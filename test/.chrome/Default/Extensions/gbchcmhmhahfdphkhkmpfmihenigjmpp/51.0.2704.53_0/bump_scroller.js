// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * This class allows enables the scrolling of the DestkopViewport in fullscreen
 * mode by moving the mouse to the edge of the screen.
 */

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/**
 * @param {remoting.DesktopViewport} viewport
 *
 * @constructor
 * @implements {base.Disposable}
 * @extends {base.EventSourceImpl}
 */
remoting.BumpScroller = function(viewport) {
  base.inherits(this, base.EventSourceImpl);

  /** @private */
  this.viewport_ = viewport;
  /** @private {number?} */
  this.bumpScrollTimer_ = null;
  /** @private */
  this.eventHook_ = new base.DomEventHook(document.documentElement, 'mousemove',
                                          this.onMouseMove_.bind(this), false);

  this.defineEvents(base.values(remoting.BumpScroller.Events));
};

/** @enum {string} */
remoting.BumpScroller.Events = {
  bumpScrollStarted: 'bumpScrollStarted',
  bumpScrollStopped: 'bumpScrollStopped'
};

remoting.BumpScroller.prototype.dispose = function() {
  base.dispose(this.eventHook_);
  this.eventHook_ = null;
};

/**
 * @param {Event} event The mouse event.
 * @private
 */
remoting.BumpScroller.prototype.onMouseMove_ = function(event) {
  if (this.bumpScrollTimer_ !== null) {
    window.clearTimeout(this.bumpScrollTimer_);
    this.bumpScrollTimer_ = null;
  }

  /**
   * Compute the scroll speed based on how close the mouse is to the edge.
   *
   * @param {number} mousePos The mouse x- or y-coordinate
   * @param {number} size The width or height of the content area.
   * @return {number} The scroll delta, in pixels.
   */
  var computeDelta = function(mousePos, size) {
    var threshold = 10;
    if (mousePos >= size - threshold) {
      return 1 + 5 * (mousePos - (size - threshold)) / threshold;
    } else if (mousePos <= threshold) {
      return -1 - 5 * (threshold - mousePos) / threshold;
    }
    return 0;
  };

  var clientArea = this.viewport_.getClientArea();
  var dx = computeDelta(event.x, clientArea.width);
  var dy = computeDelta(event.y, clientArea.height);

  if (dx !== 0 || dy !== 0) {
    this.raiseEvent(remoting.BumpScroller.Events.bumpScrollStarted);
    this.repeatScroll_(dx, dy, new Date().getTime());
  }
};

/**
 * Scroll the view, and schedule a timer to do so again unless we've hit
 * the edges of the screen. This timer is cancelled when the mouse moves.
 *
 * @param {number} dx
 * @param {number} dy
 * @param {number} expected The time at which we expect to be called.
 * @private
 */
remoting.BumpScroller.prototype.repeatScroll_ = function(dx, dy, expected) {
  /** @type {number} */
  var now = new Date().getTime();
  var timeout = 10;
  var lateAdjustment = 1 + (now - expected) / timeout;
  if (!this.viewport_.scroll(lateAdjustment * dx, lateAdjustment * dy)) {
    this.raiseEvent(remoting.BumpScroller.Events.bumpScrollStopped);
  } else {
    this.bumpScrollTimer_ = window.setTimeout(
        this.repeatScroll_.bind(this, dx, dy, now + timeout), timeout);
  }
};

}());