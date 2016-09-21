// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * A connection to an XMPP server.
 *
 * @constructor
 * @implements {remoting.SignalStrategy}
 */
remoting.XmppConnection = function() {
  /** @private */
  this.server_ = '';
  /** @private */
  this.port_ = 0;
  /** @private {?function(remoting.SignalStrategy.State):void} */
  this.onStateChangedCallback_ = null;
  /** @private {?function(Element):void} */
  this.onIncomingStanzaCallback_ = null;
  /** @type {?remoting.TcpSocket} @private */
  this.socket_ = null;
  /** @private */
  this.state_ = remoting.SignalStrategy.State.NOT_CONNECTED;
  /** @private */
  this.sendPending_ = false;
  /** @private */
  this.startTlsPending_ = false;
  /** @private {Array<!ArrayBuffer>} */
  this.sendQueue_ = [];
  /** @private {remoting.XmppLoginHandler} */
  this.loginHandler_ = null;
  /** @private {remoting.XmppStreamParser} */
  this.streamParser_ = null;
  /** @private */
  this.jid_ = '';
  /** @private */
  this.error_ = remoting.Error.none();
};

/**
 * @param {function(remoting.SignalStrategy.State):void} onStateChangedCallback
 */
remoting.XmppConnection.prototype.setStateChangedCallback = function(
    onStateChangedCallback) {
  this.onStateChangedCallback_ = onStateChangedCallback;
};

remoting.XmppConnection.prototype.setSocketForTests = function(
    /** remoting.TcpSocket */ socket) {
  this.socket_ = socket;
};

/**
 * @param {?function(Element):void} onIncomingStanzaCallback Callback to call on
 *     incoming messages.
 */
remoting.XmppConnection.prototype.setIncomingStanzaCallback =
    function(onIncomingStanzaCallback) {
  this.onIncomingStanzaCallback_ = onIncomingStanzaCallback;
};

/**
 * @param {string} server
 * @param {string} username
 * @param {string} authToken
 */
remoting.XmppConnection.prototype.connect =
    function(server, username, authToken) {
  console.assert(this.state_ == remoting.SignalStrategy.State.NOT_CONNECTED,
                'connect() called in state ' + this.state_ + '.');
  console.assert(this.onStateChangedCallback_ != null,
                 'No state-change callback registered.');

  this.error_ = remoting.Error.none();
  var hostnameAndPort = server.split(':', 2);
  this.server_ = hostnameAndPort[0];
  this.port_ =
      (hostnameAndPort.length == 2) ? parseInt(hostnameAndPort[1], 10) : 5222;

  // The server name is passed as to attribute in the <stream>. When connecting
  // to talk.google.com it affects the certificate the server will use for TLS:
  // talk.google.com uses gmail certificate when specified server is gmail.com
  // or googlemail.com and google.com cert otherwise. In the same time it
  // doesn't accept talk.google.com as target server. Here we use google.com
  // server name when authenticating to talk.google.com. This ensures that the
  // server will use google.com cert which will be accepted by the TLS
  // implementation in Chrome (TLS API doesn't allow specifying domain other
  // than the one that was passed to connect()).
  var xmppServer = this.server_;
  if (xmppServer == 'talk.google.com')
    xmppServer = 'google.com';

  var tlsMode = remoting.TlsMode.WITH_HANDSHAKE;
  if (this.port_ === 443) {
    // <starttls> handshake before starting TLS is not needed when connecting on
    // the HTTPS port.
    tlsMode = remoting.TlsMode.WITHOUT_HANDSHAKE;
  } else if (remoting.settings.XMPP_SERVER_USE_TLS === false) {
    tlsMode = remoting.TlsMode.NO_TLS;
  }

  /** @type {remoting.XmppLoginHandler} */
  this.loginHandler_ = new remoting.XmppLoginHandler(
      xmppServer, username, authToken, tlsMode,
      this.sendString_.bind(this), this.startTls_.bind(this),
      this.onHandshakeDone_.bind(this), this.onError_.bind(this));
  this.setState_(remoting.SignalStrategy.State.CONNECTING);

  if (!this.socket_) {
    this.socket_ = new remoting.TcpSocket();
  }
  var that = this;
  this.socket_.connect(this.server_, this.port_)
      .then(this.onSocketConnected_.bind(this))
      .catch(function(error) {
        that.onError_(new remoting.Error(remoting.Error.Tag.NETWORK_FAILURE),
                      'Failed to connect to ' + that.server_ + ': ' + error);
      });
};

/** @param {string} message */
remoting.XmppConnection.prototype.sendMessage = function(message) {
  console.assert(this.state_ == remoting.SignalStrategy.State.CONNECTED,
                'sendMessage() called in state ' + this.state_ + '.');
  this.sendString_(message);
};

/** @return {remoting.SignalStrategy.State} Current state */
remoting.XmppConnection.prototype.getState = function() {
  return this.state_;
};

/** @return {!remoting.Error} Error when in FAILED state. */
remoting.XmppConnection.prototype.getError = function() {
  return this.error_;
};

/** @return {string} Current JID when in CONNECTED state. */
remoting.XmppConnection.prototype.getJid = function() {
  return this.jid_;
};

/** @return {remoting.SignalStrategy.Type} The signal strategy type. */
remoting.XmppConnection.prototype.getType = function() {
  return remoting.SignalStrategy.Type.XMPP;
};

remoting.XmppConnection.prototype.dispose = function() {
  base.dispose(this.socket_);
  this.socket_ = null;
  this.setState_(remoting.SignalStrategy.State.CLOSED);
};

/** @private */
remoting.XmppConnection.prototype.onSocketConnected_ = function() {
  // Check if connection was destroyed.
  if (this.state_ != remoting.SignalStrategy.State.CONNECTING) {
    return;
  }

  this.setState_(remoting.SignalStrategy.State.HANDSHAKE);
  this.loginHandler_.start();

  if (!this.startTlsPending_) {
    this.socket_.startReceiving(this.onReceive_.bind(this),
                                this.onReceiveError_.bind(this));
  }
};

/**
 * @param {ArrayBuffer} data
 * @private
 */
remoting.XmppConnection.prototype.onReceive_ = function(data) {
  console.assert(this.state_ == remoting.SignalStrategy.State.HANDSHAKE ||
                 this.state_ == remoting.SignalStrategy.State.CONNECTED,
                'onReceive_() called in state ' + this.state_ + '.');

  if (this.state_ == remoting.SignalStrategy.State.HANDSHAKE) {
    this.loginHandler_.onDataReceived(data);
  } else if (this.state_ == remoting.SignalStrategy.State.CONNECTED) {
    this.streamParser_.appendData(data);
  }
};

/**
 * @param {number} errorCode
 * @private
 */
remoting.XmppConnection.prototype.onReceiveError_ = function(errorCode) {
  this.onError_(new remoting.Error(remoting.Error.Tag.NETWORK_FAILURE),
                'Failed to receive from XMPP socket: ' + errorCode);
};

/**
 * @param {string} text
 * @private
 */
remoting.XmppConnection.prototype.sendString_ = function(text) {
  this.sendBuffer_(base.encodeUtf8(text));
};

/**
 * @param {!ArrayBuffer} data
 * @private
 */
remoting.XmppConnection.prototype.sendBuffer_ = function(data) {
  this.sendQueue_.push(data);
  this.flushSendQueue_();
};

/**
 * @private
 */
remoting.XmppConnection.prototype.flushSendQueue_ = function() {
  if (this.sendPending_ || this.sendQueue_.length == 0) {
    return;
  }

  var that = this;

  this.sendPending_ = true;
  this.socket_.send(this.sendQueue_[0])
      .then(function(/** number */ bytesSent) {
        that.sendPending_ = false;
        that.onSent_(bytesSent);
      })
      .catch(function(/** number */ error) {
        that.sendPending_ = false;
        that.onError_(new remoting.Error(remoting.Error.Tag.NETWORK_FAILURE),
                      'TCP write failed with error ' + error);
      });
};

/**
 * @param {number} bytesSent
 * @private
 */
remoting.XmppConnection.prototype.onSent_ = function(bytesSent) {
  // Ignore send() result if the socket was closed.
  if (this.state_ != remoting.SignalStrategy.State.HANDSHAKE &&
      this.state_ != remoting.SignalStrategy.State.CONNECTED) {
    return;
  }

  console.assert(this.sendQueue_.length > 0,
                 'Bad queue length: ' + this.sendQueue_.length + '.');

  var data = this.sendQueue_[0];
  console.assert(bytesSent <= data.byteLength,
                 'Bad |bytesSent|: ' + bytesSent + '.');
  if (bytesSent == data.byteLength) {
    this.sendQueue_.shift();
  } else {
    this.sendQueue_[0] = data.slice(data.byteLength - bytesSent);
  }

  this.flushSendQueue_();
};

/**
 * @private
 */
remoting.XmppConnection.prototype.startTls_ = function() {
  console.assert(!this.startTlsPending_, 'startTls already pending.');

  var that = this;

  this.startTlsPending_ = true;
  this.socket_.startTls()
      .then(function() {
        that.startTlsPending_ = false;
        that.socket_.startReceiving(that.onReceive_.bind(that),
                                    that.onReceiveError_.bind(that));

        that.loginHandler_.onTlsStarted();
      })
      .catch(function(/** number */ error) {
        that.startTlsPending_ = false;
        that.onError_(new remoting.Error(remoting.Error.Tag.NETWORK_FAILURE),
                      'Failed to start TLS: ' + error);
      });
}

/**
 * @param {string} jid
 * @param {remoting.XmppStreamParser} streamParser
 * @private
 */
remoting.XmppConnection.prototype.onHandshakeDone_ =
    function(jid, streamParser) {
  this.jid_ = jid;
  this.streamParser_ = streamParser;
  this.streamParser_.setCallbacks(this.onIncomingStanza_.bind(this),
                                  this.onParserError_.bind(this));
  this.setState_(remoting.SignalStrategy.State.CONNECTED);
};

/**
 * @param {Element} stanza
 * @private
 */
remoting.XmppConnection.prototype.onIncomingStanza_ = function(stanza) {
  if (this.onIncomingStanzaCallback_) {
    this.onIncomingStanzaCallback_(stanza);
  }
};

/**
 * @param {string} text
 * @private
 */
remoting.XmppConnection.prototype.onParserError_ = function(text) {
  this.onError_(remoting.Error.unexpected(), text);
};

/**
 * @param {!remoting.Error} error
 * @param {string} text
 * @private
 */
remoting.XmppConnection.prototype.onError_ = function(error, text) {
  console.error(text);
  this.error_ = error;
  base.dispose(this.socket_);
  this.socket_ = null;
  this.setState_(remoting.SignalStrategy.State.FAILED);
};

/**
 * @param {remoting.SignalStrategy.State} newState
 * @private
 */
remoting.XmppConnection.prototype.setState_ = function(newState) {
  if (this.state_ != newState) {
    this.state_ = newState;
    this.onStateChangedCallback_(this.state_);
  }
};
