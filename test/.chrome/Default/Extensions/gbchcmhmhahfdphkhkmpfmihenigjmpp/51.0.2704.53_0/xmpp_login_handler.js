// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/** @enum {number} */
remoting.TlsMode = {
  NO_TLS: 0,
  WITH_HANDSHAKE: 1,
  WITHOUT_HANDSHAKE: 2
};

(function () {

/**
 * XmppLoginHandler handles authentication handshake for XmppConnection. It
 * receives incoming data using onDataReceived(), calls |sendMessageCallback|
 * to send outgoing messages and calls |onHandshakeDoneCallback| after
 * authentication is finished successfully or |onErrorCallback| on error.
 *
 * See RFC3920 for description of XMPP and authentication handshake.
 *
 * @param {string} server Domain name of the server we are connecting to.
 * @param {string} username Username.
 * @param {string} authToken OAuth2 token.
 * @param {remoting.TlsMode} tlsMode
 * @param {function(string):void} sendMessageCallback Callback to call to send
 *     a message.
 * @param {function():void} startTlsCallback Callback to call to start TLS on
 *     the underlying socket.
 * @param {function(string, remoting.XmppStreamParser):void}
 *     onHandshakeDoneCallback Callback to call after authentication is
 *     completed successfully
 * @param {function(!remoting.Error, string):void} onErrorCallback Callback to
 *     call on error. Can be called at any point during lifetime of connection.
 * @constructor
 */
remoting.XmppLoginHandler = function(server,
                                     username,
                                     authToken,
                                     tlsMode,
                                     sendMessageCallback,
                                     startTlsCallback,
                                     onHandshakeDoneCallback,
                                     onErrorCallback) {
  /** @private */
  this.server_ = server;
  /** @private */
  this.username_ = username;
  /** @private */
  this.authToken_ = authToken;
  /** @private */
  this.tlsMode_ = tlsMode;
  /** @private */
  this.sendMessageCallback_ = sendMessageCallback;
  /** @private */
  this.startTlsCallback_ = startTlsCallback;
  /** @private */
  this.onHandshakeDoneCallback_ = onHandshakeDoneCallback;
  /** @private */
  this.onErrorCallback_ = onErrorCallback;

  /** @private */
  this.state_ = remoting.XmppLoginHandler.State.INIT;
  /** @private */
  this.jid_ = '';

  /** @private {remoting.XmppStreamParser} */
  this.streamParser_ = null;
};

/** @return {function(string, remoting.XmppStreamParser):void} */
remoting.XmppLoginHandler.prototype.getHandshakeDoneCallbackForTesting =
    function() {
  return this.onHandshakeDoneCallback_;
};

/**
 * States the handshake goes through. States are iterated from INIT to DONE
 * sequentially, except for ERROR state which may be accepted at any point.
 *
 * Following messages are sent/received in each state:
 *    INIT
 *      client -> server: Stream header
 *      client -> server: <starttls>
 *    WAIT_STREAM_HEADER
 *      client <- server: Stream header with list of supported features which
 *          should include starttls.
 *    WAIT_STARTTLS_RESPONSE
 *      client <- server: <proceed>
 *    STARTING_TLS
 *      TLS handshake
 *      client -> server: Stream header
 *      client -> server: <auth> message with the OAuth2 token.
 *    WAIT_STREAM_HEADER_AFTER_TLS
 *      client <- server: Stream header with list of supported authentication
 *          methods which is expected to include X-OAUTH2
 *    WAIT_AUTH_RESULT
 *      client <- server: <success> or <failure>
 *      client -> server: Stream header
 *      client -> server: <bind>
 *      client -> server: <iq><session/></iq> to start the session
 *    WAIT_STREAM_HEADER_AFTER_AUTH
 *      client <- server: Stream header with list of features that should
 *         include <bind>.
 *    WAIT_BIND_RESULT
 *      client <- server: <bind> result with JID.
 *    WAIT_SESSION_IQ_RESULT
 *      client <- server: result for <iq><session/></iq>
 *    DONE
 *
 * @enum {number}
 */
remoting.XmppLoginHandler.State = {
  INIT: 0,
  WAIT_STREAM_HEADER: 1,
  WAIT_STARTTLS_RESPONSE: 2,
  STARTING_TLS: 3,
  WAIT_STREAM_HEADER_AFTER_TLS: 4,
  WAIT_AUTH_RESULT: 5,
  WAIT_STREAM_HEADER_AFTER_AUTH: 6,
  WAIT_BIND_RESULT: 7,
  WAIT_SESSION_IQ_RESULT: 8,
  DONE: 9,
  ERROR: 10
};

remoting.XmppLoginHandler.prototype.start = function() {
  switch (this.tlsMode_) {
    case remoting.TlsMode.NO_TLS:
      this.state_ =
          remoting.XmppLoginHandler.State.WAIT_STREAM_HEADER_AFTER_TLS;
      this.startAuthStream_();
      console.assert(remoting.settings.XMPP_SERVER_USE_TLS === false,
                     'NO_TLS should only be used in Dev builds.');
      break;
    case remoting.TlsMode.WITH_HANDSHAKE:
      this.state_ = remoting.XmppLoginHandler.State.WAIT_STREAM_HEADER;
      this.startStream_('<starttls xmlns="urn:ietf:params:xml:ns:xmpp-tls"/>');
      break;
    case remoting.TlsMode.WITHOUT_HANDSHAKE:
      this.state_ = remoting.XmppLoginHandler.State.STARTING_TLS;
      this.startTlsCallback_();
      break;
    default:
      console.assert(false, 'Unrecognized Tls mode :' + this.tlsMode_);
  }
};

/** @param {ArrayBuffer} data */
remoting.XmppLoginHandler.prototype.onDataReceived = function(data) {
  console.assert(this.state_ != remoting.XmppLoginHandler.State.INIT &&
                 this.state_ != remoting.XmppLoginHandler.State.DONE &&
                 this.state_ != remoting.XmppLoginHandler.State.ERROR,
                'onDataReceived() called in state ' + this.state_ + '.');

  this.streamParser_.appendData(data);
};

/**
 * @param {Element} stanza
 * @private
 */
remoting.XmppLoginHandler.prototype.onStanza_ = function(stanza) {
  switch (this.state_) {
    case remoting.XmppLoginHandler.State.WAIT_STREAM_HEADER:
      if (stanza.querySelector('features>starttls')) {
        this.state_ = remoting.XmppLoginHandler.State.WAIT_STARTTLS_RESPONSE;
      } else {
        this.onError_(
            remoting.Error.unexpected(),
            "Server doesn't support TLS.");
      }
      break;

    case remoting.XmppLoginHandler.State.WAIT_STARTTLS_RESPONSE:
      if (stanza.localName == "proceed") {
        this.state_ = remoting.XmppLoginHandler.State.STARTING_TLS;
        this.startTlsCallback_();
      } else {
        this.onError_(remoting.Error.unexpected(),
                      "Failed to start TLS: " +
                          (new XMLSerializer().serializeToString(stanza)));
      }
      break;

    case remoting.XmppLoginHandler.State.WAIT_STREAM_HEADER_AFTER_TLS:
      var mechanisms = Array.prototype.map.call(
          stanza.querySelectorAll('features>mechanisms>mechanism'),
          /** @param {Element} m */
          function(m) { return m.textContent; });
      if (mechanisms.indexOf("X-OAUTH2")) {
        this.onError_(remoting.Error.unexpected(),
                      "OAuth2 is not supported by the server.");
        return;
      }

      this.state_ = remoting.XmppLoginHandler.State.WAIT_AUTH_RESULT;

      break;

    case remoting.XmppLoginHandler.State.WAIT_AUTH_RESULT:
      if (stanza.localName == 'success') {
        this.state_ =
            remoting.XmppLoginHandler.State.WAIT_STREAM_HEADER_AFTER_AUTH;
        this.startStream_(
            '<iq type="set" id="0">' +
              '<bind xmlns="urn:ietf:params:xml:ns:xmpp-bind">' +
                '<resource>chromoting</resource>'+
              '</bind>' +
            '</iq>' +
            '<iq type="set" id="1">' +
              '<session xmlns="urn:ietf:params:xml:ns:xmpp-session"/>' +
            '</iq>');
      } else {
        this.onError_(
            new remoting.Error(remoting.Error.Tag.AUTHENTICATION_FAILED),
            'Failed to authenticate: ' +
              (new XMLSerializer().serializeToString(stanza)));
      }
      break;

    case remoting.XmppLoginHandler.State.WAIT_STREAM_HEADER_AFTER_AUTH:
      if (stanza.querySelector('features>bind')) {
        this.state_ = remoting.XmppLoginHandler.State.WAIT_BIND_RESULT;
      } else {
        this.onError_(remoting.Error.unexpected(),
                      "Server doesn't support bind after authentication.");
      }
      break;

    case remoting.XmppLoginHandler.State.WAIT_BIND_RESULT:
      var jidElement = stanza.querySelector('iq>bind>jid');
      if (stanza.getAttribute('id') != '0' ||
          stanza.getAttribute('type') != 'result' || !jidElement) {
        this.onError_(remoting.Error.unexpected(),
                      'Received unexpected response to bind: ' +
                          (new XMLSerializer().serializeToString(stanza)));
        return;
      }
      this.jid_ = jidElement.textContent;
      this.state_ = remoting.XmppLoginHandler.State.WAIT_SESSION_IQ_RESULT;
      break;

    case remoting.XmppLoginHandler.State.WAIT_SESSION_IQ_RESULT:
      if (stanza.getAttribute('id') != '1' ||
          stanza.getAttribute('type') != 'result') {
        this.onError_(remoting.Error.unexpected(),
                      'Failed to start session: ' +
                          (new XMLSerializer().serializeToString(stanza)));
        return;
      }
      this.state_ = remoting.XmppLoginHandler.State.DONE;
      this.onHandshakeDoneCallback_(this.jid_, this.streamParser_);
      break;

    default:
      console.error('onStanza_() called in state ' + this.state_ + '.');
      break;
  }
};

remoting.XmppLoginHandler.prototype.onTlsStarted = function() {
  console.assert(this.state_ == remoting.XmppLoginHandler.State.STARTING_TLS,
                 'onTlsStarted() called in state ' + this.state_ + '.');
  this.state_ = remoting.XmppLoginHandler.State.WAIT_STREAM_HEADER_AFTER_TLS;
  this.startAuthStream_();
};

/** @private */
remoting.XmppLoginHandler.prototype.startAuthStream_ = function() {
  var cookie = window.btoa('\0' + this.username_ + '\0' + this.authToken_);

  this.startStream_(
      '<auth xmlns="urn:ietf:params:xml:ns:xmpp-sasl" ' +
             'mechanism="X-OAUTH2" auth:service="oauth2" ' +
             'auth:allow-generated-jid="true" ' +
             'auth:client-uses-full-bind-result="true" ' +
             'auth:allow-non-google-login="true" ' +
             'xmlns:auth="http://www.google.com/talk/protocol/auth">' +
        cookie +
      '</auth>');
};

/**
 * @param {string} text
 * @private
 */
remoting.XmppLoginHandler.prototype.onParserError_ = function(text) {
  this.onError_(remoting.Error.unexpected(), text);
};

/**
 * @param {string} firstMessage Message to send after stream header.
 * @private
 */
remoting.XmppLoginHandler.prototype.startStream_ = function(firstMessage) {
  this.sendMessageCallback_('<stream:stream to="' + this.server_ +
                            '" version="1.0" xmlns="jabber:client" ' +
                            'xmlns:stream="http://etherx.jabber.org/streams">' +
                            firstMessage);
  this.streamParser_ = new remoting.XmppStreamParser();
  this.streamParser_.setCallbacks(this.onStanza_.bind(this),
                                  this.onParserError_.bind(this));
};

/**
 * @param {!remoting.Error} error
 * @param {string} text
 * @private
 */
remoting.XmppLoginHandler.prototype.onError_ = function(error, text) {
  if (this.state_ != remoting.XmppLoginHandler.State.ERROR) {
    this.onErrorCallback_(error, text);
    this.state_ = remoting.XmppLoginHandler.State.ERROR;
  } else {
    console.error(text);
  }
};

})();