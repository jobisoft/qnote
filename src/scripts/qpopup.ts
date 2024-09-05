import { DOMLocalizator } from "../modules/DOMLocalizator.mjs";
import { IPopupOptions } from "../modules/NotePopups.mjs";
import { getElementByIdOrDie, querySelectorOrDie } from "../modules/common.mjs";

let QDEB = true;

QDEB&&console.debug("qpopup(content) new QPopup: ");

// NOTE: keep this code around for now
// let queuedUpdates: IPopupOptions = {};
// let updateActivityTs = Date.now();
// let timerId: number | undefined;

// async function qpopupUpdate(): Promise<void> {
// 	const diffTs = Date.now() - updateActivityTs;

// 	console.log("updateActivityTs", diffTs);

// 	if(diffTs > 500){
// 		console.log("finally sending updates!");
// 		await browser.qpopup.update(id, queuedUpdates);
// 		timerId = undefined;
// 	} else {
// 		timerId = setTimeout(qpopupUpdate, 200);
// 	}
// }

// function qpopupUpdateLazy(updates?: IPopupOptions): void {
// 	updateActivityTs = Date.now();
// 	Object.assign(queuedUpdates, updates);

// 	if(!timerId){
// 		timerId = setTimeout(qpopupUpdate, 500);
// 	}
// }

const urlParams = new URLSearchParams(window.location.search);
const idParam = urlParams.get("id");
// const width = parseInt(urlParams.get("width") ?? "320");
// const height = parseInt(urlParams.get("height") ?? "200");
// const placeholder = urlParams.get("placeholder") ?? ""; // TODO: for multi note

if(!idParam){
	throw new Error("Missing query parameter: id");
}

const id = parseInt(idParam);

if (isNaN(id)) {
	throw new Error(`Incorrect value for query parameter id: ${id}`);
}

const Opts: IPopupOptions = { };
const i18n = new DOMLocalizator(browser.i18n.getMessage);

const YTextE      = getElementByIdOrDie('note-text') as HTMLTextAreaElement;
const popupEl     = querySelectorOrDie('.qpopup') as HTMLTextAreaElement;
const titleEl     = querySelectorOrDie(".qpopup-title") as HTMLElement;
const titleTextEl = querySelectorOrDie(".qpopup-title-text") as HTMLElement;
const resizeEl    = querySelectorOrDie(".qpopup-controls-resize") as HTMLElement;
const closeEl     = querySelectorOrDie(".qpopup-title-closebutton") as HTMLElement;
const delEl       = querySelectorOrDie("#note-delete") as HTMLElement;

function updateOptions(o: IPopupOptions){
	console.log("updateOptions");
	if(Opts.enableSpellChecker !== o.enableSpellChecker)
		Opts.enableSpellChecker = o.enableSpellChecker;

	if(Opts.width !== o.width)
		Opts.width = o.width;

	if(Opts.height !== o.height)
		Opts.height = o.height;

	if(Opts.text !== o.text)
		Opts.text = o.text;

	if(Opts.title !== o.title)
		Opts.title = o.title;

	if(Opts.placeholder !== o.placeholder)
		Opts.placeholder = o.placeholder;

	if(Opts.enableSpellChecker !== null)
		YTextE.setAttribute("spellcheck", Opts.enableSpellChecker ? "true" : "false");

	if(Opts.text)
		YTextE.value = Opts.text ?? "";

	if(Opts.title)
		titleTextEl.textContent = Opts.title;

	if(Opts.width && Opts.height)
		resizeNote(Opts.width, Opts.height);

	if(Opts.placeholder)
		YTextE.setAttribute("placeholder", Opts.placeholder);
}

// TODO: fix focus handling. Anyway, who's responsible for setting focus??
// function sfocus(f: Function){
// 	if(Opts.focusOnDisplay){
// 		var isFocused = (document.activeElement === YTextE);
// 		if(!isFocused){
// 			f();
// 		}
// 	}
// }

function resizeNote(w: number, h: number){
	let rectLimit = {
		minWidth: 200,
		minHeight: 125,
		maxWidth: 800,
		maxHeight: 500
	};

	let width, height;

	width = w > rectLimit.maxWidth ? rectLimit.maxWidth : w;
	width = w < rectLimit.minWidth ? rectLimit.minWidth : w;

	height = h > rectLimit.maxHeight ? rectLimit.maxHeight : h;
	height = h < rectLimit.minHeight ? rectLimit.minHeight : h;

	if(popupEl){
		browser.qpopup.update(id, { width, height });
		popupEl.style.width = w + 'px';
		popupEl.style.height = h + 'px';
	} else {
		console.error("popupEl is gone");
	}
}

function popup(){
	i18n.setTexts(document);

	// sfocus(() => window.focus());

	// TODO: differentiate close/delete events
	closeEl.addEventListener("click", e => {
		// ext.CurrentNote.silentlyPersistAndClose();
		browser.qpopup.remove(id);
	});

	delEl.addEventListener("click", e => {
		// ext.CurrentNote.silentlyDeleteAndClose();
		// ext.CurrentNote.close();
		browser.qpopup.remove(id);
	});

	// window.addEventListener("focus", () => {
	// 	sfocus(() => YTextE.focus());
	// });

	YTextE.addEventListener("keyup", () => {
		browser.qpopup.update(id, { text: YTextE.value });
	});

	let tDrag = (mouse: MouseEvent) => {
		if(mouse.target === null){
			console.error("mouse.target is null");
			return;
		}

		let el = mouse.target as HTMLElement;
		// let startX = 0, startY = 0;

		el.style.cursor = 'move';

		// Some strange behaviour starting with 91
		// if(vers91<0){
		// 	startX = note.left;
		// 	startY = note.top;
		// }

		let mover = (e: MouseEvent) => {
			// let opts = structuredClone(Opts);

			// if(vers91<0){
			// 	opt = {
			// 		top: e.clientY - mouse.clientY + startY,
			// 		left: e.clientX - mouse.clientX + startX
			// 	};
			// } else {
			// 	opt = {
			// 		offsetTop: e.clientY - mouse.clientY,
			// 		offsetLeft: e.clientX - mouse.clientX
			// 	};
			// }

			const offsetTop = e.clientY - mouse.clientY;
			const offsetLeft = e.clientX - mouse.clientX;

			browser.qpopup.update(id, { offsetTop, offsetLeft });
		};

		let handleDragEnd = () => {
			window.removeEventListener("mousemove", mover);
			window.removeEventListener("mouseup", handleDragEnd);
			popupEl.style.opacity = '1';
			el.style.cursor = '';
		}

		window.addEventListener("mouseup", handleDragEnd);
		window.addEventListener("mousemove", mover);

		popupEl.style.opacity = '0.4';
	};

	let tResize = (mouse: MouseEvent) => {
		let startX = mouse.clientX;
		let startY = mouse.clientY;
		let startW = popupEl.offsetWidth;
		let startH = popupEl.offsetHeight;

		let resizer = (e: MouseEvent) => {
			let w = startW + e.clientX - startX;
			let h = startH + e.clientY - startY;
			resizeNote(w, h);
		};

		let handleDragEnd = () => {
			window.removeEventListener("mousemove", resizer);
			window.removeEventListener("mouseup", handleDragEnd);
			popupEl.style.opacity = '1';
		}

		window.addEventListener("mouseup", handleDragEnd);
		window.addEventListener("mousemove", resizer);

		popupEl.style.opacity = '0.4';
	};

	let mDown = new WeakMap();

	mDown.set(titleEl, tDrag);
	mDown.set(titleTextEl, tDrag);
	mDown.set(resizeEl, tResize);

	const handleDragStart = (e: MouseEvent) => {
		if(e.target && mDown.has(e.target)){
			mDown.get(e.target)(e);
		}
	}

	window.addEventListener('mousedown', handleDragStart, false);
}


window.addEventListener("DOMContentLoaded", () => {
	browser.qpopup.get(id).then(opts => {
		updateOptions(opts);
		popup();
	});
});

// window.addEventListener("DOMContentLoaded", () => {
// 	let xulPort = browser.runtime.connect({
// 		name: "qpopup"
// 	});

// 	xulPort.onMessage.addListener(data => {
// 		let reply;
// 		if(reply = (new PopupDataReply).parse(data)){
// 			if(reply.handle == id){ // TODO: do we need check id?
// 				updateOptions(reply.opts);
// 				popup();
// 			}
// 		} else {
// 			console.error("Unknown or incorrect message: ", data);
// 		}
// 	});

// 	(new PopupDataRequest).post(xulPort, { handle: id });
// });
