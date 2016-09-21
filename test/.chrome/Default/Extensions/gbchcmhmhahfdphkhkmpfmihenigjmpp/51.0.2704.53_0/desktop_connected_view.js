// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Class handling user-facing aspects of the client session.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @param {HTMLElement} container
 * @param {remoting.ConnectionInfo} connectionInfo
 * @constructor
 * @extends {base.EventSourceImpl}
 * @implements {base.Disposable}
 */
remoting.DesktopConnectedView = function(container, connectionInfo) {

  /** @private {HTMLElement} */
  this.container_ = container;

  /** @private {remoting.ClientPlugin} */
  this.plugin_ = connectionInfo.plugin();

  /** @private {remoting.ClientSession} */
  this.session_ = connectionInfo.session();

  /** @private */
  this.host_ = connectionInfo.host();

  /** @private {remoting.DesktopViewport} */
  this.viewport_ = null;

  /** @private {remoting.ConnectedView} */
  this.view_ = null;

  /** @private {base.Disposable} */
  this.eventHooks_ = null;

  /** @private */
  this.stats_ = new remoting.ConnectionStats(
      document.getElementById('statistics'), connectionInfo.plugin());

  this.initPlugin_();
  this.initUI_();
};

/** @return {void} Nothing. */
remoting.DesktopConnectedView.prototype.dispose = function() {
  if (remoting.windowFrame) {
    remoting.windowFrame.setDesktopConnectedView(null);
  }
  if (remoting.toolbar) {
    remoting.toolbar.setDesktopConnectedView(null);
  }
  if (remoting.optionsMenu) {
    remoting.optionsMenu.setDesktopConnectedView(null);
  }

  document.body.classList.remove('connected');

  base.dispose(this.eventHooks_);
  this.eventHooks_ = null;

  base.dispose(this.viewport_);
  this.viewport_ = null;

  base.dispose(this.stats_);
  this.stats = null;
};

/**
 * Get host display name.
 *
 * @return {string}
 */
remoting.DesktopConnectedView.prototype.getHostDisplayName = function() {
  return this.host_.hostName;
};

/**
 * @return {boolean} True if shrink-to-fit is enabled; false otherwise.
 */
remoting.DesktopConnectedView.prototype.getShrinkToFit = function() {
  if (this.viewport_) {
    return this.viewport_.getShrinkToFit();
  }
  return false;
};

/**
 * @return {boolean} True if resize-to-client is enabled; false otherwise.
 */
remoting.DesktopConnectedView.prototype.getResizeToClient = function() {
  if (this.viewport_) {
    return this.viewport_.getResizeToClient();
  }
  return false;
};

/**
 * @return {boolean} True if the right-hand Ctrl key is mapped to the Meta
 *     (Windows, Command) key.
 */
remoting.DesktopConnectedView.prototype.getMapRightCtrl = function() {
  return this.host_.options.getRemapKeys()[0x0700e4] === 0x0700e7;
};

remoting.DesktopConnectedView.prototype.toggleStats = function() {
  this.stats_.toggle();
};

/**
 * @return {boolean} True if the connection stats is visible; false otherwise.
 */
remoting.DesktopConnectedView.prototype.isStatsVisible = function() {
  return this.stats_.isVisible();
};

/**
 * @return {Element} The element that should host the plugin.
 * @private
 */
remoting.DesktopConnectedView.prototype.getPluginContainer_ = function() {
  return this.container_.querySelector('.client-plugin-container');
};

/** @return {remoting.DesktopViewport} */
remoting.DesktopConnectedView.prototype.getViewportForTesting = function() {
  return this.viewport_;
};

/** @return {remoting.ConnectedView} */
remoting.DesktopConnectedView.prototype.getConnectedViewForTesting =
    function() {
  return this.view_;
};

/** @private */
remoting.DesktopConnectedView.prototype.initPlugin_ = function() {
  console.assert(remoting.app instanceof remoting.DesktopRemoting,
                '|remoting.app| is not an instance of DesktopRemoting.');
  var drApp = /** @type {remoting.DesktopRemoting} */ (remoting.app);
  var mode = drApp.getConnectionMode();

  // Show the Ctrl-Alt-Del button only in Me2Me mode.
  if (mode == remoting.DesktopRemoting.Mode.IT2ME) {
    var sendCadElement = document.getElementById('send-ctrl-alt-del');
    sendCadElement.hidden = true;
  }
};

/**
 * This is a callback that gets called when the window is resized.
 *
 * @return {void} Nothing.
 * @private.
 */
remoting.DesktopConnectedView.prototype.onResize_ = function() {
  if (this.viewport_) {
    this.viewport_.onResize();
  }
};

/** @private */
remoting.DesktopConnectedView.prototype.initUI_ = function() {
  document.body.classList.add('connected');

  this.view_ = new remoting.ConnectedView(
      this.plugin_, this.container_,
      this.container_.querySelector('.mouse-cursor-overlay'));

  var scrollerElement = base.getHtmlElement('scroller');
  this.viewport_ = new remoting.DesktopViewport(
      scrollerElement || document.body,
      this.plugin_.hostDesktop(),
      this.host_.options);

  if (remoting.windowFrame) {
    remoting.windowFrame.setDesktopConnectedView(this);
  }
  if (remoting.toolbar) {
    remoting.toolbar.setDesktopConnectedView(this);
  }
  if (remoting.optionsMenu) {
    remoting.optionsMenu.setDesktopConnectedView(this);
  }

  // Activate full-screen related UX.
  this.eventHooks_ = new base.Disposables(
    this.view_,
    new base.EventHook(this.session_,
                       remoting.ClientSession.Events.videoChannelStateChanged,
                       this.view_.onConnectionReady.bind(this.view_)),
    new base.DomEventHook(window, 'resize', this.onResize_.bind(this), false),
    new remoting.Fullscreen.EventHook(this.onFullScreenChanged_.bind(this)));
  this.onFullScreenChanged_(remoting.fullscreen.isActive());
};

/**
 * Set the shrink-to-fit and resize-to-client flags and save them if this is
 * a Me2Me connection.
 *
 * @param {boolean} shrinkToFit True if the remote desktop should be scaled
 *     down if it is larger than the client window; false if scroll-bars
 *     should be added in this case.
 * @param {boolean} resizeToClient True if window resizes should cause the
 *     host to attempt to resize its desktop to match the client window size;
 *     false to disable this behaviour for subsequent window resizes--the
 *     current host desktop size is not restored in this case.
 * @return {void} Nothing.
 */
remoting.DesktopConnectedView.prototype.setScreenMode =
    function(shrinkToFit, resizeToClient) {
  this.viewport_.setScreenMode(shrinkToFit, resizeToClient);
};

/**
 * Called when the full-screen status has changed, either via the
 * remoting.Fullscreen class, or via a system event such as the Escape key
 *
 * @param {boolean=} fullscreen True if the app is entering full-screen mode;
 *     false if it is leaving it.
 * @private
 */
remoting.DesktopConnectedView.prototype.onFullScreenChanged_ = function (
    fullscreen) {
  if (this.viewport_) {
    // When a window goes full-screen, a resize event is triggered, but the
    // Fullscreen.isActive call is not guaranteed to return true until the
    // full-screen event is triggered. In apps v2, the size of the window's
    // client area is calculated differently in full-screen mode, so register
    // for both events.
    this.viewport_.onResize();
    this.viewport_.enableBumpScroll(Boolean(fullscreen));
  }
};

/**
 * Set whether or not the right-hand Ctrl key should send the Meta (Windows,
 * Command) key-code.
 *
 * @param {boolean} enable True to enable the mapping; false to disable.
 */
remoting.DesktopConnectedView.prototype.setMapRightCtrl = function(enable) {
  if (enable === this.getMapRightCtrl()) {
    return;  // In case right Ctrl is mapped, but not to right Meta.
  }

  var remapKeys = this.host_.options.getRemapKeys();
  if (enable) {
    remapKeys[0x0700e4] = 0x0700e7;
  } else {
    delete remapKeys[0x0700e4]
  }
  this.setRemapKeys(remapKeys);
};

/**
 * Sends a Ctrl-Alt-Del sequence to the remoting client.
 *
 * @return {void} Nothing.
 */
remoting.DesktopConnectedView.prototype.sendCtrlAltDel = function() {
  console.log('Sending Ctrl-Alt-Del.');
  this.plugin_.injectKeyCombination([0x0700e0, 0x0700e2, 0x07004c]);
};

/**
 * Sends a Print Screen keypress to the remoting client.
 *
 * @return {void} Nothing.
 */
remoting.DesktopConnectedView.prototype.sendPrintScreen = function() {
  console.log('Sending Print Screen.');
  this.plugin_.injectKeyCombination([0x070046]);
};

/**
 * Sets and stores the key remapping setting for the current host. If set,
 * these mappings override the defaults for the client platform.
 *
 * @param {string|!Object} remappings
 */
remoting.DesktopConnectedView.prototype.setRemapKeys = function(remappings) {
  // Save the new remapping setting.
  this.host_.options.setRemapKeys(remappings);
  this.host_.options.save();
  this.plugin_.setRemapKeys(this.host_.options.getRemapKeys());
};

/**
 * Factory function so that it can be overwritten in unit test to avoid
 * UI dependencies.
 *
 * @param {HTMLElement} container
 * @param {remoting.ConnectionInfo} connectionInfo
 * @return  {remoting.DesktopConnectedView}
 */
remoting.DesktopConnectedView.create = function(container, connectionInfo) {
  return new remoting.DesktopConnectedView(container, connectionInfo);
};
