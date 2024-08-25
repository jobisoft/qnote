import { DOMLocalizator } from "../modules/DOMLocalizator.mjs";
import { NoteData } from "../modules/Note.mjs";
import { Preferences } from "../modules/Preferences.mjs";
import { SelectedMessageReply } from "../modules/utils.mjs";
import { QPopupOptions } from "../modules/XULNoteWindow.mjs";

class QPopup {
	note: NoteData;
	opts: QPopupOptions | undefined;
	prefs: Preferences;

	constructor(note: NoteData, prefs: Preferences){
		console.log("new QPopup", note, prefs);
		this.note = note;
		this.prefs = prefs;
		this.display();
	}

	display(){
		const i18n = new DOMLocalizator(browser.i18n.getMessage);
		const YTextE = document.getElementById('note-text') as HTMLTextAreaElement | null;
		const popupEl = document.querySelector('.qpopup') as HTMLTextAreaElement | null;
		const titleEl = document.querySelector(".qpopup-title") as HTMLElement | null;
		const titleTextEl = document.querySelector(".qpopup-title-text") as HTMLElement | null;
		const resizeEl = document.querySelector(".qpopup-controls-resize") as HTMLElement | null;
		const closeEl = document.querySelector(".qpopup-title-closebutton") as HTMLElement | null;
		const delEl = document.querySelector("#note-delete") as HTMLElement | null;
		const popup = this;

		if(!titleTextEl) { console.error("titleTextEl not found"); return; }
		if(!YTextE) { console.error("YTextE not found"); return; }
		if(!popupEl) { console.error("popupEl not found"); return; }
		if(!titleEl) { console.error("titleEl not found"); return; }
		if(!resizeEl) { console.error("resizeEl not found"); return; }
		if(!closeEl) { console.error("closeEl not found"); return; }
		if(!delEl) { console.error("delEl not found"); return; }

		function sfocus(f: Function){
			if(popup.prefs.focusOnDisplay){
				var isFocused = (document.activeElement === YTextE);
				if(!isFocused){
					f();
				}
			}
		}

		window.addEventListener("focus", () => {
			sfocus(() => YTextE.focus());
		});

		window.addEventListener("DOMContentLoaded", () => {
			sfocus(() => window.focus());
			YTextE?.setAttribute("spellcheck", this.prefs.enableSpellChecker ? "true" : "false");
		});

		if(YTextE)YTextE.value = this.note.text ? this.note.text : "";

		// let title;
		// if(this.opts.title !== undefined){
		// 	title = this.opts.title;
		// } else {
		// 	title = 'QNote';
		// 	if(this.note.data.tsFormatted){
		// 		title += ': ' + this.note.data.tsFormatted;
		// 	}
		// }

		let title = 'QNote';
		if(this.note.tsFormatted){
			title += ': ' + this.note.tsFormatted;
		}
		titleTextEl.textContent = title;

		if(this.opts?.placeholder){
			YTextE.setAttribute("placeholder", this.opts.placeholder);
		}

		YTextE.addEventListener("keyup", e => {
			this.note.text = YTextE.value;
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
				if(!this.opts?.id){
					console.error("popup id not set");
					return;
				}

				let opts = structuredClone(this.opts);

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

				opts.offsetTop = e.clientY - mouse.clientY;
				opts.offsetLeft = e.clientX - mouse.clientX;

				console.log("update", this.opts.id, opts);
				browser.qpopup.update(this.opts.id, opts).then(pi => {
					this.note.top = pi.top;
					this.note.left = pi.left;
				});
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

		function resizeNote(w: number, h: number){
			let rectLimit = {
				minWidth: 200,
				minHeight: 125,
				maxWidth: 800,
				maxHeight: 500
			};

			w = w > rectLimit.maxWidth ? rectLimit.maxWidth : w;
			w = w < rectLimit.minWidth ? rectLimit.minWidth : w;

			h = h > rectLimit.maxHeight ? rectLimit.maxHeight : h;
			h = h < rectLimit.minHeight ? rectLimit.minHeight : h;

			if(popupEl){
				popupEl.style.width = w + 'px';
				popupEl.style.height = h + 'px';
			} else {
				console.error("popupEl is gone");
			}

			popup.note.width = w;
			popup.note.height = h;
		}

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

		popupEl.style.width = popup.note.width + 'px';
		popupEl.style.height = popup.note.height + 'px';

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

		if(this.prefs.alwaysDefaultPlacement){
			resizeNote(this.prefs.width, this.prefs.height);
		} else {
			resizeNote(popup.note.width || this.prefs.width, popup.note.height || this.prefs.height);
		}

		closeEl.addEventListener("click", e => {
			// ext.CurrentNote.silentlyPersistAndClose();
			if(popup.opts?.id){
				browser.qpopup.remove(popup.opts.id);
			} else {
				console.error("popup id not set");
			}
		});

		delEl.addEventListener("click", e => {
			// ext.CurrentNote.silentlyDeleteAndClose();
			// ext.CurrentNote.close();
			// ext.browser.qpopup.remove(ext.CurrentNote.popupId);
		});

		i18n.setTexts(document);
	}
}

let xulPort = browser.runtime.connect();

xulPort.onMessage.addListener(data => {
	if("command" in data && data.command === "selectedMessage"){
		const d = data as SelectedMessageReply;
		new QPopup(d.note, d.prefs);
	} else {
		console.error("Unknown message: ", data);
	}
});

xulPort.postMessage({
	command: "getSelectedMessage"
});

// var i18n = new DOMLocalizator(browser.i18n.getMessage);
// var ext = chrome.extension.getBackgroundPage();
// var note = ext.CurrentNote.note;
// var YTextE = document.getElementById('note-text');
// var popupEl = document.querySelector('.qpopup');
// var titleEl = document.querySelector(".qpopup-title");
// var titleTextEl = document.querySelector(".qpopup-title-text");
// var resizeEl = document.querySelector(".qpopup-controls-resize");
// var closeEl = document.querySelector(".qpopup-title-closebutton");
// var delEl = document.querySelector("#note-delete");
// var vers91;

// function sfocus(f){
// 	if(ext.Prefs.focusOnDisplay){
// 		var isFocused = (document.activeElement === YTextE);
// 		if(!isFocused){
// 			f();
// 		}
// 	}
// }

// window.addEventListener("focus", () => {
// 	sfocus(() => YTextE.focus());
// });

// window.addEventListener("DOMContentLoaded", () => {
// 	sfocus(() => window.focus());
// 	YTextE.setAttribute("spellcheck", ext.Prefs.enableSpellChecker);
// });

// YTextE.value = note.text;

// let title;
// if(note.title !== undefined){
// 	title = note.title;
// } else {
// 	title = 'QNote';
// 	if(note.ts){
// 		title += ': ' + ext.qDateFormat(note.ts);
// 	}
// }
// titleTextEl.textContent = title;

// if(note.placeholder){
// 	YTextE.setAttribute("placeholder", note.placeholder);
// }

// YTextE.addEventListener("keyup", e => {
// 	note.text = YTextE.value;
// });

// let tDrag = mouse => {
// 	let el = mouse.target;
// 	// let startX = 0, startY = 0;

// 	el.style.cursor = 'move';

// 	// Some strange behaviour starting with 91
// 	// if(vers91<0){
// 	// 	startX = note.left;
// 	// 	startY = note.top;
// 	// }

// 	let mover = e => {
// 		let opt;

// 		// if(vers91<0){
// 		// 	opt = {
// 		// 		top: e.clientY - mouse.clientY + startY,
// 		// 		left: e.clientX - mouse.clientX + startX
// 		// 	};
// 		// } else {
// 		// 	opt = {
// 		// 		offsetTop: e.clientY - mouse.clientY,
// 		// 		offsetLeft: e.clientX - mouse.clientX
// 		// 	};
// 		// }

// 		opt = {
// 			offsetTop: e.clientY - mouse.clientY,
// 			offsetLeft: e.clientX - mouse.clientX
// 		};

// 		ext.browser.qpopup.update(ext.CurrentNote.popupId, opt).then(pi => {
// 			note.top = pi.top;
// 			note.left = pi.left;
// 		});
// 	};

// 	let handleDragEnd = () => {
// 		window.removeEventListener("mousemove", mover);
// 		window.removeEventListener("mouseup", handleDragEnd);
// 		popupEl.style.opacity = '1';
// 		el.style.cursor = '';
// 	}

// 	window.addEventListener("mouseup", handleDragEnd);
// 	window.addEventListener("mousemove", mover);

// 	popupEl.style.opacity = '0.4';
// };

// function resizeNote(w, h){
// 	let rectLimit = {
// 		minWidth: 200,
// 		minHeight: 125,
// 		maxWidth: 800,
// 		maxHeight: 500
// 	};

// 	w = w > rectLimit.maxWidth ? rectLimit.maxWidth : w;
// 	w = w < rectLimit.minWidth ? rectLimit.minWidth : w;

// 	h = h > rectLimit.maxHeight ? rectLimit.maxHeight : h;
// 	h = h < rectLimit.minHeight ? rectLimit.minHeight : h;

// 	popupEl.style.width = w + 'px';
// 	popupEl.style.height = h + 'px';

// 	note.width = w;
// 	note.height = h;
// }

// let tResize =  mouse => {
// 	let startX = mouse.clientX;
// 	let startY = mouse.clientY;
// 	let startW = popupEl.offsetWidth;
// 	let startH = popupEl.offsetHeight;

// 	let resizer = e => {
// 		let w = startW + e.clientX - startX;
// 		let h = startH + e.clientY - startY;
// 		resizeNote(w, h);
// 	};

// 	let handleDragEnd = () => {
// 		window.removeEventListener("mousemove", resizer);
// 		window.removeEventListener("mouseup", handleDragEnd);
// 		popupEl.style.opacity = '1';
// 	}

// 	window.addEventListener("mouseup", handleDragEnd);
// 	window.addEventListener("mousemove", resizer);

// 	popupEl.style.opacity = '0.4';
// };

// popupEl.style.width = note.width + 'px';
// popupEl.style.height = note.height + 'px';

// let mDown = new WeakMap();

// mDown.set(titleEl, tDrag);
// mDown.set(titleTextEl, tDrag);
// mDown.set(resizeEl, tResize);

// let handleDragStart = e => {
// 	if(mDown.has(e.target)){
// 		mDown.get(e.target)(e);
// 	}
// }

// // TODO: remove version check sometime
// browser.legacy.compareVersions(ext.TBInfo.version, "91").then(vers => {
// 	vers91 = vers;
// 	window.addEventListener('mousedown', handleDragStart, false);

// 	if(ext.Prefs.alwaysDefaultPlacement){
// 		resizeNote(ext.Prefs.width, ext.Prefs.height);
// 	} else {
// 		resizeNote(note.width || ext.Prefs.width, note.height || ext.Prefs.height);
// 	}
// });

// closeEl.addEventListener("click", e => {
// 	ext.CurrentNote.silentlyPersistAndClose();
// 	// ext.browser.qpopup.remove(ext.CurrentNote.popupId);
// });

// delEl.addEventListener("click", e => {
// 	ext.CurrentNote.silentlyDeleteAndClose();
// 	// ext.CurrentNote.close();
// 	// ext.browser.qpopup.remove(ext.CurrentNote.popupId);
// });

// i18n.setTexts(document);