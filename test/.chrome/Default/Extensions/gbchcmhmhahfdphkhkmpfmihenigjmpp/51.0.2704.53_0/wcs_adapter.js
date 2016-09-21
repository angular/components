// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * WCS-based SignalStrategy implementation. Used instead of XMPPConnection
 * when XMPP cannot be used (e.g. in V1 app).
 *
 * @constructor
 * @implements {remoting.SignalStrategy}
 */
remoting.WcsAdapter = function() {
  /** @private {?function(remoting.SignalStrategy.State):void} */
  this.onStateChangedCallback_ = null;
  /** @private {?function(Element):void} */
  this.onIncomingStanzaCallback_ = null;
  /** @private */
  this.state_ = remoting.SignalStrategy.State.NOT_CONNECTED;
  /** @private */
  this.jid_ = '';
  /** @private */
  this.error_ = remoting.Error.none();
};

/**
 * @param {function(remoting.SignalStrategy.State):void} onStateChangedCallback
 */
remoting.WcsAdapter.prototype.setStateChangedCallback = function(
    onStateChangedCallback) {
  this.onStateChangedCallback_ = onStateChangedCallback;
};

/**
 * @param {?function(Element):void} onIncomingStanzaCallback Callback to call on
 *     incoming messages.
 */
remoting.WcsAdapter.prototype.setIncomingStanzaCallback =
    function(onIncomingStanzaCallback) {
  this.onIncomingStanzaCallback_ = onIncomingStanzaCallback;
};

/**
 * @param {string} server
 * @param {string} username
 * @param {string} authToken
 */
remoting.WcsAdapter.prototype.connect = function(server, username, authToken) {
  console.assert(this.onStateChangedCallback_ != null,
                'No state-change callback registered.');

  remoting.wcsSandbox.setOnIq(this.onIncomingStanza_.bind(this));
  remoting.wcsSandbox.connect(this.onWcsConnected_.bind(this),
                              this.onError_.bind(this));
};

/** @return {remoting.SignalStrategy.State} Current state */
remoting.WcsAdapter.prototype.getState = function() {
  return this.state_;
};

/** @return {!remoting.Error} Error when in FAILED state. */
remoting.WcsAdapter.prototype.getError = function() {
  return this.error_;
};

/** @return {string} Current JID when in CONNECTED state. */
remoting.WcsAdapter.prototype.getJid = function() {
  return this.jid_;
};

/** @return {remoting.SignalStrategy.Type} The signal strategy type. */
remoting.WcsAdapter.prototype.getType = function() {
  return remoting.SignalStrategy.Type.WCS;
};

remoting.WcsAdapter.prototype.dispose = function() {
  this.setState_(remoting.SignalStrategy.State.CLOSED);
  remoting.wcsSandbox.setOnIq(null);
};

/** @param {string} message */
remoting.WcsAdapter.prototype.sendMessage = function(message) {
  // Extract the session id, so we can close the session later.
  // HACK: Add 'x' prefix to the IDs of the outgoing messages to make sure that
  // stanza IDs used by host and client do not match. This is necessary to
  // workaround bug in the signaling endpoint used by chromoting.
  // TODO(sergeyu): Remove this hack once the server-side bug is fixed.
  var parser = new DOMParser();
  var iqNode = parser.parseFromString(message, 'text/xml').firstChild;
  var type = iqNode.getAttribute('type');
  if (type == 'set') {
    var id = iqNode.getAttribute('id');
    iqNode.setAttribute('id', 'x' + id);
    message = (new XMLSerializer()).serializeToString(iqNode);
  }

  // Send the stanza.
  remoting.wcsSandbox.sendIq(message);
};

/** @param {string} jid */
remoting.WcsAdapter.prototype.onWcsConnected_ = function(jid) {
  this.jid_ = jid;
  this.setState_(remoting.SignalStrategy.State.CONNECTED);
};

/** @param {string} stanza */
remoting.WcsAdapter.prototype.onIncomingStanza_ = function(stanza) {
  var parser = new DOMParser();
  var parsed = parser.parseFromString(stanza, 'text/xml').firstChild;

  // HACK: Remove 'x' prefix added to the id in sendMessage().
  try {
    var type = parsed.getAttribute('type');
    var id = parsed.getAttribute('id');
    if (type != 'set' && id.charAt(0) == 'x') {
      parsed.setAttribute('id', id.substr(1));
    }
  } catch (err) {
    // Pass message as is when it is malformed.
  }

  if (this.onIncomingStanzaCallback_) {
    this.onIncomingStanzaCallback_(parsed);
  }
};

/** @param {!remoting.Error} error */
remoting.WcsAdapter.prototype.onError_ = function(error) {
  this.error_ = error;
  this.setState_(remoting.SignalStrategy.State.FAILED);
};

/**
 * @param {remoting.SignalStrategy.State} newState
 * @private
 */
remoting.WcsAdapter.prototype.setState_ = function(newState) {
  if (this.state_ != newState) {
    this.state_ = newState;
    this.onStateChangedCallback_(this.state_);
  }
};
