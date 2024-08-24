var ext = chrome.extension.getBackgroundPage();
var note = ext.CurrentNote.note;
var YTextE = document.getElementById('note-text');
var popupEl = document.querySelector('.qpopup');
var titleEl = document.querySelector(".qpopup-title");
var titleTextEl = document.querySelector(".qpopup-title-text");
var resizeEl = document.querySelector(".qpopup-controls-resize");
var closeEl = document.querySelector(".qpopup-title-closebutton");
var delEl = document.querySelector("#note-delete");
var vers91;

function sfocus(f){
	if(ext.Prefs.focusOnDisplay){
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
	YTextE.setAttribute("spellcheck", ext.Prefs.enableSpellChecker);
});

YTextE.value = note.text;

let title;
if(note.title !== undefined){
	title = note.title;
} else {
	title = 'QNote';
	if(note.ts){
		title += ': ' + ext.qDateFormat(note.ts);
	}
}
titleTextEl.textContent = title;

if(note.placeholder){
	YTextE.setAttribute("placeholder", note.placeholder);
}

YTextE.addEventListener("keyup", e => {
	note.text = YTextE.value;
});

let tDrag = mouse => {
	let el = mouse.target;
	// let startX = 0, startY = 0;

	el.style.cursor = 'move';

	// Some strange behaviour starting with 91
	// if(vers91<0){
	// 	startX = note.left;
	// 	startY = note.top;
	// }

	let mover = e => {
		let opt;

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

		opt = {
			offsetTop: e.clientY - mouse.clientY,
			offsetLeft: e.clientX - mouse.clientX
		};

		ext.browser.qpopup.update(ext.CurrentNote.popupId, opt).then(pi => {
			note.top = pi.top;
			note.left = pi.left;
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

function resizeNote(w, h){
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

	popupEl.style.width = w + 'px';
	popupEl.style.height = h + 'px';

	note.width = w;
	note.height = h;
}

let tResize =  mouse => {
	let startX = mouse.clientX;
	let startY = mouse.clientY;
	let startW = popupEl.offsetWidth;
	let startH = popupEl.offsetHeight;

	let resizer = e => {
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

popupEl.style.width = note.width + 'px';
popupEl.style.height = note.height + 'px';

let mDown = new WeakMap();

mDown.set(titleEl, tDrag);
mDown.set(titleTextEl, tDrag);
mDown.set(resizeEl, tResize);

let handleDragStart = e => {
	if(mDown.has(e.target)){
		mDown.get(e.target)(e);
	}
}

// TODO: remove version check sometime
browser.legacy.compareVersions(ext.TBInfo.version, "91").then(vers => {
	vers91 = vers;
	window.addEventListener('mousedown', handleDragStart, false);

	if(ext.Prefs.alwaysDefaultPlacement){
		resizeNote(ext.Prefs.width, ext.Prefs.height);
	} else {
		resizeNote(note.width || ext.Prefs.width, note.height || ext.Prefs.height);
	}
});

closeEl.addEventListener("click", e => {
	ext.CurrentNote.silentlyPersistAndClose();
	// ext.browser.qpopup.remove(ext.CurrentNote.popupId);
});

delEl.addEventListener("click", e => {
	ext.CurrentNote.silentlyDeleteAndClose();
	// ext.CurrentNote.close();
	// ext.browser.qpopup.remove(ext.CurrentNote.popupId);
});

ext.i18n.setTexts(document);
