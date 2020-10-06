// TODO: column disappears when new window is created
var Prefs;
var CurrentNote;
var CurrentMessageId;

async function focusCurrentWindow(){
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
	CurrentNote.onAfterDelete = async (note)=>{
		await afterNoteDelete(note.messageId, note.note);
		note.init();
	}

	CurrentNote.onAfterSave = async (note)=>{
		await afterNoteSave(note.messageId, note.note);
		note.init();
	}
}

async function initExtension(){
	Prefs = await loadPrefsWithDefaults();

	initCurrentNote();

	await browser.qapp.init();

	// Context menu on message
	browser.menus.onShown.addListener((info) => {
		// Avoid context menu other than from messageList
		if(info.selectedMessages === undefined){
			return;
		}

		browser.menus.removeAll();

		if(info.selectedMessages.messages.length != 1){
			return;
		}

		createNoteForMessage(Menu.getId(info)).then((note)=>{
			note.load().then(async (data)=>{
				Menu[data?"modify":"new"]();
				await browser.menus.refresh();
			});
		});
	});

	// Change folders
	browser.mailTabs.onDisplayedFolderChanged.addListener((tab, displayedFolder)=>{
		return CurrentNote.close().then(()=>{
			return browser.qapp.updateView();
		});
	});

	// Change tabs
	browser.tabs.onActivated.addListener(activeInfo => {
		browser.tabs.query({
			mailTab: true
		}).then(tabs => {
			for(let tab of tabs){
				if(tab.id === activeInfo.tabid){
					return;
				}
			}
			CurrentNote.close();
		});
	});

	// Handle keyboard shortcuts
	var QCommands = {
		qnote: () => {
			if(CurrentMessageId){
				if(CurrentNote.windowId){
					CurrentNote.close();
				} else {
					CurrentNote.pop(CurrentMessageId, true, true).then(()=>{
						CurrentNote.focus();
					});
				}
			}
		}
	};

	browser.commands.onCommand.addListener(command => {
		if(QCommands[command]){
			QCommands[command]();
		}
	});

	browser.messageDisplay.onMessageDisplayed.addListener((tab, message) => {
		CurrentMessageId = message.id;
	});

	browser.qapp.updateView();
}

window.addEventListener("load", ()=>{
	initExtension();
});
