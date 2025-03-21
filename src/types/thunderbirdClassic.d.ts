// Based on work of Brummolix
/*!
Copyright 2019 Brummolix (AutoarchiveReloaded, https://github.com/Brummolix/AutoarchiveReloaded )

 This file is part of AutoarchiveReloaded.

	AutoarchiveReloaded is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	AutoarchiveReloaded is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with AutoarchiveReloaded.  If not, see <http://www.gnu.org/licenses/>.
*/

//Attention this file should have NO global imports! Only local imports like import("./something").type are allowed
//otherwise TS creates code with import instead of simpy using the stuff
//see https://stackoverflow.com/questions/39040108/import-class-in-definition-file-d-ts

//Attention:
//this types are not complete! I only added, what is used by AutoarchiveReloaded at the moment!

/* eslint-disable @typescript-eslint/class-name-casing */
/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable max-classes-per-file */

//general---------------------------------------------------------------------------------------------------------

//define a Type "keyword"
//see https://github.com/Microsoft/TypeScript/issues/20719
// eslint-disable-next-line @typescript-eslint/type-annotation-spacing
type Type<T> = new(...args: any[]) => T;

//LegacyAddOn--------------------------------------------------------------------------------------------------

//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIJSCID
declare interface nsIJSCID
{
	getService<T>(type: Type<T>): T;
	createInstance<T>(type: Type<T>): T;
}

declare class nsISupports {
	QueryInterface<T>(type: Type<T>): T;
}

interface ExtensionParentFire {
	// Bug 1754866 fire.sync doesn't match documentation.
	sync(...args: any): any
	async(...args: any): any
	raw(...args: any): any
	asyncWithoutClone(...args: any): any
}

interface Extension {
	windowManager: WindowManager
	localizeMessage(name: string): string
	rootURI: any
	baseURI: Ci.nsIURI
	getURL(url: string): string
}

declare class GlobalManager {
	getExtension(extensionId: string): Extension;
}

interface ExtensionParent {
	GlobalManager: GlobalManager;

}

interface ExtensionParentExport {
	ExtensionParent: ExtensionParent
}

// namespace ExtensionParent
// {
// 	interface Fire {
// 		// Bug 1754866 fire.sync doesn't match documentation.
// 		sync(...args: any): any
// 		async(...args: any): any
// 		raw(...args: any): any
// 		asyncWithoutClone(...args: any): any
// 	}

// 	interface Extension {
// 	}

// 	class GlobalManager {
// 		getExtension(name: string): Extension;
// 	}
// 	// ExtensionParent: ExtensionParent;
// 	// GlobalManager: GlobalManager;
// }

declare class BP {
	static for(extension: any, window: any): any;
	constructor(extension: string, viewNode: any, popupURL: string, browserStyle: any, fixedWidth?: boolean, blockParser?: boolean);
	extension: any;
	popupURL: any;
	viewNode: any;
	browserStyle: any;
	window: Window;
	destroyed: boolean;
	fixedWidth: boolean;
	blockParser: boolean;
	contentReady: any;
	_resolveContentReady: any;
	browser: any;
	browserLoaded: any;
	browserLoadedDeferred: {
		resolve: any;
		reject: any;
	};
	browserReady: any;
	close(): void;
	destroy(): any;
	stack: any;
	destroyBrowser(browser: any, finalize?: boolean): void;
	receiveMessage({ name, data }: {
		name: any;
		data: any;
	}): void;
	get DESTROY_EVENT(): void;
	get STYLESHEETS(): string[];
	get panel(): any;
	dimensions: any;
	handleEvent(event: any): void;
	createBrowser(viewNode: any, popupURL?: any): any;
	unblockParser(): void;
	resizeBrowser({ width, height, detail }: {
		width: any;
		height: any;
		detail: any;
	}): void;
	lastCalculatedInViewHeight: number;
	setBackground(background: any): void;
	background: any;
	viewHeight: number;
	extraHeight: any;
}

interface BasePopupExport {
	BasePopup: typeof BP;
}

declare namespace Components
{
	class utils
	{
		//with TB67 the import is only possible with returning the imports, see https://wiki.mozilla.org/Thunderbird/Add-ons_Guide_63
		//therefore the import function returns different types depending on the input path

		public static import(path: "resource:///modules/iteratorUtils.jsm"): IteratorUtils;
		public static import(path: "resource:///modules/MailServices.jsm"): MailServicesExport;
		public static import(path: "resource:///modules/ExtensionPopups.jsm"): BasePopupExport;
		public static import(path: "resource://gre/modules/ExtensionParent.jsm"): ExtensionParentExport;
		public static import(path: "resource://gre/modules/ExtensionCommon.jsm"): any;
		public static import(path: "resource://gre/modules/FileUtils.jsm"): any;
		public static import(path: "resource://gre/modules/ExtensionUtils.jsm"): any;
		public static importESModule(path: "resource:///modules/ExtensionPopups.sys.mjs"): BasePopupExport;
		public static importESModule(path: "chrome://messenger/content/ThreadPaneColumns.mjs"): any;
		public static importESModule(path: "chrome://messenger/content/thread-pane-columns.mjs"): any;
		public static importESModule(path: "resource://gre/modules/FileUtils.sys.mjs"): any;
		public static importESModule(path: "resource://gre/modules/Services.jsm"): any;
		public static importESModule(path: "resource://gre/modules/ExtensionParent.sys.mjs"): ExtensionParentExport;
		public static importESModule(path: "resource:///modules/MailServices.sys.mjs"): MailServicesExport;
		public static importESModule(path: "resource://gre/modules/ExtensionUtils.sys.mjs"): any;

		public static importESModule(path: "resource://qnote/modules-exp/QPopups.sys.mjs?version=version"): BasePopupExport;
		public static importESModule(path: "resource://qnote/modules/QEventDispatcher.mjs?version=version"): typeof import("../modules/QEventDispatcher.mjs");
		public static importESModule(path: "resource://qnote/modules/DOMLocalizator.mjs?version=version"): typeof import("../modules/DOMLocalizator.mjs");
		public static importESModule(path: "resource://qnote/modules-exp/QNoteFile.mjs?version=version"): typeof import("../modules-exp/QNoteFile.mts");
		public static importESModule(path: "resource://qnote/modules-exp/XNoteFile.mjs?version=version"): typeof import("../modules-exp/XNoteFile.mts");
		public static importESModule(path: "resource://qnote/modules-exp/QNoteFilters.mjs?version=version"): typeof import("../modules-exp/QNoteFilters.mts");
		public static importESModule(path: "resource://qnote/modules-exp/api.mjs?version=version"): typeof import("../modules-exp/api.mts");
		public static importESModule(path: "resource://qnote/modules/common.mjs?version=version"): typeof import("../modules/common.mts");
		public static unload(path: string): void;
		public static defineModuleGetter(param1: any, param2: any, param3: any): void;
	}

	//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference
	namespace interfaces
	{
		class AString {
			length?: number | null
			value?: string | null
		}

		class nsIInterfaceRequestor extends nsISupports {
			getInterface<T>(type: Type<T>): T;

		}

		class nsIInputStream extends nsISupports {
			close(): void;
		}

		class nsIOutputStream extends nsISupports {
		}

		class nsIScriptableInputStream extends nsISupports {
			init(aInputStream: nsIInputStream): void;
			read(aCount: number): string;
			close(): void;
			// ACString readBytes(in unsigned long aCount);
		}

		class nsIUnicharInputStream extends nsISupports{
			// unsigned long readString(in unsigned long aCount, out AString aString);
			readString(aCount: number, aString: AString): number;
			close(): void;
		}

		class nsIConverterInputStream extends nsIUnicharInputStream {
			readonly DEFAULT_REPLACEMENT_CHARACTER = 0xFFFD;
			readonly ERRORS_ARE_FATAL = 0;
			init(nsIInputStream: nsIInputStream, aCharset: string, aBufferSize: number, aReplacementChar: number): void;
		}

		class nsIFileInputStream extends nsIInputStream {
			init(file: any,  ioFlags: number, perm: number, behaviorFlags: number | null): void;
		}

		type nsIIDRef = any;
		class nsIProperties extends nsISupports {
			get(prop: string, iid: nsIIDRef): any
			set(prop: string, value: any): void
			has(prop: string): boolean
			undefine(prop: string): void
		}

		type nsILoadContext = any;
		class nsITransferable extends nsISupports {
			init(aContext: nsILoadContext): void
			addDataFlavor(aDataFlavor: string): void;
			getAnyTransferData(aFlavor: AString, aData: any): void;
			setTransferData(aFlavor: string, aData: any): void;
		}

		class imgIContainer extends nsISupports {
		}

		class imgITools extends nsISupports {
			decodeImageFromBuffer(aBuffer: string, aSize: number, aMimeType: string): imgIContainer;
			decodeImageFromArrayBuffer(aArrayBuffer: ArrayBuffer, aMimeType: string): imgIContainer;
		}

		class nsISupportsString {
			data: any
		}

		class nsIWebNavigation extends nsISupports {
		}

		class nsIDocShellTreeItem extends nsISupports {
		}

		class nsIDocShell extends nsIDocShellTreeItem {
		}

		class nsIStyleSheetService extends nsISupports {
			readonly AGENT_SHEET = 0
			readonly USER_SHEET = 1
			readonly AUTHOR_SHEET = 2
			sheetRegistered(sheetURI: nsIURI, type: number): boolean
			unregisterSheet(sheetURI: nsIURI, type: number): void;
			loadAndRegisterSheet(sheetURI: nsIURI, type: number): void;
		}

		class nsIIOService extends nsISupports {
			newURI(aSin: string, aOriginCharset?: string | null, aBaseURI?: nsIURI | null): nsIURI;
		}

		class nsIDOMWindow extends Window
		{
			docShell: nsIDocShell
			browsingContext: BrowsingContext
		}

		class nsIClipboardOwner extends nsISupports {
		}

		class nsIClipboard extends nsISupports {
			static readonly kSelectionClipboard = 0;
			static readonly kGlobalClipboard = 1;
			static readonly kFindClipboard = 2;
			static readonly kSelectionCache = 3;

			getData(aTransferable: nsITransferable, aWhichClipboard: number): void;
			setData (aTransferable: nsITransferable, anOwner: nsIClipboardOwner | null, aWhichClipboard: number): void;
		}

		class nsIUnicharOutputStream extends nsISupports {
			write(aCount: number): boolean;
			writeString(str: AString): boolean;
			close(): void;
			flush(): void;
		}

		class nsIConverterOutputStream extends nsIUnicharOutputStream {
			// public init(stream: nsIOutputStream, charset: string, bufferSize: number, replacementCharacter: number): void;
			init(aOutStream: nsIFileOutputStream, aCharset: string): void;
			// public writeString(str: string): boolean;
		}


		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIPromptService
		class nsIPromptService
		{
			public alert(parent: nsIDOMWindow | null, title: string, msg: string): void;
			public confirm(parent: nsIDOMWindow | null, title: string, msg: string): boolean;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIConsoleService
		class nsIConsoleService
		{
			public logStringMessage(msg: string): void;
		}

		class nsISimpleEnumerator<T>
		{

		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIMsgFolder
		class nsIMsgFolder
		{
			public name: string;
			public readonly server: nsIMsgIncomingServer;
			public readonly URI: string;
			public readonly hasSubFolders: boolean;
			public readonly subFolders: nsISimpleEnumerator<nsIMsgFolder>;

			public getFlag(flagName: nsMsgFolderFlags): boolean;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Thunderbird/Thunderbird_extensions/HowTos/Activity_Manager
		class nsIActivityManager
		{
			public addActivity(activity: nsIActivity): void;
			public removeActivity(id: string): void;
		}

		//https://dxr.mozilla.org/comm-central/source/comm/mail/base/content/mailWindowOverlay.js
		class BatchMessageMover
		{
			public archiveMessages(messages: nsIMsgDBHdr[]): void;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIMsgAccount
		class nsIMsgAccount
		{
			public incomingServer: nsIMsgIncomingServer;
			public key: string;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIMsgIncomingServer
		class nsIMsgIncomingServer
		{
			public readonly serverURI: string;
			public type: "pop3" | "imap" | "nntp" | "none" | "im" | "rss" | "exquilla"; //"and so on"?
			public rootFolder: nsIMsgFolder;
			public prettyName: string;
			public readonly localStoreType: "mailbox" | "imap" | "news" | "exquilla";

			public getBoolValue(attr: string): boolean;
			public getIntValue(attr: string): number;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIXULAppInfo
		class nsIXULAppInfo
		{
			public readonly ID: string;
			public readonly version: string;
			public readonly appBuildID: string;
			public readonly platformVersion: string;
			public readonly platformBuildID: string;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIStringBundle
		class nsIStringBundle
		{
			public GetStringFromName(name: string): string;
			public formatStringFromName(name: string, params: string[], length: number): string;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIMsgSearchSession
		// class nsIMsgSearchSession
		// {
		// 	public addScopeTerm(scope: nsMsgSearchScope, folder: nsIMsgFolder): void;
		// 	public createTerm(): nsMsgSearchTerm;
		// 	public appendTerm(term: nsMsgSearchTerm): void;
		// 	public registerListener(listener: nsIMsgSearchNotify): void;
		// 	public search(window: nsIMsgWindow | null): void;
		// }

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIMsgWindow
		class nsIMsgWindow
		{
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIMsgSearchTerm
		// class nsMsgSearchTerm
		// {
		// 	public attrib: nsMsgSearchAttrib;
		// 	public value: nsIMsgSearchValue;
		// 	public op: nsMsgSearchOp;
		// 	public booleanAnd: boolean;
		// }

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIMsgSearchValue
		class nsIMsgSearchValue
		{
			public attrib: nsMsgSearchAttrib;
			public age: number;
			public status: nsMsgMessageFlags;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIMsgSearchNotify
		interface nsIMsgSearchNotify
		{
			onSearchHit(header: nsIMsgDBHdr, folder: nsIMsgFolder): void;

			// notification that a search has finished.
			onSearchDone(status: number): void;

			/*
			 * called when a new search begins
			 */
			onNewSearch(): void;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIFileOutputStream
		class nsIFileOutputStream
		{
			public init(file: nsIFile, ioFlags: number, perm: number, behaviorFlags: number): void;
			write(aBuf: string, aCount: number): number;
			close(): void;
			flush(): void;
		}

		class nsIFile extends nsISupports {
			static readonly NORMAL_FILE_TYPE = 0
			static readonly DIRECTORY_TYPE   = 1
			readonly path: string
		}

		class nsIURI extends nsISupports {
			resolve(relativePath: string): string;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIStringBundleService
		class nsIStringBundleService
		{
			public createBundle(urlSpec: string): nsIStringBundle;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIWindowMediator
		class nsIWindowMediator
		{
			public getMostRecentWindow(windowType: string | null): nsIDOMWindow;
			public getMostRecentWindow(windowType: "mail:3pane"): Mail3Pane;

		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsMsgFolderFlagType
		class nsMsgFolderFlags
		{
			public static readonly Trash: nsMsgFolderFlags;
			public static readonly Junk: nsMsgFolderFlags;
			public static readonly Queue: nsMsgFolderFlags;
			public static readonly Drafts: nsMsgFolderFlags;
			public static readonly Templates: nsMsgFolderFlags;
			public static readonly Archive: nsMsgFolderFlags;
			public static readonly Virtual: nsMsgFolderFlags;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsMsgSearchScope
		class nsMsgSearchScope
		{
			public static readonly offlineMail: nsMsgSearchScope;
		}

		class nsMsgSearchOp {
			static readonly Contains = 0; /* for text attributes      */
			static readonly DoesntContain = 1;
			static readonly Is = 2; /* is and isn't also apply to some non-text attrs */
			static readonly Isnt = 3;
			static readonly IsEmpty = 4;

			static readonly IsBefore = 5; /* for date attributes              */
			static readonly IsAfter = 6;

			static readonly IsHigherThan = 7; /* for priority. Is also applies  */
			static readonly IsLowerThan = 8;

			static readonly BeginsWith = 9;
			static readonly EndsWith = 10;

			static readonly SoundsLike = 11; /* for LDAP phoenetic matching      */
			static readonly LdapDwim = 12; /* Do What I Mean for simple search */

			static readonly IsGreaterThan = 13;
			static readonly IsLessThan = 14;

			static readonly NameCompletion = 15; /* Name Completion operator...as the name implies =) */
			static readonly IsInAB = 16;
			static readonly IsntInAB = 17;
			static readonly IsntEmpty = 18; /* primarily for tags */
			static readonly Matches = 19; /* generic term for use by custom terms */
			static readonly DoesntMatch = 20; /* generic term for use by custom terms */
			static readonly kNumMsgSearchOperators  = 21;     /* must be last operator */
		}

		type nsMsgSearchOpValue = number;

		interface nsIMsgSearchCustomTerm {
			/**
			 * globally unique string to identify this search term.
			 * recommended form: ExtensionName@example.com#TermName
			 * Commas and quotes are not allowed, the id must not
			 * parse to an integer, and names of standard search
			 * attributes in SearchAttribEntryTable in nsMsgSearchTerm.cpp
			 * are not allowed.
			 */
			readonly id: string

			/// name to display in term list. This should be localized. */
			readonly name: string

			/// Does this term need the message body?
			readonly needsBody: boolean

			/**
			 * Is this custom term enabled?
			 *
			 * @param scope          search scope (nsMsgSearchScope)
			 * @param op             search operator (nsMsgSearchOp). If null, determine
			 *                       if term is available for any operator.
			 *
			 * @return               true if enabled
			 */
			getEnabled(scope: nsMsgSearchScopeValue, op: nsMsgSearchOpValue): boolean

			/**
			 * Is this custom term available?
			 *
			 * @param scope          search scope (nsMsgSearchScope)
			 * @param op             search operator (nsMsgSearchOp). If null, determine
			 *                       if term is available for any operator.
			 *
			 * @return               true if available
			 */
			getAvailable(scope: nsMsgSearchScopeValue, op: nsMsgSearchOpValue): boolean

			/**
			 * List the valid operators for this term.
			 *
			 * @param scope          search scope (nsMsgSearchScope)
			 *
			 * @return               array of operators
			 */
			getAvailableOperators(scope: nsMsgSearchScopeValue): Array<nsMsgSearchOpValue>

			/**
			 * Apply the custom search term to a message
			 *
			 * @param msgHdr       header database reference representing the message
			 * @param searchValue  user-set value to use in the search
			 * @param searchOp     search operator (Contains, IsHigherThan, etc.)
			 *
			 * @return             true if the term matches the message, else false
			 */

			match(msgHdr: nsIMsgDBHdr, searchValue: string, searchOp: nsMsgSearchOpValue): boolean
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsMsgSearchOp
		// class nsMsgSearchOp
		// {
		// 	public static readonly IsGreaterThan: nsMsgSearchOp;
		// 	public static readonly Isnt: nsMsgSearchOp;
		// 	public static readonly Contains: nsMsgSearchOp;
		// 	public static readonly DoesntContain: nsMsgSearchOp;
		// 	public static readonly Is: nsMsgSearchOp;
		// 	public static readonly BeginsWith: nsMsgSearchOp;
		// 	public static readonly EndsWith: nsMsgSearchOp;
		// }

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsMsgSearchAttrib
		class nsMsgSearchAttrib
		{
			public static readonly AgeInDays: nsMsgSearchAttrib;
			public static readonly MsgStatus: nsMsgSearchAttrib;
			public static readonly Custom: nsMsgSearchAttrib;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/nsMsgMessagesFlags
		class nsMsgMessageFlags
		{
			public static readonly IMAPDeleted: nsMsgMessageFlags;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/nsMsgNavigationType
		class nsMsgNavigationType
		{
			public static readonly firstMessage: nsMsgNavigationType;
		}

		class nsIActivity
		{
			public contextType: string;
			public contextObj: nsIMsgIncomingServer;
		}

		class nsIActivityEvent extends nsIActivity
		{
			public init(msg: string, value2: any, value3: string, time: number, date: number): void;
		}

		class nsIActivityStates
		{

		}

		class nsIActivityProcess extends nsIActivity
		{
			public static readonly STATE_COMPLETED: nsIActivityStates;

			public state: nsIActivityStates;
			public startTime: number;
			public id: string;

			public init(msg: string, value2: any): void;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIPrefService
		class nsIPrefService
		{
			public getBranch(aPrefRoot: string): nsIPrefBranch;
		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIMsgDBHdr
		// class nsIMsgDBHdr
		// {
		// 	public readonly isRead: boolean;
		// 	public readonly isFlagged: boolean;
		// 	public readonly dateInSeconds: number;
		// 	public readonly folder: nsIMsgFolder;
		// }

		class nsIMsgTag
		{

		}

		//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIPrefBranch
		class nsIPrefBranch
		{
			public getBoolPref(name: string, defaultValue: boolean | undefined): boolean;
			public getCharPref(name: string, defaultValue: string | undefined): string;
			public getChildList(startingAt: string, obj: object): string[];
			public setBoolPref(name: string, value: boolean): void;
		}

		class BrowsingContext {}

		enum nsIFilePicker_Mode {
			modeOpen         = 0,                        // Load a file or directory
			modeSave         = 1,                        // Save a file or directory
			modeGetFolder    = 2,                        // Select a folder/directory
			modeOpenMultiple = 3,                        // Load multiple files
		}

		enum nsIFilePicker_ResultCode {
			returnOK        = 0,                        // User hit Ok, process selection
			returnCancel    = 1,                        // User hit cancel, ignore selection
			returnReplace   = 2,                        // User acknowledged file already exists so ok to replace, process selection
		}

		interface nsIFilePickerShownCallback {
		}

		class nsIFilePicker extends nsISupports {
			static modeOpen        : nsIFilePicker_Mode.modeOpen
			static modeSave        : nsIFilePicker_Mode.modeSave
			static modeGetFolder   : nsIFilePicker_Mode.modeGetFolder
			static modeOpenMultiple: nsIFilePicker_Mode.modeOpenMultiple

			static returnOK        : nsIFilePicker_ResultCode.returnOK
			static returnCancel    : nsIFilePicker_ResultCode.returnCancel
			static returnReplace   : nsIFilePicker_ResultCode.returnReplace

			displayDirectory: nsIFile
			readonly file   : nsIFile

			init(browsingContext: BrowsingContext, title: string, mode: nsIFilePicker_Mode): void
			open(aFilePickerShownCallback: nsIFilePickerShownCallback): void
		}
	}

	//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Language_Bindings/Components.classes
	let classes: { [key: string]: nsIJSCID };
}

//https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/FileUtils.jsm
// declare class FileUtils
// {
// 	File: any
// 	MODE_RDONLY: number
// 	MODE_WRONLY: number
// 	MODE_RDWR: number
// 	MODE_CREATE: number
// 	MODE_APPEND: number
// 	MODE_TRUNCATE: number
// 	PERMS_FILE: number
// 	PERMS_DIRECTORY: number
// 	public static getFile(key: string, pathArray: string[], followLinks?: boolean): Ci.nsIFile
// 	getDir(key: any, pathArray: any): any;
// 	openFileOutputStream(file: any, modeFlags: any): any;
// 	openAtomicFileOutputStream(file: any, modeFlags: any): any;
// 	openSafeFileOutputStream(file: any, modeFlags: any): any;
// 	_initFileOutputStream(fos: any, file: any, modeFlags: any): any;
// 	closeAtomicFileOutputStream(stream: any): void;
// 	closeSafeFileOutputStream(stream: any): void;
// }

//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/Toolkit_API/extIApplication
declare class Application
{
	public static console: extIConsole;
}

//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/Toolkit_API/extIConsole
declare class extIConsole
{
	public log(msg: string): void;
}

declare class MailServicesAccounts
{
	public accounts: Ci.nsISimpleEnumerator<Ci.nsIMsgAccount>;
}

declare interface MailServicesExport
{
	MailServices: MailServices;
}

declare class nsMsgFilterType extends nsISupports {
	/* these longs are all actually of type nsMsgFilterTypeType */
	static readonly None             = 0x00;
	static readonly InboxRule        = 0x01;
	static readonly InboxJavaScript  = 0x02;
	static readonly Inbox            = 0x03; // InboxRule | InboxJavaScript;
	static readonly NewsRule         = 0x04;
	static readonly NewsJavaScript   = 0x08;
	static readonly News             = 0x0C; // NewsRule | NewsJavaScript;
	static readonly Incoming         = 0x0F; // Inbox | News;
	static readonly Manual           = 0x10;
	static readonly PostPlugin       = 0x20; // After bayes filtering
	static readonly PostOutgoing     = 0x40; // After sending
	static readonly Archive          = 0x80; // Before archiving
	static readonly Periodic         = 0x100;// On a repeating timer
	static readonly All              = 0x1F; // Incoming | Manual;
}
type nsMsgFilterTypeType = nsMsgFilterType;
type nsMsgSearchScopeValue = number;

declare class nsIMsgFolder extends nsISupports {
}

declare class nsIMsgDBHdr extends nsISupports {
	// void setStringProperty(in string propertyName, in  AUTF8String propertyValue);
	// AUTF8String getStringProperty(in string propertyName);
	// unsigned long getUint32Property(in string propertyName);
	// void setUint32Property(in string propertyName,
	//                        in unsigned long propertyVal);

	// accessors, to make our JS cleaner
	readonly isRead: boolean;
	readonly isFlagged: boolean;

	// Special accessor that checks if a message is part of an ignored subthread
	readonly isKilled: boolean;

	// Mark message routines
	markRead(read: boolean): void;
	markFlagged(flagged: boolean): void;
	markHasAttachments(hasAttachments: boolean): void;

	// static readonly priority: nsMsgPriorityValue;

	/* flag handling routines */
	flags: number;
	orFlags(flags: number): number;
	andFlags(flags: number): number;

	/* various threading stuff */
	// static readonly threadId: nsMsgKey;
	// static readonly messageKey: nsMsgKey;
	// static readonly threadParent: nsMsgKey;

	/* meta information about the message, learned from reading the message */

	/**
	 * For "Offline" supporting folders (IMAP, NNTP), .messageSize is
	 * the size of the original message on the server.
	 * For Local folders, this is the exact size of the message as written to
	 * the msgStore.
	 * See also Bug 1764857.
	 */
	messageSize: number;
	lineCount: number;
	/**
	 * The offset into the local folder/offline store of the message. This
	 * will be pluggable store-dependent, e.g., for mail dir it should
	 * always be 0.
	 */
	messageOffset: number;
	/**
	 * For "Offline" supporting folders (IMAP, NNTP): .offlineMessageSize is
	 * the exact size of the local copy of the message in the msgStore.
	 * If the message is not flagged Offline, this will be zero or unset.
	 * For Local folders, this is unset or zero.
	 * See also Bug 1764857.
	 */
	offlineMessageSize: number;
	/* common headers */
	// date: PRTime;
	readonly dateInSeconds: number;
	messageId: string;
	ccList: string;
	bccList: string;
	author: string;
	subject: string;
	recipients: string;

	/* anything below here still has to be fixed */
	setReferences(references: string): void;
	readonly numReferences: number;
	getStringReference(refNum: number): string;

	readonly mime2DecodedAuthor: string;
	readonly mime2DecodedSubject: string;
	readonly mime2DecodedRecipients: string;

	// Array<octet> getAuthorCollationKey();
	// Array<octet> getSubjectCollationKey();
	// Array<octet> getRecipientsCollationKey();

	charset: string;

	/**
	 * Returns the effective character set for the message (@ref charset).
	 * For NNTP, if there is no specific set defined for the message,
	 * the character set of the server instead.
	 */
	readonly effectiveCharset: string;

	accountKey: string;
	readonly folder: nsIMsgFolder;

	/// Array of names of all database properties in the header.
	readonly properties: Array<string>;
}

declare class nsIMsgCopyServiceListener extends nsISupports {
}

declare class nsIMsgWindow extends nsISupports {
}

declare interface nsIMsgFilterCustomAction {
	id: string
	name: string
	allowDuplicates: boolean
	isAsync: boolean
	needsBody: boolean
	isValidForType(type: nsMsgFilterTypeType, scope: nsMsgSearchScopeValue): boolean
	validateActionValue(actionValue: string, actionFolder: nsIMsgFolder, filterType: nsMsgFilterTypeType): string
	applyAction(
		msgHdrs: Array<nsIMsgDBHdr>,
		actionValue: string,
		copyListener: nsIMsgCopyServiceListener,
		filterType: nsMsgFilterTypeType,
		msgWindow: nsIMsgWindow
	): void
}

declare class nsIMsgFilterService extends nsISupports {
	getCustomAction(id: string): nsIMsgFilterCustomAction
	addCustomAction(aAction: nsIMsgFilterCustomAction): void
	getCustomTerm(id: string): Ci.nsIMsgSearchCustomTerm
	addCustomTerm(aTerm: Ci.nsIMsgSearchCustomTerm): void
}

declare interface MailServices
{
	accounts: MailServicesAccounts;
	filters: nsIMsgFilterService;
}

//https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Add-on_Manager/Addon
declare class Addon
{
	public readonly type: string;
	public readonly name: string;
	public readonly id: string;
	public readonly version: string;
	public readonly isActive: boolean;
}

//https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Add-on_Manager/AddonManager
declare class AddonManager
{
	public static getAllAddons(AddonListCallback: (addons: Addon[]) => void): void;
}

interface IteratorUtils
{
	fixIterator<T>(collection: Ci.nsISimpleEnumerator<T>, objectType: Type<T>): T[];
}

//not official API
declare class FolderDisplayViewDb
{
	//show(folder:Ci.nsIMsgFolder):void;
}

//not official API
declare class FolderDisplayView
{
	public dbView: FolderDisplayViewDb;
}

//I don't know the real type name
declare class FolderDisplay
{
	public displayedFolder: Ci.nsIMsgFolder;
	public selectedCount: number;

	//not official API
	public view: FolderDisplayView;

	public navigate(type: Ci.nsMsgNavigationType): void;
	public show(folder: Ci.nsIMsgFolder): void;
}

//I don't know the real type name
declare class MessageIdentity
{
	public archiveEnabled: boolean;
}

declare class ThunderbirdNavigator extends Navigator
{
	public oscpu: string;
}

declare class Mail3Pane extends Ci.nsIDOMWindow
{
	public gFolderDisplay: FolderDisplay;
	// eslint-disable-next-line @typescript-eslint/type-annotation-spacing
	public BatchMessageMover: new() => Ci.BatchMessageMover; //tricky, this is an inner class
	public navigator: ThunderbirdNavigator;

	public getIdentityForHeader(msg: nsIMsgDBHdr): MessageIdentity;
}

declare class ThunderbirdError
{
	public fileName: string;
	public lineNumber: number;
	public stack: string;

	public toSource(): string;
}

//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIObserver
declare class nsIObserver
{

}

declare interface nsIWindowWatcher {
	unregisterNotification(aObserver: nsIObserver): void;
	registerNotification(observer: nsIObserver): void;
}

interface mozIDOMWindowProxy extends nsISupports {
}

type OutParam<T> = { value?: T };

// https://searchfox.org/mozilla-central/source/dom/interfaces/base/nsIFocusManager.idl
interface nsIFocusManager extends nsISupports {
	readonly FLAG_RAISE: 1;
	readonly FLAG_NOSCROLL: 2;
	readonly FLAG_NOSWITCHFRAME: 4;
	readonly FLAG_NOPARENTFRAME: 8;
	readonly FLAG_NONSYSTEMCALLER: 16;
	readonly FLAG_BYMOUSE: 4096;
	readonly FLAG_BYKEY: 8192;
	readonly FLAG_BYMOVEFOCUS: 16384;
	readonly FLAG_NOSHOWRING: 32768;
	readonly FLAG_SHOWRING: 1048576;
	readonly FLAG_BYTOUCH: 2097152;
	readonly FLAG_BYJS: 4194304;
	readonly FLAG_BYLONGPRESS: 8388608;
	readonly METHOD_MASK: 14708736;
	readonly METHODANDRING_MASK: 15790080;
	readonly MOVEFOCUS_FORWARD: 1;
	readonly MOVEFOCUS_BACKWARD: 2;
	readonly MOVEFOCUS_FORWARDDOC: 3;
	readonly MOVEFOCUS_BACKWARDDOC: 4;
	readonly MOVEFOCUS_FIRST: 5;
	readonly MOVEFOCUS_LAST: 6;
	readonly MOVEFOCUS_ROOT: 7;
	readonly MOVEFOCUS_CARET: 8;
	readonly MOVEFOCUS_FIRSTDOC: 9;
	readonly MOVEFOCUS_LASTDOC: 10;

	readonly activeWindow: mozIDOMWindowProxy;
	readonly activeBrowsingContext: any; //BrowsingContext;
	focusedWindow: mozIDOMWindowProxy;
	readonly focusedContentBrowsingContext: any; // BrowsingContext;
	readonly focusedElement: Element;
	getLastFocusMethod(window: mozIDOMWindowProxy): u32;
	setFocus(aElement: Element, aFlags: u32): void;
	moveFocus(aWindow: mozIDOMWindowProxy, aStartElement: Element, aType: u32, aFlags: u32): Element;
	clearFocus(aWindow: mozIDOMWindowProxy): void;
	getFocusedElementForWindow(aWindow: mozIDOMWindowProxy, aDeep: boolean, aFocusedWindow: OutParam<mozIDOMWindowProxy>): Element;
	moveCaretToFocus(aWindow: mozIDOMWindowProxy): void;
	elementIsFocusable(aElement: Element, aFlags: u32): boolean;
}

//https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Services.jsm
declare namespace Services
{
	interface mozIDOMWindowProxy extends nsISupports {}
	interface nsIJSEnumerator extends nsISupports {
		iterator(): nsIJSEnumerator;
		next(): any;
	}

	interface nsID<uuid = string> {
		readonly number: uuid;
	}

	interface nsISimpleEnumeratorBase extends nsISupports {
		iterator(): nsIJSEnumerator;
		entries(aIface: nsID): nsIJSEnumerator;
	}

	interface nsISimpleEnumerator extends nsISimpleEnumeratorBase {
		hasMoreElements(): boolean;
		getNext(): nsISupports;
	}

	interface nsIObserverService extends nsISupports {
		addObserver(anObserver: nsIObserver, aTopic: string, ownsWeak?: boolean): void;
		removeObserver(anObserver: nsIObserver, aTopic: string): void;
		notifyObservers(aSubject: nsISupports | null, aTopic: string, someData?: string): void;
		enumerateObservers(aTopic: string): nsISimpleEnumerator;
	}

	namespace prompt {
		function alert(aParent: mozIDOMWindowProxy | null, aDialogTitle: string | null, aText: string | null): void
		function confirm(aParent: mozIDOMWindowProxy | null, aDialogTitle: string | null, aText: string | null): boolean
	}

	namespace vc {
		function compare(A: string, B: string): number
	}

	let obs: nsIObserverService;
	let clipboard: Ci.nsIClipboard;
	let ww: nsIWindowWatcher;
	let wm: Ci.nsIWindowMediator;
	let prefs: any;
	let scriptloader: any;
	let io: Components.interfaces.nsIIOService // Cu.nsIIOService & nsINetUtil & nsISpeculativeConnect
	let focus: nsIFocusManager;
}

declare namespace ExtensionCommon
{
	interface Fire {
		wakeup: Function
		sync: Function
		async: Function
		raw: Function
	}

	abstract class  ExtensionAPI
	{
		public abstract getAPI(context: any): {};
	}

	class EventManager
	{
		public constructor(params: EventManagerParams);
		public api(): {};
	}

	interface EventManagerParams {
		context: object;
		module?: string;
		event?: string;
		extensionApi?: object;
		name?: string;
		register: Function;
		inputHandling?: boolean;
	}
}

declare class ExperimentAPIManager
{

}

// //https://thunderbird-webextensions.readthedocs.io/en/latest/how-to/experiments.html
// interface FolderManager
// {
// 	get(accountId: string, path: string): Ci.nsIMsgFolder;
// 	convert(realFolder: Ci.nsIMsgFolder): MailFolder;
// }

// //https://thunderbird-webextensions.readthedocs.io/en/latest/how-to/experiments.html
// interface MessageManager
// {
// 	get(messageId: number): Ci.nsIMsgDBHdr;
// 	convert(realMessage: Ci.nsIMsgDBHdr): MessageHeader;

// 	// Start a MessageList from an array or enumerator of nsIMsgDBHdr ???
// 	//startMessageList(realFolder.messages);
// }

declare class ParentMessageManager
{

}

declare class WindowManager
{
	get(windowId: number): any
}

// Grabbed from lib.gecko.dom.d.ts
interface TouchEventHandlersEventMap {
    touchcancel: TouchEvent;
    touchend: TouchEvent;
    touchmove: TouchEvent;
    touchstart: TouchEvent;
}

interface TouchEventHandlers {
    ontouchcancel: ((this: TouchEventHandlers, ev: Event) => any) | null;
    ontouchend: ((this: TouchEventHandlers, ev: Event) => any) | null;
    ontouchmove: ((this: TouchEventHandlers, ev: Event) => any) | null;
    ontouchstart: ((this: TouchEventHandlers, ev: Event) => any) | null;
    addEventListener<K extends keyof TouchEventHandlersEventMap>(type: K, listener: (this: TouchEventHandlers, ev: TouchEventHandlersEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof TouchEventHandlersEventMap>(type: K, listener: (this: TouchEventHandlers, ev: TouchEventHandlersEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}


interface OnErrorEventHandlerForNodesEventMap {
    "error": ErrorEvent;
}

interface OnErrorEventHandlerForNodes {
    onerror: OnErrorEventHandler;
    addEventListener<K extends keyof OnErrorEventHandlerForNodesEventMap>(type: K, listener: (this: OnErrorEventHandlerForNodes, ev: OnErrorEventHandlerForNodesEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof OnErrorEventHandlerForNodesEventMap>(type: K, listener: (this: OnErrorEventHandlerForNodes, ev: OnErrorEventHandlerForNodesEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface HTMLOrForeignElement {
    autofocus: boolean;
    readonly dataset: DOMStringMap;
    tabIndex: number;
    blur(): void;
    focus(options?: FocusOptions): void;
}

interface XULElementEventMap extends ElementEventMap, GlobalEventHandlersEventMap, OnErrorEventHandlerForNodesEventMap, TouchEventHandlersEventMap {
}

interface nsIController extends nsISupports {
	isCommandEnabled(command: string): boolean;
	supportsCommand(command: string): boolean;
	doCommand(command: string): void;
	onEvent(eventName: string): void;
}

interface nsIControllers extends nsISupports {
	getControllerForCommand(command: string): nsIController;
	insertControllerAt(index: u32, controller: nsIController): void;
	removeControllerAt(index: u32): nsIController;
	getControllerAt(index: u32): nsIController;
	appendController(controller: nsIController): void;
	removeController(controller: nsIController): void;
	getControllerId(controller: nsIController): u32;
	getControllerById(controllerID: u32): nsIController;
	getControllerCount(): u32;
}

type XULControllers = nsIControllers;

interface XULElement extends Element, ElementCSSInlineStyle, GlobalEventHandlers, HTMLOrForeignElement, OnErrorEventHandlerForNodes {
    collapsed: boolean;
    contextMenu: string;
    readonly controllers: XULControllers;
    hidden: boolean;
    menu: string;
    observes: string;
    src: string;
    tooltip: string;
    tooltipText: string;
    click(): void;
    doCommand(): void;
    hasMenu(): boolean;
    openMenu(open: boolean): void;
    addEventListener<K extends keyof XULElementEventMap>(type: K, listener: (this: XULElement, ev: XULElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof XULElementEventMap>(type: K, listener: (this: XULElement, ev: XULElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var XULElement: {
    prototype: XULElement;
    new(): XULElement;
    isInstance(obj: any): obj is XULElement;
};

interface XULFrameElement extends XULElement, MozFrameLoaderOwner {
    readonly browserId: number;
    readonly contentDocument: Document | null;
    readonly contentWindow: WindowProxy | null;
    readonly docShell: any; //nsIDocShell | null;
    openWindowInfo: any; //nsIOpenWindowInfo | null;
    readonly webNavigation: any; //nsIWebNavigation | null;
    addEventListener<K extends keyof XULElementEventMap>(type: K, listener: (this: XULFrameElement, ev: XULElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof XULElementEventMap>(type: K, listener: (this: XULFrameElement, ev: XULElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var XULFrameElement: {
    prototype: XULFrameElement;
    new(): XULFrameElement;
    isInstance(obj: any): obj is XULFrameElement;
};

interface MozFrameLoaderOwner {
    readonly browsingContext: any; // BrowsingContext | null;
    readonly frameLoader: any; // FrameLoader | null;
    changeRemoteness(aOptions: any): void;  // aOptions: RemotenessOptions
    swapFrameLoaders(aOtherLoaderOwner: XULFrameElement): void;
    swapFrameLoaders(aOtherLoaderOwner: HTMLIFrameElement): void;
}

import Cu = Components.utils;
import ChromeUtils = Components.utils;
import Cc = Components.classes;
import Ci = Components.interfaces;
