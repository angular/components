// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 *
 * HostInstaller allows the caller to download the host binary and monitor the
 * install progress of the host by pinging the host periodically via native
 * messaging.
 *
 * To download the host and wait for install:
 *   var hostInstaller = new remoting.HostInstaller();
 *   hostInstaller.downloadAndWaitForInstall().then(function() {
 *      // Install has completed.
 *   }, function(){
 *      // Download has failed.
 *   })
 *
 * To stop listening to the install progress:
 *   hostInstaller.cancel();
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

/**
 * @constructor
 */
remoting.HostInstaller = function() {
  /** @private {Promise} */
  this.downloadAndWaitForInstallPromise_ = null;

  /** @private {?number} */
  this.checkInstallIntervalId_ = null;
};

/**
 * @return {Promise}  The promise will resolve to a boolean value indicating
 *     whether the host is installed or not.
 */
remoting.HostInstaller.isInstalled = function() {
  // Always do a fresh check as we don't get notified when the host is
  // uninstalled.

  return new Promise(
      /** @param {function(*=):void} resolve */
      function(resolve) {
        // TODO(kelvinp): Use different native messaging ports for the Me2me
        // host vs It2MeHost.
        /** @type {Port} */
        var port =
            chrome.runtime.connectNative('com.google.chrome.remote_assistance');

        function onMessage() {
          port.onDisconnect.removeListener(onDisconnected);
          port.onMessage.removeListener(onMessage);
          port.disconnect();
          resolve(true);
        }

        function onDisconnected() {
          port.onDisconnect.removeListener(onDisconnected);
          port.onMessage.removeListener(onMessage);
          resolve(false);
        }

        port.onDisconnect.addListener(onDisconnected);
        port.onMessage.addListener(onMessage);
        port.postMessage({type: 'hello'});
      });
};

/** @type {Object<string>} */
var HOST_DOWNLOAD_URLS = {
  'Win32': 'http://dl.google.com/dl/edgedl/chrome-remote-desktop/' +
               'chromeremotedesktophost.msi',
  'Win64': 'http://dl.google.com/dl/edgedl/chrome-remote-desktop/' +
               'chromeremotedesktophost.msi',
  'MacIntel': 'https://dl.google.com/chrome-remote-desktop/' +
                  'chromeremotedesktop.dmg',
  'Linux x86_64': 'https://dl.google.com/linux/direct/' +
                      'chrome-remote-desktop_current_amd64.deb',
  'Linux i386': 'https://dl.google.com/linux/direct/' +
                    'chrome-remote-desktop_current_i386.deb',
  'Linux i686': 'https://dl.google.com/linux/direct/' +
                    'chrome-remote-desktop_current_i386.deb'
};

/**
 * Returns true if the host is installable on the current platform.
 * @returns {boolean}
 */
remoting.HostInstaller.canInstall = function() {
  return !!HOST_DOWNLOAD_URLS[navigator.platform];
};

/**
 * @throws {Error}  Throws if there is no matching host binary for the current
 *     platform.
 */
remoting.HostInstaller.prototype.download = function() {
  var hostPackageUrl = HOST_DOWNLOAD_URLS[navigator.platform];
  if (hostPackageUrl === undefined) {
    console.error("Tried to install host on " + navigator.platform);
    throw new Error(remoting.Error.unexpected());
  }

  // Start downloading the package.
  if (base.isAppsV2()) {
    // TODO(jamiewalch): Use chrome.downloads when it is available to
    // apps v2 (http://crbug.com/174046)
    window.open(hostPackageUrl);
  } else {
    window.location = hostPackageUrl;
  }
};

/** @return {Promise} */
remoting.HostInstaller.prototype.downloadAndWaitForInstall = function() {
  /** @type {remoting.HostInstaller} */
  var that = this;
  /**
   * @type {number}
   * @const
   */
  var CHECK_INSTALL_INTERVAL_IN_MILLISECONDS = 1000;

  return remoting.HostInstaller.isInstalled().then(
      /** @param {boolean} installed */
      function(installed){
        if (installed) {
          return Promise.resolve(true);
        }

        if (that.downloadAndWaitForInstallPromise_ === null) {
          that.downloadAndWaitForInstallPromise_ = new Promise(
              /** @param {Function} resolve */
              function(resolve){
                that.download();
                that.checkInstallIntervalId_ = window.setInterval(function() {
                  remoting.HostInstaller.isInstalled().then(
                      /** @param {boolean} installed */
                      function(installed) {
                        if (installed) {
                          that.cancel();
                          resolve();
                        }
                      });
                }, CHECK_INSTALL_INTERVAL_IN_MILLISECONDS);
              });
        }
        return that.downloadAndWaitForInstallPromise_;
      });
};

/**
 * Stops waiting for the host to be installed.
 * For example
 *   var promise = hostInstaller.downloadAndWaitForInstall();
 *   hostInstaller.cancel(); // This will prevent |promise| from fulfilling.
 */
remoting.HostInstaller.prototype.cancel = function() {
  if (this.checkInstallIntervalId_ !== null) {
    window.clearInterval(this.checkInstallIntervalId_);
    this.checkInstallIntervalId_ = null;
  }
  this.downloadAndWaitForInstallPromise_ = null;
};

})();
