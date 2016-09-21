/* Copyright 2013 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

/**
 * @fileoverview
 * The sandbox side of the application/sandbox WCS interface, used by the
 * sandbox to exchange messages with the application.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/** @constructor */
remoting.WcsSandboxContent = function() {
  /** @private {Window} */
  this.parentWindow_ = null;
  /** @private {number} */
  this.nextXhrId_ = 0;
  /** @private {Object<number, XMLHttpRequest>} */
  this.pendingXhrs_ = {};

  window.addEventListener('message', this.onMessage_.bind(this), false);
};

/**
 * Event handler to process messages from the application.
 *
 * @param {Event} event
 */
remoting.WcsSandboxContent.prototype.onMessage_ = function(event) {
  this.parentWindow_ = event.source;

  switch (event.data['command']) {

    case 'proxyXhrs':
      // Since the WCS driver code constructs XHRs directly, the only
      // mechanism for proxying them is to replace the XMLHttpRequest
      // constructor.
      XMLHttpRequest = remoting.XMLHttpRequestProxy;
      break;

    case 'sendIq':
      /** @type {string} */
      var stanza = event.data['stanza'];
      if (stanza === undefined) {
        console.error('sendIq: missing IQ stanza.');
        break;
      }
      if (remoting.wcs) {
        remoting.wcs.sendIq(stanza);
      } else {
        console.error('Dropping IQ stanza:', stanza);
      }
      break;

    case 'setAccessToken':
      /** @type {string} */
      var token = event.data['token'];
      if (token === undefined) {
        console.error('setAccessToken: missing access token.');
        break;
      }
      // The WCS driver JS requires that remoting.wcsLoader be a global
      // variable, so it can't be a member of this class.
      // TODO(jamiewalch): remoting.wcs doesn't need to be global and should
      // be made a member (http://crbug.com/172348).
      if (remoting.wcs) {
        remoting.wcs.updateAccessToken(token);
      } else if (!remoting.wcsLoader) {
        remoting.wcsLoader = new remoting.WcsLoader();
        remoting.wcsLoader.start(token,
                                 this.onLocalJid_.bind(this),
                                 this.onError_.bind(this));
      }
      break;

    case 'xhrStateChange':
      /** @type {number} */
      var id = event.data['id'];
      if (id === undefined) {
        console.error('xhrStateChange: missing id.');
        break;
      }
      var pendingXhr = this.pendingXhrs_[id];
      if (!pendingXhr) {
        console.error('xhrStateChange: unrecognized id:', id);
        break;
      }
      /** @type {XMLHttpRequest} */
      var xhr = event.data['xhr'];
      if (xhr === undefined) {
        console.error('xhrStateChange: missing xhr');
        break;
      }
      for (var member in xhr) {
        pendingXhr[member] = xhr[member];
      }
      if (xhr.readyState == 4) {
        delete this.pendingXhrs_[id];
      }
      if (pendingXhr.onreadystatechange) {
        pendingXhr.onreadystatechange();
      }
      break;

    default:
      console.error('Unexpected message:', event.data['command'], event.data);
  }
};

/**
 * Callback method to indicate that the WCS driver has loaded and provide the
 * full JID of the client.
 *
 * @param {string} localJid The full JID of the WCS client.
 * @private
 */
remoting.WcsSandboxContent.prototype.onLocalJid_ = function(localJid) {
  remoting.wcs.setOnIq(this.onIq_.bind(this));
  var message = {
    'source': 'wcs-sandbox',
    'command': 'onLocalJid',
    'localJid': localJid
  };
  this.parentWindow_.postMessage(message, '*');
};

/**
 * Callback method to indicate that something went wrong loading the WCS driver.
 *
 * @param {!remoting.Error} error Details of the error.
 * @private
 */
remoting.WcsSandboxContent.prototype.onError_ = function(error) {
  var message = {
    'source': 'wcs-sandbox',
    'command': 'onError',
    'error': error
  };
  this.parentWindow_.postMessage(message, '*');
};

/**
 * Forward an XHR to the container process to send. This is analogous to XHR's
 * send method.
 *
 * @param {remoting.XMLHttpRequestProxy} xhr The XHR to send.
 * @return {number} The unique ID allocated to the XHR. Used to abort it.
 */
remoting.WcsSandboxContent.prototype.sendXhr = function(xhr) {
  var id = this.nextXhrId_++;
  this.pendingXhrs_[id] = xhr;
  var message = {
    'source': 'wcs-sandbox',
    'command': 'sendXhr',
    'id': id,
    'parameters': xhr.sandboxIpc
  };
  this.parentWindow_.postMessage(message, '*');
  delete xhr.sandboxIpc;
  return id;
};

/**
 * Abort a forwarded XHR. This is analogous to XHR's abort method.
 *
 * @param {number} id The unique ID of the XHR to abort, as returned by sendXhr.
 */
remoting.WcsSandboxContent.prototype.abortXhr = function(id) {
  if (!this.pendingXhrs_[id]) {
    // The XHR is removed when it reaches the "ready" state. Calling abort
    // subsequently is unusual, but legal, so just silently ignore the request
    // in this case.
    return;
  }
  var message = {
    'source': 'wcs-sandbox',
    'command': 'abortXhr',
    'id': id
  };
  this.parentWindow_.postMessage(message, '*');
};

/**
 * Callback to indicate than an IQ stanza has been received from the WCS
 * driver, and should be forwarded to the main process.
 *
 * @param {string} stanza
 * @private
 */
remoting.WcsSandboxContent.prototype.onIq_ = function(stanza) {
  remoting.wcs.setOnIq(this.onIq_.bind(this));
  var message = {
    'source': 'wcs-sandbox',
    'command': 'onIq',
    'stanza': stanza
  };
  this.parentWindow_.postMessage(message, '*');
};

/**
 * Entry point for the WCS sandbox process.
 */
function onSandboxInit() {
  // The WCS code registers for a couple of events that aren't supported in
  // Apps V2, so ignore those for now.
  var oldAEL = window.addEventListener;
  window.addEventListener = function(type, listener, useCapture) {
    if (type == 'beforeunload' || type == 'unload') {
      return;
    }
    oldAEL(type, listener, useCapture);
  };

  remoting.settings = new remoting.Settings();
  remoting.sandboxContent = new remoting.WcsSandboxContent();
}

window.addEventListener('load', onSandboxInit, false);

/** @type {remoting.WcsSandboxContent} */
remoting.sandboxContent = null;
