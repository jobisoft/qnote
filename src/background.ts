// MAYBE: multiple notes simultaneously
// MAYBE: note popup on mouse over
// TODO: save note pos and dims locally, outside note
// TODO: save create and update time
// TODO: attach keyb/col handler to all windows at the start

// Interesting links
//
//      Background scripts
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts
//
//     ESMification: Out-of-tree Migration
// https://docs.google.com/document/d/14FqYX749nJkCSL_GknCDZyQnuqkXNc9KoTuXSV3HtMg/edit
//
//     ESMification: In-tree Migration Phase 1
// https://docs.google.com/document/d/1cpzIK-BdP7u6RJSar-Z955GV--2Rj8V4x2vl34m36Go/edit#heading=h.jpld4f8xni91
//
//     XPCOM String Guide
// https://firefox-source-docs.mozilla.org/xpcom/stringguide.html
//

//    Types for MozXULElement and others
// https://github.com/dothq/browser-desktop/blob/nightly/types.d.ts

// import * as luxon from 'luxon';
import { QPopupDOMContentLoadedMessage, UpdateQPoppupMessage } from "./modules/Messages.mjs";
import { INote, NoteData, QNote, QNoteFolder } from "./modules/Note.mjs";
import { QNotePopup, NotePopup } from "./modules/NotePopups.mjs";
import { Preferences } from "./modules/Preferences.mjs";
import {
	dateFormat,
	focusMessagePane,
	getCurrentTabId,
	getCurrentTabIdAnd,
	getCurrentWindowIdAnd,
	getPrefs,
	getXNoteStoragePath,
	isFolderWritable,
	isPrefsEmpty,
	loadAllFolderNotes,
	MessageId,
	mpUpdateForNote,
	POP_EXISTING,
	POP_FOCUS,
	POP_NONE,
	silentCatcher,
	ts2jsdate,
	updateIcons
} from "./modules/utils.mjs";

// TODO: getting dead object: open msg in tab, drag out in new window, reload extension when tread view activated in new window
var QDEB = true;
var Prefs: Preferences;
let BrowserAction = browser.action ? browser.action : browser.browserAction;

// var CurrentPopup: DefaultNoteWindow;
// var CurrentTabId;
// var CurrentWindowId; // MAYBE: should get rid of and replace with CurrentNote.windowId
// var CurrentLang;
// var TBInfo;
// var i18n = new DOMLocalizator(browser.i18n.getMessage);
var _ = browser.i18n.getMessage;

// TODO: promise interface
var PopupManager = {
	counter: 0,
	popups: new Map<number, QNotePopup>,
	allocId(): number {
		return ++this.counter;
	},
	add(popup: QNotePopup): void {
		console.log(`Adding new windows with id ${popup.id}`);
		if(this.has(popup.id)){
			throw new Error(`PopupManager: id ${popup.id} already exists`);
		} else {
			this.popups.set(popup.id, popup);
		}
	},
	remove(id: number): boolean {
		return this.get(id) ? this.popups.delete(id) : false;
	},
	get(id: number): QNotePopup {
		let p = this.popups.get(id);
		if(p){
			return p;
		}
		throw new Error(`PopupManager: id ${id} not found`);
	},
	has(id: number): boolean {
		return this.popups.has(id);
	}
}

async function confirmDelete(shouldConfirm: boolean): Promise<boolean> {
	return shouldConfirm ? await browser.legacy.confirm(_("delete.note"), _("are.you.sure")) : true;
}

async function importQNotes(notes: Array<NoteData>, overwrite = false){
	let stats = {
		err: 0,
		exist: 0,
		imported: 0,
		overwritten: 0
	};

	for (const note of notes) {
		let yn = new QNote(note.keyId);

		await yn.load();

		let exists = yn.data.exists;

		if(exists && !overwrite){
			stats.exist++;
		} else {
			yn.data = note;
			await yn.save().then(() => {
				stats[exists ? "overwritten" : "imported"]++;
			}).catch(e => {
				console.error(_("error.saving.note"), e.message, yn.data.keyId);
				stats.err++;
			});
		}
	}

	return stats;
}

async function importFolderNotes(root: string, overwrite = false){
	return loadAllFolderNotes(root).then(notes => importQNotes(notes, overwrite));
}

export async function loadPrefsWithDefaults() {
	let p = await getPrefs();
	let isEmpty = await isPrefsEmpty();
	// let defaultPrefs = getDefaultPrefs();
	// let isEmptyPrefs = Object.keys(p).length === 0;

	// Check for xnote settings if no settings at all
	// if(isEmptyPrefs){
	// 	let l = xnotePrefsMapper(await browser.xnote.getPrefs());
	// 	for(let k in defaultPrefs){
	// 		if(l[k] === undefined){
	// 			p[k] = defaultPrefs[k];
	// 		} else {
	// 			p[k] = l[k];
	// 		}
	// 	}
	// }

	// Apply defaults
	// for(let k in defaultPrefs){
	// 	if(p[k] === undefined){
	// 		p[k] = defaultPrefs[k];
	// 	}
	// }

	if(p.tagName){
		p.tagName = p.tagName.toLowerCase();
	}

	if(isEmpty){
		// If XNote++ storage_path is set and readable, then use it
		// else check if XNote folder exists inside profile directory
		let path = await getXNoteStoragePath();

		if(await isFolderWritable(path)){
			p.storageOption = 'folder';
			p.storageFolder = path;
		} else {
			path = await browser.qapp.createStoragePath();
			if(await isFolderWritable(path)){
				p.storageOption = 'folder';
				p.storageFolder = path;
			} else {
				browser.legacy.alert(_("could.not.initialize.storage.folder"));
				p.storageOption = 'ext';
			}
		}
	}

	// Override old default "yyyy-mm-dd - HH:MM"
	if(p.dateFormat === "yyyy-mm-dd - HH:MM"){
		p.dateFormat = 'Y-m-d H:i';
	}

	return p;
}

async function resetTbState(){
	browser.menus.removeAll();
	const tabId = await getCurrentTabId();
	if(tabId){
		updateIcons(false, tabId);
	}
}

async function loadNote(keyId: string) {
	let note = createNote(keyId);
	return note.load().then(() => note);
}

function dateFormatPredefined(locale: string, format: string, ts: Date) {
	console.error("TODO: dateFormatPredefined");
	return "";
	// return luxon.DateTime.fromJSDate(ts2jsdate(ts)).setLocale(locale).toFormat(format);
}

function _qDateFormat(locale: string, ts: number){
	if(Prefs.dateFormatPredefined){
		return dateFormatPredefined(locale, Prefs.dateFormatPredefined, new Date(ts));
	} else {
		if(Prefs.dateFormat){
			return dateFormat(locale, Prefs.dateFormat, new Date(ts));
		} else {
			return dateFormatPredefined(locale, 'DATETIME_FULL_WITH_SECONDS', new Date(ts));
		}
	}
}

async function getMessageKeyId(id: MessageId) {
	return browser.messages.get(id).then(parts => parts.headerMessageId);
}

async function loadNoteForMessageAnd(id: MessageId) {
	return createNoteForMessage(id).then(async note => {
		return note.load().then(() => note);
	});
}

// TODO:
// async function deleteNoteForMessage(id: MessageId) {
// 	return createNoteForMessage(id).then(async note => {
// 		return note.delete().then(() => note);
// 	});
// }

// TODO:
// async function saveNoteForMessage(id, data){
// 	return loadNoteForMessage(id).then(note => {
// 		note.set(data);
// 		return note.save();
// 	});
// }

// TODO:
// async function saveNoteForMessageIfNotExists(id, data){
// 	return loadNoteForMessage(id).then(note => {
// 		if(!note.exists){
// 			note.set(data);
// 			return note.save();
// 		}
// 	});
// }

// async function getMessage(id: MessageId){
// 	return browser.messages.get(id).then(messageHeaderReturner);
// }

// async function getMessageFull(id: MessageId){
// 	return browser.messages.getFull(id).then(messagePartReturner);
// }

// async function tagMessage(id, tagName, toTag = true) {
// 	return getMessage(id).then(message => {
// 		QDEB&&console.debug(`tagMessage(id:${id}, tagName:${tagName}, toTag:${toTag})`);
// 		let tags = message.tags;

// 		if(toTag){
// 			if(!message.tags.includes(tagName)){
// 				tags.push(tagName);
// 			}
// 		} else {
// 			tags = tags.filter(item => item !== tagName);
// 		}

// 		return browser.messages.update(message.id, {
// 			tags: tags
// 		});
// 	});
// }

// TODO:
// async function ifNoteForMessageExists(id) {
// 	return new Promise((resolve, reject) => {
// 		loadNoteForMessage(id).then(note => {
// 			if(note.exists){
// 				resolve(note);
// 			} else {
// 				reject();
// 			}
// 		});
// 	});
// }

// async function mpUpdateForMessage(messageId: MessageId){
// 	return loadNoteForMessage(messageId).then(note => {
// 		mpUpdateForNote(note.data);
// 	}).catch(silentCatcher());
// }

async function createNoteForMessage(id: MessageId) {
	return getMessageKeyId(id).then(keyId => createNote(keyId));
}

// TODO
// async function createNoteForMessage(id: MessageId) {
// 	return getMessageKeyId(id).then(keyId => {
// 		let note = createNote(keyId);

// 		note.addListener("afterupdate", (n: any, action: string) => {
// 			QDEB&&console.debug("afterupdate", action);
// 			if(Prefs.useTag){
// 				console.error("TODO: tagMessage");
// 				// tagMessage(id, Prefs.tagName, action === "save");
// 			}

// 			mpUpdateForMessage(id);
// 		});

// 		return note;
// 	});
// }

function qDateFormat(ts: number){
	if(Prefs.dateLocale){
		try {
			return _qDateFormat(Prefs.dateLocale, ts);
		} catch {
		}
	}

	return _qDateFormat(browser.i18n.getUILanguage(), ts);
}

function qDateFormatPredefined(format: string, ts: Date){
	if(Prefs.dateLocale){
		try {
			return dateFormatPredefined(Prefs.dateLocale, format, ts);
		} catch {
		}
	}

	return dateFormatPredefined(browser.i18n.getUILanguage(), format, ts);
}

function createNote(keyId: string) {
	QDEB&&console.debug(`createNote(${keyId})`, Prefs.storageOption);
	if(Prefs.storageOption === 'ext'){
		return new QNote(keyId);
	} else if(Prefs.storageOption === 'folder'){
		return new QNoteFolder(keyId, Prefs.storageFolder);
	} else {
		throw new TypeError("Ivalid Prefs.storageOption");
	}
}

async function createMultiNote(messageList: any, overwrite = false){
	console.error("TODO: createMultiNote");
	// await CurrentPopup.silentlyPersistAndClose();
	// let note = createNote('qnote.multi');
	// CurrentPopup.note = note;
	// CurrentPopup.note.title = _("multi.note");
	// CurrentNote.note.placeholder = _("multi.note.warning");
	// CurrentNote.loadedNoteData = {};

	// let l = async () => {
	// 	if(CurrentNote.needSaveOnClose && note.text){
	// 		for(const m of messageList){
	// 			await getMessageKeyId(m.id).then(keyId => {
	// 				note.keyId = keyId;
	// 				if(overwrite){
	// 					saveNoteForMessage(m.id, note2QAppNote(note));
	// 				} else {
	// 					saveNoteForMessageIfNotExists(m.id, note2QAppNote(note));
	// 				}
	// 			});
	// 		};
	// 		mpUpdateForMultiMessage(messageList);
	// 	}
	// 	CurrentNote.removeListener("afterclose", l);
	// };

	// CurrentNote.addListener("afterclose", l);

	// CurrentNote.pop().then(() => {
	// 	CurrentNote.focus();
	// });
}

async function QNotePopForMessage(id: MessageId, flags = POP_NONE) {
	console.log("pop note");
	let createNew = !(flags & POP_EXISTING);
	let setFocus = flags & POP_FOCUS;

	// await CurrentNote.silentlyPersistAndClose();

	/*
	let createNew = !(flags & POP_EXISTING);
	let setFocus = flags & POP_FOCUS;

	return CurrentPopup.loadNoteForMessage(id).then(note => {
		CurrentPopup.messageId = id;
		CurrentPopup.flags = flags;
		if(note.exists || createNew){
			// if(CurrentNote.popping){
			// 	QDEB&&console.debug("already popping");
			// 	return false;
			// }

			// CurrentNote.popping = true;
			return CurrentPopup.pop().then(isPopped => {
				if(setFocus && isPopped){
					CurrentPopup.focus();
				}

				if(isPopped){
					note.left = isPopped.left;
					note.top = isPopped.top;
				}

				mpUpdateForNote(note);

				return isPopped;
			// }).finally(() => {
			// 	CurrentNote.popping = false;
			});
		} else {
			mpUpdateForNote(note);
		}
	}).catch(e => {
		if(e instanceof NoKeyIdError){
			if(createNew){
				browser.legacy.alert(_("no.message_id.header"));
			}
		} else if(e instanceof DirtyStateError){
			if(createNew){
				browser.legacy.alert(_("close.current.note"));
			}
		} else {
			console.error(e);
		}
	});
	*/
}

// TODO:
// async function getDisplayedMessageForTab(tab) {
// 	// return browser.messageDisplay.getDisplayedMessage(getTabId(tab)).then(messagePartReturner);
// 	return browser.messageDisplay.getDisplayedMessages(getTabId(tab)).then(
// 		MessageList => messagePartReturner(MessageList.messages[0])
// 	);
// }

// TODO:
// async function QNotePopForTab(Tab, flags = POP_NONE) {
// 	return getDisplayedMessageForTab(Tab).then(async Message => {
// 		await CurrentPopup.silentlyPersistAndClose();
// 		return QNotePopForMessage(Message.id, flags);
// 	});
// };

// TODO:
// async function QNotePopToggle(Tab) {
// 	if(CurrentPopup.shown){
// 		// This logic won't work with WebExtensionNoteWindow when clicking on buttons because window will loose focus hence report no focus
// 		if(await CurrentPopup.isFocused()){
// 			QDEB&&console.debug(`QNotePopToggle(), popupId = ${CurrentNote.popupId} - focused, waiting to close`);
// 			await CurrentPopup.persistAndClose().catch(e => {
// 				if(e instanceof DirtyStateError){
// 					browser.legacy.alert(_("close.current.note"));
// 				} else {
// 					throw e;
// 				}
// 			});
// 		} else {
// 			QDEB&&console.debug(`QNotePopToggle(), popupId = ${CurrentNote.popupId} - opened, waiting to gain focus`);
// 			await CurrentPopup.focus();
// 		}
// 	} else {
// 		QDEB&&console.debug("QNotePopToggle(), popupId = -not set-");
// 		QNotePopForTab(Tab, POP_FOCUS).then(isPopped => {
// 			QDEB&&console.debug("QNotePopToggle(), isPopped =", isPopped);
// 		}).catch(silentCatcher());
// 	}
// }
async function createPopupWindow(note: INote): Promise<QNotePopup> {
	return new Promise(async resolve => {
		return getCurrentWindowIdAnd().then(async windowId => {
			var popup: QNotePopup | undefined;
			if(Prefs.windowOption === 'xul'){
				popup = new QNotePopup(PopupManager.allocId(), windowId, note, Prefs);
			} else if(Prefs.windowOption == 'webext'){
				console.error("TODO: new WebExtensionNoteWindow");
				// CurrentNote = new WebExtensionNoteWindow(CurrentWindowId);
			} else {
				throw new TypeError("Prefs.windowOption");
			}

			if(popup){
				PopupManager.add(popup);
				// const l = (w: NoteWindow) => {
				// 	QDEB&&console.debug("afterclose", w);
				// 	focusMessagePane(windowId);
				// };
				// popup.addListener("afterclose", l);
				resolve(popup);
			}
		});
	});

}

// async function initCurrentNote(): Promise<boolean> {
// 	QDEB&&console.debug(`initCurrentNote()`);

// 	resetTbState();

// 	const windowId = await getCurrentWindowId();

// 	if(windowId === undefined){
// 		console.error("Could not find current window");
// 		return false;
// 	}

// 	var popup: NoteWindow;

// 	if(Prefs.windowOption === 'xul'){
// 		popup = new QNotePopup(windowId);
// 	} else if(Prefs.windowOption == 'webext'){
// 		console.error("TODO: new WebExtensionNoteWindow");
// 		// CurrentNote = new WebExtensionNoteWindow(CurrentWindowId);
// 	} else {
// 		throw new TypeError("Prefs.windowOption");
// 	}

// 	// CurrentNote.note.addListener("afterupdate", (n, action) => {
// 	// 	QDEB&&console.debug("afterupdate", action);
// 	// 	if(CurrentNote.messageId){
// 	// 		mpUpdateForMessage(CurrentNote.messageId);
// 	// 		// if(Prefs.useTag){
// 	// 		// 	tagMessage(CurrentNote.messageId, Prefs.tagName, action === "save");
// 	// 		// }
// 	// 	}
// 	// });

// 	popup.addListener("afterclose", () => {
// 		QDEB&&console.debug("afterclose");
// 		focusMessagePane(CurrentPopup.windowId);
// 	});

// 	return true;
// }

// We call this after options has been changed
async function sendPrefs(){
	browser.qapp.setPrefs({
		storageOption: Prefs.storageOption,
		storageFolder: Prefs.storageFolder,
		showFirstChars: Prefs.showFirstChars,
		printAttachTop: Prefs.printAttachTop,
		printAttachBottom: Prefs.printAttachBottom,
		messageAttachTop: Prefs.messageAttachTop,
		messageAttachBottom: Prefs.messageAttachBottom,
		attachTemplate: Prefs.attachTemplate,
		treatTextAsHtml: Prefs.treatTextAsHtml,
	});
}

async function setUpExtension(){
	// CurrentWindowId = await getCurrentWindowId();
	// CurrentTabId = await getCurrentTabId();

	// CurrentNote = null;
	// CurrentLang = browser.i18n.getUILanguage();

	resetTbState();
	Prefs = await loadPrefsWithDefaults();

	// QDEB = !!Prefs.enableDebug;
	await browser.qapp.setDebug(QDEB);
	await browser.qpopup.setDebug(QDEB);

	sendPrefs();
}

// async function menuHandler(info){
// 	if(!info.selectedMessages){
// 		console.error("No info.selectedMessages found");
// 		return;
// 	}

// 	const messages = info.selectedMessages.messages;
// 	if(info.selectedMessages.messages.length === 1){
// 		// process single message
// 		const id = messages[0].id;

// 		// New
// 		if(info.menuItemId === "create" || info.menuItemId === "modify"){
// 			QNotePopForMessage(id, POP_FOCUS);
// 		} else if(info.menuItemId === "paste"){
// 			Menu.paste(id);
// 		} else if(info.menuItemId === "options"){
// 			browser.runtime.openOptionsPage();
// 		// Existing
// 		} else if(info.menuItemId === "copy"){
// 			loadNoteForMessage(id).then(note => {
// 				addToClipboard(note);
// 			});
// 		} else if(info.menuItemId === "paste"){
// 			if(await isClipboardSet()){
// 				Menu.paste(id);
// 			}
// 		} else if(info.menuItemId === "delete"){
// 			if(CurrentNote.messageId === id){
// 				await CurrentNote.silentlyDeleteAndClose();
// 			} else {
// 				if(await confirmDelete()) {
// 					deleteNoteForMessage(id).then(updateNoteView).catch(e => browser.legacy.alert(_("error.deleting.note"), e.message));
// 				}
// 			}
// 		} else if(info.menuItemId === "reset"){
// 			if(CurrentNote.messageId === id){
// 				CurrentNote.reset().then(() => {
// 					CurrentNote.silentlyPersistAndClose().then(() => {
// 						QNotePopForMessage(id, CurrentNote.flags)
// 					});
// 				});
// 			} else {
// 				saveNoteForMessage(id, {
// 					left: undefined,
// 					top: undefined,
// 					width: Prefs.width,
// 					height: Prefs.height
// 				}).catch(e => browser.legacy.alert(_("error.saving.note"), e.message));
// 			}
// 		} else {
// 			console.error("Unknown menuItemId: ", info.menuItemId);
// 		}
// 	} else {
// 		// process multiple message selection
// 		if(info.menuItemId === "create_multi"){
// 			createMultiNote(info.selectedMessages.messages, true);
// 		} else if(info.menuItemId === "paste_multi"){
// 			if(await isClipboardSet()){
// 				for(const m of info.selectedMessages.messages){
// 					await Menu.paste(m.id);
// 				};
// 				mpUpdateForMultiMessage(info.selectedMessages.messages);
// 			}
// 		} else if(info.menuItemId === "delete_multi"){
// 			if(await confirmDelete()) {
// 				for(const m of info.selectedMessages.messages){
// 					await ifNoteForMessageExists(m.id).then(() => {
// 						if(CurrentNote.messageId === m.id){
// 							CurrentNote.silentlyDeleteAndClose();
// 						} else {
// 							deleteNoteForMessage(m.id).then(updateNoteView).catch(e => browser.legacy.alert(_("error.deleting.note"), e.message));
// 						}
// 					}).catch(silentCatcher);
// 				}
// 				mpUpdateForMultiMessage(info.selectedMessages.messages);
// 			}
// 		} else if(info.menuItemId === "reset_multi"){
// 			for(const m of info.selectedMessages.messages){
// 				ifNoteForMessageExists(m.id).then(() => {
// 					if(CurrentNote.messageId === m.id){
// 						CurrentNote.reset().then(() => {
// 							CurrentNote.silentlyPersistAndClose().then(() => {
// 								QNotePopForMessage(m.id, CurrentNote.flags)
// 							});
// 						});
// 					} else {
// 						saveNoteForMessage(m.id, {
// 							left: undefined,
// 							top: undefined,
// 							width: Prefs.width,
// 							height: Prefs.height
// 						}).catch(e => browser.legacy.alert(_("error.saving.note"), e.message));
// 					}
// 				}).catch(silentCatcher);
// 			}
// 		} else {
// 			console.error("Unknown menuItemId: ", info.menuItemId);
// 		}
// 	}
// }

async function initExtension(){
	QDEB&&console.debug("initExtension()");
	await browser.ResourceUrl.register("qnote");
	// await browser.ResourceUrl.register("qnote", "modules/");
	// await browser.ResourceUrl.register("qnote", "api/");
	// await browser.ResourceUrl.register("qnote", "scripts/");

	await setUpExtension();
	console.log("setUpExtension() - OK");
	// TBInfo = await browser.runtime.getBrowserInfo();

	// Return notes to qapp on request
	// browser.qapp.onNoteRequest.addListener(getQAppNoteData);
	browser.qapp.onNoteRequest.addListener(async (keyId: string) => loadNote(keyId).then(note => note.data));

	// window.addEventListener("unhandledrejection", event => {
	// 	console.warn(`Unhandle: ${event.reason}`, event);
	// });

	await browser.qapp.init();

	// KeyDown from qapp
	browser.qapp.onKeyDown.addListener(e => {
		let ret = {};
		if(e.key === 'Escape'){
			console.error("TODO: Escape");
			// if(CurrentNote.shown){
			// 	CurrentNote.needSaveOnClose = false;
			// 	CurrentNote.silentlyPersistAndClose();
			// 	ret.preventDefault = true;
			// }
		}
		return ret;
	});

	// Change folders
	browser.mailTabs.onDisplayedFolderChanged.addListener(async (Tab, displayedFolder) => {
		QDEB&&console.debug("mailTabs.onDisplayedFolderChanged()");

		// await CurrentNote.silentlyPersistAndClose();
		console.error("TODO: CurrentNote.silentlyPersistAndClose()");

		resetTbState();
	});

	// Create tabs
	browser.tabs.onCreated.addListener(async Tab => {
		QDEB&&console.debug("tabs.onCreated(), tabId:", Tab.id, Tab);

		// await CurrentNote.silentlyPersistAndClose();
		console.error("TODO: CurrentNote.silentlyPersistAndClose()");
	});

	// Change tabs
	browser.tabs.onActivated.addListener(async activeInfo => {
		QDEB&&console.debug("tabs.onActivated()", activeInfo);

		// await CurrentNote.silentlyPersistAndClose();
		// CurrentTabId = activeInfo.tabId;
		console.error("TODO: CurrentNote.silentlyPersistAndClose()");
	});

	// Create window
	browser.windows.onCreated.addListener(async Window => {
		QDEB&&console.debug("windows.onCreated(), windowId:", Window.id, Window);

		// This check is needed for WebExtensionNoteWindow
		if(Window.type === "normal"){
			// CurrentWindowId = Window.id;
		}

		// await CurrentNote.silentlyPersistAndClose();
		console.error("TODO: CurrentNote.silentlyPersistAndClose()");
	});

	browser.windows.onRemoved.addListener(async windowId => {
		QDEB&&console.debug("windows.onRemoved(), windowId:", windowId);
		console.error("TODO: browser.windows.onRemoved()");

		// mpUpdateCurrent();
	});

	// Change focus
	browser.windows.onFocusChanged.addListener(async windowId => {
		// QDEB&&console.debug("windows.onFocusChanged(), windowId:", windowId, CurrentNote);

		// if(
		// 	true
		// 	|| windowId === browser.windows.WINDOW_ID_NONE
		// 	|| windowId === CurrentNote.windowId
		// 	|| windowId === CurrentNote.popupId // This check is needed for WebExtensionNoteWindow
		// ){
		// 	return;
		// }

		// CurrentNote.windowId = CurrentWindowId = windowId;
		// CurrentTabId = await getCurrentTabId();

		// mpUpdateCurrent();

		// await CurrentNote.silentlyPersistAndClose();
	});

	async function changeMessage(Tab: browser.tabs.Tab, Message: browser.messages.MessageHeader){
		QDEB&&console.debug("onMessageDisplayed(), messageId:", Message.id);

		let flags = POP_EXISTING;
		if(Prefs.focusOnDisplay){
			flags |= POP_FOCUS;
		}

		return loadNoteForMessageAnd(Message.id).then(async note => {
			console.log("loadNoteForMessageAnd", note);
			if(note.data.exists){
				mpUpdateForNote(note.data);
				createPopupWindow(note).then(async w => w.pop());
			}
			// createPopupWindow(note).then(async w => w.pop())
		});
		// .catch(() => console.error("loadNoteForMessageAnd.catch", arguments));

		// const p = await pop();
		// if(p){
		// 	loadNoteForMessage(Message.id).then(note => {
		// 		p.pop(note);
		// 	});
		// }

		//updateCurrentMessage(CurrentTab);

		// await CurrentPopup.silentlyPersistAndClose();

		// CurrentTabId = getTabId(Tab);

		// if(Prefs.showOnSelect){
		// 	QNotePopForMessage(Message.id, flags).then(isPopped =>{
		// 		// Focus message pane in case popped
		// 		console.error("TODO: focusMessagePane()");
		// 		// if(isPopped && !Prefs.focusOnDisplay){
		// 		// 	focusMessagePane(CurrentNote.windowId);
		// 		// }
		// 	});
		// } else {
		// 	mpUpdateForMessage(Message.id);
		// }
	}

	const toggler = async (Tab?: browser.tabs.Tab) => {
		console.error("TODO: toggler");
		// let tabInfo = await browser.tabs.get(Tab.id || CurrentTabId));

		// console.log(tabInfo);
		// if(tabInfo.type === "mail"){
		// 	let mList = await browser.mailTabs.getSelectedMessages(getTabId(Tab || CurrentTabId));
		// 	if(!CurrentNote.shown && (mList.messages.length > 1)){
		// 		createMultiNote(mList.messages, false);
		// 		return;
		// 	}
		// }

		// QNotePopToggle(Tab || CurrentTabId);
	};

	// Click on main toolbar
	BrowserAction.onClicked.addListener(Tab => {
		QDEB&&console.debug("action.onClicked()");

		// QNotePopToggle(Tab || CurrentTabId);
		toggler(Tab);
	});

	// // Click on QNote button
	browser.messageDisplayAction.onClicked.addListener(Tab => {
		QDEB&&console.debug("messageDisplayAction.onClicked()");

		// QNotePopToggle(Tab || CurrentTabId);
		toggler(Tab);
	});

	// Handle keyboard shortcuts
	browser.commands.onCommand.addListener(command => {
		if(command === 'qnote') {
			QDEB&&console.debug("commands.onCommand()", command);
			toggler();
		} else {
			console.error("Unknown browser.commands.onCommand: ", command);
		}
	});

	// TODO: bring back
	// Context menu on message
	// browser.menus.onShown.addListener(async info => {
	// 	await browser.menus.removeAll();

	// 	if(info && info.selectedMessages && (info.selectedMessages.messages.length > 1)){
	// 		await Menu.multi();
	// 		browser.menus.refresh();
	// 	} else {
	// 		let id;

	// 		// Click other than from messageList
	// 		if(info.selectedMessages === undefined){
	// 			let msg = await getDisplayedMessageForTab(CurrentTabId);
	// 			id = msg.id;
	// 		} else {
	// 			if(info.selectedMessages.messages.length != 1){
	// 				return;
	// 			}
	// 			id = Menu.getId(info);
	// 		}

	// 		loadNoteForMessage(id).then(async note => {
	// 			if(note.exists){
	// 				await Menu.modify();
	// 			} else {
	// 				await Menu.new();
	// 			}
	// 			browser.menus.refresh();
	// 		}).catch(silentCatcher());
	// 	}
	// });

	browser.messageDisplay.onMessagesDisplayed.addListener(async (Tab: browser.tabs.Tab, Messages: browser.messages.MessageHeader[] | browser.messages.MessageList) => {
		let m;
		if("messages" in Messages){
			m = Messages.messages;
		} else {
			m = Messages;
		}

		// let m = Messages.messages ? Messages.messages : Messages;
		if(m.length == 1){
			changeMessage(Tab, m[0]);
		} else {
			console.error("TODO: multi message");
			// await CurrentNote.silentlyPersistAndClose();

			// CurrentTabId = getTabId(Tab);

			// // disble icons for multi select
			// updateIcons(false);

			// mpUpdateForMultiMessage(m);
		}
	});

	browser.NotifyTools.onNotifyBackground.addListener(async (data) => {
		if(data.command == "pop"){
			browser.messages.query({
				headerMessageId: data.messageId
			}).then(async (MList: browser.messages.MessageList | string) => {
				if(typeof MList === "string"){
					console.warn("Unexpected query result: ", MList);
					return;
				}

				if(MList.messages && (MList.messages.length === 1)){
					let Message = MList.messages[0];
					let flags = POP_EXISTING;
					if(Prefs.focusOnDisplay){
						flags |= POP_FOCUS;
					}

					QNotePopForMessage(Message.id, flags).then((isPopped: any) =>{
						// Focus message pane in case popped
						if(isPopped && !Prefs.focusOnDisplay){
							console.error("TODO: focusMessagePane()");
							// focusMessagePane(CurrentPopup.windowId);
						}
					});
				}
			});
		}
	});

	// TODO: bring back
	// browser.scripting.messageDisplay.registerScripts([{
	// 	id: "qnote-message-display",
	// 	js: ["scripts/message-display.js"],
	// 	css: ["html/qpopup.css"],
	// }]);

	// browser.messageDisplayScripts.register({ js: [{ file: "scripts/message-display.js" }] });

	// async function getSelectedMessageReply(keyId: string): Promise<SelectedMessageReply> {
	// 	return loadNote(keyId).then(note => new SelectedMessageReply(note.data, Prefs));
	// }

	// browser.runtime.onMessage.addListener(async (data: any, sender: browser.runtime.MessageSender): Promise<void> => {
	// 	QDEB&&console.log("Received message: ", data, sender);
	// 	if(data.command === "getSelectedMessage"){
	// 		getCurrentTabIdAnd().then(tabId => {
	// 			browser.messageDisplay.getDisplayedMessages(tabId).then(async List => {
	// 				if(List.messages.length === 1){
	// 					const reply = await getSelectedMessageReply(List.messages[0].headerMessageId);
	// 					QDEB&&console.log("Sending selectedMessage reply: ", reply);
	// 					browser.tabs.sendMessage(tabId, reply);
	// 				} else {
	// 					console.error("Unexpected getDisplayedMessages() count: ", List.messages.length);
	// 				}
	// 			});
	// 		});
	// 	} else {
	// 		console.error("Unknown message: ", data);
	// 	}
	// });

	browser.runtime.onConnect.addListener(function(connection){
		QDEB&&console.log("New connection: ", connection);
		connection.onMessage.addListener((data: any) => {
			// if(data.command === "getSelectedMessage"){
			// 	getCurrentTabIdAnd().then(tabId => {
			// 		browser.messageDisplay.getDisplayedMessages(tabId).then(async List => {
			// 			if(List.messages.length === 1){
			// 				const reply = await getSelectedMessageReply(List.messages[0].headerMessageId);
			// 				QDEB&&console.log("Posting selectedMessage reply: ", reply);
			// 				connection.postMessage(reply);
			// 			} else {
			// 				console.error("Unexpected getDisplayedMessages() count: ", List.messages.length);
			// 			}
			// 		});
			// 	});

			let message;

			if(message = (new QPopupDOMContentLoadedMessage).parse(data)){
				QDEB&&console.log(`Received ${data.command} message: `, data);
				const p = PopupManager.get(message.id);
				(new UpdateQPoppupMessage).post(connection, {
					id: p.id,
					opts: p.note2QPopupOptions()
				});
			} else {
				console.error("Unknown or incorrect message: ", data);
			}
		});
	});

	// TODO: bring back
	// browser.menus.onClicked.addListener(menuHandler);

	// TODO: add "install", "update" handling if neccessary
	// if temporary - add reload button to the main toolbar to speed up developement
	// messenger.runtime.onInstalled.addListener(async ({ reason, temporary })
}

async function waitForLoad() {
	let windows = await browser.windows.getAll({windowTypes:["normal"]});
	if (windows.length > 0) {
		return false;
	}

	return new Promise(function(resolve, reject) {
		function listener() {
			browser.windows.onCreated.removeListener(listener);
			resolve(true);
		}
		browser.windows.onCreated.addListener(listener);
	});
}

waitForLoad().then(isAppStartup => initExtension());

// await browser.ResourceUrl.register("exampleapi", "modules");
