// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Class to communicate with the host daemon via Native Messaging.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @constructor
 */
remoting.HostDaemonFacade = function() {
  /** @private {number} */
  this.nextId_ = 0;

  /** @private {Object<number, remoting.HostDaemonFacade.PendingReply>} */
  this.pendingReplies_ = {};

  /** @private {?Port} */
  this.port_ = null;

  /** @private {string} */
  this.version_ = '';

  /** @private {Array<remoting.HostController.Feature>} */
  this.supportedFeatures_ = [];

  /** @private {Array<function(boolean):void>} */
  this.afterInitializationTasks_ = [];

  /**
   * A promise that fulfills when the daemon finishes initializing.
   * It will be set to null when the promise fulfills.
   * @private {Promise}
   */
  this.initializingPromise_ = null;

  /** @private {!remoting.Error} */
  this.error_ = remoting.Error.none();

  /** @private */
  this.onIncomingMessageCallback_ = this.onIncomingMessage_.bind(this);

  /** @private */
  this.onDisconnectCallback_ = this.onDisconnect_.bind(this);

  /** @private */
  this.debugMessageHandler_ =
      new remoting.NativeMessageHostDebugMessageHandler();

  this.initialize_();
};

/**
 * @return {Promise} A promise that fulfills when the daemon finishes
 *     initializing
 * @private
 */
remoting.HostDaemonFacade.prototype.initialize_ = function() {
  if (!this.initializingPromise_) {
    if (this.port_) {
      return Promise.resolve();
    }

    /** @type {remoting.HostDaemonFacade} */
    var that = this;
    this.initializingPromise_ = this.connectNative_().then(function() {
      that.initializingPromise_ = null;
    }, function() {
      that.initializingPromise_ = null;
      throw new Error(that.error_);
    });
  }
  return this.initializingPromise_;
};

/**
 * Connects to the native messaging host and sends a hello message.
 *
 * @return {Promise} A promise that fulfills when the connection attempt
 *     succeeds or fails.
 * @private
 */
remoting.HostDaemonFacade.prototype.connectNative_ = function() {
  var that = this;
  try {
    this.port_ = chrome.runtime.connectNative(
        'com.google.chrome.remote_desktop');
    this.port_.onMessage.addListener(this.onIncomingMessageCallback_);
    this.port_.onDisconnect.addListener(this.onDisconnectCallback_);
    return this.postMessageInternal_({type: 'hello'}).then(function(reply) {
      that.version_ = base.getStringAttr(reply, 'version');
      // Old versions of the native messaging host do not return this list.
      // Those versions default to the empty list of supported features.
      that.supportedFeatures_ =
          base.getArrayAttr(reply, 'supportedFeatures', []);
    });
  } catch (/** @type {*} */ err) {
    console.log('Native Messaging initialization failed: ', err);
    throw remoting.Error.unexpected();
  }
};

/**
 * Type used for entries of |pendingReplies_| list.
 *
 * @param {string} type Type of the originating request.
 * @param {!base.Deferred} deferred Used to communicate returns back
 *     to the caller.
 * @constructor
 */
remoting.HostDaemonFacade.PendingReply = function(type, deferred) {
  /** @const */
  this.type = type;

  /** @const */
  this.deferred = deferred;
};

/**
 * @param {remoting.HostController.Feature} feature The feature to test for.
 * @return {!Promise<boolean>} True if the implementation supports the
 *     named feature.
 */
remoting.HostDaemonFacade.prototype.hasFeature = function(feature) {
  /** @type {remoting.HostDaemonFacade} */
  var that = this;
  return this.initialize_().then(function() {
    return that.supportedFeatures_.indexOf(feature) >= 0;
  }, function () {
    return false;
  });
};

/**
 * Initializes that the Daemon if necessary and posts the supplied message.
 *
 * @param {{type: string}} message The message to post.
 * @return {!Promise<!Object>}
 * @private
 */
remoting.HostDaemonFacade.prototype.postMessage_ =
    function(message) {
  /** @type {remoting.HostDaemonFacade} */
  var that = this;
  return this.initialize_().then(function() {
    return that.postMessageInternal_(message);
  }, function() {
    throw that.error_;
  });
};

/**
 * Attaches a new ID to the supplied message, and posts it to the
 * Native Messaging port, adding a Deferred object to the list of
 * pending replies.  |message| should have its 'type' field set, and
 * any other fields set depending on the message type.
 *
 * @param {{type: string}} message The message to post.
 * @return {!Promise<!Object>}
 * @private
 */
remoting.HostDaemonFacade.prototype.postMessageInternal_ = function(message) {
  var id = this.nextId_++;
  message['id'] = id;
  var deferred = new base.Deferred();
  this.pendingReplies_[id] = new remoting.HostDaemonFacade.PendingReply(
    message.type + 'Response', deferred);
  this.port_.postMessage(message);
  return deferred.promise();
};

/**
 * Handler for incoming Native Messages.
 *
 * @param {Object} message The received message.
 * @return {void} Nothing.
 * @private
 */
remoting.HostDaemonFacade.prototype.onIncomingMessage_ = function(message) {
  if (this.debugMessageHandler_.handleMessage(message)) {
    return;
  }

  /** @type {number} */
  var id = message['id'];
  if (typeof(id) != 'number') {
    console.error('NativeMessaging: missing or non-numeric id');
    return;
  }
  var reply = this.pendingReplies_[id];
  if (!reply) {
    console.error('NativeMessaging: unexpected id: ', id);
    return;
  }
  delete this.pendingReplies_[id];

  try {
    var type = base.getStringAttr(message, 'type');
    if (type != reply.type) {
      throw 'Expected reply type: ' + reply.type + ', got: ' + type;
    }
    reply.deferred.resolve(message);
  } catch (/** @type {*} */ e) {
    console.error('Error while processing native message', e);
    reply.deferred.reject(remoting.Error.unexpected());
  }
};

/**
 * @return {void} Nothing.
 * @private
 */
remoting.HostDaemonFacade.prototype.onDisconnect_ = function() {
  console.error('Native Message port disconnected');

  this.port_.onDisconnect.removeListener(this.onDisconnectCallback_);
  this.port_.onMessage.removeListener(this.onIncomingMessageCallback_);
  this.port_ = null;

  // If initialization hasn't finished then assume that the port was
  // disconnected because Native Messaging host is not installed.
  this.error_ = this.initializingPromise_ ?
      new remoting.Error(remoting.Error.Tag.MISSING_PLUGIN) :
      remoting.Error.unexpected();

  // Notify the error-handlers of any requests that are still outstanding.
  var pendingReplies = this.pendingReplies_;
  this.pendingReplies_ = {};
  for (var id in pendingReplies) {
    var num_id = parseInt(id, 10);
    pendingReplies[num_id].deferred.reject(this.error_);
  }
}

/**
 * Gets local hostname.
 *
 * @return {!Promise<string>}
 */
remoting.HostDaemonFacade.prototype.getHostName = function() {
  return this.postMessage_({type: 'getHostName'}).then(function(reply) {
    return base.getStringAttr(reply, 'hostname');
  });
};

/**
 * Calculates PIN hash value to be stored in the config, passing the resulting
 * hash value base64-encoded to the callback.
 *
 * @param {string} hostId The host ID.
 * @param {string} pin The PIN.
 * @return {!Promise<string>}
 */
remoting.HostDaemonFacade.prototype.getPinHash = function(hostId, pin) {
  return this.postMessage_({
      type: 'getPinHash',
      hostId: hostId,
      pin: pin
  }).then(function(reply) {
    return base.getStringAttr(reply, 'hash');
  });
};

/**
 * Generates new key pair to use for the host. The specified callback is called
 * when the key is generated. The key is returned in format understood by the
 * host (PublicKeyInfo structure encoded with ASN.1 DER, and then BASE64).
 *
 * @return {!Promise<remoting.KeyPair>}
 */
remoting.HostDaemonFacade.prototype.generateKeyPair = function() {
  return this.postMessage_({type: 'generateKeyPair'}).then(function(reply) {
    return {
      privateKey: base.getStringAttr(reply, 'privateKey'),
      publicKey: base.getStringAttr(reply, 'publicKey')
    };
  });
};

/**
 * Updates host config with the values specified in |config|. All
 * fields that are not specified in |config| remain
 * unchanged. Following parameters cannot be changed using this
 * function: host_id, xmpp_login. Error is returned if |config|
 * includes these parameters. Changes take effect before the callback
 * is called.
 *
 * TODO(jrw): Consider conversion exceptions to AsyncResult values.
 *
 * @param {Object} config The new config parameters.
 * @return {!Promise<remoting.HostController.AsyncResult>}
 */
remoting.HostDaemonFacade.prototype.updateDaemonConfig = function(config) {
  return this.postMessage_({
      type: 'updateDaemonConfig',
      config: config
  }).then(function(reply) {
    return remoting.HostController.AsyncResult.fromString(
        base.getStringAttr(reply, 'result'));
  });
};

/**
 * Loads daemon config. The config is passed as a JSON formatted string to the
 * callback.
 * @return {!Promise<Object>}
 */
remoting.HostDaemonFacade.prototype.getDaemonConfig = function() {
  return this.postMessage_({type: 'getDaemonConfig'}).then(function(reply) {
    return base.getObjectAttr(reply, 'config');
  });
};

/**
 * Retrieves daemon version. The version is returned as a dotted decimal
 * string of the form major.minor.build.patch.
 *
 * @return {!Promise<string>}
 */
remoting.HostDaemonFacade.prototype.getDaemonVersion = function() {
  /** @type {remoting.HostDaemonFacade} */
  var that = this;
  return this.initialize_().then(function() {
    return that.version_;
  }, function() {
    throw that.error_;
  });
};

/**
 * Get the user's consent to crash reporting. The consent flags are passed to
 * the callback as booleans: supported, allowed, set-by-policy.
 *
 * @return {!Promise<remoting.UsageStatsConsent>}
 */
remoting.HostDaemonFacade.prototype.getUsageStatsConsent = function() {
  return this.postMessage_({type: 'getUsageStatsConsent'}).
      then(function(reply) {
        return {
          supported: base.getBooleanAttr(reply, 'supported'),
          allowed: base.getBooleanAttr(reply, 'allowed'),
          setByPolicy: base.getBooleanAttr(reply, 'setByPolicy')
        };
      });
};

/**
 * Starts the daemon process with the specified configuration.
 *
 * TODO(jrw): Consider conversion exceptions to AsyncResult values.
 *
 * @param {Object} config Host configuration.
 * @param {boolean} consent Consent to report crash dumps.
 * @return {!Promise<remoting.HostController.AsyncResult>}
 */
remoting.HostDaemonFacade.prototype.startDaemon = function(config, consent) {
  return this.postMessage_({
      type: 'startDaemon',
      config: config,
      consent: consent
  }).then(function(reply) {
    return remoting.HostController.AsyncResult.fromString(
        base.getStringAttr(reply, 'result'));
  });
};

/**
 * Stops the daemon process.
 *
 * TODO(jrw): Consider conversion exceptions to AsyncResult values.
 *
 * @return {!Promise<remoting.HostController.AsyncResult>}
 */
remoting.HostDaemonFacade.prototype.stopDaemon =
    function() {
  return this.postMessage_({type: 'stopDaemon'}).then(function(reply) {
    return remoting.HostController.AsyncResult.fromString(
        base.getStringAttr(reply, 'result'));
  });
};

/**
 * Gets the installed/running state of the Host process.
 *
 * @return {!Promise<remoting.HostController.State>}
 */
remoting.HostDaemonFacade.prototype.getDaemonState = function() {
  return this.postMessage_({type: 'getDaemonState'}).then(function(reply) {
    return remoting.HostController.State.fromString(
        base.getStringAttr(reply, 'state'));
 });
};

/**
 * Retrieves the list of paired clients.
 *
 * @return {!Promise<Array<remoting.PairedClient>>}
 */
remoting.HostDaemonFacade.prototype.getPairedClients = function() {
  return this.postMessage_({type: 'getPairedClients'}).then(function(reply) {
    var pairedClients =remoting.PairedClient.convertToPairedClientArray(
        reply['pairedClients']);
    if (pairedClients != null) {
      return pairedClients;
    } else {
      throw remoting.Error.unexpected('No paired clients!');
    }
  });
};

/**
 * Clears all paired clients from the registry.
 *
 * @return {!Promise<boolean>}
 */
remoting.HostDaemonFacade.prototype.clearPairedClients = function() {
  return this.postMessage_({type: 'clearPairedClients'}).then(function(reply) {
    return base.getBooleanAttr(reply, 'result');
  });
};

/**
 * Deletes a paired client referenced by client id.
 *
 * @param {string} client Client to delete.
 * @return {!Promise<boolean>}
 */
remoting.HostDaemonFacade.prototype.deletePairedClient = function(client) {
  return this.postMessage_({
    type: 'deletePairedClient',
    clientId: client
  }).then(function(reply) {
    return base.getBooleanAttr(reply, 'result');
  });
};

/**
 * Gets the API keys to obtain/use service account credentials.
 *
 * @return {!Promise<string>}
 */
remoting.HostDaemonFacade.prototype.getHostClientId = function() {
  return this.postMessage_({type: 'getHostClientId'}).then(function(reply) {
    return base.getStringAttr(reply, 'clientId');
  });
};

/**
 * @param {string} authorizationCode OAuth authorization code.
 * @return {!Promise<{remoting.XmppCredentials}>}
 */
remoting.HostDaemonFacade.prototype.getCredentialsFromAuthCode =
    function(authorizationCode) {
  return this.postMessage_({
    type: 'getCredentialsFromAuthCode',
    authorizationCode: authorizationCode
  }).then(function(reply) {
    var userEmail = base.getStringAttr(reply, 'userEmail');
    var refreshToken = base.getStringAttr(reply, 'refreshToken');
    if (userEmail && refreshToken) {
      return {
        userEmail: userEmail,
        refreshToken: refreshToken
      };
    } else {
      throw remoting.Error.unexpected('Missing userEmail or refreshToken');
    }
  });
};

/**
 * @param {string} authorizationCode OAuth authorization code.
 * @return {!Promise<string>}
 */
remoting.HostDaemonFacade.prototype.getRefreshTokenFromAuthCode =
    function(authorizationCode) {
  return this.postMessage_({
    type: 'getRefreshTokenFromAuthCode',
    authorizationCode: authorizationCode
  }).then(function(reply) {
    var refreshToken = base.getStringAttr(reply, 'refreshToken');
    if (refreshToken) {
      return refreshToken
    } else {
      throw remoting.Error.unexpected('Missing refreshToken');
    }
  });
};
