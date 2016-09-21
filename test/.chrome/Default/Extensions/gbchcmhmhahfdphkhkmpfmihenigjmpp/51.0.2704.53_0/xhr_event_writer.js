// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/**
 * A class that writes log events to our back-end using XHR.
 * If a log request fails due to network failure, it will be stored to
 * |storage| for retrying in the future by calling flush().
 *
 * @param {!string} url
 * @param {!StorageArea} storage
 * @param {!string} storageKey
 * @constructor
 */
remoting.XhrEventWriter = function(url, storage, storageKey) {
  /** @private */
  this.url_ = url;
  /** @private */
  this.storage_ = storage;
  /** @private @const */
  this.storageKey_ = storageKey;
  /** @private */
  this.pendingRequests_ = new Map();
  /** @private {base.Deferred} */
  this.pendingFlush_ = null;
};

/**
 * @return {Promise} A promise that resolves when initialization is completed.
 */
remoting.XhrEventWriter.prototype.loadPendingRequests = function() {
  var that = this;
  var deferred = new base.Deferred();
  this.storage_.get(this.storageKey_, function(entry) {
    try {
      that.pendingRequests_ = new Map(entry[that.storageKey_]);
    } catch(e) {
      that.pendingRequests_ = new Map();
    }
    deferred.resolve(that.pendingRequests_);
  });
  return deferred.promise();
};

/**
 * @param {Object} event  The event to be written to the server.
 * @return {Promise} A promise that resolves on success.
 */
remoting.XhrEventWriter.prototype.write = function(event) {
  console.log('Writing Event - ' + JSON.stringify(event));
  this.markPending_(event);
  return this.flush();
};

/**
 * @return {Promise} A promise that resolves on success.
 */
remoting.XhrEventWriter.prototype.flush = function() {
  if (!this.pendingFlush_) {
    var that = this;
    this.pendingFlush_ = new base.Deferred();

    var onFailure = function(/** * */e) {
      that.pendingFlush_.reject(e);
      that.pendingFlush_ = null;
    };

    var flushAll = function() {
      if (that.pendingRequests_.size > 0) {
        that.doFlush_().then(flushAll, onFailure);
      } else {
        that.pendingFlush_.resolve();
        that.pendingFlush_ = null;
      }
    };

    // Ensures that |this.pendingFlush_| won't be set to null
    // in the same stack frame.
    Promise.resolve().then(flushAll);
  }

  return this.pendingFlush_.promise();
};

/**
 * @return {Promise} A promise that resolves on success.
 * @private
 */
remoting.XhrEventWriter.prototype.doFlush_ = function() {
  var payLoad = [];
  var requestIds = [];

  // Map.forEach enumerates the entires of the map in insertion order.
  this.pendingRequests_.forEach(
    function(/** Object */ event, /** string */ requestId) {
      requestIds.push(requestId);
      payLoad.push(event);
    });

  return this.doXhr_(requestIds, {'event': payLoad});
};

/**
 * @return {Promise} A promise that resolves when the pending requests are
 *     written to disk.
 */
remoting.XhrEventWriter.prototype.writeToStorage = function() {
  var deferred = new base.Deferred();
  var map = [];
  this.pendingRequests_.forEach(
    function(/** Object */ request, /** string */ id) {
      map.push([id, request]);
    });

  var entry = {};
  entry[this.storageKey_] = map;
  this.storage_.set(entry, deferred.resolve.bind(deferred));
  return deferred.promise();
};

/**
 * @param {Array<string>} requestIds
 * @param {Object} event
 * @return {Promise}
 * @private
 */
remoting.XhrEventWriter.prototype.doXhr_ = function(requestIds, event) {
  var that = this;
  var XHR_RETRY_ATTEMPTS = 20;
  var xhr = new remoting.AutoRetryXhr(
      {method: 'POST', url: this.url_, jsonContent: event, useIdentity: true},
      XHR_RETRY_ATTEMPTS);
  return xhr.start().then(function(response) {
    var error = remoting.Error.fromHttpStatus(response.status);
    // Only store requests that are failed with NETWORK_FAILURE, so that
    // malformed requests won't be stuck in the client forever.
    if (!error.hasTag(remoting.Error.Tag.NETWORK_FAILURE)) {
      requestIds.forEach(function(/** string */ requestId) {
        that.pendingRequests_.delete(requestId);
      });
    }
    if (!error.isNone()) {
      throw error;
    }
  });
};

/**
 * @param {number} length
 * @return {string} A random string of length |length|
 */
function randomString(length) {
  var random = new Uint8Array(length);
  window.crypto.getRandomValues(random);
  return window.btoa(String.fromCharCode.apply(null, random));
}

/**
 * @param {Object} event
 * @private
 */
remoting.XhrEventWriter.prototype.markPending_ = function(event) {
  var requestId = Date.now() + '_' + randomString(16);
  console.assert(!this.pendingRequests_.has(requestId),
                 'There is already an event with id ' + requestId + '.');
  this.pendingRequests_.set(requestId, event);
};

})();
