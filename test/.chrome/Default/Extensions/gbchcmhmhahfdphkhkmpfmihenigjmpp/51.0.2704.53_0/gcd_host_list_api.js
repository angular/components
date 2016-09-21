// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * REST API for host-list management.
 */

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/**
 * @constructor
 * @implements {remoting.HostListApi}
 */
remoting.GcdHostListApi = function() {
  this.gcd_ = new remoting.gcd.Client({
    apiKey: remoting.settings.GOOGLE_API_KEY
  });
};

/** @override */
remoting.GcdHostListApi.prototype.register = function(
    hostName, publicKey, hostClientId) {
  var self = this;
  var deviceDraft = {
    channel: {
      supportedType: 'xmpp'
    },
    deviceKind: 'vendor',
    name: hostName,
    state: {
      base: {
        firmwareVersion: 'none',
        localDiscoveryEnabled: false,
        localAnonymousAccessMaxRole: 'none',
        localPairingEnabled: false,
        // The leading underscore is necessary for |_publicKey|
        // because it's not a standard key defined by GCD.
        _publicKey: publicKey
      }
    },
    'tags': [CHROMOTING_DEVICE_TAG]
  };

  return /** @type {!Promise<remoting.HostListApi.RegisterResult>} */ (
      this.gcd_.insertRegistrationTicket().
      then(function(ticket) {
        return self.gcd_.patchRegistrationTicket(
            ticket.id, deviceDraft, hostClientId);
      }).
      then(function(/**remoting.gcd.RegistrationTicket*/ ticket) {
        return self.gcd_.finalizeRegistrationTicket(ticket.id);
      }).
      then(function(/**remoting.gcd.RegistrationTicket*/ ticket) {
        return {
          authCode: ticket.robotAccountAuthorizationCode,
          email: ticket.robotAccountEmail,
          hostId: ticket.deviceId
        };
      }).
      catch(function(error) {
        console.error('Error registering device with GCD: ' + error);
        throw new remoting.Error(remoting.Error.Tag.REGISTRATION_FAILED);
      }));
};

/** @override */
remoting.GcdHostListApi.prototype.get = function() {
  return this.gcd_.listDevices().
      then(function(devices) {
        var hosts = [];
        devices.forEach(function(device) {
          try {
            if (isChromotingHost(device)) {
              hosts.push(deviceToHost(device));
            }
          } catch (/** @type {*} */ error) {
            console.warn('Invalid device spec:', error);
          }
        });
        return hosts;
      });
};

/** @override */
remoting.GcdHostListApi.prototype.put =
    function(hostId, hostName, hostPublicKey) {
  return this.gcd_.patchDevice(hostId, {
    'name': hostName
  }).then(function(device) {
    if (device.name != hostName) {
      console.error('error updating host name');
      throw remoting.Error.unexpected();
    }
    if (!device.state || device.state['_publicKey'] != hostPublicKey) {
      // TODO(jrw): Is there any reason to believe this would ever be
      // happen?
      console.error('unexpected host public key');
      throw remoting.Error.unexpected();
    }
    // Don't return anything.
  });
};

/** @override */
remoting.GcdHostListApi.prototype.remove = function(hostId) {
  return this.gcd_.deleteDevice(hostId).then(function(deleted) {
    if (!deleted) {
      console.error('error deleting host from GCD');
      throw remoting.Error.unexpected();
    }
    // Don't return anything.
  });
};

/** @override */
remoting.GcdHostListApi.prototype.getSupportHost = function(supportId) {
  console.error('getSupportHost not supported by HostListApiGclImpl');
  return Promise.reject(remoting.Error.unexpected());
};

/**
 * Tag for distinguishing Chromoting hosts from other devices stored
 * in GCD.
 *
 * @const
 */
var CHROMOTING_DEVICE_TAG = '1ce4542c-dd87-4320-ba19-ac173f98c04e';

/**
 * Check whether a GCD device entry is a Chromoting host.
 *
 * @param {remoting.gcd.Device} device
 * @return {boolean}
 */
function isChromotingHost(device) {
  return device.tags != null &&
      device.tags.indexOf(CHROMOTING_DEVICE_TAG) != -1;
}

/**
 * Converts a GCD device description to a Host object.
 *
 * @param {!Object} device
 * @return {!remoting.Host}
 */
function deviceToHost(device) {
  var statusMap = {
    'online': 'ONLINE',
    'offline': 'OFFLINE'
  };
  var hostId = base.getStringAttr(device, 'id');
  var host = new remoting.Host(hostId);
  host.hostName = base.getStringAttr(device, 'name');
  host.status = base.getStringAttr(
      statusMap, base.getStringAttr(device, 'connectionStatus'));
  var state = base.getObjectAttr(device, 'state', {});
  var baseState = base.getObjectAttr(state, 'base', {});
  host.publicKey = base.getStringAttr(baseState, '_publicKey');
  host.jabberId = base.getStringAttr(baseState, '_jabberId', '');
  host.hostVersion = base.getStringAttr(baseState, '_hostVersion', '');
  host.hostOs = remoting.ChromotingEvent.toOs(
      base.getStringAttr(baseState, '_hostOs', ''));
  host.hostOsVersion = base.getStringAttr(baseState, '_hostOsVersion', '');
  var creationTimeMs = base.getNumberAttr(device, 'creationTimeMs', 0);
  if (creationTimeMs) {
    host.createdTime = new Date(creationTimeMs).toISOString();
  }
  var lastUpdateTimeMs = base.getNumberAttr(device, 'lastUpdateTimeMs', 0);
  if (lastUpdateTimeMs) {
    host.updatedTime = new Date(lastUpdateTimeMs).toISOString();
  }
  return host;
};

})();
