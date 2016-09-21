// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Class handling setting of the local app window shape to account for windows
 * on the remote desktop, as well as any client-side UI.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/** @constructor */
remoting.WindowShape = function() {
  /** @private {Array<{left: number, top: number,
                       width: number, height: number}>} */
  this.desktopRects_ = [];

  /** @private {Array<remoting.WindowShape.ClientUI>} */
  this.clientUIs_ = [];
};

/**
 * @return {boolean} True if setShape is available and implemented for the
 *     current platform.
 */
remoting.WindowShape.isSupported = function() {
  return base.isAppsV2() &&
      typeof(chrome.app.window.current().setShape) != 'undefined' &&
      !remoting.platformIsMac();
};

/**
 * Adds a client-side UI.
 *
 * @param {remoting.WindowShape.ClientUI} callback
 */
remoting.WindowShape.prototype.registerClientUI = function(callback) {
  if (this.clientUIs_.indexOf(callback) === -1) {
    this.clientUIs_.push(callback);
    this.updateClientWindowShape();
  }
};

/**
 * Removes a client-side UI.
 *
 * @param {remoting.WindowShape.ClientUI} callback
 */
remoting.WindowShape.prototype.unregisterClientUI = function(callback) {
  var index = this.clientUIs_.indexOf(callback);
  this.clientUIs_.splice(index, 1);
  this.updateClientWindowShape();
};

/**
 * Center aligns a DOM element to the desktop shape.
 *
 * @param {HTMLElement} element
 */
remoting.WindowShape.prototype.centerToDesktop = function(element) {
  var desktop = {
    left: Number.MAX_VALUE,
    right: Number.MIN_VALUE,
    top: Number.MAX_VALUE,
    bottom: Number.MIN_VALUE
  };

  // If there is no desktop window, center it to the current viewport.
  if (this.desktopRects_.length === 0) {
    desktop.left = 0;
    desktop.right = window.innerWidth;
    desktop.top = 0;
    desktop.bottom = window.innerHeight;
  } else {
    // Compute the union of the bounding rects of all desktop windows.
    this.desktopRects_.forEach(function(
        /**{left: number, top: number, width: number, height: number}*/ rect) {
      desktop.left = Math.min(rect.left, desktop.left);
      desktop.right = Math.max(rect.left + rect.width, desktop.right);
      desktop.top = Math.min(rect.top, desktop.top);
      desktop.bottom = Math.max(rect.top + rect.height, desktop.bottom);
    });
  }

  // Center the element to the desktop window bounding rect.
  var rect = element.getBoundingClientRect();
  var left = (desktop.right - desktop.left - rect.width) / 2 + desktop.left;
  var top = (desktop.bottom - desktop.top - rect.height) / 2 + desktop.top;
  element.style.left = Math.round(left) + 'px';
  element.style.top = Math.round(top) + 'px';
  this.updateClientWindowShape();
};

/**
 * Sets the region associated with the remote desktop windows.
 *
 * @param {Array<{left: number, top: number, width: number, height: number}>}
 *     rects
 */
remoting.WindowShape.prototype.setDesktopRects = function(rects) {
  this.desktopRects_ = rects;
  this.updateClientWindowShape();
};

/**
 * Updates the client window shape.
 */
remoting.WindowShape.prototype.updateClientWindowShape = function() {
  if (!remoting.WindowShape.isSupported()) {
    return;
  }

  var rects = this.desktopRects_.slice();
  for (var i = 0; i < this.clientUIs_.length; ++i) {
    this.clientUIs_[i].addToRegion(rects);
  }
  for (var i = 0; i < rects.length; ++i) {
    var rect = /** @type {ClientRect} */ (rects[i]);
    var left = Math.floor(rect.left);
    var right = Math.ceil(rect.left + rect.width);
    var top = Math.floor(rect.top);
    var bottom = Math.ceil(rect.top + rect.height);
    rects[i] = { left: left,
                 top: top,
                 width: right - left,
                 height: bottom - top };
  }
  chrome.app.window.current().setShape({rects: rects});
};


/**
 * @interface
 */
remoting.WindowShape.ClientUI = function () {
};

/**
 * Adds the context menu's bounding rectangle to the specified region.
 *
 * @param {Array<{left: number, top: number, width: number, height: number}>}
 *     rects
 */
remoting.WindowShape.ClientUI.prototype.addToRegion = function(rects) {};
