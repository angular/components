// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Experimental features that can be accessed via the Chrome debugging console.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

remoting.experimental = {};

/**
 * Enables or disables rendering of dirty regions for debugging.
 * @param {boolean} enable True to enable rendering.
 */
remoting.experimental.enableDebugRegion = function(enable) {
  var drApp = /** @type {remoting.DesktopRemoting} */ (remoting.app);
  if (drApp instanceof remoting.DesktopRemoting) {
    var desktopConnectedView = drApp.getConnectedViewForTesting();
    var connectedView = desktopConnectedView.getConnectedViewForTesting();
    connectedView.enableDebugRegion(enable);
  }
}

/**
 * Sets and stores the scale factor to apply to host sizing requests.
 * The desktopScale applies to the dimensions reported to the host, not
 * to the client DPI reported to it.
 *
 * @param {number} desktopScale Scale factor to apply.
 */
remoting.experimental.setDesktopScale = function(desktopScale) {
  var drApp = /** @type {remoting.DesktopRemoting} */ (remoting.app);
  if (drApp instanceof remoting.DesktopRemoting) {
    var connectedView = drApp.getConnectedViewForTesting();
    var viewport = connectedView.getViewportForTesting();
    viewport.setDesktopScale(desktopScale);
  }
};

/**
 * Sets and stores the key remapping setting for the current host. If set,
 * these mappings override the defaults for the client platform.
 *
 * @param {string} remappings Comma-separated list of key remappings.
 */
remoting.experimental.setRemapKeys = function(remappings) {
  var drApp = /** @type {remoting.DesktopRemoting} */ (remoting.app);
  if (drApp instanceof remoting.DesktopRemoting) {
    var connectedView = drApp.getConnectedViewForTesting();
    connectedView.setRemapKeys(remappings);
  }
};
