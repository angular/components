// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/** @suppress {duplicate} */
var remoting = remoting || {};

(function () {

'use strict';

/**
 * remoting.NetworkConnectivityDetector provides a reliable way to detect
 * whether the current computer has connectivity.
 *
 * The waitForOnline() method returns a promise that resolves when the machine
 * has network connectivity or rejects with remoting.Error.Tag.CANCELLED when
 * cancel() is called.
 *
 * @constructor
 * @implements {base.Disposable}
 */
remoting.NetworkConnectivityDetector = function() {
  /** @private {base.Deferred} */
  this.deferred_ = null;

  /** @private {base.Disposable}*/
  this.pendingXhr_ = null;
};

remoting.NetworkConnectivityDetector.prototype.dispose = function() {
  this.cancel();
};

remoting.NetworkConnectivityDetector.prototype.cancel = function() {
  base.dispose(this.pendingXhr_);
  this.pendingXhr_ = null;

  if (this.deferred_) {
    this.deferred_.reject(new remoting.Error(remoting.Error.Tag.CANCELLED));
  }
  this.deferred_ = null;
};

/**
 * @return {Promise} A promise that resolves when the device is online or
 *     rejects with the error tag remoting.Error.Tag.Cancelled when cancel() is
 *     called.
 */
remoting.NetworkConnectivityDetector.prototype.waitForOnline = function() {
  if (this.deferred_) {
    return this.deferred_.promise();
  }

  this.deferred_ = new base.Deferred();

  var that = this;

  this.waitForOnlineEvent_().then(
    this.waitForConnectivity_.bind(this)
  ).then(function() {
    that.deferred_.resolve();
    that.cancel();
  }).catch(function(){
    that.cancel();
  });

  return this.deferred_.promise();
};

/**
 * @private
 * @return {Promise}
 */
remoting.NetworkConnectivityDetector.prototype.waitForOnlineEvent_ = function(){
  if (base.isOnline()) {
    return Promise.resolve();
  }

  var pending = new base.Deferred();
  function onOnline() {
    pending.resolve();
    window.removeEventListener('online', onOnline, false);
  }

  window.addEventListener('online', onOnline, false);
  return pending.promise();
};

/**
 * @private
 * @return {Promise}
 */
remoting.NetworkConnectivityDetector.prototype.waitForConnectivity_=
    function() {
  console.assert(this.pendingXhr_ == null, 'Unexpected pending request');

  if (!this.deferred_) {
    // It is canceled.
    return Promise.reject();
  }

  this.pendingXhr_ = new remoting.AutoRetryXhr({
    method: 'GET',
    url: remoting.NetworkConnectivityDetector.getUrlForTesting(),
  });
  return this.pendingXhr_.start();
};

/**
 * Factory method for stubbing in unittests
 *
 * @return {remoting.NetworkConnectivityDetector}
 */
remoting.NetworkConnectivityDetector.create = function() {
  return new remoting.NetworkConnectivityDetector();
};

/** @return {string} */
remoting.NetworkConnectivityDetector.getUrlForTesting = function() {
  return remoting.settings.TALK_GADGET_URL +
         '/oauth/chrome-remote-desktop-client';
};

})();
