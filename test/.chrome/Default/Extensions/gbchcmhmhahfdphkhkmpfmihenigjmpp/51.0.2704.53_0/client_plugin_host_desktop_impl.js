// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Provides an interface to manage the Host Desktop of a remoting session.
 */

var remoting = remoting || {};
remoting.ClientPlugin = remoting.ClientPlugin || {};

(function() {

'use strict';

/**
 * @param {remoting.ClientPlugin} plugin
 * @param {function(Object):void} postMessageCallback Callback to post a message
 *   to the Client Plugin.
 *
 * @implements {remoting.HostDesktop}
 * @extends {base.EventSourceImpl}
 * @constructor
 */
remoting.ClientPlugin.HostDesktopImpl = function(plugin, postMessageCallback) {
  base.inherits(this, base.EventSourceImpl);
  /** @private */
  this.plugin_ = plugin;
  /** @private */
  this.width_ = 0;
  /** @private */
  this.height_ = 0;
  /** @private */
  this.xDpi_ = 96;
  /** @private */
  this.yDpi_ = 96;
  /** @private */
  this.postMessageCallback_ = postMessageCallback;

  this.defineEvents(base.values(remoting.HostDesktop.Events));
};

/** @return {{width:number, height:number, xDpi:number, yDpi:number}} */
remoting.ClientPlugin.HostDesktopImpl.prototype.getDimensions = function() {
  return {
    width: this.width_,
    height: this.height_,
    xDpi: this.xDpi_,
    yDpi: this.yDpi_
  };
};

/**
 * @param {number} width
 * @param {number} height
 * @param {number} deviceScale
 */
remoting.ClientPlugin.HostDesktopImpl.prototype.resize = function(
    width, height, deviceScale) {
  var dpi = Math.floor(deviceScale * 96);
  this.postMessageCallback_({
    method: 'notifyClientResolution',
    data: {
      width: Math.floor(width * deviceScale),
      height: Math.floor(height * deviceScale),
      x_dpi: dpi,
      y_dpi: dpi
    }
  });
};

/**
 * This function is called by |this.plugin_| when the size of the host
 * desktop is changed.
 *
 * @param {remoting.ClientPluginMessage} message
 */
remoting.ClientPlugin.HostDesktopImpl.prototype.onSizeUpdated = function(
    message) {
  this.width_ = base.getNumberAttr(message.data, 'width');
  this.height_ = base.getNumberAttr(message.data, 'height');
  this.xDpi_ = base.getNumberAttr(message.data, 'x_dpi', 96);
  this.yDpi_ = base.getNumberAttr(message.data, 'y_dpi', 96);
  this.raiseEvent(remoting.HostDesktop.Events.sizeChanged,
                  this.getDimensions());
};

}());
