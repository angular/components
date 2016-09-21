// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Class handling saving and restoring of per-host options.
 */

/** @suppress {duplicate} */
var remoting = remoting || {};

(function(){

'use strict';

/**
 * @param {string} hostId
 * @constructor
 */
remoting.HostOptions = function (hostId) {
  /** @private @const */
  this.hostId_ = hostId;

  // This class violates the convention that private variables end with an
  // underscore because it simplifies the load/save code.

  /** @private {?boolean} */
  this.shrinkToFit = null;
  /** @private {?boolean} */
  this.resizeToClient = null;
  /** @private {?number} */
  this.desktopScale = null;
  /** @private {?remoting.PairingInfo} */
  this.pairingInfo = null;
  /** @private {Object} */
  this.remapKeys = null;
};

/** @return {boolean} True if the remote desktop should be reduced in size to
 *      fit a smaller client window; false if scroll-bars or bump-scrolling
 *      should be used instead.
 */
remoting.HostOptions.prototype.getShrinkToFit = function() {
  return (this.shrinkToFit == null) ? true : this.shrinkToFit;
};

/** @param {boolean} shrinkToFit */
remoting.HostOptions.prototype.setShrinkToFit = function(shrinkToFit) {
  this.shrinkToFit = shrinkToFit;
};

/** @return {boolean} True if the remote desktop should be resized to fit the
 *      client window size.
 */
remoting.HostOptions.prototype.getResizeToClient = function() {
  return (this.resizeToClient == null) ? true : this.resizeToClient;
};

/** @param {boolean} resizeToClient */
remoting.HostOptions.prototype.setResizeToClient = function(resizeToClient) {
  this.resizeToClient = resizeToClient;
};

/** @return {number} The scaling factor applied when rendering or resizing the
 *      remote desktop.
 */
remoting.HostOptions.prototype.getDesktopScale = function() {
  return (this.desktopScale == null) ? 1 : this.desktopScale;
};

/** @param {number} desktopScale */
remoting.HostOptions.prototype.setDesktopScale = function(desktopScale) {
  this.desktopScale = desktopScale;
};

/**
 * @return {!remoting.PairingInfo} The pairing info for this client/host pair.
 */
remoting.HostOptions.prototype.getPairingInfo = function() {
  return (this.pairingInfo == null)
      ? {clientId: '', sharedSecret: ''}
      : /** @type {remoting.PairingInfo} */ (base.deepCopy(this.pairingInfo));
};

/**
 * @param {!remoting.PairingInfo} pairingInfo
 */
remoting.HostOptions.prototype.setPairingInfo = function(pairingInfo) {
  this.pairingInfo =
      /** @type {remoting.PairingInfo} */ (base.deepCopy(pairingInfo));
};

/**
 * @return {!Object} The key remapping to apply to connections to this host.
 */
remoting.HostOptions.prototype.getRemapKeys = function() {
  if (this.remapKeys == null) {
    return (remoting.platformIsChromeOS()) ? {0x0700e4: 0x0700e7} : {};
  } else {
    return /** @type {!Object} */ (base.deepCopy(this.remapKeys));
  }
};

/**
 * @param {string|!Object} remapKeys The new key remapping, either in the new-
 *     style dictionary format, or the old-style "from>to,..." string encoding.
 */
remoting.HostOptions.prototype.setRemapKeys = function(remapKeys) {
  this.remapKeys = (typeof remapKeys == 'string')
      ? remapKeysFromString_(/** @type {string} */(remapKeys))
      : /** @type {!Object} */ (base.deepCopy(remapKeys))
};

/**
 * Save the settings for this host. Only settings that have been set using one
 * of the setter methods are saved.
 *
 * @return {Promise} Promise resolved when the save is complete.
 */
remoting.HostOptions.prototype.save = function() {
  var settings = base.copyWithoutNullFields(this);
  delete settings['hostId_'];  // No need to save the hostId

  var hostId = this.hostId_;
  return remoting.HostOptions.loadInternal_().then(
      function(/** Object */ allHosts) {
        allHosts[hostId] = settings;
        var newSettings = {};
        newSettings[remoting.HostOptions.KEY_] = JSON.stringify(allHosts);
        var deferred = new base.Deferred();
        chrome.storage.local.set(newSettings,
                                 function() { deferred.resolve(); });
        return deferred.promise();
      });
};

/**
 * Load the settings for this host.
 *
 * @return {Promise} Promise resolved when the load is complete.
 */
remoting.HostOptions.prototype.load = function() {
  var that = this;
  return remoting.HostOptions.loadInternal_().then(
      function(/** Object */ allHosts) {
        if (allHosts.hasOwnProperty(that.hostId_) &&
            typeof(allHosts[that.hostId_]) == 'object') {
          /** @type {!Object} */
          var host = allHosts[that.hostId_];
          base.mergeWithoutNullFields(that, host);
          // Older clients stored remapKeys as a string, which will be decoded
          // in setRemapKeys().
          if (typeof that.remapKeys == 'string') {
            that.setRemapKeys(/** @type {string} */ (host['remapKeys']));
          }
        }
      });
};

/**
 * Helper function for both load and save.
 *
 * @return {Promise<Object>} Promise resolved with the current settings for
 *     all hosts.
 * @private
 */
remoting.HostOptions.loadInternal_ = function() {
  var deferred = new base.Deferred();
  /**
   * @param {Object} storageResult The current options for all hosts.
   */
  var onDone = function(storageResult) {
    var result = {};
    try {
      /** @type {string} */
      var allHosts = storageResult[remoting.HostOptions.KEY_];
      if (allHosts && typeof allHosts == 'string') {
        result = base.jsonParseSafe(allHosts);
        if (typeof(result) != 'object') {
          console.error('Error loading host settings: Not an object');
          result = {};
        }
      }
    } catch (/** @type {*} */ err) {
      console.error('Error loading host settings:', err);
    }
    deferred.resolve(result);
  };
  chrome.storage.local.get(remoting.HostOptions.KEY_, onDone);
  return deferred.promise();
};

/**
 * Convert an old-style string key remapping into a new-style dictionary one.
 *
 * @param {string} remappings
 * @return {!Object} The same remapping expressed as a dictionary.
 */
function remapKeysFromString_(remappings) {
  var remappingsArr = remappings.split(',');
  var result = {};
  for (var i = 0; i < remappingsArr.length; ++i) {
    var keyCodes = remappingsArr[i].split('>');
    if (keyCodes.length != 2) {
      console.log('bad remapKey: ' + remappingsArr[i]);
      continue;
    }
    var fromKey = parseInt(keyCodes[0], 0);
    var toKey = parseInt(keyCodes[1], 0);
    if (!fromKey || !toKey) {
      console.log('bad remapKey code: ' + remappingsArr[i]);
      continue;
    }
    result[fromKey] = toKey;
  }
  return result;
};

/** @type {string} @private */
remoting.HostOptions.KEY_ = 'remoting-host-options';

})();
