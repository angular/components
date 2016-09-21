// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * OAuth2 class that handles retrieval/storage of an OAuth2 token.
 *
 * Uses a content script to trampoline the OAuth redirect page back into the
 * extension context.  This works around the lack of native support for
 * chrome-extensions in OAuth2.
 */

// TODO(jamiewalch): Delete this code once Chromoting is a v2 app and uses the
// identity API (http://crbug.com/ 134213).

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/** @type {remoting.OAuth2} */
remoting.oauth2 = null;


/**
 * @constructor
 * @extends {remoting.Identity}
 */
remoting.OAuth2 = function() {
};

// Constants representing keys used for storing persistent state.
/** @private */
remoting.OAuth2.prototype.KEY_REFRESH_TOKEN_ = 'oauth2-refresh-token';
/** @private */
remoting.OAuth2.prototype.KEY_ACCESS_TOKEN_ = 'oauth2-access-token';
/** @private */
remoting.OAuth2.prototype.KEY_EMAIL_ = 'remoting-email';
/** @private */
remoting.OAuth2.prototype.KEY_FULLNAME_ = 'remoting-fullname';

// Constants for parameters used in retrieving the OAuth2 credentials.
/** @private */
remoting.OAuth2.prototype.SCOPE_ =
      'https://www.googleapis.com/auth/chromoting ' +
      'https://www.googleapis.com/auth/googletalk ' +
      'https://www.googleapis.com/auth/userinfo#email';

// Configurable URLs/strings.
/** @private
 *  @return {string} OAuth2 redirect URI.
 */
remoting.OAuth2.prototype.getRedirectUri_ = function() {
  return remoting.settings.OAUTH2_REDIRECT_URL();
};

/** @private
 *  @return {string} API client ID.
 */
remoting.OAuth2.prototype.getClientId_ = function() {
  return remoting.settings.OAUTH2_CLIENT_ID;
};

/** @private
 *  @return {string} API client secret.
 */
remoting.OAuth2.prototype.getClientSecret_ = function() {
  return remoting.settings.OAUTH2_CLIENT_SECRET;
};

/** @private
 *  @return {string} OAuth2 authentication URL.
 */
remoting.OAuth2.prototype.getOAuth2AuthEndpoint_ = function() {
  return remoting.settings.OAUTH2_BASE_URL + '/auth';
};

/** @return {boolean} True if the app is already authenticated. */
remoting.OAuth2.prototype.isAuthenticated = function() {
  if (this.getRefreshToken()) {
    return true;
  }
  return false;
};

/**
 * Remove the cached auth token, if any.
 *
 * @return {!Promise<null>} A promise resolved with the operation completes.
 */
remoting.OAuth2.prototype.removeCachedAuthToken = function() {
  window.localStorage.removeItem(this.KEY_EMAIL_);
  window.localStorage.removeItem(this.KEY_FULLNAME_);
  this.clearAccessToken_();
  this.clearRefreshToken_();
  return Promise.resolve(null);
};

/**
 * Sets the refresh token.
 *
 * @param {string} token The new refresh token.
 * @return {void} Nothing.
 * @private
 */
remoting.OAuth2.prototype.setRefreshToken_ = function(token) {
  window.localStorage.setItem(this.KEY_REFRESH_TOKEN_, escape(token));
  window.localStorage.removeItem(this.KEY_EMAIL_);
  window.localStorage.removeItem(this.KEY_FULLNAME_);
  this.clearAccessToken_();
};

/**
 * @return {?string} The refresh token, if authenticated, or NULL.
 */
remoting.OAuth2.prototype.getRefreshToken = function() {
  var value = window.localStorage.getItem(this.KEY_REFRESH_TOKEN_);
  if (typeof value == 'string') {
    return unescape(value);
  }
  return null;
};

/**
 * Clears the refresh token.
 *
 * @return {void} Nothing.
 * @private
 */
remoting.OAuth2.prototype.clearRefreshToken_ = function() {
  window.localStorage.removeItem(this.KEY_REFRESH_TOKEN_);
};

/**
 * @param {string} token The new access token.
 * @param {number} expiration Expiration time in milliseconds since epoch.
 * @return {void} Nothing.
 * @private
 */
remoting.OAuth2.prototype.setAccessToken_ = function(token, expiration) {
  // Offset expiration by 120 seconds so that we can guarantee that the token
  // we return will be valid for at least 2 minutes.
  // If the access token is to be useful, this object must make some
  // guarantee as to how long the token will be valid for.
  // The choice of 2 minutes is arbitrary, but that length of time
  // is part of the contract satisfied by callWithToken().
  // Offset by a further 30 seconds to account for RTT issues.
  var access_token = {
    'token': token,
    'expiration': (expiration - (120 + 30)) * 1000 + Date.now()
  };
  window.localStorage.setItem(this.KEY_ACCESS_TOKEN_,
                              JSON.stringify(access_token));
};

/**
 * Returns the current access token, setting it to a invalid value if none
 * existed before.
 *
 * @private
 * @return {{token: string, expiration: number}} The current access token, or
 *     an invalid token if not authenticated.
 */
remoting.OAuth2.prototype.getAccessTokenInternal_ = function() {
  if (!window.localStorage.getItem(this.KEY_ACCESS_TOKEN_)) {
    // Always be able to return structured data.
    this.setAccessToken_('', 0);
  }
  var accessToken = window.localStorage.getItem(this.KEY_ACCESS_TOKEN_);
  if (typeof accessToken == 'string') {
    var result = base.jsonParseSafe(accessToken);
    if (result && 'token' in result && 'expiration' in result) {
      return /** @type {{token: string, expiration: number}} */(result);
    }
  }
  console.log('Invalid access token stored.');
  return {'token': '', 'expiration': 0};
};

/**
 * Returns true if the access token is expired, or otherwise invalid.
 *
 * Will throw if !isAuthenticated().
 *
 * @return {boolean} True if a new access token is needed.
 * @private
 */
remoting.OAuth2.prototype.needsNewAccessToken_ = function() {
  if (!this.isAuthenticated()) {
    throw 'Not Authenticated.';
  }
  var access_token = this.getAccessTokenInternal_();
  if (!access_token['token']) {
    return true;
  }
  if (Date.now() > access_token['expiration']) {
    return true;
  }
  return false;
};

/**
 * @return {void} Nothing.
 * @private
 */
remoting.OAuth2.prototype.clearAccessToken_ = function() {
  window.localStorage.removeItem(this.KEY_ACCESS_TOKEN_);
};

/**
 * Update state based on token response from the OAuth2 /token endpoint.
 *
 * @param {function(string):void} onOk Called with the new access token.
 * @param {string} accessToken Access token.
 * @param {number} expiresIn Expiration time for the access token.
 * @return {void} Nothing.
 * @private
 */
remoting.OAuth2.prototype.onAccessToken_ =
    function(onOk, accessToken, expiresIn) {
  this.setAccessToken_(accessToken, expiresIn);
  onOk(accessToken);
};

/**
 * Update state based on token response from the OAuth2 /token endpoint.
 *
 * @param {function():void} onOk Called after the new tokens are stored.
 * @param {string} refreshToken Refresh token.
 * @param {string} accessToken Access token.
 * @param {number} expiresIn Expiration time for the access token.
 * @return {void} Nothing.
 * @private
 */
remoting.OAuth2.prototype.onTokens_ =
    function(onOk, refreshToken, accessToken, expiresIn) {
  this.setAccessToken_(accessToken, expiresIn);
  this.setRefreshToken_(refreshToken);
  onOk();
};

/**
 * Redirect page to get a new OAuth2 authorization code
 *
 * @param {function(?string):void} onDone Completion callback to receive
 *     the authorization code, or null on error.
 * @return {void} Nothing.
 */
remoting.OAuth2.prototype.getAuthorizationCode = function(onDone) {
  var xsrf_token = base.generateXsrfToken();
  var GET_CODE_URL = this.getOAuth2AuthEndpoint_() + '?' +
    remoting.Xhr.urlencodeParamHash({
          'client_id': this.getClientId_(),
          'redirect_uri': this.getRedirectUri_(),
          'scope': this.SCOPE_,
          'state': xsrf_token,
          'response_type': 'code',
          'access_type': 'offline',
          'approval_prompt': 'force'
        });

  /**
   * Processes the results of the oauth flow.
   *
   * @param {Object<string>} message Dictionary containing the parsed OAuth
   *     redirect URL parameters.
   * @param {function(*)} sendResponse Function to send response.
   */
  function oauth2MessageListener(message, sender, sendResponse) {
    if ('code' in message && 'state' in message) {
      if (message['state'] == xsrf_token) {
        onDone(message['code']);
      } else {
        console.error('Invalid XSRF token.');
        onDone(null);
      }
    } else {
      if ('error' in message) {
        console.error(
            'Could not obtain authorization code: ' + message['error']);
      } else {
        // We intentionally don't log the response - since we don't understand
        // it, we can't tell if it has sensitive data.
        console.error('Invalid oauth2 response.');
      }
      onDone(null);
    }
    chrome.extension.onMessage.removeListener(oauth2MessageListener);
    sendResponse(null);
  }
  chrome.extension.onMessage.addListener(oauth2MessageListener);
  window.open(GET_CODE_URL, '_blank', 'location=yes,toolbar=no,menubar=no');
};

/**
 * Redirect page to get a new OAuth Refresh Token.
 *
 * @param {function():void} onDone Completion callback.
 * @return {void} Nothing.
 */
remoting.OAuth2.prototype.doAuthRedirect = function(onDone) {
  /** @type {remoting.OAuth2} */
  var that = this;
  /** @param {?string} code */
  var onAuthorizationCode = function(code) {
    if (code) {
      that.exchangeCodeForToken(code, onDone);
    } else {
      onDone();
    }
  };
  this.getAuthorizationCode(onAuthorizationCode);
};

/**
 * Asynchronously exchanges an authorization code for a refresh token.
 *
 * @param {string} code The OAuth2 authorization code.
 * @param {function():void} onDone Callback to invoke on completion.
 * @return {void} Nothing.
 */
remoting.OAuth2.prototype.exchangeCodeForToken = function(code, onDone) {
  /** @param {!remoting.Error} error */
  var onError = function(error) {
    console.error('Unable to exchange code for token: ' + error.toString());
  };

  remoting.oauth2Api.exchangeCodeForTokens(
      this.onTokens_.bind(this, onDone), onError,
      this.getClientId_(), this.getClientSecret_(), code,
      this.getRedirectUri_());
};

/**
 * Print a command-line that can be used to register a host on Linux platforms.
 */
remoting.OAuth2.prototype.printStartHostCommandLine = function() {
  /** @type {string} */
  var redirectUri = this.getRedirectUri_();
  /** @param {?string} code */
  var onAuthorizationCode = function(code) {
    if (code) {
      console.log('Run the following command to register a host:');
      console.log(
          '%c/opt/google/chrome-remote-desktop/start-host' +
          ' --code=' + code +
          ' --redirect-url=' + redirectUri +
          ' --name=$HOSTNAME', 'font-weight: bold;');
    }
  };
  this.getAuthorizationCode(onAuthorizationCode);
};

/**
 * Get an access token, refreshing it first if necessary.  The access
 * token will remain valid for at least 2 minutes.
 *
 * @return {!Promise<string>} A promise resolved the an access token or
 *     rejected with a remoting.Error.
 */
remoting.OAuth2.prototype.getToken = function() {
  /** @const */
  var that = this;

  return new Promise(function(resolve, reject) {
    var refreshToken = that.getRefreshToken();
    if (refreshToken) {
      if (that.needsNewAccessToken_()) {
        remoting.oauth2Api.refreshAccessToken(
            that.onAccessToken_.bind(that, resolve), reject,
            that.getClientId_(), that.getClientSecret_(),
            refreshToken);
      } else {
        resolve(that.getAccessTokenInternal_()['token']);
      }
    } else {
      reject(new remoting.Error(remoting.Error.Tag.NOT_AUTHENTICATED));
    }
  });
};

/**
 * Get the user's email address.
 *
 * @return {!Promise<string>} Promise resolved with the user's email
 *     address or rejected with a remoting.Error.
 */
remoting.OAuth2.prototype.getEmail = function() {
  var cached = window.localStorage.getItem(this.KEY_EMAIL_);
  if (typeof cached == 'string') {
    return Promise.resolve(cached);
  }
  /** @type {remoting.OAuth2} */
  var that = this;

  return new Promise(function(resolve, reject) {
    /** @param {string} email */
    var onResponse = function(email) {
      window.localStorage.setItem(that.KEY_EMAIL_, email);
      window.localStorage.setItem(that.KEY_FULLNAME_, '');
      resolve(email);
    };

    that.getToken().then(
        remoting.oauth2Api.getEmail.bind(
            remoting.oauth2Api, onResponse, reject),
        reject);
  });
};

/**
 * Get the user's email address and full name.
 *
 * @return {!Promise<{email: string, name: string}>} Promise
 *     resolved with the user's email address and full name, or rejected
 *     with a remoting.Error.
 */
remoting.OAuth2.prototype.getUserInfo = function() {
  var cachedEmail = window.localStorage.getItem(this.KEY_EMAIL_);
  var cachedName = window.localStorage.getItem(this.KEY_FULLNAME_);
  if (typeof cachedEmail == 'string' && typeof cachedName == 'string') {
    /**
     * The temp variable is needed to work around a compiler bug.
     * @type {{email: string, name: string}}
     */
    var result = {email: cachedEmail, name: cachedName};
    return Promise.resolve(result);
  }

  /** @type {remoting.OAuth2} */
  var that = this;

  return new Promise(function(resolve, reject) {
    /**
     * @param {string} email
     * @param {string} name
     */
    var onResponse = function(email, name) {
      window.localStorage.setItem(that.KEY_EMAIL_, email);
      window.localStorage.setItem(that.KEY_FULLNAME_, name);
      resolve({email: email, name: name});
    };

    that.getToken().then(
        remoting.oauth2Api.getUserInfo.bind(
            remoting.oauth2Api, onResponse, reject),
        reject);
  });
};
