/* Copyright 2015 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

/**
 * @fileoverview
 * This class dispatches window messages (those sent using window.postMessage)
 * from different sources to the registered handlers.
 * This should be the only 'message' event listener in this app. Anyone who
 * wants to listen to window messages should register with this class.
 */

'use strict';

/** @suppress {duplicate} */
var base = base || {};

(function() {
/**
 * @constructor
 * @implements {base.Disposable}
 */
base.WindowMessageDispatcher = function() {
  /** @private {Object<string, function(Event):void>} */
  this.handlers_ = {};

  /** @private */
  this.eventHook_ = new base.DomEventHook(
      window, 'message', this.onMessage_.bind(this), false);
};

base.WindowMessageDispatcher.prototype.dispose = function() {
  this.unregisterAllHandlers();

  base.dispose(this.eventHook_);
  this.eventHook_ = null;
};

/**
 * @param {string} source Message source to register handler for.
 * @param {function(Event):void} handler Handler for the messages from |source|.
 * @return {void}
 */
base.WindowMessageDispatcher.prototype.registerMessageHandler =
    function(source, handler) {
  console.assert(Boolean(source), 'No source specified.');
  console.assert(Boolean(handler), 'No handler specified.');

  if (source in this.handlers_) {
    console.error('Cannot register more than one handler for source: ', source);
  } else {
    this.handlers_[source] = handler;
  }
};

/**
 * @param {string} source Message source to unregister handler for.
 * @return {void}
 */
base.WindowMessageDispatcher.prototype.unregisterMessageHandler =
    function(source) {
  console.assert(Boolean(source), 'No source specified.');

  if (source in this.handlers_) {
    delete this.handlers_[source];
  } else {
    console.error('Message handler doesn\'t exist for source: ', source);
  }
};

/**
 * @return {void}
 */
base.WindowMessageDispatcher.prototype.unregisterAllHandlers = function() {
  this.handlers_ = {};
};

/**
 * Event handler to process window messages.
 *
 * @param {Event} event
 */
base.WindowMessageDispatcher.prototype.onMessage_ = function(event) {
  var data = event.data;
  if (typeof data === 'object') {
    /** @type {string} */
    var source = data['source'];
    if (source === undefined) {
      console.error('Missing source field in incoming message: ', data);
      return;
    }

    console.log('object message received from: ', source);
    var handler = this.handlers_[source];
    if (handler) {
      handler(event);
    } else {
      console.error('No handler registered for messages from: ', source);
    }
  } else {
    console.error('Unknown window message data type: ', data);
  }
};

})();
