// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Full-screen implementation for apps v1, using webkitRequestFullscreen.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @constructor
 * @implements {remoting.Fullscreen}
 */
remoting.FullscreenAppsV1 = function() {
  /** @private {string} Internal 'full-screen changed' event name */
  this.kEventName_ = '_fullscreenchanged';

  /** @private {base.EventSourceImpl} */
  this.eventSource_ = new base.EventSourceImpl();
  this.eventSource_.defineEvents([this.kEventName_]);

  document.addEventListener(
      'webkitfullscreenchange',
      this.onFullscreenChanged_.bind(this),
      false);
};

/**
 * @param {boolean} fullscreen
 * @param {function():void=} opt_onDone
 * @override
 */
remoting.FullscreenAppsV1.prototype.activate = function(
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
    document.body.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  } else {
    document.webkitCancelFullScreen();
  }
};

/** @return {void} */
remoting.FullscreenAppsV1.prototype.toggle = function() {
  this.activate(!this.isActive());
};

/**
 * @return {boolean} True if full-screen mode is active.
 */
remoting.FullscreenAppsV1.prototype.isActive = function() {
  return document.webkitIsFullScreen;
};

/**
 * @param {function(boolean=):void} callback
 */
remoting.FullscreenAppsV1.prototype.addListener = function(callback) {
  this.eventSource_.addEventListener(this.kEventName_, callback);
};

/**
 * @param {function(boolean=):void} callback
 */
remoting.FullscreenAppsV1.prototype.removeListener = function(callback) {
  this.eventSource_.removeEventListener(this.kEventName_, callback);
};

/**
 * @private
 */
remoting.FullscreenAppsV1.prototype.onFullscreenChanged_ = function() {
  /** @this {remoting.FullscreenAppsV1} */
  var checkIsActive = function() {
    if (this.isActive()) {
      document.body.classList.add('fullscreen');
    } else {
      document.body.classList.remove('fullscreen');
    }
    this.eventSource_.raiseEvent(this.kEventName_, this.isActive());
  };

  // Querying full-screen immediately after the webkitfullscreenchange
  // event fires sometimes gives the wrong answer on Mac, perhaps due to
  // the time taken to animate presentation mode. Since I haven't been able
  // to isolate the exact repro steps, and we're not planning on using this
  // API for much longer, this hack will suffice for now.
  window.setTimeout(checkIsActive.bind(this), 500);
};
