// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/**
 * @param {Element} container parent element for the plugin to be created.
 * @param {Array<string>} capabilities capabilities required by this
 *     application.
 * @constructor
 */
remoting.ClientSessionFactory = function(container, capabilities) {
  /** @private */
  this.container_ = /** @type {HTMLElement} */ (container);

  /** @private {Array<string>} */
  this.requiredCapabilities_ = [
    remoting.ClientSession.Capability.SEND_INITIAL_RESOLUTION,
    remoting.ClientSession.Capability.RATE_LIMIT_RESIZE_REQUESTS,
    remoting.ClientSession.Capability.TOUCH_EVENTS
  ];

  // Append the app-specific capabilities.
  this.requiredCapabilities_.push.apply(this.requiredCapabilities_,
                                        capabilities);
};

/**
 * Creates a session.
 *
 * @param {remoting.ClientSession.EventHandler} listener
 * @param {remoting.SessionLogger} logger
 * @return {Promise<!remoting.ClientSession>} Resolves with the client session
 *     if succeeded or rejects with remoting.Error on failure.
 */
remoting.ClientSessionFactory.prototype.createSession =
    function(listener, logger) {
  var that = this;
  /** @type {string} */
  var token;
  /** @type {remoting.SignalStrategy} */
  var signalStrategy;
  /** @type {remoting.ClientPlugin} */
  var clientPlugin;

  function OnError(/** !remoting.Error */ error) {
    logger.logSessionStateChange(
        remoting.ChromotingEvent.SessionState.CONNECTION_FAILED, error);
    base.dispose(signalStrategy);
    base.dispose(clientPlugin);
    throw error;
  }

  var promise = remoting.identity.getToken().then(
    function(/** string */ authToken) {
    token = authToken;
    return remoting.identity.getUserInfo();
  }).then(function(/** {email: string, name: string} */ userInfo) {
    logger.logSessionStateChange(
        remoting.ChromotingEvent.SessionState.SIGNALING);
    return connectSignaling(userInfo.email, token);
  }).then(function(/** remoting.SignalStrategy */ strategy) {
    signalStrategy = strategy;
    logger.logSessionStateChange(
        remoting.ChromotingEvent.SessionState.CREATING_PLUGIN);
    return createPlugin(that.container_, that.requiredCapabilities_);
  }).then(function(/** remoting.ClientPlugin */ plugin) {
    clientPlugin = plugin;
    return new remoting.ClientSession(plugin, signalStrategy, logger, listener);
  }).catch(
    remoting.Error.handler(OnError)
  );

  return /** @type {Promise<!remoting.ClientSession>} */ (promise);
};

/**
 * @param {string} email
 * @param {string} token
 * @return {Promise<!remoting.SignalStrategy>}
 */
function connectSignaling(email, token) {
  var signalStrategy = remoting.SignalStrategy.create();
  var deferred = new base.Deferred();
  function onSignalingState(/** remoting.SignalStrategy.State */ state) {
    switch (state) {
      case remoting.SignalStrategy.State.CONNECTED:
        deferred.resolve(signalStrategy);
        break;

      case remoting.SignalStrategy.State.FAILED:
        var error = signalStrategy.getError();
        signalStrategy.dispose();
        deferred.reject(error);
        break;
    }
  }
  signalStrategy.setStateChangedCallback(onSignalingState);
  signalStrategy.connect(remoting.settings.XMPP_SERVER, email, token);
  return deferred.promise();
}

/**
 * Creates the plugin.
 * @param {HTMLElement} container parent element for the plugin.
 * @param {Array<string>} capabilities capabilities required by this
 *     application.
 * @return {Promise<!remoting.ClientPlugin>}
 */
function createPlugin(container, capabilities) {
  var plugin = remoting.ClientPlugin.factory.createPlugin(
      container, capabilities);
  return plugin.initialize().then(function() {
    return plugin;
  });
}

})();
