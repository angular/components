// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * HostInstallDialog prompts the user to accept Google ToS and install host
 * components. It has (up to) three stages:
 *
 * 1. When show() is called, it prompts the user to accept Google's ToS. If
 *    the user declines, it calls the onError callback with reason CANCELED.
 * 2. If the user accepts, it starts downloading the host installer and shows
 *    a prompt asking the user to continue. If the user cancels at this point,
 *    if calls the onError callback with reason CANCELED.
 * 3. If the user clicks OK, it calls the onDone callback. This callback should
 *    check whether or not the host is actually installed, and call tryAgain()
 *    if it is not. This will show a reminder to the user that they need to run
 *    the downloaded installer.
 *
 * @constructor
 */
remoting.HostInstallDialog = function() {
  /** @private */
  this.acceptTosButton_ = document.getElementById('host-install-tos-accept');
  /** @private */
  this.rejectTosButton_ = document.getElementById('host-install-tos-reject');
  /** @private */
  this.continueInstallButton_ = document.getElementById(
      'host-install-continue');
  /** @private */
  this.cancelInstallButton_ = document.getElementById('host-install-dismiss');
  /** @private */
  this.retryInstallButton_ = document.getElementById('host-install-retry');
  /** @private */
  this.tosMessage_ = document.getElementById('tos-message');

  /** @private {base.Disposables} */
  this.handlers_ = null;

  /** @private {function():void} */
  this.onDoneHandler_ = function() {};

  /** @private {function(!remoting.Error):void} */
  this.onErrorHandler_ = function(error) {};

  /** @private {remoting.HostInstaller} */
  this.hostInstaller_ = new remoting.HostInstaller();

  /** @private */
  this.termsOfServiceAccepted_ = false;
};

/**
 * Starts downloading host components and shows installation prompt.
 *
 * @param {function():void} onDone Callback called when user clicks Ok,
 * presumably after installing the host. The handler must verify that the host
 * has been installed and call tryAgain() otherwise.
 * @param {function(!remoting.Error):void} onError Callback called when user
 *    clicks Cancel button or there is some other unexpected error.
 * @return {void}
 */
remoting.HostInstallDialog.prototype.show = function(onDone, onError) {
  console.assert(this.handlers_ == null, 'Event handlers already exist.');
  this.handlers_ = new base.Disposables(
      new base.DomEventHook(this.acceptTosButton_,
                            'click',
                            this.onAcceptClicked_.bind(this),
                            false),
      new base.DomEventHook(this.rejectTosButton_,
                            'click',
                            this.onCancelClicked_.bind(this),
                            false));

  this.onDoneHandler_ = onDone;
  this.onErrorHandler_ = onError;

  var url = 'http://www.google.com/accounts/TOS?hl=' + l10n.getLocale();
  var substitutions = [
    '<a href="' + url + '" target="_blank">',
    '</a>'
  ];
  l10n.localizeElementFromTag(this.tosMessage_,
                              'HOST_SETUP_TERMS_OF_SERVICE',
                              substitutions,
                              true);

  remoting.setMode(remoting.AppMode.HOST_INSTALL_TOS);
};

/**
 * In manual host installation, onDone handler must call this method if it
 * detects that the host components are still unavailable. The same onDone
 * and onError callbacks will be used when user clicks Ok or Cancel.
 */
remoting.HostInstallDialog.prototype.tryAgain = function() {
  console.assert(this.handlers_ == null, 'Event handlers already exist.');
  this.handlers_ = new base.Disposables(
      new base.DomEventHook(this.retryInstallButton_,
                            'click',
                            this.onRetryClicked_.bind(this),
                            false));

  remoting.setMode(remoting.AppMode.HOST_INSTALL_PENDING);
};

/** @private */
remoting.HostInstallDialog.prototype.onAcceptClicked_ = function() {
  console.assert(this.handlers_ != null, 'No event handlers registered.');
  base.dispose(this.handlers_);
  this.handlers_ = new base.Disposables(
      new base.DomEventHook(this.continueInstallButton_,
                            'click',
                            this.onOkClicked_.bind(this),
                            false),
      new base.DomEventHook(this.cancelInstallButton_,
                            'click',
                            this.onCancelClicked_.bind(this),
                            false));

  /** @type {remoting.HostInstaller} */
  var hostInstaller = new remoting.HostInstaller();

  /** @type {remoting.HostInstallDialog} */
  var that = this;

  this.hostInstaller_.downloadAndWaitForInstall().then(function() {
    that.continueInstallButton_.click();
    that.hostInstaller_.cancel();
  }, function(){
    that.onErrorHandler_(new remoting.Error(remoting.Error.Tag.CANCELLED));
    that.hostInstaller_.cancel();
  });

  remoting.setMode(remoting.AppMode.HOST_INSTALL_PROMPT);
};

/** @private */
remoting.HostInstallDialog.prototype.onOkClicked_ = function() {
  console.assert(this.handlers_ != null, 'No event handlers registered.');
  base.dispose(this.handlers_);
  this.handlers_ = null;

  this.onDoneHandler_();
};

/** @private */
remoting.HostInstallDialog.prototype.onCancelClicked_ = function() {
  console.assert(this.handlers_ != null, 'No event handlers registered.');
  base.dispose(this.handlers_);
  this.handlers_ = null;
  this.hostInstaller_.cancel();
  this.onErrorHandler_(new remoting.Error(remoting.Error.Tag.CANCELLED));
};

/** @private */
remoting.HostInstallDialog.prototype.onRetryClicked_ = function() {
  console.assert(this.handlers_ != null, 'No event handlers registered.');
  base.dispose(this.handlers_);
  this.handlers_ = new base.Disposables(
      new base.DomEventHook(this.continueInstallButton_,
                            'click',
                            this.onOkClicked_.bind(this),
                            false),
      new base.DomEventHook(this.cancelInstallButton_,
                            'click',
                            this.onCancelClicked_.bind(this),
                            false));

  remoting.setMode(remoting.AppMode.HOST_INSTALL_PROMPT);
};
