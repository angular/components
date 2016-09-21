// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * AppLauncher is an interface that allows the client code to launch and close
 * the app without knowing the implementation difference between a v1 app and
 * a v2 app.
 *
 * To launch an app:
 *   var appLauncher = new remoting.V1AppLauncher();
 *   var appId = "";
 *   appLauncher.launch({arg1:'someValue'}).then(function(id){
 *    appId = id;
 *   });
 *
 * To close an app:
 *   appLauncher.close(appId);
 */

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/** @interface */
remoting.AppLauncher = function() {};

/**
 * @param {Object=} opt_launchArgs
 * @return {Promise} The promise will resolve when the app is launched.  It will
 * provide the caller with the appId (which is either the id of the hosting tab
 * or window). The caller can use the appId to close the app.
 */
remoting.AppLauncher.prototype.launch = function(opt_launchArgs) { };

/**
 * @param {string} id  The id of the app to close.
 * @return {Promise} The promise will resolve when the app is closed.
 */
remoting.AppLauncher.prototype.close = function(id) {};

/**
 * @constructor
 * @implements {remoting.AppLauncher}
 */
remoting.V1AppLauncher = function() {};

remoting.V1AppLauncher.prototype.launch = function(opt_launchArgs) {
  var url = base.urlJoin('main.html', opt_launchArgs);

  return new Promise(function(resolve, reject) {
    chrome.tabs.create({ url: url, selected: true }, function(/**Tab*/ tab){
      if (!tab) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(String(tab.id));
      }
    });
  });
};

remoting.V1AppLauncher.prototype.close = function(id) {
  return new Promise(function(resolve, reject) {
    chrome.tabs.get(parseInt(id, 10), function(/** Tab */ tab) {
      if (!tab) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        chrome.tabs.remove(tab.id, resolve);
      }
    });
  });
};


/**
 * @constructor
 * @implements {remoting.AppLauncher}
 */
remoting.V2AppLauncher = function() {};

var APP_MAIN_URL = 'main.html';

/**
 * @param {string} id
 * @return {Promise<string>}  A promise that resolves with the id of the created
 *     window, which is guaranteed to be the same as the current window id.
 */
remoting.V2AppLauncher.prototype.restart = function(id) {
  return this.close(id).then(function() {
    return createWindow_({'id' : id, 'frame': 'none'});
  }).then(function (/** string */ newId) {
    console.assert(newId === id, 'restart() should preserve the window id.');
    return newId;
  });
};

/**
 * @param {!chrome.app.window.CreateWindowOptions=} opt_options
 * @param {Object=} opt_launchArgs
 * @return {Promise<string>} A promise that resolves with the id of the created
 *     window.
 */
function createWindow_(opt_options, opt_launchArgs) {
  var url = base.urlJoin(APP_MAIN_URL, opt_launchArgs);
  var deferred = new base.Deferred();

  chrome.app.window.create(url, opt_options,
    function(/** chrome.app.window.AppWindow= */ appWindow) {
      if (!appWindow) {
        deferred.reject(new Error(chrome.runtime.lastError.message));
      } else {
        deferred.resolve(appWindow.id);
      }
    });
  return deferred.promise();
}

remoting.V2AppLauncher.prototype.launch = function(opt_launchArgs) {
  var deferred = new base.Deferred();
  var START_FULLSCREEN = 'start-fullscreen';

  /** @param {Object} values */
  var onValues = function(values) {
    /** @type {string} */
    var state = values[START_FULLSCREEN] ? 'fullscreen' : 'normal';
    createWindow_({
        'width': 800,
        'height': 634,
        'frame': 'none',
        'id': String(getNextWindowId()),
        'state': state
    }, opt_launchArgs).then(
      deferred.resolve.bind(deferred),
      deferred.reject.bind(deferred)
    );
  };
  chrome.storage.local.get(START_FULLSCREEN, onValues);
  return deferred.promise();
};

remoting.V2AppLauncher.prototype.close = function(id) {
  return new Promise(
      /**
       * @param {function(*=):void} resolve
       * @param {function(*=):void} reject
       */
      function(resolve, reject) {
        var appWindow = chrome.app.window.get(id);
        if (!appWindow) {
          return Promise.reject(new Error(chrome.runtime.lastError.message));
        }
        appWindow.onClosed.addListener(resolve);
        appWindow.close();
      });
};

/**
 * @return {number} The first available window id. Since Chrome remembers
 *     properties such as size and position for app windows, it is better
 *     to reuse window ids rather than allocating new ones.
 */
function getNextWindowId() {
  var appWindows = chrome.app.window.getAll();
  var result = 1;
  for (; result <= appWindows.length; ++result) {
    if (!chrome.app.window.get(String(result))) {
      break;
    }
  }
  return result;
}

})();
