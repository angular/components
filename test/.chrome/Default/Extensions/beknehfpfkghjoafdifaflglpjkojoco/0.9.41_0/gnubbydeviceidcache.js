/**
 * @fileoverview Description of this file.
 */
'use strict';

/**
 * @typedef {{
 *   lastUsed: number,
 *   properties: (Object|undefined)
 * }}
 */
var GnubbyDeviceIdCacheEntry;

/**
 * Fixed-size cache of GnubbyDeviceIds, retaining the most-recently-used
 * entries.
 * @param {number=} opt_size Number of entries to cache. If no value is
 *     provided, DEFAULT_CACHE_SIZE entries are cached.
 * @constructor
 */
function GnubbyDeviceIdCache(opt_size) {
  /** @private {number} */
  this.size_ = opt_size || GnubbyDeviceIdCache.DEFAULT_CACHE_SIZE;
  /** @private {!Object<string, GnubbyDeviceIdCacheEntry>} */
  this.entries_ = {};
  /** @private {!Array<string>} */
  this.indexes_ = [];
}

/**
 * Default number of entries to cache.
 * @const
 */
GnubbyDeviceIdCache.DEFAULT_CACHE_SIZE = 2;

/**
 * Adds an entry to the cache. As a side effect, if the cache is already full,
 * a previously-cached entry may be evicted.
 * @param {GnubbyDeviceId} id Device id to cache.
 * @param {Object=} opt_properties Properties to store for the device id.
 */
GnubbyDeviceIdCache.prototype.add = function(id, opt_properties) {
  var index = JSON.stringify(id);
  var now = Date.now();
  if (this.entries_.hasOwnProperty(index)) {
    this.update(id, opt_properties);
  } else {
    var entry = {
      lastUsed: now
    };
    if (opt_properties) {
      entry.properties = opt_properties;
    }
    if (this.indexes_.length >= this.size_) {
      var droppedIndex = this.indexes_.pop();
      delete this.entries_[droppedIndex];
    }
    this.indexes_.unshift(index);
    this.entries_[index] = entry;
  }
};

/**
 * Updates an existing entry in the cache.
 * @param {GnubbyDeviceId} id Device id to cache.
 * @param {Object=} opt_properties Properties to store for the device id.
 * @return {boolean} Whether the device id is in the cache.
 */
GnubbyDeviceIdCache.prototype.update = function(id, opt_properties) {
  var index = JSON.stringify(id);
  if (!this.entries_.hasOwnProperty(index)) {
    return false;
  }
  var oldIndex = this.indexes_.indexOf(index);
  if (oldIndex != -1) {
    this.indexes_.splice(oldIndex, 1);
  }
  this.indexes_.unshift(index);
  this.entries_[index].lastUsed = Date.now();
  if (opt_properties) {
    this.entries_[index].properties = opt_properties;
  }
  return true;
};

/**
 * Returns whether the device id is present in the cache.
 * @param {GnubbyDeviceId} id Device id to cache.
 * @return {boolean} Whether the id is present.
 */
GnubbyDeviceIdCache.prototype.hasId = function(id) {
  var index = JSON.stringify(id);
  return this.entries_.hasOwnProperty(index);
};

/**
 * Returns the properties, if any, associated with the device id.
 * @param {GnubbyDeviceId} id Device id to cache.
 * @return {Object|undefined} The device properties.
 */
GnubbyDeviceIdCache.prototype.getProperties = function(id) {
  var index = JSON.stringify(id);
  if (!this.entries_.hasOwnProperty(index)) {
    return undefined;
  }
  return this.entries_[index].properties;
}

/**
 * Removes the device id from the cache, if it's present.
 * @param {GnubbyDeviceId} id Device id to cache.
 */
GnubbyDeviceIdCache.prototype.remove = function(id) {
  var index = JSON.stringify(id);
  if (!this.entries_.hasOwnProperty(index)) {
    return;
  }
  delete this.entries_[index];
};
