// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/** @suppress {duplicate} */
var remoting = remoting || {};

(function () {

'use strict';

/**
 * A struct that encapsulates the states of a remoting connection.  It does not
 * manage the lifetime of its constituents.
 *
 * @param {remoting.Host} host
 * @param {remoting.CredentialsProvider} credentialsProvider
 * @param {remoting.ClientSession} session
 * @param {remoting.ClientPlugin} plugin
 *
 * @constructor
 * @struct
 */
remoting.ConnectionInfo = function(host, credentialsProvider, session, plugin) {
  /** @private */
  this.host_ = host;
  /** @private */
  this.credentialsProvider_ = credentialsProvider;
  /** @private */
  this.session_ = session;
  /** @private */
  this.plugin_ = plugin;
};

/** @returns {remoting.Host} */
remoting.ConnectionInfo.prototype.host = function() {
  return this.host_;
};

/** @returns {remoting.CredentialsProvider} */
remoting.ConnectionInfo.prototype.credentialsProvider = function() {
  return this.credentialsProvider_;
};

/** @returns {remoting.ClientSession} */
remoting.ConnectionInfo.prototype.session = function() {
  return this.session_;
};

/** @returns {remoting.ClientPlugin} */
remoting.ConnectionInfo.prototype.plugin = function() {
  return this.plugin_;
};

})();
