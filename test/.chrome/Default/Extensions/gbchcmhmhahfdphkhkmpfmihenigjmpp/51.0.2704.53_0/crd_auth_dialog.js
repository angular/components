// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

var instance_ = null;

/**
 * @constructor
 * @implements {remoting.Identity.ConsentDialog}
 * @param {HTMLElement} rootElement The dialog DOM element.
 * @private
 */
remoting.AuthDialog = function(rootElement) {
  /** @private {HTMLElement} */
  this.rootElement_ = rootElement;

  /** @private {HTMLElement} */
  this.borderElement_ = rootElement.querySelector('#auth-dialog-border');

  /** @private {HTMLElement} */
  this.authButton_ = rootElement.querySelector('#auth-button');

  /** @private {base.Deferred} */
  this.onAuthButtonDeferred_ = null;

  this.authButton_.addEventListener('click', this.onClick_.bind(this), false);
};

/** @private */
remoting.AuthDialog.prototype.onClick_ = function() {
  this.rootElement_.hidden = true;
  this.onAuthButtonDeferred_.resolve(null);
  this.onAuthButtonDeferred_ = null;
};

/**
 * @return {Promise} A Promise object that resolves when the user clicks on the
 *   auth button.
 */
remoting.AuthDialog.prototype.show = function() {
  if (this.isVisible()) {
    return Promise.reject('Auth dialog is already showing.');
  }
  this.rootElement_.hidden = false;
  console.assert(this.onAuthButtonDeferred_ === null,
                 'Duplicate show() invocation.');
  this.onAuthButtonDeferred_ = new base.Deferred();
  return this.onAuthButtonDeferred_.promise();
};

/**
 * @return {boolean} whether the auth dialog is visible or not.
 */
remoting.AuthDialog.prototype.isVisible = function() {
  return !this.rootElement_.hidden;
};

/**
 * @return {remoting.AuthDialog}
 */
remoting.AuthDialog.getInstance = function() {
  if (!instance_) {
    var rootElement = base.getHtmlElement('auth-dialog');
    instance_ = new remoting.AuthDialog(rootElement);
  }
  return instance_;
};

})();
