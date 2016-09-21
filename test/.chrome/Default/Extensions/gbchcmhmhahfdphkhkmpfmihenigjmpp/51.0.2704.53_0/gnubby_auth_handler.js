// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Class that routes gnubby-auth extension messages to and from the gnubbyd
 * extension.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @constructor
 * @implements {remoting.ProtocolExtension}
 */
remoting.GnubbyAuthHandler = function() {
  /** @private {?function(string,string)} */
  this.sendMessageToHostCallback_ = null;

  /** @private {string} */
  this.gnubbyExtensionId_ = '';

  /** @private {Promise} */
  this.gnubbyExtensionPromise_ = null;
};

/** @private @const  {string} */
remoting.GnubbyAuthHandler.EXTENSION_TYPE = 'gnubby-auth';

/** @private @const {string} */
remoting.GnubbyAuthHandler.GNUBBY_DEV_EXTENSION_ID =
    'dlfcjilkjfhdnfiecknlnddkmmiofjbg';

/** @private @const {string} */
remoting.GnubbyAuthHandler.GNUBBY_STABLE_EXTENSION_ID =
    'beknehfpfkghjoafdifaflglpjkojoco';

/**
 * Determines whether any supported Gnubby extensions are installed.
 *
 * @return {Promise<boolean>}  Promise that resolves after we have either found
 *     an extension or checked for the known extensions IDs without success.
 *     Returns true if an applicable gnubby extension was found.
 */
remoting.GnubbyAuthHandler.prototype.isGnubbyExtensionInstalled = function() {
  if (this.gnubbyExtensionPromise_) {
    return this.gnubbyExtensionPromise_;
  }

  var findGnubbyExtension = function(extensionId, resolve, reject) {
    var message_callback = function(response) {
      if (response) {
        this.gnubbyExtensionId_ = extensionId;
        resolve(true);
      } else {
        reject();
      }
    }.bind(this)

    chrome.runtime.sendMessage(extensionId, "HELLO", message_callback);
  }

  var findDevGnubbyExtension = findGnubbyExtension.bind(this,
      remoting.GnubbyAuthHandler.GNUBBY_DEV_EXTENSION_ID)

  var findStableGnubbyExtension = findGnubbyExtension.bind(this,
      remoting.GnubbyAuthHandler.GNUBBY_STABLE_EXTENSION_ID)

  this.gnubbyExtensionPromise_ = new Promise(
    findStableGnubbyExtension
  ).catch(function () {
      return new Promise(findDevGnubbyExtension);
    }
  ).catch(function () {
      // If no extensions are found, return false.
      return Promise.resolve(false);
    }
  );

  return this.gnubbyExtensionPromise_;
};

/** @override @return {Array<string>} */
remoting.GnubbyAuthHandler.prototype.getExtensionTypes = function() {
  return [remoting.GnubbyAuthHandler.EXTENSION_TYPE];
};

/**
 * @param {function(string,string)} sendMessageToHost Callback to send a message
 *     to the host.
 */
remoting.GnubbyAuthHandler.prototype.startExtension =
    function(sendMessageToHost) {
  this.sendMessageToHostCallback_ = sendMessageToHost;

  this.sendMessageToHost_({
    'type': 'control',
    'option': 'auth-v1'
  });
};

/**
 * @param {Object} data The data to send.
 * @private
 */
remoting.GnubbyAuthHandler.prototype.sendMessageToHost_ = function(data) {
  this.sendMessageToHostCallback_(remoting.GnubbyAuthHandler.EXTENSION_TYPE,
                                  JSON.stringify(data));
}

/**
 * Processes gnubby-auth messages.
 *
 * @param {string} type The message type.
 * @param {Object} message The parsed extension message data.
 * @return {boolean} True if the extension message was handled.
 */
remoting.GnubbyAuthHandler.prototype.onExtensionMessage =
    function(type, message) {
  var messageType = base.getStringAttr(message, 'type');
  if (messageType == 'data') {
    this.sendMessageToGnubbyd_({
      'type': 'auth-agent@openssh.com',
      'data': base.getArrayAttr(message, 'data')
    }, this.callback_.bind(this, base.getNumberAttr(message, 'connectionId')));
  } else {
    console.error('Invalid gnubby-auth message: ' + messageType);
    return false;
  }
  return true;
};

/**
 * Callback invoked with data to be returned to the host.
 * @param {number} connectionId The connection id.
 * @param {Object} response The JSON response with the data to send to the host.
 * @private
 */
remoting.GnubbyAuthHandler.prototype.callback_ =
    function(connectionId, response) {
  try {
    this.sendMessageToHost_({
      'type': 'data',
      'connectionId': connectionId,
      'data': base.getArrayAttr(response, 'data')
    });
  } catch (/** @type {*} */ err) {
    console.error('gnubby callback failed: ', err);
    this.sendMessageToHost_({
      'type': 'error',
      'connectionId': connectionId
    });
    return;
  }
};

/**
 * Send data to the installed gnubbyd extension.
 * @param {Object} jsonObject The JSON object to send to the gnubbyd extension.
 * @param {function(Object)} callback The callback to invoke with reply data.
 * @private
 */
remoting.GnubbyAuthHandler.prototype.sendMessageToGnubbyd_ =
    function(jsonObject, callback) {
  this.isGnubbyExtensionInstalled().then(
    function (extensionInstalled) {
      if (extensionInstalled) {
        chrome.runtime.sendMessage(
            this.gnubbyExtensionId_, jsonObject, callback);
      }
    }.bind(this)
  );
};
