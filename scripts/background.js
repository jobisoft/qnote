// TODO: note optionally next to message
// TODO: check xnote version setting
// TODO: rename xnote, qnote API
// TODO: menu delete all notes from selected messages?
var Prefs;
var CurrentNote;
var CurrentTab;

var qcon = {
	group: (label) => {
		if(!Prefs || Prefs.enableDebug) {
			console.group(label);
		}
	},
	groupEnd: () => {
		if(!Prefs || Prefs.enableDebug) {
			console.groupEnd();
		}
	}
}

for(let k of ["log", "debug", "error", "warn", "info"]){
	qcon[k] = (...args) => {
		if(!Prefs || Prefs.enableDebug) {
			console[k](...args);
		}
	}
}

async function focusMessagePane(){
	return browser.windows.getCurrent().then(async window => {
		await browser.windows.update(window.id, {
			focused: true
		});

		// browser.windows.update() will focus main window, but not message list
		await browser.qapp.messagesFocus();
	});
}

function initCurrentNote(){
	if(Prefs.windowOption === 'xul'){
		CurrentNote = new XULNoteWindow();
	} else if(Prefs.windowOption == 'webext'){
		CurrentNote = new WebExtensionNoteWindow();
	}

	CurrentNote.onAfterClose = async (isClosed) => {
		if(isClosed){
			if(CurrentNote.needSaveOnClose && CurrentNote.note){
				let f;
				if(CurrentNote.note.exists){ // Update, delete
					f = CurrentNote.note.text ? "save" : "delete"; // delete if no text
				} else {
					if(CurrentNote.note.text){ // Create new
						f = "save";
					}
				}

				if(f){
					qcon.debug(`CurrentNote.close() and ${f}`);
					if(await CurrentNote.note[f]()){
						updateDisplayedMessage(CurrentTab);
						if(Prefs.useTag){
							tagMessage(CurrentNote.messageId, f === "save");
						}
					}
				} else {
					qcon.debug(`CurrentNote.close() and do nothing`);
				}
			}

			focusMessagePane();

			CurrentNote.init();
		} else {
			qcon.debug("CurrentNote.close() - not popped");
		}
	}
}

async function initExtension(){
	qcon.debug("initExtension()");
	Prefs = await loadPrefsWithDefaults();

	initCurrentNote();

	await browser.qapp.init();

	// Context menu on message
	browser.menus.onShown.addListener(info => {
		// Avoid context menu other than from messageList
		if(info.selectedMessages === undefined){
			return;
		}

		browser.menus.removeAll();

		if(info.selectedMessages.messages.length != 1){
			return;
		}

		loadNoteForMessage(Menu.getId(info)).then(note => {
			Menu[note.exists ? "modify" : "new"]();
			browser.menus.refresh();
		});
	});

	// Change folders
	browser.mailTabs.onDisplayedFolderChanged.addListener(async (tab, displayedFolder) => {
		qcon.debug("browser.mailTabs.onDisplayedFolderChanged()");
		await CurrentNote.close();
		updateDisplayedMessage(tab);
	});

	// Change tabs
	browser.tabs.onActivated.addListener(async activeInfo => {
		qcon.debug("browser.tabs.onActivated()");
		CurrentTab = activeInfo.tabId;
		await CurrentNote.close();
		updateDisplayedMessage(CurrentTab);
	});

	// Handle keyboard shortcuts
	browser.commands.onCommand.addListener(command => {
		if(command === 'qnote') {
			QNotePopToggle().then(()=>{
				QNoteTabPop(CurrentTab, true, true, true);
			});
		}
	});

	// Click on main window toolbar
	browser.browserAction.onClicked.addListener(tab => {
		qcon.debug("browser.browserAction.onClicked()");
		QNotePopToggle().then(()=>{
			QNoteTabPop(tab);
		});
	});

	// Click on QNote button
	browser.messageDisplayAction.onClicked.addListener(tab => {
		qcon.debug("browser.messageDisplayAction.onClicked()");
		QNotePopToggle().then(()=>{
			QNoteTabPop(tab);
		});
	});

	// Change message
	browser.messageDisplay.onMessageDisplayed.addListener((tab, message) => {
		qcon.debug("browser.messageDisplay.onMessageDisplayed()");
		QNoteMessagePop(message, false, Prefs.showOnSelect, false);
		updateDisplayedMessage(tab);
	});

	browser.qapp.updateView();
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
