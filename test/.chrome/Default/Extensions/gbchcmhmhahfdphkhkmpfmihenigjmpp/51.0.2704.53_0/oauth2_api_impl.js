// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * OAuth2 API flow implementations.
 */

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/**
 * @constructor
 * @implements {remoting.OAuth2Api}
 */
remoting.OAuth2ApiImpl = function() {
};

/** @private
 *  @return {string} OAuth2 token URL.
 */
remoting.OAuth2ApiImpl.prototype.getOAuth2TokenEndpoint_ = function() {
  return remoting.settings.OAUTH2_BASE_URL + '/token';
};

/** @private
 *  @return {string} OAuth2 userinfo API URL.
 */
remoting.OAuth2ApiImpl.prototype.getOAuth2ApiUserInfoEndpoint_ = function() {
  return remoting.settings.OAUTH2_API_BASE_URL + '/v1/userinfo';
};


/**
 * Interprets HTTP error responses in authentication XMLHttpRequests.
 *
 * @private
 * @param {number} xhrStatus Status (HTTP response code) of the XMLHttpRequest.
 * @return {!remoting.Error} An error code to be raised.
 */
remoting.OAuth2ApiImpl.prototype.interpretXhrStatus_ =
    function(xhrStatus) {
  // Return AUTHENTICATION_FAILED by default, so that the user can try to
  // recover from an unexpected failure by signing in again.
  /** @type {!remoting.Error} */
  var error = new remoting.Error(remoting.Error.Tag.AUTHENTICATION_FAILED);
  if (xhrStatus == 400 || xhrStatus == 401 || xhrStatus == 403) {
    error = new remoting.Error(remoting.Error.Tag.AUTHENTICATION_FAILED);
  } else if (xhrStatus == 502 || xhrStatus == 503) {
    error = new remoting.Error(remoting.Error.Tag.SERVICE_UNAVAILABLE);
  } else if (xhrStatus == 0) {
    error = new remoting.Error(remoting.Error.Tag.NETWORK_FAILURE);
  } else {
    console.warn('Unexpected authentication response code: ' + xhrStatus);
  }
  return error;
};

/**
 * Asynchronously retrieves a new access token from the server.
 *
 * @param {function(string, number): void} onDone Callback to invoke when
 *     the access token and expiration time are successfully fetched.
 * @param {function(!remoting.Error):void} onError Callback invoked if an
 *     error occurs.
 * @param {string} clientId OAuth2 client ID.
 * @param {string} clientSecret OAuth2 client secret.
 * @param {string} refreshToken OAuth2 refresh token to be redeemed.
 * @return {void} Nothing.
 */
remoting.OAuth2ApiImpl.prototype.refreshAccessToken = function(
    onDone, onError, clientId, clientSecret, refreshToken) {
  /** @param {!remoting.Xhr.Response} response */
  var onResponse = function(response) {
    if (response.status == 200) {
      try {
        // Don't use base.jsonParseSafe here unless you also include base.js,
        // otherwise this won't work from the OAuth trampoline.
        // TODO(jamiewalch): Fix this once we're no longer using the trampoline.
        var tokens = JSON.parse(response.getText());
        onDone(tokens['access_token'], tokens['expires_in']);
      } catch (/** @type {Error} */ err) {
        console.error('Invalid "token" response from server:', err);
        onError(remoting.Error.unexpected());
      }
    } else {
      console.error('Failed to refresh token. Status: ' + response.status +
                    ' response: ' + response.getText());
      onError(remoting.Error.fromHttpStatus(response.status));
    }
  };

  new remoting.Xhr({
    method: 'POST',
    url: this.getOAuth2TokenEndpoint_(),
    formContent: {
      'client_id': clientId,
      'client_secret': clientSecret,
      'refresh_token': refreshToken,
      'grant_type': 'refresh_token'
    }
  }).start().then(onResponse);
};

/**
 * Asynchronously exchanges an authorization code for access and refresh tokens.
 *
 * @param {function(string, string, number): void} onDone Callback to
 *     invoke when the refresh token, access token and access token expiration
 *     time are successfully fetched.
 * @param {function(!remoting.Error):void} onError Callback invoked if an
 *     error occurs.
 * @param {string} clientId OAuth2 client ID.
 * @param {string} clientSecret OAuth2 client secret.
 * @param {string} code OAuth2 authorization code.
 * @param {string} redirectUri Redirect URI used to obtain this code.
 * @return {void} Nothing.
 */
remoting.OAuth2ApiImpl.prototype.exchangeCodeForTokens = function(
    onDone, onError, clientId, clientSecret, code, redirectUri) {
  /** @param {!remoting.Xhr.Response} response */
  var onResponse = function(response) {
    if (response.status == 200) {
      try {
        // Don't use base.jsonParseSafe here unless you also include base.js,
        // otherwise this won't work from the OAuth trampoline.
        // TODO(jamiewalch): Fix this once we're no longer using the trampoline.
        var tokens = JSON.parse(response.getText());
        onDone(tokens['refresh_token'],
               tokens['access_token'], tokens['expires_in']);
      } catch (/** @type {Error} */ err) {
        console.error('Invalid "token" response from server:', err);
        onError(remoting.Error.unexpected());
      }
    } else {
      console.error('Failed to exchange code for token. Status: ' +
                    response.status + ' response: ' + response.getText());
      onError(remoting.Error.fromHttpStatus(response.status));
    }
  };

  new remoting.Xhr({
    method: 'POST',
    url: this.getOAuth2TokenEndpoint_(),
    formContent: {
      'client_id': clientId,
      'client_secret': clientSecret,
      'redirect_uri': redirectUri,
      'code': code,
      'grant_type': 'authorization_code'
    }
  }).start().then(onResponse);
};

/**
 * Get the user's email address.
 *
 * @param {function(string):void} onDone Callback invoked when the email
 *     address is available.
 * @param {function(!remoting.Error):void} onError Callback invoked if an
 *     error occurs.
 * @param {string} token Access token.
 * @return {void} Nothing.
 */
remoting.OAuth2ApiImpl.prototype.getEmail = function(onDone, onError, token) {
  /** @param {!remoting.Xhr.Response} response */
  var onResponse = function(response) {
    if (response.status == 200) {
      try {
        var result = JSON.parse(response.getText());
        onDone(result['email']);
      } catch (/** @type {Error} */ err) {
        console.error('Invalid "userinfo" response from server:', err);
        onError(remoting.Error.unexpected());
      }
    } else {
      console.error('Failed to get email. Status: ' + response.status +
                    ' response: ' + response.getText());
      onError(remoting.Error.fromHttpStatus(response.status));
    }
  };
  new remoting.Xhr({
    method: 'GET',
    url: this.getOAuth2ApiUserInfoEndpoint_(),
    oauthToken: token
  }).start().then(onResponse);
};

/**
 * Get the user's email address and full name.
 *
 * @param {function(string, string):void} onDone Callback invoked when the email
 *     address and full name are available.
 * @param {function(!remoting.Error):void} onError Callback invoked if an
 *     error occurs.
 * @param {string} token Access token.
 * @return {void} Nothing.
 */
remoting.OAuth2ApiImpl.prototype.getUserInfo =
    function(onDone, onError, token) {
  /** @param {!remoting.Xhr.Response} response */
  var onResponse = function(response) {
    if (response.status == 200) {
      try {
        var result = JSON.parse(response.getText());
        onDone(result['email'], result['name']);
      } catch (/** @type {Error} */ err) {
        console.error('Invalid "userinfo" response from server:', err);
        onError(remoting.Error.unexpected());
      }
    } else {
      console.error('Failed to get user info. Status: ' + response.status +
                    ' response: ' + response.getText());
      onError(remoting.Error.fromHttpStatus(response.status));
    }
  };
  new remoting.Xhr({
    method: 'GET',
    url: this.getOAuth2ApiUserInfoEndpoint_(),
    oauthToken: token
  }).start().then(onResponse);
};

/** @returns {!remoting.Error} */
function fromHttpStatus(/** number */ status) {
  var error = remoting.Error.fromHttpStatus(status);
  if (error === remoting.Error.unexpected()) {
    // Return AUTHENTICATION_FAILED by default, so that the user can try to
    // recover from an unexpected failure by signing in again.
    return new remoting.Error(remoting.Error.Tag.AUTHENTICATION_FAILED);
  }
  return error;
}

/** @type {remoting.OAuth2Api} */
remoting.oauth2Api = new remoting.OAuth2ApiImpl();

})();
