// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * A class for moving clipboard items between the plugin and the OS.
 */

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/**
 * @private
 * @enum {string}
 */
var ItemTypes = {
  TEXT_TYPE: 'text/plain',
  TEXT_UTF8_TYPE: 'text/plain; charset=UTF-8'
};

/**
 * @constructor
 * @param {remoting.ClientPlugin} plugin
 * @implements {base.Disposable}
 */
remoting.Clipboard = function(plugin) {
  /** @private {string} */
  this.previousContent_ = '';

  /** @private {boolean} */
  this.itemFromHostTextPending_ = false;

  /** @private {boolean} */
  this.blockOneClipboardSend_ = true;

  /** @private */
  this.plugin_ = plugin;

  /** @private */
  this.eventHooks_ = new base.Disposables(
      new base.DomEventHook(plugin.element(), 'focus',
                            this.initiateToHost_.bind(this), false),
      new base.DomEventHook(window, 'paste', this.onPaste_.bind(this), false),
      new base.DomEventHook(window, 'copy', this.onCopy_.bind(this), false));

  // Do a paste operation, but make sure the resulting clipboard data isn't sent
  // to the host. This stops the host seeing items that were placed on the
  // clipboard before the session began. The user may not have intended such
  // items to be sent to the host.
  this.initiateToHost_();
  this.plugin_.setClipboardHandler(this.fromHost_.bind(this));
};

remoting.Clipboard.prototype.dispose = function() {
  this.plugin_.setClipboardHandler(base.doNothing);
  this.plugin_ = null;
  base.dispose(this.eventHooks_);
  this.eventHooks_ = null;
};

/**
 * Accepts a clipboard from the OS, and sends any changed clipboard items to
 * the host.
 *
 * Currently only text items are supported.
 *
 * @param {ClipboardData} clipboardData
 * @return {void} Nothing.
 * @private
 */
remoting.Clipboard.prototype.toHost_ = function(clipboardData) {
  if (!clipboardData || !clipboardData.types || !clipboardData.getData) {
    console.log('Got invalid clipboardData.');
    return;
  }
  for (var i = 0; i < clipboardData.types.length; i++) {
    var type = clipboardData.types[i];
    var item = clipboardData.getData(type);
    if (!item) {
      item = '';
    }
    console.log('Got clipboard from OS, type: ' + type +
                ' length: ' + item.length + ' new: ' +
                (item != this.previousContent_) + ' blocking-send: ' +
                this.blockOneClipboardSend_);
    // The browser presents text clipboard items as 'text/plain'.
    if (type == ItemTypes.TEXT_TYPE) {
      // Don't send the same item more than once. Otherwise the item may be
      // sent to and fro indefinitely.
      if (item != this.previousContent_) {
        if (!this.blockOneClipboardSend_) {
          // The plugin's JSON reader emits UTF-8.
          console.log('Sending clipboard to host.');
          this.plugin_.sendClipboardItem(ItemTypes.TEXT_UTF8_TYPE, item);
        }
        this.previousContent_ = item;
      }
    }
  }
  this.blockOneClipboardSend_ = false;
};

/**
 * Accepts a clipboard item from the host, and stores it so that toOs() will
 * subsequently send it to the OS clipboard.
 *
 * @param {string} mimeType The MIME type of the clipboard item.
 * @param {string} item The clipboard item.
 * @return {void} Nothing.
 */
remoting.Clipboard.prototype.fromHost_ = function(mimeType, item) {
  // The plugin's JSON layer will correctly convert only UTF-8 data sent from
  // the host.
  console.log('Got clipboard from host, type: ' + mimeType +
              ' length: ' + item.length + ' new: ' +
              (item != this.previousContent_));
  if (mimeType != ItemTypes.TEXT_UTF8_TYPE) {
    return;
  }
  if (item == this.previousContent_) {
    return;
  }
  this.previousContent_ = item;
  this.itemFromHostTextPending_ = true;
  this.initiateToOs_();
};

/**
 * Moves any pending clipboard items to a ClipboardData object.
 *
 * @param {ClipboardData} clipboardData
 * @return {boolean} Whether any clipboard items were moved to the ClipboardData
 *     object.
 * @private
 */
remoting.Clipboard.prototype.toOs_ = function(clipboardData) {
  if (!this.itemFromHostTextPending_) {
    console.log('Got unexpected clipboard copy event.');
    return false;
  }
  // The JSON layer between the plugin and this webapp converts UTF-8 to the
  // JS string encoding. The browser will convert JS strings to the correct
  // encoding, per OS and locale conventions, provided the data type is
  // 'text/plain'.
  console.log('Setting OS clipboard, length: ' + this.previousContent_.length);
  clipboardData.setData(ItemTypes.TEXT_TYPE, this.previousContent_);
  this.itemFromHostTextPending_ = false;
  return true;
};

/**
 * Initiates the process of sending any fresh items on the OS clipboard, to the
 * host.
 *
 * This method makes the browser fire a paste event, which provides access to
 * the OS clipboard. That event will be caught by a handler in the document,
 * which will call toHost().
 * @private
 */
remoting.Clipboard.prototype.initiateToHost_ = function() {
  // It would be cleaner to send a paste command to the plugin element,
  // but that's not supported.
  //console.log('Initiating clipboard paste.');
  document.execCommand('paste');
};

/**
 * Initiates the process of sending any items freshly received from the host,
 * to the OS clipboard.
 *
 * This method makes the browser fire a copy event, which provides access to
 * the OS clipboard. That event will be caught by a handler in the document,
 * which will call toOs().
 * @private
 */
remoting.Clipboard.prototype.initiateToOs_ = function() {
  // It would be cleaner to send a paste command to the plugin element,
  // but that's not supported.
  console.log('Initiating clipboard copy.');
  document.execCommand('copy');
};

/**
 * Callback function called when the browser window gets a paste operation.
 *
 * @param {Event} event
 * @return {void} Nothing.
 * @private
 */
remoting.Clipboard.prototype.onPaste_ = function(event) {
  if (event && event.clipboardData) {
    this.toHost_(event.clipboardData);
  }
};

/**
 * Callback function called when the browser window gets a copy operation.
 *
 * @param {Event} event
 * @return {void} Nothing.
 * @private
 */
remoting.Clipboard.prototype.onCopy_ = function(event) {
  if (event && event.clipboardData && this.toOs_(event.clipboardData)) {
    // The default action may overwrite items that we added to clipboardData.
    event.preventDefault();
  }
};

})();
