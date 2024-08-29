import { DefaultNote, NoteData } from './Note.mjs';

export class QNoteFolder extends DefaultNote {
	root: string;

	constructor(keyId: string, root: string) {
		super(keyId);
		this.root = root;
	}

	async load(): Promise<NoteData> {
		this.data = new NoteData(this.keyId);

		let data = await browser.qnote.load(this.root, this.data.keyId);

		// Check maybe XNote exists
		if(!data.exists){
			data = await browser.xnote.load(this.root, this.data.keyId);
		}

		if(data.exists){
			this.data = data;
		}

		return this.data;
	}

	async save(){
		browser.qnote.save(this.root, this.data.keyId, this.data).then(() => true).catch(() => false);
		// return super.saver(() => browser.qnote.saveNote(this.root, this.data.keyId, this.data).then(() => true).catch(() => false));
	}

	async delete() {
		await browser.xnote.delete(this.root, this.data.keyId);
		await browser.qnote.delete(this.root, this.data.keyId);
		// return super.deleter(async () => {
		// 	// Remove XNote, if exists
		// 	await browser.xnote.deleteNote(this.root, this.data.keyId);

		// 	return browser.qnote.deleteNote(this.root, this.data.keyId);
		// });
	}
}
