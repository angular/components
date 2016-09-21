// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Third party authentication support for the remoting web-app.
 *
 * When third party authentication is being used, the client must request both a
 * token and a shared secret from a third-party server. The server can then
 * present the user with an authentication page, or use any other method to
 * authenticate the user via the browser. Once the user is authenticated, the
 * server will redirect the browser to a URL containing the token and shared
 * secret in its fragment. The client then sends only the token to the host.
 * The host signs the token, then contacts the third-party server to exchange
 * the token for the shared secret. Once both client and host have the shared
 * secret, they use a zero-disclosure mutual authentication protocol to
 * negotiate an authentication key, which is used to establish the connection.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @constructor
 * Encapsulates the logic to fetch a third party authentication token.
 *
 * @param {string} tokenUrl Token-issue URL received from the host.
 * @param {string} hostPublicKey Host public key (DER and Base64 encoded).
 * @param {string} scope OAuth scope to request the token for.
 * @param {Array<string>} tokenUrlPatterns Token URL patterns allowed for the
 *     domain, received from the directory server.
 * @param {function(string, string):void} onThirdPartyTokenFetched Callback.
 */
remoting.ThirdPartyTokenFetcher = function(
    tokenUrl, hostPublicKey, scope, tokenUrlPatterns,
    onThirdPartyTokenFetched) {
  this.tokenUrl_ = tokenUrl;
  this.tokenScope_ = scope;
  this.onThirdPartyTokenFetched_ = onThirdPartyTokenFetched;
  this.failFetchToken_ = function() { onThirdPartyTokenFetched('', ''); };
  this.xsrfToken_ = base.generateXsrfToken();
  this.tokenUrlPatterns_ = tokenUrlPatterns;
  this.hostPublicKey_ = hostPublicKey;
  if (chrome.identity) {
    /** @private {function():void} */
    this.fetchTokenInternal_ = this.fetchTokenIdentityApi_.bind(this);
    this.redirectUri_ = 'https://' + window.location.hostname +
        '.chromiumapp.org/ThirdPartyAuth';
  } else {
    this.fetchTokenInternal_ = this.fetchTokenWindowOpen_.bind(this);
    this.redirectUri_ = remoting.settings.THIRD_PARTY_AUTH_REDIRECT_URI;
  }
};

/**
 * Fetch a token with the parameters configured in this object.
 */
remoting.ThirdPartyTokenFetcher.prototype.fetchToken = function() {
  // If there is no list of patterns, this host cannot use a token URL.
  if (!this.tokenUrlPatterns_) {
    console.error('No token URLs are allowed for this host');
    this.failFetchToken_();
  }

  // Verify the host-supplied URL matches the domain's allowed URL patterns.
  for (var i = 0; i < this.tokenUrlPatterns_.length; i++) {
    if (this.tokenUrl_.match(this.tokenUrlPatterns_[i])) {
      var hostPermissions = new remoting.ThirdPartyHostPermissions(
          this.tokenUrl_);
      hostPermissions.getPermission(
          this.fetchTokenInternal_,
          this.failFetchToken_);
      return;
    }
  }
  // If the URL doesn't match any pattern in the list, refuse to access it.
  console.error('Token URL does not match the domain\'s allowed URL patterns.' +
      ' URL: ' + this.tokenUrl_ + ', patterns: ' + this.tokenUrlPatterns_);
  this.failFetchToken_();
};

/**
 * Parse the access token from the URL to which we were redirected.
 *
 * @param {string=} responseUrl The URL to which we were redirected.
 * @private
 */
remoting.ThirdPartyTokenFetcher.prototype.parseRedirectUrl_ =
    function(responseUrl) {
  var token = '';
  var sharedSecret = '';

  if (responseUrl && responseUrl.search('#') >= 0) {
    var query = responseUrl.substring(responseUrl.search('#') + 1);
    var parts = query.split('&');
    /** @type {Object<string>} */
    var queryArgs = {};
    for (var i = 0; i < parts.length; i++) {
      var pair = parts[i].split('=');
      queryArgs[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }

    // Check that 'state' contains the same XSRF token we sent in the request.
    if ('state' in queryArgs && queryArgs['state'] == this.xsrfToken_ &&
        'code' in queryArgs && 'access_token' in queryArgs) {
      // Terminology note:
      // In the OAuth code/token exchange semantics, 'code' refers to the value
      // obtained when the *user* authenticates itself, while 'access_token' is
      // the value obtained when the *application* authenticates itself to the
      // server ("implicitly", by receiving it directly in the URL fragment, or
      // explicitly, by sending the 'code' and a 'client_secret' to the server).
      // Internally, the piece of data obtained when the user authenticates
      // itself is called the 'token', and the one obtained when the host
      // authenticates itself (using the 'token' received from the client and
      // its private key) is called the 'shared secret'.
      // The client implicitly authenticates itself, and directly obtains the
      // 'shared secret', along with the 'token' from the redirect URL fragment.
      token = queryArgs['code'];
      sharedSecret = queryArgs['access_token'];
    }
  }
  this.onThirdPartyTokenFetched_(token, sharedSecret);
};

/**
 * Build a full token request URL from the parameters in this object.
 *
 * @return {string} Full URL to request a token.
 * @private
 */
remoting.ThirdPartyTokenFetcher.prototype.getFullTokenUrl_ = function() {
  return this.tokenUrl_ + '?' + remoting.Xhr.urlencodeParamHash({
    'redirect_uri': this.redirectUri_,
    'scope': this.tokenScope_,
    'client_id': this.hostPublicKey_,
    // The webapp uses an "implicit" OAuth flow with multiple response types to
    // obtain both the code and the shared secret in a single request.
    'response_type': 'code token',
    'state': this.xsrfToken_
  });
};

/**
 * Fetch a token by opening a new window and redirecting to a content script.
 * @private
 */
remoting.ThirdPartyTokenFetcher.prototype.fetchTokenWindowOpen_ = function() {
  /** @type {remoting.ThirdPartyTokenFetcher} */
  var that = this;
  var fullTokenUrl = this.getFullTokenUrl_();
  // The function below can't be anonymous, since it needs to reference itself.
  /**
   * @param {string} message Message received from the content script.
   * @param {function(*)} sendResponse Function to send response.
   */
  function tokenMessageListener(message, sender, sendResponse) {
    that.parseRedirectUrl_(message);
    chrome.extension.onMessage.removeListener(tokenMessageListener);
    sendResponse(null);
  }
  chrome.extension.onMessage.addListener(tokenMessageListener);
  window.open(fullTokenUrl, '_blank', 'location=yes,toolbar=no,menubar=no');
};

/**
 * Fetch a token from a token server using the identity.launchWebAuthFlow API.
 * @private
 */
remoting.ThirdPartyTokenFetcher.prototype.fetchTokenIdentityApi_ = function() {
  var fullTokenUrl = this.getFullTokenUrl_();
  chrome.identity.launchWebAuthFlow(
    {'url': fullTokenUrl, 'interactive': true},
    this.parseRedirectUrl_.bind(this));
};
