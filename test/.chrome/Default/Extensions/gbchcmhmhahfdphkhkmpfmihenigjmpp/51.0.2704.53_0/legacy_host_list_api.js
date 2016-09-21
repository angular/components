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
remoting.LegacyHostListApi = function() {
};

/** @override */
remoting.LegacyHostListApi.prototype.register = function(
    hostName, publicKey, hostClientId) {
  var newHostId = base.generateUuid();
  return remoting.LegacyHostListApi.registerWithHostId(
      newHostId, hostName, publicKey, hostClientId);
};

/**
 * Registers a host with the Chromoting directory using a specified
 * host ID, which should not be equal to the ID of any existing host.
 *
 * @param {string} newHostId The host ID of the new host.
 * @param {string} hostName The user-visible name of the new host.
 * @param {string} publicKey The public half of the host's key pair.
 * @param {?string} hostClientId The OAuth2 client ID of the host.
 * @return {!Promise<remoting.HostListApi.RegisterResult>}
 */
remoting.LegacyHostListApi.registerWithHostId = function(
    newHostId, hostName, publicKey, hostClientId) {
  var newHostDetails = { data: {
    hostId: newHostId,
    hostName: hostName,
    publicKey: publicKey
  } };

  return new remoting.Xhr({
    method: 'POST',
    url: remoting.settings.DIRECTORY_API_BASE_URL + '/@me/hosts',
    urlParams: {
      hostClientId: hostClientId
    },
    jsonContent: newHostDetails,
    acceptJson: true,
    useIdentity: true
  }).start().then(function(response) {
    if (response.status == 200) {
      var result = /** @type {!Object} */ (response.getJson());
      var data = base.getObjectAttr(result, 'data');
      var authCode = hostClientId ?
          base.getStringAttr(data, 'authorizationCode') :
          '';
      return {
        authCode: authCode,
        email: '',
        hostId: newHostId
      };
    } else {
      console.log(
          'Failed to register the host. Status: ' + response.status +
          ' response: ' + response.getText());
      throw new remoting.Error(remoting.Error.Tag.REGISTRATION_FAILED);
    }
  });
};

/** @override */
remoting.LegacyHostListApi.prototype.get = function() {
  var that = this;
  return new remoting.Xhr({
    method: 'GET',
    url: remoting.settings.DIRECTORY_API_BASE_URL + '/@me/hosts',
    useIdentity: true
  }).start().then(function(/** !remoting.Xhr.Response */ response) {
    return that.parseHostListResponse_(response);
  });
};

/** @override */
remoting.LegacyHostListApi.prototype.put =
    function(hostId, hostName, hostPublicKey) {
  return new remoting.Xhr({
    method: 'PUT',
    url: remoting.settings.DIRECTORY_API_BASE_URL + '/@me/hosts/' + hostId,
    jsonContent: {
      'data': {
        'hostId': hostId,
        'hostName': hostName,
        'publicKey': hostPublicKey
      }
    },
    useIdentity: true
  }).start().then(remoting.LegacyHostListApi.defaultResponse_());
};

/** @override */
remoting.LegacyHostListApi.prototype.remove = function(hostId) {
  return new remoting.Xhr({
    method: 'DELETE',
    url: remoting.settings.DIRECTORY_API_BASE_URL + '/@me/hosts/' + hostId,
    useIdentity: true
  }).start().then(remoting.LegacyHostListApi.defaultResponse_(
      [remoting.Error.Tag.NOT_FOUND]));
};

/**
 * Handle the results of the host list request.  A success response will
 * include a JSON-encoded list of host descriptions, which is parsed and
 * passed to the callback.
 *
 * @param {!remoting.Xhr.Response} response
 * @return {!Array<!remoting.Host>}
 * @private
 */
remoting.LegacyHostListApi.prototype.parseHostListResponse_ =
    function(response) {
  if (response.status == 200) {
    var obj = /** @type {{data: {items: Array}}} */
        (base.jsonParseSafe(response.getText()));
    if (!obj || !obj.data) {
      console.error('Invalid "hosts" response from server.');
      throw remoting.Error.unexpected();
    } else {
      var items = obj.data.items || [];
      var hosts = items.map(
        function(/** Object */ item) {
          var host = new remoting.Host(base.getStringAttr(item, 'hostId', ''));
          host.hostName = base.getStringAttr(item, 'hostName', '');
          host.status = base.getStringAttr(item, 'status', '');
          host.jabberId = base.getStringAttr(item, 'jabberId', '');
          host.publicKey = base.getStringAttr(item, 'publicKey', '');
          host.hostVersion = base.getStringAttr(item, 'hostVersion', '');
          host.hostOs = remoting.ChromotingEvent.toOs(
              base.getStringAttr(item, 'hostOs', ''));
          host.hostOsVersion = base.getStringAttr(item, 'hostOsVersion', '');
          host.tokenUrlPatterns =
              base.getArrayAttr(item, 'tokenUrlPatterns', []);
          host.updatedTime = base.getStringAttr(item, 'updatedTime', '');
          host.hostOfflineReason =
              base.getStringAttr(item, 'hostOfflineReason', '');
          return host;
      });
      return hosts;
    }
  } else {
    throw remoting.Error.fromHttpStatus(response.status);
  }
};

/**
 * Generic success/failure response proxy.
 *
 * @param {Array<remoting.Error.Tag>=} opt_ignoreErrors
 * @return {function(!remoting.Xhr.Response):void}
 * @private
 */
remoting.LegacyHostListApi.defaultResponse_ = function(opt_ignoreErrors) {
  /** @param {!remoting.Xhr.Response} response */
  var result = function(response) {
    var error = remoting.Error.fromHttpStatus(response.status);
    if (error.isNone()) {
      return;
    }

    if (opt_ignoreErrors && error.hasTag.apply(error, opt_ignoreErrors)) {
      return;
    }

    throw error;
  };
  return result;
};

/** @override */
remoting.LegacyHostListApi.prototype.getSupportHost = function(supportId) {
  return new remoting.Xhr({
    method: 'GET',
    url: remoting.settings.DIRECTORY_API_BASE_URL + '/support-hosts/' +
        encodeURIComponent(supportId),
    useIdentity: true
  }).start().then(function(xhrResponse) {
    if (xhrResponse.status == 200) {
      var response =
          /** @type {{data: {jabberId: string, publicKey: string}}} */
          (base.jsonParseSafe(xhrResponse.getText()));
      if (response && response.data &&
          response.data.jabberId && response.data.publicKey) {
        var host = new remoting.Host(supportId);
        host.jabberId = base.getStringAttr(response.data, 'jabberId', '');
        host.publicKey = base.getStringAttr(response.data, 'publicKey', '');
        host.hostName = host.jabberId.split('/')[0];
        return host;
      } else {
        console.error('Invalid "support-hosts" response from server.');
        throw remoting.Error.unexpected();
      }
    } else if (xhrResponse.status == 404) {
      throw new remoting.Error(remoting.Error.Tag.INVALID_ACCESS_CODE);
    } else {
      throw remoting.Error.fromHttpStatus(xhrResponse.status);
    }
  });
};

})();
