// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var remoting = remoting || {};

/** @typedef {{clientId: string, sharedSecret: string}} */
remoting.PairingInfo;

/** @typedef {{token: string, secret: string}} */
remoting.ThirdPartyToken;

/**
 * Parameters for the remoting.CredentialsProvider constructor.
 *
 * fetchPin: Called by Me2Me connections when a PIN needs to be obtained
 *     interactively.
 *
 * pairingInfo: The pairing info for Me2Me Connections.
 *
 * accessCode: It2Me access code. If present, the |fetchPin| callback will be
 *     ignored.
 *
 * fetchThirdPartyToken: Called when a third party authentication token
 *     is needed
 *
 * @typedef {{
 *   accessCode: (string|undefined),
 *   fetchPin: (function(boolean,function(string): void)|undefined),
 *   pairingInfo: (remoting.PairingInfo|undefined),
 *   fetchThirdPartyToken:
 *      (function(string ,string , string,
 *                function(string, string):void) | undefined)
 * }}
 */
remoting.CredentialsProviderParams;

/**
 * @param {remoting.CredentialsProviderParams} args
 * @constructor
 */
remoting.CredentialsProvider = function(args) {
  /** @private */
  this.fetchPin_ = (args.accessCode) ? this.getAccessCode_ : args.fetchPin;
  /** @private */
  this.pairingInfo_ = args.pairingInfo;
  /** @private */
  this.accessCode_ = args.accessCode;
  /** @private */
  this.fetchThirdPartyToken_ = args.fetchThirdPartyToken;

  /** @private {?remoting.ChromotingEvent.AuthMethod} */
  this.authMethod_ = null;
};

/** @returns {void}  */
remoting.CredentialsProvider.prototype.getAccessCode_ = function(
  /** boolean */ supportsPairing, /** Function */ callback) {
  this.authMethod_ = remoting.ChromotingEvent.AuthMethod.ACCESS_CODE;
  callback(this.accessCode_);
};

/** @returns {remoting.PairingInfo}  */
remoting.CredentialsProvider.prototype.getPairingInfo = function() {
  if (this.pairingInfo_) {
    this.authMethod_ = remoting.ChromotingEvent.AuthMethod.PINLESS;
  }
  return this.pairingInfo_ || { clientId: '', sharedSecret: ''};
};

/**
 * @param {boolean} pairingSupported Whether pairing is supported by the host.
 * @returns {Promise<string>}
 */
remoting.CredentialsProvider.prototype.getPIN = function(pairingSupported) {
  var that = this;
  if (!this.fetchPin_) {
    Promise.resolve('');
  }

  this.authMethod_ = remoting.ChromotingEvent.AuthMethod.PIN;
  return new Promise(function(/** function(string) */ resolve) {
    that.fetchPin_(pairingSupported, resolve);
  });
};

/**
 * @param {string} tokenUrl Token-issue URL received from the host.
 * @param {string} hostPublicKey Host public key (DER and Base64 encoded).
 * @param {string} scope OAuth scope to request the token for.
 *
 * @returns {Promise<remoting.ThirdPartyToken>}
 */
remoting.CredentialsProvider.prototype.getThirdPartyToken = function(
    tokenUrl, hostPublicKey, scope) {
  var that = this;
  if (!this.fetchThirdPartyToken_) {
    Promise.resolve({token: '', secret: ''});
  }

  this.authMethod_ = remoting.ChromotingEvent.AuthMethod.THIRD_PARTY;
  return new Promise(function(/** Function */ resolve) {
    var onTokenFetched = function(/** string */ token, /** string */ secret) {
      resolve({token: token, secret: secret});
    };
    that.fetchThirdPartyToken_(tokenUrl, hostPublicKey, scope, onTokenFetched);
  });
};

/** @return {?remoting.ChromotingEvent.AuthMethod} */
remoting.CredentialsProvider.prototype.getAuthMethod = function() {
  return this.authMethod_;
};