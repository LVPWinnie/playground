// Copyright 2015 Las Venturas Playground. All rights reserved.
// Use of this source code is governed by the MIT license, a copy of which can
// be found in the LICENSE file.

const Dialog = require('components/dialogs/dialog.js');

// The menu class represents a user-visible dialog from which they can choose an option. Optionally,
// the menu can have up to four columns, each of which must have a set header. The width of columns
// will be decided by SA-MP.
//
// Each item added to the menu either should have an associated event listener, or the user's
// selection should be observed by waiting for the promise to displayForPlayer() to settle.
//
// There is no limit to the number of items that can be added to a menu, as this component will
// automatically split a dialog up in multiple dialogs when it doesn't fit in a single box. However,
// keep in mind that this does not provide a great user experience.
class Menu {
  constructor(title, columns = []) {
    if (!Array.isArray(columns) || columns.length > Menu.MAX_COLUMN_COUNT)
      throw new Error('Columns must be defined in an array with no more than ' + MAX_COLUMN_COUNT + ' entries.');

    this.title_ = title;
    this.columns_ = columns;
    this.items_ = [];
  }

  // -----------------------------------------------------------------------------------------------

  // Adds a new item to the menu. One argument must be passed for each of the columns in the menu,
  // and optionally one more for the event listener associated with this menu item.
  addItem() {
    let columnCount = Math.max(1, this.columns_.length);
    if (arguments.length < columnCount)
      throw new Error('Expected ' + columnCount + ' labels, got ' + arguments.length);

    let listener = null;
    if (arguments.length >= columnCount && typeof arguments[columnCount] == 'function')
      listener = arguments[columnCount];

    this.items_.push({
      labels: Array.prototype.slice.call(arguments, 0, columnCount),
      listener: listener
    });
  }

  // -----------------------------------------------------------------------------------------------

  // Displays the menu to |player|. A promise will be returned that will resolve when the dialog
  // has dismissed from their screen (even when they didn't make a selection). The promise will be
  // rejected when the |player| is not connected, or disconnects during the lifetime of the menu.
  displayForPlayer(player) {
    const isList = this.columns_.length == 0;

    return new Promise(resolve => {
      let menu = Dialog.displayMenu(player, isList, this.title_, this.buildContent(), 'Select', 'Cancel');

      // TODO(Russell): Handle pagination of menus.

      resolve(menu.then(result => {
        if (result.response != Dialog.PRIMARY_BUTTON)
          return null;

        if (result.item < 0 || result.item >= this.items_.length)
          throw new Error('An out-of-bounds menu item has been selected by the player.');

        let item = this.items_[result.item];
        if (item.listener) {
          return new Promise(async(resolve) => {
            await item.listener(player);
            resolve();

          }).then(() => { return { player: player, item: item.labels } });
        }

        return { player: player, item: item.labels };
      }));
    });
  }

  // Builds the content string for the menu in accordance with the syntax required for SA-MP's
  // DIALOG_STYLE_{LIST, TABLIST_HEADERS} dialog display styles.
  // http://wiki.sa-mp.com/wiki/Dialog_Styles#5_-_DIALOG_STYLE_TABLIST_HEADERS
  buildContent() {
    const rows = [];

    if (this.columns_.length > 0)
      rows.push(this.columns_.join('\t'));

    // Append each of the items to the rows to print.
    this.items_.forEach(item =>
        rows.push(item.labels.join('\t')));

    return rows.join('\n');
  }
};

// Maximum number of columns that can be added to a menu.
Menu.MAX_COLUMN_COUNT = 4;

exports = Menu;
