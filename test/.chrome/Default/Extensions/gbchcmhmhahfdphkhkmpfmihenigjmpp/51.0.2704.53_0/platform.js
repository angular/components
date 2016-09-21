// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/** @enum {string} */
remoting.Os = {
  WINDOWS: 'Windows',
  LINUX: 'Linux',
  MAC: 'Mac',
  CHROMEOS: 'ChromeOS',
  UNKNOWN: 'Unknown'
};

/**
 * @typedef {{
 *  osName: remoting.Os,
 *  osVersion: string,
 *  cpu: string,
 *  chromeVersion: string
 * }}
 */
remoting.SystemInfo;

(function() {

/**
 * Returns full Chrome version.
 * @return {string?}
 */
remoting.getChromeVersion = function() {
  return remoting.getSystemInfo().chromeVersion;
};

/**
 * Tests whether we are running on Mac.
 *
 * @return {boolean} True if the platform is Mac.
 */
remoting.platformIsMac = function() {
  return remoting.getSystemInfo().osName === remoting.Os.MAC;
};

/**
 * Tests whether we are running on Windows.
 *
 * @return {boolean} True if the platform is Windows.
 */
remoting.platformIsWindows = function() {
  return remoting.getSystemInfo().osName === remoting.Os.WINDOWS;
};

/**
 * Tests whether we are running on Linux.
 *
 * @return {boolean} True if the platform is Linux.
 */
remoting.platformIsLinux = function() {
  return remoting.getSystemInfo().osName === remoting.Os.LINUX;
};

/**
 * Tests whether we are running on ChromeOS.
 *
 * @return {boolean} True if the platform is ChromeOS.
 */
remoting.platformIsChromeOS = function() {
  return remoting.getSystemInfo().osName === remoting.Os.CHROMEOS;
};

/**
 * @return {?remoting.SystemInfo}
 */
remoting.getSystemInfo = function() {
  var userAgent = remoting.getUserAgent();

  /** @type {remoting.SystemInfo} */
  var result = {
    chromeVersion: '',
    osName: remoting.Os.UNKNOWN,
    osVersion: '',
    cpu: ''
  };

  // See platform_unittest.js for sample user agent strings.
  var chromeVersion = new RegExp('Chrome/([0-9.]*)').exec(userAgent);
  if (chromeVersion && chromeVersion.length >= 2) {
    result.chromeVersion = chromeVersion[1];
  }

  var match = new RegExp('Windows NT ([0-9\\.]*)').exec(userAgent);
  if (match && (match.length >= 2)) {
    result.osName = remoting.Os.WINDOWS;
    result.osVersion = match[1];
    return result;
  }

  match = new RegExp('Linux ([a-zA-Z0-9_]*)').exec(userAgent);
  if (match && (match.length >= 2)) {
    result.osName = remoting.Os.LINUX;
    result.osVersion = '';
    result.cpu = match[1];
    return result;
  }

  match = new RegExp('([a-zA-Z]*) Mac OS X ([0-9_]*)').exec(userAgent);
  if (match && (match.length >= 3)) {
    result.osName = remoting.Os.MAC;
    result.osVersion = match[2].replace(/_/g, '.');
    result.cpu = match[1];
    return result;
  }

  match = new RegExp('CrOS ([a-zA-Z0-9_]*) ([0-9.]*)').exec(userAgent);
  if (match && (match.length >= 3)) {
    result.osName = remoting.Os.CHROMEOS;
    result.osVersion = match[2];
    result.cpu = match[1];
    return result;
  }
  return null;
};

/**
 * To be overwritten by unit test.
 *
 * @return {!string}
 */
remoting.getUserAgent = function() {
  return navigator.userAgent;
};

})();

