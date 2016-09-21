// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Class handling the in-session options menu (or menus in the case of apps v1).
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @param {Element} sendCtrlAltDel
 * @param {Element} sendPrtScrn
 * @param {Element} mapRightCtrl
 * @param {Element} resizeToClient
 * @param {Element} shrinkToFit
 * @param {Element} newConnection
 * @param {Element?} fullscreen
 * @param {Element?} toggleStats
 * @constructor
 */
remoting.OptionsMenu = function(sendCtrlAltDel, sendPrtScrn, mapRightCtrl,
                                resizeToClient, shrinkToFit,
                                newConnection, fullscreen, toggleStats) {
  this.sendCtrlAltDel_ = sendCtrlAltDel;
  this.sendPrtScrn_ = sendPrtScrn;
  this.mapRightCtrl_ = mapRightCtrl;
  this.resizeToClient_ = resizeToClient;
  this.shrinkToFit_ = shrinkToFit;
  this.newConnection_ = newConnection;
  this.fullscreen_ = fullscreen;
  this.toggleStats_ = toggleStats;

  /** @private {remoting.DesktopConnectedView} */
  this.desktopConnectedView_ = null;

  this.sendCtrlAltDel_.addEventListener(
      'click', this.onSendCtrlAltDel_.bind(this), false);
  this.sendPrtScrn_.addEventListener(
      'click', this.onSendPrtScrn_.bind(this), false);
  this.mapRightCtrl_.addEventListener(
      'click', this.onMapRightCtrl_.bind(this), false);
  this.resizeToClient_.addEventListener(
      'click', this.onResizeToClient_.bind(this), false);
  this.shrinkToFit_.addEventListener(
      'click', this.onShrinkToFit_.bind(this), false);
  this.newConnection_.addEventListener(
      'click', this.onNewConnection_.bind(this), false);

  if (this.fullscreen_) {
    fullscreen.addEventListener('click', this.onFullscreen_.bind(this), false);
  }
  if (this.toggleStats_) {
    toggleStats.addEventListener(
        'click', this.onToggleStats_.bind(this), false);
  }

};

/**
 * @param {remoting.DesktopConnectedView} desktopConnectedView The view for the
 *     active session, or null if there is no connection.
 */
remoting.OptionsMenu.prototype.setDesktopConnectedView = function(
    desktopConnectedView) {
  this.desktopConnectedView_ = desktopConnectedView;
};

remoting.OptionsMenu.prototype.onShow = function() {
  if (this.desktopConnectedView_) {
    console.assert(remoting.app instanceof remoting.DesktopRemoting,
                  '|remoting.app| is not an instance of DesktopRemoting.');
    var drApp = /** @type {remoting.DesktopRemoting} */ (remoting.app);
    var mode = drApp.getConnectionMode();

    this.mapRightCtrl_.hidden = !remoting.platformIsChromeOS();
    remoting.MenuButton.select(
        this.mapRightCtrl_, this.desktopConnectedView_.getMapRightCtrl());

    this.resizeToClient_.hidden = mode === remoting.DesktopRemoting.Mode.IT2ME;
    remoting.MenuButton.select(
        this.resizeToClient_, this.desktopConnectedView_.getResizeToClient());
    remoting.MenuButton.select(
        this.shrinkToFit_, this.desktopConnectedView_.getShrinkToFit());

    if (this.fullscreen_) {
      remoting.MenuButton.select(
          this.fullscreen_, remoting.fullscreen.isActive());
    }
    if (this.toggleStats_) {
      remoting.MenuButton.select(
          this.toggleStats_, this.desktopConnectedView_.isStatsVisible());
    }
  }
};

remoting.OptionsMenu.prototype.onSendCtrlAltDel_ = function() {
  if (this.desktopConnectedView_) {
    this.desktopConnectedView_.sendCtrlAltDel();
  }
};

remoting.OptionsMenu.prototype.onSendPrtScrn_ = function() {
  if (this.desktopConnectedView_) {
    this.desktopConnectedView_.sendPrintScreen();
  }
};

remoting.OptionsMenu.prototype.onMapRightCtrl_ = function() {
  if (this.desktopConnectedView_) {
    this.desktopConnectedView_.setMapRightCtrl(
        !this.desktopConnectedView_.getMapRightCtrl());
  }
};

remoting.OptionsMenu.prototype.onResizeToClient_ = function() {
  if (this.desktopConnectedView_) {
    this.desktopConnectedView_.setScreenMode(
        this.desktopConnectedView_.getShrinkToFit(),
        !this.desktopConnectedView_.getResizeToClient());
  }
};

remoting.OptionsMenu.prototype.onShrinkToFit_ = function() {
  if (this.desktopConnectedView_) {
    this.desktopConnectedView_.setScreenMode(
        !this.desktopConnectedView_.getShrinkToFit(),
        this.desktopConnectedView_.getResizeToClient());
  }
};

remoting.OptionsMenu.prototype.onNewConnection_ = function() {
  base.Ipc.invoke('remoting.ActivationHandler.launch');
};

remoting.OptionsMenu.prototype.onFullscreen_ = function() {
  remoting.fullscreen.toggle();
};

remoting.OptionsMenu.prototype.onToggleStats_ = function() {
  if (this.desktopConnectedView_) {
    this.desktopConnectedView_.toggleStats();
  }
};

/**
 * @type {remoting.OptionsMenu}
 */
remoting.optionsMenu = null;
