// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * API for host-list management.
 */

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/** @interface */
remoting.HostListApi = function() {
};

/**
 * Registers a new host with the host registry service (either the
 * Chromoting registry or GCD).
 *
 * @param {string} hostName The user-visible name of the new host.
 * @param {string} publicKey The public half of the host's key pair.
 * @param {string} hostClientId The OAuth2 client ID of the host.
 * @return {!Promise<remoting.HostListApi.RegisterResult>}
 */
remoting.HostListApi.prototype.register = function(
    hostName, publicKey, hostClientId) {
};

/**
 * Fetch the list of hosts for a user.
 *
 * @return {!Promise<!Array<!remoting.Host>>}
 */
remoting.HostListApi.prototype.get = function() {
};

/**
 * Update the information for a host.
 *
 * @param {string} hostId
 * @param {string} hostName
 * @param {string} hostPublicKey
 * @return {!Promise<void>}
 */
remoting.HostListApi.prototype.put =
    function(hostId, hostName, hostPublicKey) {
};

/**
 * Delete a host.
 *
 * @param {string} hostId
 * @return {!Promise<void>}
 */
remoting.HostListApi.prototype.remove = function(hostId) {
};

/**
 * Attempts to look up a host using an ID derived from its publicly
 * visible access code.
 *
 * @param {string} supportId The support ID of the host to connect to.
 * @return {!Promise<!remoting.Host>}
 */
remoting.HostListApi.prototype.getSupportHost = function(supportId) {
};

/**
 * @private {remoting.HostListApi}
 */
var instance = null;

/**
 * @return {!remoting.HostListApi}
 */
remoting.HostListApi.getInstance = function() {
  if (instance == null) {
    if (remoting.settings.USE_GCD) {
      var gcdInstance = new remoting.GcdHostListApi();
      var legacyInstance = new remoting.LegacyHostListApi();
      instance = new remoting.CombinedHostListApi(legacyInstance, gcdInstance);
    } else {
      instance = new remoting.LegacyHostListApi();
    }
  }
  return instance;
};

/**
 * For testing.
 * @param {remoting.HostListApi} newInstance
 */
remoting.HostListApi.setInstance = function(newInstance) {
  instance = newInstance;
};

})();

/**
 * Information returned from the registry/GCD server when registering
 * a device.
 *
 * The fields are:
 *
 * authCode: An OAuth2 authorization code that can be exchanged for a
 *     refresh token.
 *
 * email: The email/XMPP address of the robot account associated with
 *     this device.  The Chromoting directory sets this field to the
 *     empty string; GCD returns a real email address.
 *
 * hostId: The ID of the newly registered host.
 *
 * @typedef {{
 *   authCode: string,
 *   email: string,
 *   hostId: string
 * }}
 */
remoting.HostListApi.RegisterResult;
