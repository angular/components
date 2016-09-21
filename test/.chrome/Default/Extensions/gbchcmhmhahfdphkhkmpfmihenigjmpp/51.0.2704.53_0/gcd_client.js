// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Client for the GCD REST API.
 * TODO: Add link to GCD docs.
 */

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * Namespace for GCD definitions
 * @type {Object}
 */
remoting.gcd = remoting.gcd || {};

/**
 * @typedef {{
 *   id: string,
 *   robotAccountEmail: string,
 *   robotAccountAuthorizationCode: string,
 *   deviceId: string,
 *   deviceDraft: Object
 * }}
 */
remoting.gcd.RegistrationTicket;

/**
 * TODO: Flesh out with typical fields.
 * @typedef {{
 *   id:string,
 *   name:string,
 *   state:(!Object|undefined),
 *   tags:(!Array<string>|undefined)
 * }}
 */
remoting.gcd.Device;

/**
 * @typedef {!Object}
 */
remoting.gcd.DevicePatch;

/**
 * @typedef {{
 *   devices: (Array<remoting.gcd.Device>|undefined)
 * }}
 */
remoting.gcd.DeviceListResponse;

(function() {
'use strict';

/**
 * Interprets an HTTP response as a JSON object with a specific value
 * in the 'kind' field.
 * @param {remoting.Xhr.Response} response
 * @param {string} expectedKind
 * @return {!Object}
 * @throws {remoting.Error}
 */
var responseAsObject = function(response, expectedKind) {
  if (typeof response.getJson() != 'object') {
    console.error(
        'invalid response; expected object, got:', response.getJson());
    throw remoting.Error.unexpected();
  }
  var obj = base.assertObject(response.getJson());
  var kind = base.getStringAttr(obj, 'kind');
  if (kind != expectedKind) {
    console.error(
        'invalid resonse kind; expected ' + expectedKind + ', got ' + kind);
    throw remoting.Error.unexpected();
  }
  return obj;
};

/**
 * Interprets an HTTP response as containing a GCD registration ticket.
 * @param {remoting.Xhr.Response} response
 * @return {!remoting.gcd.RegistrationTicket}
 * @throws {remoting.Error}
 */
var responseAsGcdRegistrationTicket = function(response) {
  return /** @type {!remoting.gcd.RegistrationTicket} */ (
      responseAsObject(
          response, 'clouddevices#registrationTicket'));
};

/**
 * Interprets an HTTP response as containing a GCD device defintion.
 * @param {remoting.Xhr.Response} response
 * @return {!remoting.gcd.Device}
 * @throws {remoting.Error}
 */
var responseAsGcdDevice = function(response) {
  return /** @type {!remoting.gcd.Device} */ (
      responseAsObject(response, 'clouddevices#device'));
};

/**
 * Interprets an HTTP response as containing a GCD device list.
 * @param {remoting.Xhr.Response} response
 * @return {!remoting.gcd.DeviceListResponse}
 * @throws {remoting.Error}
 */
var responseAsGcdDeviceListResponse = function(response) {
  return /** @type {!remoting.gcd.DeviceListResponse} */ (
      responseAsObject(response, 'clouddevices#devicesListResponse'));
};

/**
 * Creates a new client using a specific API key, and optionall a
 * specific base URL, and OAuth2 client ID.
 * @param {{
 *   apiKey: string,
 *   apiBaseUrl: (string|undefined)
 * }} options
 * @constructor
 */
remoting.gcd.Client = function(options) {
  /** @const */
  this.apiKey_ = options.apiKey;
  /** @const */
  this.apiBaseUrl_ = options.apiBaseUrl ||
      'https://www.googleapis.com/clouddevices/v1';
};

/**
 * Creates a new registration ticket.
 * TODO: Add link to GCD docs.
 * @return {!Promise<remoting.gcd.RegistrationTicket>}
 */
remoting.gcd.Client.prototype.insertRegistrationTicket = function() {
  return new remoting.Xhr({
    method: 'POST',
    url: this.apiBaseUrl_ + '/registrationTickets',
    jsonContent: { 'userEmail': 'me' },
    useIdentity: true,
    acceptJson: true
  }).start().then(function(/** remoting.Xhr.Response */ response) {
    if (response.isError()) {
      console.error('error creating registration ticket');
      throw remoting.Error.unexpected();
    }
    return responseAsGcdRegistrationTicket(response);
  });
};

/**
 * Updates an existing registration ticket using patch semantics.
 * TODO: Add link to GCD docs.
 * @param {string} ticketId
 * @param {!Object<*>} deviceDraft
 * @param {string} oauthClientId
 * @return {!Promise<remoting.gcd.RegistrationTicket>}
 */
remoting.gcd.Client.prototype.patchRegistrationTicket = function(
    ticketId, deviceDraft, oauthClientId) {
  return new remoting.Xhr({
    method: 'PATCH',
    url: this.apiBaseUrl_ + '/registrationTickets/' +
        encodeURIComponent(ticketId),
    urlParams: {
      'key': this.apiKey_
    },
    jsonContent: {
      'deviceDraft': deviceDraft,
      'oauthClientId': oauthClientId
    },
    acceptJson: true
  }).start().then(function(response) {
    if (response.isError()) {
      console.error('error patching registration ticket');
      throw remoting.Error.unexpected();
    }
    return responseAsGcdRegistrationTicket(response);
  });
};

/**
 * Finalizes device registration and returns its credentials.
 * TODO: Add link to GCD docs.
 * @param {string} ticketId
 * @return {!Promise<remoting.gcd.RegistrationTicket>}
 */
remoting.gcd.Client.prototype.finalizeRegistrationTicket = function(ticketId) {
  return new remoting.Xhr({
    method: 'POST',
    url: this.apiBaseUrl_ + '/registrationTickets/' +
        encodeURIComponent(ticketId) + '/finalize',
    urlParams: {
      'key': this.apiKey_
    },
    acceptJson: true
  }).start().then(function(response) {
    if (response.isError()) {
      console.error('error finalizing registration ticket');
      throw remoting.Error.unexpected();
    }
    return responseAsGcdRegistrationTicket(response);
  });
};

/**
 * Lists devices user has access to.
 * TODO: Add link to GCD docs.
 * @return {!Promise<!Array<remoting.gcd.Device>>}
 */
remoting.gcd.Client.prototype.listDevices = function() {
  return new remoting.Xhr({
    method: 'GET',
    url: this.apiBaseUrl_ + '/devices',
    useIdentity: true,
    acceptJson: true
  }).start().then(function(response) {
    if (response.isError()) {
      console.error('error getting device list');
      throw remoting.Error.unexpected();
    }
    var hosts = responseAsGcdDeviceListResponse(response);
    return hosts.devices || [];
  });
};

/**
 * Deletes a device from the system.
 * TODO: Add link to GCD docs.
 * @param {string} deviceId
 * @return {!Promise<boolean>} Promise that resolves to true if the
 *     device was deleted, false if there was no such device ID.
 */
remoting.gcd.Client.prototype.deleteDevice = function(deviceId) {
  return new remoting.Xhr({
    method: 'DELETE',
    url: this.apiBaseUrl_ + '/devices/' + deviceId,
    useIdentity: true
  }).start().then(function(response) {
    if (response.status == 404) {
      return false;
    }
    if (response.isError()) {
      console.error('error deleting device');
      throw remoting.Error.unexpected();
    }
    return true;
  });
};

/**
 * Updates a device data using patch semantics.
 * TODO: Add link to GCD docs.
 * @param {string} deviceId
 * @param {!Object<*>} patch
 * @return {!Promise<remoting.gcd.Device>}
 */
remoting.gcd.Client.prototype.patchDevice = function(deviceId, patch) {
  return new remoting.Xhr({
    method: 'PATCH',
    url: this.apiBaseUrl_ + '/devices/' + deviceId,
    jsonContent: patch,
    useIdentity: true,
    acceptJson: true
  }).start().then(function(response) {
    if (response.isError()) {
      console.error('error patching device');
      throw remoting.Error.unexpected();
    }
    return responseAsGcdDevice(response);
  });
};

})();
