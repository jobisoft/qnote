var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
var { QCustomActionAbstract } = ChromeUtils.import("resource://qnote/modules/QCustomActionAbstract.js");

var EXPORTED_SYMBOLS = ["QCustomActionAdd"];

class QCustomActionAdd extends QCustomActionAbstract {
	constructor(options) {
		super(options);
		this.id = 'qnote@dqdp.net#qnote-action-add';
		this.xulName = "qnote-ruleactiontarget-add";
	}

	_apply(keyIds, actionValue){
		if(!actionValue){
			return;
		}

		let ts = Date.now();
		let w = this.Services.wm.getMostRecentWindow("mail:3pane");

		keyIds.forEach(keyId => {
			let note = {
				text: actionValue,
				ts: ts
			};

			if(!this.QN.getExistingFile(this.notesRoot, keyId)){
				this.QN.save(this.notesRoot, keyId, note);
				this.API.noteGrabber.delete(keyId);
				this.API.updateView(w, keyId);
			}
		});
	}
};
