// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/**
 * @constructor
 */
function MessageWindowImpl() {
  /**
   * Used to prevent multiple responses due to the closeWindow handler.
   *
   * @private {boolean}
   */
  this.sentReply_ = false;

  window.addEventListener('message', this.onMessage_.bind(this), false);
};

/**
 * @param {Window} parentWindow The id of the window that showed the message.
 * @param {number} messageId The identifier of the message, as supplied by the
 *     parent.
 * @param {number} result 0 if window was closed without pressing a button;
 *     otherwise the index of the button pressed (e.g., 1 = primary).
 * @private
 */
MessageWindowImpl.prototype.sendReply_ = function(
    parentWindow, messageId, result) {
  // Only forward the first reply that we receive.
  if (!this.sentReply_) {
    var message = {
      source: 'message-window',
      command: 'messageWindowResult',
      id: messageId,
      result: result
    };
    parentWindow.postMessage(message, '*');
    this.sentReply_ = true;
  } else {
    // Make sure that the reply we're ignoring is from the window close.
    console.assert(result == 0, 'Received unexpected result ' + result + '.');
  }
};

/**
 * Initializes the button with the label and the click handler.
 * Hides the button if the label is null or undefined.
 *
 * @param {HTMLElement} button
 * @param {?string} label
 * @param {Function} clickHandler
 * @private
 */
MessageWindowImpl.prototype.initButton_ =
    function(button, label, clickHandler) {
  if (label) {
    button.innerText = label;
    button.addEventListener('click', clickHandler, false);
  }
  button.hidden = !Boolean(label);
};

/**
 * Event-handler callback, invoked when the parent window supplies the
 * message content.
 *
 * @param{Event} event
 * @private
 */
MessageWindowImpl.prototype.onMessage_ = function(event) {
  switch (event.data['command']) {
    case 'show':
      // Validate the message.
      var messageId = /** @type {number} */ (event.data['id']);
      var title = /** @type {string} */ (event.data['title']);
      var message = /** @type {string} */ (event.data['message']);
      var infobox = /** @type {string} */ (event.data['infobox']);
      var buttonLabel = /** @type {string} */ (event.data['buttonLabel']);
      /** @type {string} */
      var cancelButtonLabel = (event.data['cancelButtonLabel']);
      var showSpinner = /** @type {boolean} */ (event.data['showSpinner']);
      if (typeof(messageId) != 'number' ||
          typeof(title) != 'string' ||
          typeof(message) != 'string' ||
          typeof(infobox) != 'string' ||
          typeof(buttonLabel) != 'string' ||
          typeof(showSpinner) != 'boolean') {
        console.log('Bad show message:', event.data);
        break;
      }

      // Set the dialog text.
      var button = base.getHtmlElement('button-primary');
      var cancelButton = base.getHtmlElement('button-secondary');
      var messageDiv = base.getHtmlElement('message');
      var infoboxDiv = base.getHtmlElement('infobox');

      base.getHtmlElement('title').innerText = title;
      document.querySelector('title').innerText = title;
      messageDiv.innerHTML = message;

      if (showSpinner) {
        messageDiv.classList.add('waiting');
        messageDiv.classList.add('prominent');
      }
      if (infobox != '') {
        infoboxDiv.innerText = infobox;
      } else {
        infoboxDiv.hidden = true;
      }

      this.initButton_(
          button,
          buttonLabel,
          this.sendReply_.bind(this, event.source, messageId, 1));

      this.initButton_(
          cancelButton,
          cancelButtonLabel,
          this.sendReply_.bind(this, event.source, messageId, 0));

      var buttonToFocus = (cancelButtonLabel) ? cancelButton : button;
      buttonToFocus.focus();

      // Add a close handler in case the window is closed without clicking one
      // of the buttons. This will send a 0 as the result.
      // Note that when a button is pressed, this will result in sendReply_
      // being called multiple times (once for the button, once for close).
      chrome.app.window.current().onClosed.addListener(
          this.sendReply_.bind(this, event.source, messageId, 0));

      base.resizeWindowToContent(true);
      chrome.app.window.current().show();
      break;

    case 'update_message':
      var message = /** @type {string} */ (event.data['message']);
      if (typeof(message) != 'string') {
        console.log('Bad update_message message:', event.data);
        break;
      }

      var messageDiv = base.getHtmlElement('message');
      messageDiv.innerText = message;

      base.resizeWindowToContent(true);
      break;

    default:
      console.error('Unexpected message:', event.data);
  }
};

var messageWindow = new MessageWindowImpl();
