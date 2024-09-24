# Table of contents
1. [About](#about)
2. [Features](#features)
3. [Usage](#usage)
4. [Storage](#storage)
5. [Popup windows](#popup-windows)
6. [Screenshots](#screenshots)
7. [Known issues](#known-issues)
8. [Support](#support)
9. [Credits](#credits)

# About

This is the source code repository for the Thunderbird [QNote](https://addons.thunderbird.net/en-US/thunderbird/addon/qnote/) extension.

<p>
	<img src="https://img.shields.io/badge/QNote-v0.14.0-brightgreen">
	<img src="https://img.shields.io/badge/Thunderbird-v68.2.0%20--%20131.x-brightgreen">
</p>

# Features

- Add notes to email messages
- Save note position and size; multiple default note positions
- Searchable notes using Thunderbird's built-in search (Edit / Find / Search Messages)
- Filter and apply actions based on different conditions (Tools / Message Filters)
- Clipboard copy/paste
- Column with note icon and preview
- Actions on multiple message selections: create, update, delete, reset, copy, paste
- Attach notes to email message body
- Attach notes when printing
- Light and dark themes
- Multiple locales and localized date formats
- Automatically tag messages when adding notes
- Fully compatible with <a href="https://addons.thunderbird.net/en-US/thunderbird/addon/xnotepp/">XNote++</a> (3.0.0)
- Import/export between XNote++ (.xnote) and QNote (.qnote) file formats
- Supports Thunderbird versions, starting from 68.2.0 (check <a href="https://addons.thunderbird.net/en-US/thunderbird/addon/qnote/versions/">archive</a> for latest supported version for your Thunderbird installation)
- Templating support for attaching to print and email message

# Usage

- Press Alt+Q to toggle the note
- Press ESC to close the note without saving
- Right-click on message(s) to access more commands in the context menu
- Use the built-in search to search within notes
- Use the built-in Filter Manager to create custom filters and actions


# Storage

There are two options for storing notes:

- Storing inside the extension (deprecated)
- Storing in a folder

Currently, there is no built-in mechanism for sharing notes across multiple computers. For now, in order to share notes across multiple computers, you could use shared folder solutions like Dropbox, NFS, or Windows/Samba shares.

If you are migrating from the XNote++ extension, you have two options: using the XNote++ folder directly or importing notes into the QNote folder. For more information, refer to the doc\migration-guide.md

__If you are using internal storage, don't forget to export data before removing the extension.__

# Popup windows

There are two options for note windows:

- floating panel
- popup window

_Floating panel_ looks better but might not work well on all platforms. Fall back to _popup window_ if you experience difficulties with the _floating panel_. The _popup window_ uses Thunderbird's standard API.

# Screenshots

<p align="center" width="100%">
<img width="40%" src="thunderbird.net/screenshots/note.jpg" alt="Note popup">
<img width="40%" src="thunderbird.net/screenshots/attach_message.jpg" alt="Attach to message">
</p>
<p align="center" width="100%">
<img width="40%" src="thunderbird.net/screenshots/attach_print.jpg" alt="Attach to print">
<img width="40%" src="thunderbird.net/screenshots/column.jpg" alt="Column header">
</p>
<p align="center" width="100%">
<img width="40%" src="thunderbird.net/screenshots/filters.jpg" alt="Message filters">
<img width="40%" src="thunderbird.net/screenshots/search.jpg" alt="Message search">
</p>

# Known issues
- It does not work very well together with the <a href="https://addons.thunderbird.net/en-US/thunderbird/addon/gmail-conversation-view/">Conversations</a> extension.

# Support

Maintaining this extension requires a significant amount of time. If you find it useful, and you'd like to support its development, contributions in [EUR](https://www.paypal.com/donate/?hosted_button_id=CCFL84AMQKV4S) or [USD](https://www.paypal.com/donate/?hosted_button_id=NKF22QJS87LWN) via PayPal would be greatly appreciated.

# Credits

- Beautiful icons sourced from the [Gartoon Redux Action Icons Pack](https://www.iconarchive.com/show/gartoon-action-icons-by-gartoon-team.html)
- Date formatting is provided by the [Luxon](https://github.com/moment/luxon/) library
