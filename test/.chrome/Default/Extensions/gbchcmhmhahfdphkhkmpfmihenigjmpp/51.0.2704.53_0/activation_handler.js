// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/** @suppress {duplicate} */
var remoting = remoting || {};

(function(){

'use strict';

/** @type {string} */
var NEW_WINDOW_MENU_ID_ = 'new-window';

/**
 * A class that handles application activation.
 *
 * @param {base.Ipc} ipc
 * @param {remoting.V2AppLauncher} appLauncher
 * @param {remoting.TelemetryEventWriter.Service} telemetryService
 * @extends {base.EventSourceImpl}
 * @implements {base.Disposable}
 * @constructor
 */
remoting.ActivationHandler = function (ipc, appLauncher, telemetryService) {
  base.inherits(this, base.EventSourceImpl);
  this.defineEvents(base.values(remoting.ActivationHandler.Events));

  /** @private */
  this.ipc_ = ipc;

  /** @private {remoting.V2AppLauncher} */
  this.appLauncher_ = appLauncher;

  /** @private {Map<string, base.Disposable>} */
  this.windowClosedHooks_ = new Map();

  /** @private */
  this.telemetryService_ = telemetryService;

  chrome.contextMenus.create({
     id: NEW_WINDOW_MENU_ID_,
     contexts: ['launcher'],
     title: chrome.i18n.getMessage(/*i18n-content*/'NEW_WINDOW')
  });

  this.disposables_ = new base.Disposables(
      new base.ChromeEventHook(chrome.contextMenus.onClicked,
                               this.onContextMenu_.bind(this)),
      new base.ChromeEventHook(chrome.app.runtime.onLaunched,
                               this.onLaunched_.bind(this)));
  ipc.register(remoting.ActivationHandler.Ipc.RESTART,
               this.onRestart_.bind(this));
  ipc.register(remoting.ActivationHandler.Ipc.LAUNCH,
               this.onLaunched_.bind(this));

};

remoting.ActivationHandler.prototype.dispose = function() {
  this.windowClosedHooks_.forEach(function(/** base.Disposable */ eventHook) {
    base.dispose(eventHook);
  });
  this.windowClosedHooks_.clear();

  base.dispose(this.disposables_);
  this.disposables_ = null;
  this.ipc_.unregister(remoting.ActivationHandler.Ipc.LAUNCH);
  this.ipc_.unregister(remoting.ActivationHandler.Ipc.RESTART);
};

/** @enum {string} */
remoting.ActivationHandler.Ipc = {
  LAUNCH: 'remoting.ActivationHandler.launch',
  RESTART: 'remoting.ActivationHandler.restart'
};

/**
 * @param {OnClickData} info
 * @private
 */
remoting.ActivationHandler.prototype.onContextMenu_ = function(info) {
  if (info.menuItemId == NEW_WINDOW_MENU_ID_) {
    this.launchDefaultSession_();
  }
};

/**
 * Restart the window with |id|.
 * @param {string} id
 *
 * @private
 */
remoting.ActivationHandler.prototype.onRestart_ = function(id) {
  this.appLauncher_.restart(id).then(this.onWindowCreated_.bind(this));
};

/**
 * @param {Object?} launchData  |launchData| is null when this function
 *     is invoked from an IPC.
 *
 * @private
 */
remoting.ActivationHandler.prototype.onLaunched_ = function(launchData) {
  if (Boolean(launchData) && Boolean(launchData['isPublicSession'])) {
    this.launchIt2MeSession_();
  } else {
    this.launchDefaultSession_();
  }
};

/**
 * Create a new app window and register for the closed event.
 *
 * @private
 */
remoting.ActivationHandler.prototype.launchDefaultSession_ = function() {
  this.appLauncher_.launch().then(this.onWindowCreated_.bind(this));
};

/**
 * @param {string} windowId
 *
 * @private
 */
remoting.ActivationHandler.prototype.onWindowCreated_ = function(
    windowId) {
  // Send the client heartbeat.
  var event =
      new remoting.ChromotingEvent(remoting.ChromotingEvent.Type.HEARTBEAT);
  event.role = remoting.ChromotingEvent.Role.CLIENT;
  this.telemetryService_.write(''/* No window Id for background page */, event);

  // Register close handler.
  var appWindow = chrome.app.window.get(windowId);
  console.assert(!this.windowClosedHooks_.has(windowId),
                'Duplicate close listener attached to window : ' + windowId);
  this.windowClosedHooks_.set(windowId, new base.ChromeEventHook(
      appWindow.onClosed, this.onWindowClosed_.bind(this, windowId)));
};

/**
 * @param {string} id The id of the window that is closed.
 * @private
 */
remoting.ActivationHandler.prototype.onWindowClosed_ = function(id) {
  // Unhook the event.
  var hook = /** @type {base.Disposable} */ (this.windowClosedHooks_.get(id));
  base.dispose(hook);
  this.windowClosedHooks_.delete(id);

  this.raiseEvent(remoting.ActivationHandler.Events.windowClosed, id);
};

/** @private */
remoting.ActivationHandler.prototype.launchIt2MeSession_ = function() {
  chrome.app.window.create("public_session.html", {
    'width': 570,
    'height': 300,
    'resizable': false
  });
};

})();

/** @enum {string} */
remoting.ActivationHandler.Events = {
  windowClosed: 'windowClosed'
};
