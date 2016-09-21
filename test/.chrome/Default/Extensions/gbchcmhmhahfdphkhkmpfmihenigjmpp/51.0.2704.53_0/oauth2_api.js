// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * OAuth2 API flow implementations.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/** @interface */
remoting.OAuth2Api = function() {
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
remoting.OAuth2Api.prototype.refreshAccessToken = function(
    onDone, onError, clientId, clientSecret, refreshToken) {
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
remoting.OAuth2Api.prototype.exchangeCodeForTokens = function(
    onDone, onError, clientId, clientSecret, code, redirectUri) {
};

/**
 * Get the user's email address.
 *
 * TODO(jamiewalch): Reorder these parameters to match the typical chrome API
 *     convention of having callbacks at the end and remove the token parameter
 *     to match remoting.HostListApi.
 *
 * @param {function(string):void} onDone Callback invoked when the email
 *     address is available.
 * @param {function(!remoting.Error):void} onError Callback invoked if an
 *     error occurs.
 * @param {string} token Access token.
 * @return {void} Nothing.
 */
remoting.OAuth2Api.prototype.getEmail = function(onDone, onError, token) {
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
remoting.OAuth2Api.prototype.getUserInfo = function(onDone, onError, token) {
};
