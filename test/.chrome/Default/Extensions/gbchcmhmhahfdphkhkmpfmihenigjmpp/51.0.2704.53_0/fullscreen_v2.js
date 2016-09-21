// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Full-screen implementation for apps v2, using chrome.AppWindow.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @constructor
 * @implements {remoting.Fullscreen}
 */
remoting.FullscreenAppsV2 = function() {
  /**
   * @type {boolean} True if the window is minimized. onRestored fires when the
   *     the window transitions from minimized to any other state, but since we
   *     only want transitions from full-screen to windowed to cause a callback,
   *     we must keep track of the minimized state of the window.
   * @private
   */
  this.isMinimized_ = chrome.app.window.current().isMinimized();

  /**
   * @type {?boolean} The most recent full-screen state passed to the callback.
   *     This guards against redundant invocations, as as would otherwise occur
   *     in response to a full-screen -> maximized -> unmaximized transition,
   *     because this results in two onRestored callbacks.
   */
  this.previousCallbackState_ = null;

  /** @private {string} Internal 'full-screen changed' event name. */
  this.kEventName_ = '_fullscreenchanged';

  /** @private {base.EventSourceImpl} */
  this.eventSource_ = new base.EventSourceImpl();
  this.eventSource_.defineEvents([this.kEventName_]);

  chrome.app.window.current().onFullscreened.addListener(
      this.onFullscreened_.bind(this));
  chrome.app.window.current().onRestored.addListener(
      this.onRestored_.bind(this));
  chrome.app.window.current().onMinimized.addListener(
      this.onMinimized_.bind(this));

  document.body.classList.toggle('fullscreen', this.isActive());
};

/**
 * @param {boolean} fullscreen True to enter full-screen mode; false to leave.
 * @param {function():void=} opt_onDone Optional completion callback.
 */
remoting.FullscreenAppsV2.prototype.activate = function(
    fullscreen, opt_onDone) {
  if (opt_onDone) {
    if (this.isActive() == fullscreen) {
      opt_onDone();
    } else {
      /** @type {remoting.Fullscreen} */
      var that = this;
      var callbackAndRemoveListener = function() {
        that.removeListener(callbackAndRemoveListener);
        opt_onDone();
      };
      this.addListener(callbackAndRemoveListener);
    }
  }

  if (fullscreen) {
    chrome.app.window.current().fullscreen();
  } else if (this.isActive()) {
    chrome.app.window.current().restore();
  }
};

remoting.FullscreenAppsV2.prototype.toggle = function() {
  this.activate(!this.isActive());
};

/**
 * @return {boolean}
 */
remoting.FullscreenAppsV2.prototype.isActive = function() {
  return chrome.app.window.current().isFullscreen();
};

/**
 * @param {function(boolean=):void} callback
 */
remoting.FullscreenAppsV2.prototype.addListener = function(callback) {
  this.eventSource_.addEventListener(this.kEventName_, callback);
};

/**
 * @param {function(boolean=):void} callback
 */
remoting.FullscreenAppsV2.prototype.removeListener = function(callback) {
  this.eventSource_.removeEventListener(this.kEventName_, callback);
};

/**
 * @private
 */
remoting.FullscreenAppsV2.prototype.onFullscreened_ = function() {
  this.isMinimized_ = false;
  this.raiseEvent_(true);
  document.body.classList.add('fullscreen');
};

/**
 * @private
 */
remoting.FullscreenAppsV2.prototype.onRestored_ = function() {
  if (!this.isMinimized_) {
    // ChromeOS fires a spurious onRestored event going maximized->fullscreen.
    // TODO(jamiewalch): Remove this work-around when crbug.com/394819 is fixed.
    if (remoting.platformIsChromeOS() && this.isActive()) {
      return;
    }
    document.body.classList.remove('fullscreen');
    this.raiseEvent_(false);
  }
  this.isMinimized_ = false;
};

/**
 * @private
 */
remoting.FullscreenAppsV2.prototype.onMinimized_ = function() {
  this.isMinimized_ = true;
};

/**
 * @param {boolean} isFullscreen
 * @private
 */
remoting.FullscreenAppsV2.prototype.raiseEvent_ = function(isFullscreen) {
  if (isFullscreen !== this.previousCallbackState_) {
    this.previousCallbackState_ = isFullscreen;
    this.eventSource_.raiseEvent(this.kEventName_, isFullscreen);
  }
};
