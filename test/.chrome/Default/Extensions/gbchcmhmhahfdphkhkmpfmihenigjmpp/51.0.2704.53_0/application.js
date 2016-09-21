// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Interface abstracting the Application functionality.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @type {base.EventSourceImpl} An event source object for handling global
 *    events. This is an interim hack.  Eventually, we should move
 *    functionalities away from the remoting namespace and into smaller objects.
 */
remoting.testEvents;

/**
 * @constructor
 * @implements {base.Disposable}
 */
remoting.Application = function() {
  // Create global factories.
  remoting.ClientPlugin.factory = new remoting.DefaultClientPluginFactory();

  /** @protected {base.WindowMessageDispatcher} */
  this.windowMessageDispatcher_ = new base.WindowMessageDispatcher();
};

remoting.Application.prototype.dispose = function() {
  base.dispose(this.windowMessageDispatcher_);
  this.windowMessageDispatcher_ = null;
};

/* Public method to exit the application. */
remoting.Application.prototype.quit = function() {
  this.exitApplication_();
};

/**
 * Close the main window when quitting the application. This should be called
 * by exitApplication() in the subclass.
 * @protected
 */
remoting.Application.prototype.closeMainWindow_ = function() {
  chrome.app.window.current().close();
};

/**
 * Initialize the application and register all event handlers. After this
 * is called, the app is running and waiting for user events.
 */
remoting.Application.prototype.start = function() {
  // TODO(garykac): This should be owned properly rather than living in the
  // global 'remoting' namespace.
  remoting.settings = new remoting.Settings();

  this.initGlobalObjects_();
  remoting.initIdentity();

  this.initApplication_();

  var that = this;
  remoting.identity.getToken().then(
    this.startApplication_.bind(this)
  ).catch(function(/** !remoting.Error */ error) {
    if (error.hasTag(remoting.Error.Tag.CANCELLED)) {
      that.exitApplication_();
    } else {
      that.signInFailed_(error);
    }
  });
};

/** @private */
remoting.Application.prototype.initGlobalObjects_ = function() {
  if (base.isAppsV2()) {
    var htmlNode = /** @type {HTMLElement} */ (document.body.parentNode);
    htmlNode.classList.add('apps-v2');
  }

  console.log(this.getExtensionInfo());
  l10n.localize();

  var sandbox =
      /** @type {HTMLIFrameElement} */ (document.getElementById('wcs-sandbox'));
  remoting.wcsSandbox = new remoting.WcsSandboxContainer(
      sandbox.contentWindow, this.windowMessageDispatcher_);
  remoting.initModalDialogs();
};

/**
 * @return {string} Information about the current extension.
 */
remoting.Application.prototype.getExtensionInfo = function() {
  var v2OrLegacy = base.isAppsV2() ? " (v2)" : " (legacy)";
  var manifest = chrome.runtime.getManifest();
  if (manifest && manifest.version) {
    var name = this.getApplicationName();
    return name + ' version: ' + manifest.version + v2OrLegacy;
  } else {
    return 'Failed to get product version. Corrupt manifest?';
  }
};

/**
 * These functions must be overridden in the subclass.
 */

/**
 * @return {string}
 * @suppress {missingReturn}
 */
remoting.Application.prototype.getApplicationId = function() {
  console.assert(false, 'Subclass must override');
};

/**
 * @return {string}
 * @suppress {missingReturn}
 */
remoting.Application.prototype.getApplicationName = function() {
  console.assert(false, 'Subclass must override getApplicationName().');
};

/**
 * @return {remoting.Activity}  The Current activity.
 * @suppress {missingReturn}
 */
remoting.Application.prototype.getActivity = function() {
  console.assert(false, 'Subclass must override getActivity().');
};

/**
 * @param {!remoting.Error} error
 * @protected
 */
remoting.Application.prototype.signInFailed_ = function(error) {
  console.assert(false, 'Subclass must override signInFailed().');
};

/** @protected */
remoting.Application.prototype.initApplication_ = function() {
  console.assert(false, 'Subclass must override initApplication().');
};

/**
 * @param {string} token
 * @protected
 */
remoting.Application.prototype.startApplication_ = function(token) {
  console.assert(false, 'Subclass must override startApplication().');
};

/** @protected */
remoting.Application.prototype.exitApplication_ = function() {
  console.assert(false, 'Subclass must override exitApplication().');
};

/**
 * The interface specifies the methods that a subclass of remoting.Application
 * is required implement to override the default behavior.
 *
 * @interface
 */
remoting.ApplicationInterface = function() {};

/**
 * @return {string} Application Id.
 */
remoting.ApplicationInterface.prototype.getApplicationId = function() {};

/**
 * @return {string} Application product name to be used in UI.
 */
remoting.ApplicationInterface.prototype.getApplicationName = function() {};

/**
 * Report an authentication error to the user. This is called in lieu of
 * startApplication() if the user cannot be authenticated or if they decline
 * the app permissions.
 *
 * @param {!remoting.Error} error The failure reason.
 */
remoting.ApplicationInterface.prototype.signInFailed_ = function(error) {};

/**
 * Initialize the application. This is called before an OAuth token is requested
 * and should be used for tasks such as initializing the DOM, registering event
 * handlers, etc. After this is called, the app is running and waiting for
 * user events.
 */
remoting.ApplicationInterface.prototype.initApplication_ = function() {};

/**
 * Start the application. Once startApplication() is called, we can assume that
 * the user has consented to all permissions specified in the manifest.
 *
 * @param {string} token An OAuth access token. The app should not cache
 *     this token, but can assume that it will remain valid during application
 *     start-up.
 */
remoting.ApplicationInterface.prototype.startApplication_ = function(token) {};

/**
 * Close down the application before exiting.
 */
remoting.ApplicationInterface.prototype.exitApplication_ = function() {};

/** @type {remoting.Application} */
remoting.app = null;
