// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Obtains additional host permissions, showing a consent dialog if needed.
 *
 * When third party authentication is being used, the client must talk to a
 * third-party server. For that, once the URL is received from the host the
 * webapp must use Chrome's optional permissions API to check if it has the
 * "host" permission needed to access that URL. If the webapp hasn't already
 * been granted that permission, it shows a dialog explaining why it is being
 * requested, then uses the Chrome API ask the user for the new permission.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @constructor
 * Encapsulates the UI to check/request permissions to a new host.
 *
 * @param {string} url The URL to request permission for.
 */
remoting.ThirdPartyHostPermissions = function(url) {
  this.url_ = url;
  this.permissions_ = {'origins': [url]};
};

/**
 * Get permissions to the URL, asking interactively if necessary.
 *
 * @param {function(): void} onOk Called if the permission is granted.
 * @param {function(): void} onError Called if the permission is denied.
 */
remoting.ThirdPartyHostPermissions.prototype.getPermission = function(
    onOk, onError) {
  /** @type {remoting.ThirdPartyHostPermissions} */
  var that = this;
  chrome.permissions.contains(this.permissions_,
    /** @param {boolean} allowed Whether this extension has this permission. */
    function(allowed) {
      if (allowed) {
        onOk();
      } else {
        // Optional permissions must be requested in a user action context. This
        // is called from an asynchronous plugin callback, so we have to open a
        // confirmation dialog to perform the request on an interactive event.
        // In any case, we can use this dialog to explain to the user why we are
        // asking for the additional permission.
        that.showPermissionConfirmation_(onOk, onError);
      }
    });
};

/**
 * Show an interactive dialog informing the user of the new permissions.
 *
 * @param {function(): void} onOk Called if the permission is granted.
 * @param {function(): void} onError Called if the permission is denied.
 * @private
 */
remoting.ThirdPartyHostPermissions.prototype.showPermissionConfirmation_ =
    function(onOk, onError) {
  /** @type {HTMLElement} */
  var button = base.getHtmlElement('third-party-auth-button');
  /** @type {HTMLElement} */
  var url = base.getHtmlElement('third-party-auth-url');
  url.innerText = this.url_;

  /** @type {remoting.ThirdPartyHostPermissions} */
  var that = this;

  var consentGranted = function(event) {
    remoting.setMode(remoting.AppMode.CLIENT_CONNECTING);
    button.removeEventListener('click', consentGranted, false);
    that.requestPermission_(onOk, onError);
  };

  button.addEventListener('click', consentGranted, false);
  remoting.setMode(remoting.AppMode.CLIENT_THIRD_PARTY_AUTH);
};


/**
 * Request permission from the user to access the token-issue URL.
 *
 * @param {function(): void} onOk Called if the permission is granted.
 * @param {function(): void} onError Called if the permission is denied.
 * @private
 */
remoting.ThirdPartyHostPermissions.prototype.requestPermission_ = function(
    onOk, onError) {
  chrome.permissions.request(
    this.permissions_,
    /** @param {boolean} result Whether the permission was granted. */
    function(result) {
      if (result) {
        onOk();
      } else {
        onError();
      }
  });
};
