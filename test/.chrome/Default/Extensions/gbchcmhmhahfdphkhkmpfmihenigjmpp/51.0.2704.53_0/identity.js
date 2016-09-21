// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Wrapper class for Chrome's identity API.
 */
/** @suppress {duplicate} */
var remoting = remoting || {};

(function(){

'use strict';

/**
 * @type {remoting.Identity}
 */
remoting.identity = null;

var USER_CANCELLED = 'The user did not approve access.';

/**
 * @param {remoting.Identity.ConsentDialog=} opt_consentDialog
 * @constructor
 */
remoting.Identity = function(opt_consentDialog) {
  /** @private */
  this.consentDialog_ = opt_consentDialog;
  /** @private {string} */
  this.email_ = '';
  /** @private {string} */
  this.fullName_ = '';
  /** @private {Object<base.Deferred<string>>} */
  this.authTokensDeferred_ = {};
  /** @private {boolean} */
  this.interactive_ = false;
};

/**
 * chrome.identity.getAuthToken should be initiated from user interactions if
 * called with interactive equals true.  This interface prompts a dialog for
 * the user's consent.
 *
 * @interface
 */
remoting.Identity.ConsentDialog = function() {};

/**
 * @return {Promise} A Promise that resolves when permission to start an
 *   interactive flow is granted.
 */
remoting.Identity.ConsentDialog.prototype.show = function() {};

/**
 * Gets an access token.
 *
 * @param {Array<string>=} opt_scopes Optional OAuth2 scopes to request. If not
 *     specified, the scopes specified in the manifest will be used. No consent
 *     prompt will be needed as long as the requested scopes are a subset of
 *     those already granted (in most cases, the remoting.Application framework
 *     ensures that the scopes specified in the manifest are already authorized
 *     before any application code is executed). Callers can request scopes not
 *     specified in the manifest, but a consent prompt will be shown.
 *
 * @return {!Promise<string>} A promise resolved with an access token
 *     or rejected with a remoting.Error.
 */
remoting.Identity.prototype.getToken = function(opt_scopes) {
  var key = getScopesKey(opt_scopes);
  if (!this.authTokensDeferred_[key]) {
    this.authTokensDeferred_[key] = new base.Deferred();
    var options = {
      'interactive': this.interactive_,
      'scopes': opt_scopes
    };
    chrome.identity.getAuthToken(options,
                                 this.onAuthComplete_.bind(this, opt_scopes));
  }
  return this.authTokensDeferred_[key].promise();
};

/**
 * Gets a fresh access token.
 *
 * @param {Array<string>=} opt_scopes Optional OAuth2 scopes to request, as
 *     documented in getToken().
 * @return {!Promise<string>} A promise resolved with an access token
 *     or rejected with a remoting.Error.
 */
remoting.Identity.prototype.getNewToken = function(opt_scopes) {
  /** @type {remoting.Identity} */
  var that = this;

  return this.getToken(opt_scopes).then(function(/** string */ token) {
    return new Promise(function(resolve, reject) {
      chrome.identity.removeCachedAuthToken({'token': token }, function() {
        resolve(that.getToken(opt_scopes));
      });
    });
  });
};

/**
 * Removes the cached auth token, if any.
 *
 * @return {!Promise<null>} A promise resolved with the operation completes.
 */
remoting.Identity.prototype.removeCachedAuthToken = function() {
  return new Promise(function(resolve, reject) {
    /** @param {string=} token */
    var onToken = function(token) {
      if (token) {
        chrome.identity.removeCachedAuthToken(
            {'token': token}, resolve.bind(null, null));
      } else {
        resolve(null);
      }
    };
    chrome.identity.getAuthToken({'interactive': false}, onToken);
  });
};

/**
 * Gets the user's email address and full name.  The full name will be
 * null unless the webapp has requested and been granted the
 * userinfo.profile permission.
 *
 * TODO(jrw): Type declarations say the name can't be null.  Are the
 * types wrong, or is the documentation wrong?
 *
 * @return {!Promise<{email:string, name:string}>} Promise
 *     resolved with the user's email address and full name, or rejected
 *     with a remoting.Error.
 */
remoting.Identity.prototype.getUserInfo = function() {
  if (this.isAuthenticated()) {
    /**
     * The temp variable is needed to work around a compiler bug.
     * @type {{email: string, name: string}}
     */
    var result = {email: this.email_, name: this.fullName_};
    return Promise.resolve(result);
  }

  /** @type {remoting.Identity} */
  var that = this;

  return this.getToken().then(function(token) {
    return new Promise(function(resolve, reject) {
      /**
       * @param {string} email
       * @param {string} name
       */
      var onResponse = function(email, name) {
        that.email_ = email;
        that.fullName_ = name;
        resolve({email: email, name: name});
      };

      remoting.oauth2Api.getUserInfo(onResponse, reject, token);
    });
  });
};

/**
 * Gets the user's email address.
 *
 * @return {!Promise<string>} Promise resolved with the user's email
 *     address or rejected with a remoting.Error.
 */
remoting.Identity.prototype.getEmail = function() {
  return this.getUserInfo().then(function(userInfo) {
    return userInfo.email;
  });
};

/**
 * Callback for the getAuthToken API.
 *
 * @param {Array<string>|undefined} scopes The explicit scopes passed to
 *     getToken, or undefined if no scopes were specified.
 * @param {string=} token The auth token, or null if the request failed.
 * @private
 */
remoting.Identity.prototype.onAuthComplete_ = function(scopes, token) {
  var key = getScopesKey(scopes);

  // Pass the token to the callback(s) if it was retrieved successfully.
  if (token) {
    var promise = this.authTokensDeferred_[key];
    delete this.authTokensDeferred_[key];
    promise.resolve(token);
    return;
  }

  // If not, pass an error back to the callback(s) if we've already prompted the
  // user for permission.
  if (this.interactive_) {
    var error_message =
        chrome.runtime.lastError ? chrome.runtime.lastError.message
                                 : 'Unknown error.';
    console.error(error_message);
    var error = (error_message == USER_CANCELLED) ?
        new remoting.Error(remoting.Error.Tag.CANCELLED) :
        new remoting.Error(remoting.Error.Tag.NOT_AUTHENTICATED);
    this.authTokensDeferred_[key].reject(error);
    delete this.authTokensDeferred_[key];
    return;
  }

  // If there's no token, but we haven't yet prompted for permission, do so
  // now.
  var that = this;
  var showConsentDialog =
      (this.consentDialog_) ? this.consentDialog_.show() : Promise.resolve();
  showConsentDialog.then(function() {
    that.interactive_ = true;
    var options = {
      'interactive': that.interactive_,
      'scopes': scopes
    };
    chrome.identity.getAuthToken(options,
                                 that.onAuthComplete_.bind(that, scopes));
  });
};

/**
 * Returns whether the web app has authenticated with the Google services.
 *
 * @return {boolean}
 */
remoting.Identity.prototype.isAuthenticated = function() {
  return remoting.identity.email_ !== '';
};


/**
 * @param {Array<string>=} opt_scopes
 * @return {string}
 */
function getScopesKey(opt_scopes) {
  return opt_scopes ? JSON.stringify(opt_scopes) : '';
}

})();
