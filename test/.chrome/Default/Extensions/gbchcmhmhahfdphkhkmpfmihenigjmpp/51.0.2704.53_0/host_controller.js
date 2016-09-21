// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/** @constructor */
remoting.HostController = function() {
  /** @type {remoting.HostDaemonFacade} @private */
  this.hostDaemonFacade_ = new remoting.HostDaemonFacade();

  /** @param {string} version */
  var printVersion = function(version) {
    if (version == '') {
      console.log('Host not installed.');
    } else {
      console.log('Host version: ' + version);
    }
  };

  this.getLocalHostVersion()
      .then(printVersion)
      .catch(function() {
        console.log('Host version not available.');
      });
};

// The values in the enums below are duplicated in daemon_controller.h except
// for NOT_INSTALLED.
/** @enum {number} */
remoting.HostController.State = {
  NOT_IMPLEMENTED: 0,
  NOT_INSTALLED: 1,
  STOPPED: 2,
  STARTING: 3,
  STARTED: 4,
  STOPPING: 5,
  UNKNOWN: 6
};

/**
 * @param {string} state The host controller state name.
 * @return {remoting.HostController.State} The state enum value.
 */
remoting.HostController.State.fromString = function(state) {
  if (!remoting.HostController.State.hasOwnProperty(state)) {
    throw "Invalid HostController.State: " + state;
  }
  return remoting.HostController.State[state];
}

/** @enum {number} */
remoting.HostController.AsyncResult = {
  OK: 0,
  FAILED: 1,
  CANCELLED: 2
};

/**
 * @param {string} result The async result name.
 * @return {remoting.HostController.AsyncResult} The result enum value.
 */
remoting.HostController.AsyncResult.fromString = function(result) {
  if (!remoting.HostController.AsyncResult.hasOwnProperty(result)) {
    throw "Invalid HostController.AsyncResult: " + result;
  }
  return remoting.HostController.AsyncResult[result];
}

/**
 * Set of features for which hasFeature() can be used to test.
 *
 * @enum {string}
 */
remoting.HostController.Feature = {
  PAIRING_REGISTRY: 'pairingRegistry',
  OAUTH_CLIENT: 'oauthClient'
};

/**
 * Information relating to user consent to collect usage stats.  The
 * fields are:
 *
 *   supported: True if crash dump reporting is supported by the host.
 *
 *   allowed: True if crash dump reporting is allowed.
 *
 *   setByPolicy: True if crash dump reporting is controlled by policy.
 *
 * @typedef {{
 *   supported:boolean,
 *   allowed:boolean,
 *   setByPolicy:boolean
 * }}
 */
remoting.UsageStatsConsent;

/**
 * @typedef {{
 *   userEmail:string,
 *   refreshToken:string
 * }}
 */
remoting.XmppCredentials;

/**
 * @typedef {{
 *   privateKey:string,
 *   publicKey:string
 * }}
 */
remoting.KeyPair;

/**
 * @param {remoting.HostController.Feature} feature The feature to test for.
 * @return {!Promise<boolean>} A promise that always resolves.
 */
remoting.HostController.prototype.hasFeature = function(feature) {
  // TODO(rmsousa): This could synchronously return a boolean, provided it were
  // only called after native messaging is completely initialized.
  return this.hostDaemonFacade_.hasFeature(feature);
};

/**
 * @return {!Promise<remoting.UsageStatsConsent>}
 */
remoting.HostController.prototype.getConsent = function() {
  return this.hostDaemonFacade_.getUsageStatsConsent();
};

/**
 * Registers and starts the host.
 *
 * @param {string} hostPin Host PIN.
 * @param {boolean} consent The user's consent to crash dump reporting.
 * @return {!Promise<void>} A promise resolved once the host is started.
 */
remoting.HostController.prototype.start = function(hostPin, consent) {
  /** @type {remoting.HostController} */
  var that = this;

  // Start a bunch of requests with no side-effects.
  var hostNamePromise = this.hostDaemonFacade_.getHostName();
  var hasOauthPromise =
      this.hasFeature(remoting.HostController.Feature.OAUTH_CLIENT);
  var keyPairPromise = this.hostDaemonFacade_.generateKeyPair();
  var hostClientIdPromise = hasOauthPromise.then(function(hasOauth) {
    if (hasOauth) {
      return that.hostDaemonFacade_.getHostClientId();
    } else {
      return null;
    }
  });
  var hostOwnerPromise = this.getClientBaseJid_();

  // Register the host and extract an auth code from the host response
  // and, optionally an email address for the robot account.
  /** @type {!Promise<remoting.HostListApi.RegisterResult>} */
  var registerResultPromise = Promise.all([
    hostClientIdPromise,
    hostNamePromise,
    keyPairPromise
  ]).then(function(/** Array */ a) {
    var hostClientId = /** @type {string} */ (a[0]);
    var hostName = /** @type {string} */ (a[1]);
    var keyPair = /** @type {remoting.KeyPair} */ (a[2]);

    return remoting.HostListApi.getInstance().register(
        hostName, keyPair.publicKey, hostClientId);
  });

  // For convenience, make the host ID available as a separate promise.
  /** @type {!Promise<string>} */
  var hostIdPromise = registerResultPromise.then(function(registerResult) {
    return registerResult.hostId;
  });

  // Get the PIN hash based on the host ID.
  /** @type {!Promise<string>} */
  var pinHashPromise = hostIdPromise.then(function(hostId) {
    return that.hostDaemonFacade_.getPinHash(hostId, hostPin);
  });

  // Get XMPP creditials.
  var xmppCredsPromise = registerResultPromise.then(function(registerResult) {
    console.assert(registerResult.authCode != '', '|authCode| is empty.');
    if (registerResult.email) {
      // Use auth code and email supplied by GCD.
      return that.hostDaemonFacade_.getRefreshTokenFromAuthCode(
          registerResult.authCode).then(function(token) {
            return {
              userEmail: registerResult.email,
              refreshToken: token
            };
          });
    } else {
      // Use auth code supplied by Chromoting registry.
      return that.hostDaemonFacade_.getCredentialsFromAuthCode(
          registerResult.authCode);
    }
  });

  // Build the host configuration.
  /** @type {!Promise<!Object>} */
  var hostConfigPromise = Promise.all([
    hostNamePromise,
    pinHashPromise,
    xmppCredsPromise,
    keyPairPromise,
    hostOwnerPromise,
    remoting.identity.getEmail(),
    registerResultPromise
  ]).then(function(/** Array */ a) {
    var hostName = /** @type {string} */ (a[0]);
    var hostSecretHash = /** @type {string} */ (a[1]);
    var xmppCreds = /** @type {remoting.XmppCredentials} */ (a[2]);
    var keyPair = /** @type {remoting.KeyPair} */ (a[3]);
    var hostOwner = /** @type {string} */ (a[4]);
    var hostOwnerEmail = /** @type {string} */ (a[5]);
    var registerResult =
        /** @type {remoting.HostListApi.RegisterResult} */ (a[6]);
    var hostConfig = {
      xmpp_login: xmppCreds.userEmail,
      oauth_refresh_token: xmppCreds.refreshToken,
      host_name: hostName,
      host_secret_hash: hostSecretHash,
      private_key: keyPair.privateKey,
      host_owner: hostOwner
    };
    if (hostOwnerEmail != hostOwner) {
      hostConfig['host_owner_email'] = hostOwnerEmail;
    }
    hostConfig['host_id'] = registerResult.hostId;
    return hostConfig;
  });

  // Start the daemon.
  /** @type {!Promise<remoting.HostController.AsyncResult>} */
  var startDaemonResultPromise =
      hostConfigPromise.then(function(hostConfig) {
        return that.hostDaemonFacade_.startDaemon(hostConfig, consent);
      });

  // Update the UI or report an error.
  return hostIdPromise.then(function(hostId) {
    return startDaemonResultPromise.then(function(result) {
      if (result == remoting.HostController.AsyncResult.OK) {
        return hostNamePromise.then(function(hostName) {
          return keyPairPromise.then(function(keyPair) {
            remoting.hostList.onLocalHostStarted(
                hostName, hostId, keyPair.publicKey);
          });
        });
      } else if (result == remoting.HostController.AsyncResult.CANCELLED) {
        throw new remoting.Error(remoting.Error.Tag.CANCELLED);
      } else {
        throw remoting.Error.unexpected();
      }
    }).catch(function(error) {
      remoting.hostList.unregisterHostById(hostId);
      throw error;
    });
  });
};

/**
 * Stop the daemon process.
 * @param {function():void} onDone Callback to be called when done.
 * @param {function(!remoting.Error):void} onError Callback to be called on
 *     error.
 * @return {void} Nothing.
 */
remoting.HostController.prototype.stop = function(onDone, onError) {
  /** @type {remoting.HostController} */
  var that = this;

  /** @param {string?} hostId The host id of the local host. */
  function unregisterHost(hostId) {
    if (hostId) {
      remoting.hostList.unregisterHostById(hostId, onDone);
      return;
    }
    onDone();
  }

  /** @param {remoting.HostController.AsyncResult} result */
  function onStopped(result) {
    if (result == remoting.HostController.AsyncResult.OK) {
      that.getLocalHostId(unregisterHost);
    } else if (result == remoting.HostController.AsyncResult.CANCELLED) {
      onError(new remoting.Error(remoting.Error.Tag.CANCELLED));
    } else {
      onError(remoting.Error.unexpected());
    }
  }

  this.hostDaemonFacade_.stopDaemon().then(
      onStopped, remoting.Error.handler(onError));
};

/**
 * Check the host configuration is valid (non-null, and contains both host_id
 * and xmpp_login keys).
 * @param {Object} config The host configuration.
 * @return {boolean} True if it is valid.
 */
function isHostConfigValid_(config) {
  return !!config && typeof config['host_id'] == 'string' &&
      typeof config['xmpp_login'] == 'string';
}

/**
 * @param {string} newPin The new PIN to set
 * @param {function():void} onDone Callback to be called when done.
 * @param {function(!remoting.Error):void} onError Callback to be called on
 *     error.
 * @return {void} Nothing.
 */
remoting.HostController.prototype.updatePin = function(newPin, onDone,
                                                       onError) {
  /** @type {remoting.HostController} */
  var that = this;

  /** @param {remoting.HostController.AsyncResult} result */
  function onConfigUpdated(result) {
    if (result == remoting.HostController.AsyncResult.OK) {
      that.clearPairedClients(onDone, onError);
    } else if (result == remoting.HostController.AsyncResult.CANCELLED) {
      onError(new remoting.Error(remoting.Error.Tag.CANCELLED));
    } else {
      onError(remoting.Error.unexpected());
    }
  }

  /** @param {string} pinHash */
  function updateDaemonConfigWithHash(pinHash) {
    var newConfig = {
      host_secret_hash: pinHash
    };
    that.hostDaemonFacade_.updateDaemonConfig(newConfig).then(
        onConfigUpdated, remoting.Error.handler(onError));
  }

  /** @param {Object} config */
  function onConfig(config) {
    if (!isHostConfigValid_(config)) {
      onError(remoting.Error.unexpected());
      return;
    }
    /** @type {string} */
    var hostId = base.getStringAttr(config, 'host_id');
    that.hostDaemonFacade_.getPinHash(hostId, newPin).then(
        updateDaemonConfigWithHash, remoting.Error.handler(onError));
  }

  // TODO(sergeyu): When crbug.com/121518 is fixed: replace this call
  // with an unprivileged version if that is necessary.
  this.hostDaemonFacade_.getDaemonConfig().then(
      onConfig, remoting.Error.handler(onError));
};

/**
 * Get the state of the local host.
 *
 * @param {function(remoting.HostController.State):void} onDone Completion
 *     callback.
 */
remoting.HostController.prototype.getLocalHostState = function(onDone) {
  /** @param {!remoting.Error} error */
  function onError(error) {
    onDone((error.hasTag(remoting.Error.Tag.MISSING_PLUGIN)) ?
               remoting.HostController.State.NOT_INSTALLED :
               remoting.HostController.State.UNKNOWN);
  }
  this.hostDaemonFacade_.getDaemonState().then(
      onDone, remoting.Error.handler(onError));
};

/**
 * Get the id of the local host, or null if it is not registered.
 *
 * @param {function(string?):void} onDone Completion callback.
 */
remoting.HostController.prototype.getLocalHostId = function(onDone) {
  /** @type {remoting.HostController} */
  var that = this;
  /** @param {Object} config */
  function onConfig(config) {
    var hostId = null;
    if (isHostConfigValid_(config)) {
      hostId = base.getStringAttr(config, 'host_id');
    }
    onDone(hostId);
  };

  this.hostDaemonFacade_.getDaemonConfig().then(onConfig, function(error) {
    onDone(null);
  });
};

/**
 * @return {Promise<string>} Promise that resolves with the host version, if
 *     installed, or rejects otherwise.
 */
remoting.HostController.prototype.getLocalHostVersion = function() {
  return this.hostDaemonFacade_.getDaemonVersion();
};

/**
 * Fetch the list of paired clients for this host.
 *
 * @param {function(Array<remoting.PairedClient>):void} onDone
 * @param {function(!remoting.Error):void} onError
 * @return {void}
 */
remoting.HostController.prototype.getPairedClients = function(onDone,
                                                              onError) {
  this.hostDaemonFacade_.getPairedClients().then(
      onDone, remoting.Error.handler(onError));
};

/**
 * Delete a single paired client.
 *
 * @param {string} client The client id of the pairing to delete.
 * @param {function():void} onDone Completion callback.
 * @param {function(!remoting.Error):void} onError Error callback.
 * @return {void}
 */
remoting.HostController.prototype.deletePairedClient = function(
    client, onDone, onError) {
  this.hostDaemonFacade_.deletePairedClient(client).then(
      onDone, remoting.Error.handler(onError));
};

/**
 * Delete all paired clients.
 *
 * @param {function():void} onDone Completion callback.
 * @param {function(!remoting.Error):void} onError Error callback.
 * @return {void}
 */
remoting.HostController.prototype.clearPairedClients = function(
    onDone, onError) {
  this.hostDaemonFacade_.clearPairedClients().then(
      onDone, remoting.Error.handler(onError));
};

/**
 * Gets the host owner's base JID, used by the host for client authorization.
 * In most cases this is the same as the owner's email address, but for
 * non-Gmail accounts, it may be different.
 *
 * @private
 * @return {!Promise<string>}
 */
remoting.HostController.prototype.getClientBaseJid_ = function() {
  /** @type {remoting.SignalStrategy} */
  var signalStrategy = null;

  var result = new Promise(function(resolve, reject) {
    /** @param {remoting.SignalStrategy.State} state */
    var onState = function(state) {
      switch (state) {
        case remoting.SignalStrategy.State.CONNECTED:
        var jid = signalStrategy.getJid().split('/')[0].toLowerCase();
        base.dispose(signalStrategy);
        signalStrategy = null;
        resolve(jid);
        break;

        case remoting.SignalStrategy.State.FAILED:
        var error = signalStrategy.getError();
        base.dispose(signalStrategy);
        signalStrategy = null;
        reject(error);
        break;
      }
    };

    signalStrategy = remoting.SignalStrategy.create();
    signalStrategy.setStateChangedCallback(onState);
  });

  var tokenPromise = remoting.identity.getToken();
  var emailPromise = remoting.identity.getEmail();
  tokenPromise.then(function(/** string */ token) {
    emailPromise.then(function(/** string */ email) {
      signalStrategy.connect(remoting.settings.XMPP_SERVER, email, token);
    });
  });

  return result;
};

/** @type {remoting.HostController} */
remoting.hostController = null;
