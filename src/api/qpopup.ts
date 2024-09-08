import { IPopupOptions } from "../modules/NotePopups.mjs";

var { ExtensionParent } = ChromeUtils.import("resource://gre/modules/ExtensionParent.jsm");
var { BasePopup } = ChromeUtils.importESModule("resource:///modules/ExtensionPopups.sys.mjs");
// var { BasePopup } = ChromeUtils.importESModule("resource://qnote/modules-exp/QPopups.sys.mjs");
var { QEventDispatcher } = ChromeUtils.importESModule("resource://qnote/modules/QEventDispatcher.mjs");

var QDEB = true;
var extension = ExtensionParent.GlobalManager.getExtension("qnote@dqdp.net");

interface Box {
	top: number;
	left: number;
	width: number;
	height: number;
}

class QPopupEventDispatcher extends QEventDispatcher<{
	onclose: (id: number, reason: string, state: IPopupOptions) => void;
	onfocus: (id: number) => void;
	onblur: (id: number) => void;
}> {}

function coalesce(...args: any): any {
	for (let a of args) if (a !== null) return a;

	return null;
}

const PopupEventDispatcher = new QPopupEventDispatcher();

var popupManager = {
	counter: 0,
	popups: new Map<number, QPopup>(),
	add(popup: QPopup): void {
		QDEB && console.debug(`qpopup.popupManager: Adding new popup with id ${popup.id}`);
		if (this.has(popup.id)) {
			throw new Error(`qpopup: id ${popup.id} already exists`);
		} else {
			this.popups.set(popup.id, popup);
		}
	},
	remove(id: number): boolean {
		return this.popups.delete(id);
	},
	get(id: number): QPopup {
		if (this.popups.has(id)) {
			return this.popups.get(id)!;
		} else {
			throw new Error(`qpopup: id ${id} not found`);
		}
	},
	has(id: number): boolean {
		return this.popups.has(id);
	},
};

var qpopup = class extends ExtensionCommon.ExtensionAPI {
	static onDisable(id: string) {
		console.log("[qpopup onDisable]", id);
	}

	static onUninstall(id: string) {
		console.log("[qpopup onUninstall]", id);
	}

	static onUpdate(id: string, manifest: any) {
		console.log("[qpopup onUpdate]", id, manifest);
	}

	onShutdown(_isAppShutdown: any) {
		console.log("[qpopup onShutdown]", _isAppShutdown);
		for(const id of popupManager.popups.keys()){
			popupManager.get(id).destroy("shutdown");
		}
	}

	getAPI(context: any) {
		// this.i18n = new DOMLocalizator(id => {
		// 	return extension.localizeMessage(id);
		// });

		function id2RealWindow(windowId: number): MozWindow {
			try {
				return extension.windowManager.get(windowId).window;
			} catch {
				// QDEB&&console.debug("windowManager fail");
				throw new Error("windowManager fail");
			}
			// return undefined;
			// Get a window ID from a real window:
			// context.extension.windowManager.getWrapper(realWindow).id;

			// // Get all windows: (note this returns a Generator, not an array like the API)
			// context.extension.windowManager.getAll();
		}

		// ext no context?
		return {
			qpopup: {
				onClose: new ExtensionCommon.EventManager({
					context,
					name: "qpopup.onClose",
					register: (fire: ExtensionParentFire) => {
						const l = (id: number, reason: string, state: IPopupOptions) => {
							fire.async(id, reason, state);
						};

						PopupEventDispatcher.addListener("onclose", l);

						return () => {
							PopupEventDispatcher.removeListener("onclose", l);
						};
					},
				}).api(),
				onFocus: new ExtensionCommon.EventManager({
					context,
					name: "qpopup.onFocus",
					register: (fire: ExtensionParentFire) => {
						const l = (id: number) => {
							fire.async(id);
						};

						PopupEventDispatcher.addListener("onfocus", l);

						return () => {
							PopupEventDispatcher.removeListener("onfocus", l);
						};
					},
				}).api(),
				onBlur: new ExtensionCommon.EventManager({
					context,
					name: "qpopup.onBlur",
					register: (fire: ExtensionParentFire) => {
						const l = (id: number) => {
							fire.async(id);
						};

						PopupEventDispatcher.addListener("onblur", l);

						return () => {
							PopupEventDispatcher.removeListener("onblur", l);
						};
					},
				}).api(),
				async setDebug(on: boolean) {
					QDEB = on;
				},
				async close(id: number, reason: string) {
					QDEB && console.debug("qpopup.remove()", id);
					popupManager.get(id).destroy(reason);
				},
				async get(id: number) {
					return popupManager.get(id).state;
					// popup.popupInfo.focused = popup.isFocused;
				},
				async update(id: number, newState: IPopupOptions) {
					let popup = popupManager.get(id);

					let oldState = Object.assign({}, popup.state);

					// state come in null-ed
					let { top, left, offsetTop, offsetLeft } = newState;

					if(offsetTop !== null)newState.top = coalesce(oldState.top, 0) + coalesce(offsetTop, 0) as number;
					if(offsetLeft !== null)newState.left = coalesce(oldState.left, 0) + coalesce(offsetLeft, 0) as number;

					if (offsetTop !== null || offsetLeft !== null || top !== null || left !== null) {
						popup.moveTo(coalesce(newState.left, 0), coalesce(newState.top, 0));
					}

					if(newState.focused !== oldState.focused){
						console.log("newState.focused !== oldState.focused", newState.focused !== oldState.focused);
						if(newState.focused === true){
							PopupEventDispatcher.fireListeners("onfocus", id);
						} else if(newState.focused === false){
							PopupEventDispatcher.fireListeners("onblur", id);
						}
					}

					// if(title){
					// 	popup.title = title;
					// }

					const assignState: IPopupOptions = {};
					Object.entries(newState).map(([k, v]) => {
						if(v !== null)assignState[k as keyof IPopupOptions] = v;
					});

					return Object.assign(popup.state, assignState);
				},
				async pop(id: number) {
					return popupManager.get(id).pop();
					// const popup = popupManager.get(id);
					// return popup.pop().then(status => {
					// 	// popup.options.top = popup.panel.screenY;
					// 	// popup.options.left = popup.panel.screenX;

					// 	return popup.id;
					// });
				},
				async create(windowId: number, options: IPopupOptions) {
					QDEB && console.debug("qpopup.create()");

					const popup = new QPopup(id2RealWindow(windowId), extension, options);

					return popup.id;
				},
			},
		};
	}
};

class QPopup extends BasePopup {
	id: number;
	state: IPopupOptions;

	constructor(window: MozWindow, extension: any, state: IPopupOptions) {
		// const extension = ExtensionParent.GlobalManager.getExtension("qnote@dqdp.net");

		let document = window.document;

		let mainPopupSet = document.getElementById("mainPopupSet");
		if (!mainPopupSet) {
			throw new Error("mainPopupSet not found");
		}

		const id = ++popupManager.counter;

		const panel = document.createXULElement("panel");
		panel.setAttribute("id", "qnote-window-panel-" + id);
		panel.setAttribute("noautohide", "true");
		if(state.focusOnDisplay)panel.setAttribute("noautofocus", "true");
		panel.setAttribute("class", "mail-extension-panel panel-no-padding browser-extension-panel");
		panel.setAttribute("type", "arrow");
		// panel.setAttribute("role", "group");

		// window.addEventListener("click", () => {
		// 	console.error("click from api");
		// });

		// window.addEventListener("WebExtPopupResized", () => {
		// 	console.error("WebExtPopup:Resized from api");
		// });

		// window.addEventListener("WebExtPopupLoaded", () => {
		// 	console.error("WebExtPopup:Loaded from api");
		// });

		mainPopupSet.appendChild(panel);

		const url = "html/qpopup.html?id=" + id;

		const popupURL = extension.getURL(url);
		const browserStyle = false;
		const fixedWidth = false;
		const blockParser = false;

		super(extension, panel, popupURL, browserStyle, fixedWidth, blockParser);

		this.id = id;
		this.state = state;

		popupManager.add(this);
	}

	destroy(reason?: string) {
		QDEB&&console.debug("qpopup.api.destroy id:", this.id);
		if(popupManager.has(this.id)){
			popupManager.remove(this.id);
			PopupEventDispatcher.fireListeners("onclose", this.id, reason ?? "", this.state);
		}
		super.destroy();
	}

	// Is called from parent, w/o params - do not remove
	closePopup() {
	}

	moveTo(x: number, y: number) {
		this.panel.moveTo(x, y);
	}

	// sizeTo(width: number, height: number){
	// 	this.panel.sizeTo(width, height);
	// }

	// TODO: broken
	// sizeTo(width, height){
	// 	let popup = this.popupEl;

	// 	// This seems to set rather size limits?
	// 	//this.panel.sizeTo(width, height);

	// 	popup.style.width = width + 'px';
	// 	popup.style.height = height + 'px';
	// }

	// box = { top, left, width, height }
	_center(innerBox: Box, outerBox: Box, absolute = true) {
		const retBox: Box = {
			top: 0,
			left: 0,
			width: 0,
			height: 0,
		};

		const iWidth = innerBox.width;
		const iHeight = innerBox.height;
		const oWidth = outerBox.width;
		const oHeight = outerBox.height;

		retBox.left = Math.round((oWidth - iWidth) / 2);
		retBox.top = Math.round((oHeight - iHeight) / 2);

		if (absolute) {
			retBox.left += outerBox.left;
			retBox.top += outerBox.top;
		}

		return retBox;
	}

	pop() {
		QDEB && console.debug("qpopup.api.pop:", this.state);
		const { left, top, width, height, anchor, anchorPlacement } = this.state;
		const window = this.window;

		return new Promise((resolve) => {
			const elements = {
				window: "",
				threadpane: "threadContentArea",
				message: "messagepane",
			};

			if (left === null && top === null) {
				let aEl: HTMLElement | null = null;
				let adjX = 0;
				let adjY = 0;

				if (anchor && anchor in elements) {
					if (elements[anchor]) {
						aEl = window.document.getElementById(elements[anchor]);
					}
				}

				// Fall back to window in case referring element is not visible
				if (!aEl || !aEl.clientWidth || !aEl.clientHeight) {
					aEl = window.document.querySelector("#messengerWindow");
				}

				if (aEl && anchorPlacement) {
					if (anchorPlacement === "center") {
						const wBox = {
							top: (aEl as any).screenY, // TODO any
							left: (aEl as any).screenX,
							width: aEl.clientWidth,
							height: aEl.clientHeight,
						};
						const currBox: Box = {
							left: left || 0,
							top: top || 0,
							width: width || 0,
							height: height || 0,
						};
						const adjBox = this._center(currBox, wBox, false);
						adjX = adjBox.left;
						adjY = adjBox.top;
					} else if (width && (anchorPlacement.startsWith("topcenter") || anchorPlacement.startsWith("bottomcenter"))) {
						adjX = (width / 2) * -1;
					} else if (height && (anchorPlacement.startsWith("rightcenter") || anchorPlacement.startsWith("leftcenter"))) {
						adjY = (height / 2) * -1;
					}
				}
				this.panel.openPopup(aEl, anchorPlacement);
				this.panel.moveTo(adjX, adjY);
			} else {
				this.panel.openPopup(null, "after_start");
				this.panel.moveTo(left, top);
			}

			resolve(true);
		});
	}
}
