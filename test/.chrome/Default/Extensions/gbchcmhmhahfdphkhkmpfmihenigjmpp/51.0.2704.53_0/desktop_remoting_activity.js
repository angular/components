// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

var ESCAPE_KEY_CODE = 27;

/**
 * This class provides common functionality to Me2MeActivity and It2MeActivity,
 * e.g. constructing the relevant UX, and delegate the custom handling of the
 * session state changes to the |parentActivity|.
 *
 * @param {remoting.Activity} parentActivity
 * @param {remoting.SessionLogger} logger
 * @param {Array<string>=} opt_additionalCapabilities
 * @implements {remoting.ClientSession.EventHandler}
 * @implements {base.Disposable}
 * @constructor
 */
remoting.DesktopRemotingActivity = function(
    parentActivity, logger, opt_additionalCapabilities) {
  /** @private */
  this.parentActivity_ = parentActivity;
  /** @private {remoting.DesktopConnectedView} */
  this.connectedView_ = null;

  opt_additionalCapabilities = opt_additionalCapabilities || [];
  /** @private */
  this.sessionFactory_ = new remoting.ClientSessionFactory(
      document.querySelector('#client-container .client-plugin-container'),
      opt_additionalCapabilities);

  /** @private {remoting.ClientSession} */
  this.session_ = null;
  /** @private {remoting.ConnectingDialog} */
  this.connectingDialog_ = remoting.modalDialogFactory.createConnectingDialog(
      parentActivity.stop.bind(parentActivity));

  /** @private */
  this.isStopped_ = false;

  /** @private */
  this.logger_ = logger;

  /** @private {base.DomEventHook} */
  this.keydownHook_ = null;
};

/**
 * Initiates a connection.
 *
 * @param {remoting.Host} host the Host to connect to.
 * @param {remoting.CredentialsProvider} credentialsProvider
 * @return {void} Nothing.
 */
remoting.DesktopRemotingActivity.prototype.start =
    function(host, credentialsProvider) {
  var that = this;
  this.isStopped_ = false;
  this.sessionFactory_.createSession(this, this.logger_).then(
    function(/** remoting.ClientSession */ session) {
      if (that.isStopped_) {
        base.dispose(session);
      } else {
        that.session_ = session;
        session.connect(host, credentialsProvider);
      }
  }).catch(remoting.Error.handler(
    function(/** !remoting.Error */ error) {
      that.parentActivity_.onConnectionFailed(error);
  }));
};

remoting.DesktopRemotingActivity.prototype.stop = function() {
  this.isStopped_ = true;
  if (this.session_) {
    this.session_.disconnect(remoting.Error.none());
    console.log('Disconnected.');
  } else {
    console.log('Canceled.');
    // Session creation in process, just report it as canceled.
    this.logger_.logSessionStateChange(
      remoting.ChromotingEvent.SessionState.CONNECTION_CANCELED);
  }
};

/**
 * @param {remoting.ConnectionInfo} connectionInfo
 */
remoting.DesktopRemotingActivity.prototype.onConnected =
    function(connectionInfo) {
  this.connectingDialog_.hide();
  remoting.setMode(remoting.AppMode.IN_SESSION);
  if (!base.isAppsV2()) {
    remoting.toolbar.center();
    remoting.toolbar.preview();
  }

  this.connectedView_ = remoting.DesktopConnectedView.create(
      base.getHtmlElement('client-container'), connectionInfo);

  // Apply the default or previously-specified keyboard remapping.
  var remapping = connectionInfo.host().options.getRemapKeys();
  this.connectedView_.setRemapKeys(remapping);
  this.parentActivity_.onConnected(connectionInfo);

  // ESC key feature tracking
  var pluginElement = connectionInfo.plugin().element();
  var onKeyDown = function(/** KeyboardEvent **/ event) {
    if (event && event.keyCode == ESCAPE_KEY_CODE
      && remoting.fullscreen.isActive()) {
      this.logger_.incrementFeatureUsage('fullscreen_esc_count');
    }
  };
  this.keydownHook_ = new base.DomEventHook(
    pluginElement, 'keydown', onKeyDown.bind(this), false);
};

remoting.DesktopRemotingActivity.prototype.onDisconnected = function(reason) {
  if (this.handleError_(reason)) {
    return;
  }

  base.dispose(this.keydownHook_);

  this.parentActivity_.onDisconnected(reason);
};

/**
 * @param {!remoting.Error} error
 */
remoting.DesktopRemotingActivity.prototype.onConnectionFailed =
    function(error) {
  if (this.handleError_(error)) {
    return;
  }
  this.parentActivity_.onConnectionFailed(error);
};

/**
 * @param {!remoting.Error} error The error to be localized and displayed.
 * @return {boolean} returns true if the error is handled.
 * @private
 */
remoting.DesktopRemotingActivity.prototype.handleError_ = function(error) {
  if (error.hasTag(remoting.Error.Tag.AUTHENTICATION_FAILED)) {
    remoting.setMode(remoting.AppMode.HOME);
    remoting.handleAuthFailureAndRelaunch();
    return true;
  }
  return false;
};

remoting.DesktopRemotingActivity.prototype.dispose = function() {
  base.dispose(this.connectedView_);
  this.connectedView_ = null;
  base.dispose(this.session_);
  this.session_ = null;
  this.connectingDialog_.hide();
};

/** @return {remoting.DesktopConnectedView} */
remoting.DesktopRemotingActivity.prototype.getConnectedView = function() {
  return this.connectedView_;
};

/**
 * @return {remoting.ClientSession}.
 */
remoting.DesktopRemotingActivity.prototype.getSession = function() {
  return this.session_;
};

/** @return {remoting.ConnectingDialog} */
remoting.DesktopRemotingActivity.prototype.getConnectingDialog = function() {
  return this.connectingDialog_;
};

})();
