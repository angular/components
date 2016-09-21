// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/**
 * @param {function(string, string)} sendExtensionMessage Callback used to
 *     send an extension message to the plugin.
 * @constructor
 * @implements {base.Disposable}
 */
remoting.ProtocolExtensionManager = function(sendExtensionMessage) {
  /** @private */
  this.sendExtensionMessage_ = sendExtensionMessage;
  /** @private {Object<remoting.ProtocolExtension>} */
  this.protocolExtensions_ = {};

  /**
   * True once a session has been created and we've started the extensions.
   * This is used to immediately start any extensions that are registered
   * after the CONNECTED state change.
   * @private
   */
  this.protocolExtensionsStarted_ = false;
};

remoting.ProtocolExtensionManager.prototype.dispose = function() {
  this.sendExtensionMessage_ = base.doNothing;
  this.protocolExtensions_ = {};
};

/** Called by the plugin when the session is connected */
remoting.ProtocolExtensionManager.prototype.start = function() {
  console.assert(!this.protocolExtensionsStarted_,
                 'Duplicate start() invocation.');
  /** @type {Object<remoting.ProtocolExtension, boolean>} */
  var started = {};
  for (var type in this.protocolExtensions_) {
    var extension = this.protocolExtensions_[type];
    if (!(extension in started)) {
      extension.startExtension(this.sendExtensionMessage_);
      started[extension] = true;
    }
  }
  this.protocolExtensionsStarted_ = true;
};

/**
 * @param {remoting.ProtocolExtension} extension
 * @return {boolean} true if the extension is successfully registered.
 */
remoting.ProtocolExtensionManager.prototype.register =
    function(extension) {
  var types = extension.getExtensionTypes();

  // Make sure we don't have an extension of that type already registered.
  for (var i=0, len=types.length; i < len; i++) {
    if (types[i] in this.protocolExtensions_) {
      console.error(
          'Attempt to register multiple extensions of the same type: ', type);
      return false;
    }
  }

  // Register the extension for each type.
  for (var i=0, len=types.length; i < len; i++) {
    var type = types[i];
    this.protocolExtensions_[type] = extension;
  }

  // Start the extension.
  if (this.protocolExtensionsStarted_) {
    extension.startExtension(this.sendExtensionMessage_);
  }

  return true;
};

/**
 * Called when an extension message needs to be handled.
 *
 * @param {string} type The type of the extension message.
 * @param {string} data The payload of the extension message.
 * @return {boolean} Return true if the extension message was recognized.
 */
remoting.ProtocolExtensionManager.prototype.onProtocolExtensionMessage =
    function(type, data) {
  if (type == 'test-echo-reply') {
    console.log('Got echo reply: ' + data);
    return true;
  }

  var message = base.jsonParseSafe(data);
  if (typeof message != 'object') {
    console.error('Error parsing extension json data: ' + data);
    return false;
  }

  if (type in this.protocolExtensions_) {
    /** @type {remoting.ProtocolExtension} */
    var extension = this.protocolExtensions_[type];
    var handled = false;
    try {
      handled = extension.onExtensionMessage(type, message);
    } catch (/** @type {*} */ err) {
      console.error('Failed to process protocol extension ' + type +
                    ' message: ' + err);
    }
    if (handled) {
      return true;
    }
  }

  return false;
};

})();
