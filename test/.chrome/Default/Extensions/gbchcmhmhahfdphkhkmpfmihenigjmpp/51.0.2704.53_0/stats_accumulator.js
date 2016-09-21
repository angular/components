// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * The webapp reads the plugin's connection statistics frequently (once per
 * second). It logs statistics to the server less frequently, to keep
 * bandwidth and storage costs down. This class bridges that gap, by
 * accumulating high-frequency numeric data, and providing statistics
 * summarising that data.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @constructor
 */
remoting.StatsAccumulator = function() {
  /**
   * A map from names to lists of values.
   * @private {Object<Array<number>>}
   */
  this.valueLists_ = {};

  /**
   * The first time, after this object was most recently initialized or emptied,
   * at which a value was added to this object.
   * @private {?number}
   */
  this.timeOfFirstValue_ = null;
};

/**
 * Adds values to this object.
 *
 * @param {Object<number>} newValues
 */
remoting.StatsAccumulator.prototype.add = function(newValues) {
  for (var key in newValues) {
    this.getValueList(key).push(newValues[key]);
  }
  if (this.timeOfFirstValue_ === null) {
    this.timeOfFirstValue_ = new Date().getTime();
  }
};

/**
 * Empties this object.
 */
remoting.StatsAccumulator.prototype.empty = function() {
  this.valueLists_ = {};
  this.timeOfFirstValue_ = null;
};

/**
 * Gets the number of milliseconds since the first value was added to this
 * object, after this object was most recently initialized or emptied.
 *
 * @return {number} milliseconds since the first value
 */
remoting.StatsAccumulator.prototype.getTimeSinceFirstValue = function() {
  if (this.timeOfFirstValue_ === null) {
    return 0;
  }
  return new Date().getTime() - this.timeOfFirstValue_;
};

/**
 * Calculates the mean of the values for a given key.
 *
 * @param {string} key
 * @return {number} the mean of the values for that key
 */
remoting.StatsAccumulator.prototype.calcMean = function(key) {
  /**
   * @param {Array<number>} values
   * @return {number}
   */
  var calcMean = function(values) {
    if (values.length == 0) {
      return 0.0;
    }
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
      sum += values[i];
    }
    return sum / values.length;
  };
  return this.map(key, calcMean);
};

/**
 * Finds the max of the values for a given key.
 *
 * @param {string} key
 * @return {number} the max of the values for that key
 */
remoting.StatsAccumulator.prototype.calcMax = function(key) {
  /**
   * @param {Array<number>} values
   * @return {number}
   */
  var calcMax = function(values) {
    if (!values || !values.length) {
      return 0;
    }
    return Math.max.apply(null, values);
  };
  return this.map(key, calcMax);
};

/**
 * Applies a given map to the list of values for a given key.
 *
 * @param {string} key
 * @param {function(Array<number>): number} map
 * @return {number} the result of applying that map to the list of values for
 *     that key
 */
remoting.StatsAccumulator.prototype.map = function(key, map) {
  return map(this.getValueList(key));
};

/**
 * Gets the list of values for a given key.
 * If this object contains no values for that key, then this routine creates
 * an empty list, stores it in this object, and returns it.
 *
 * @private
 * @param {string} key
 * @return {Array<number>} the list of values for that key
 */
remoting.StatsAccumulator.prototype.getValueList = function(key) {
  var valueList = this.valueLists_[key];
  if (!valueList) {
    valueList = [];
    this.valueLists_[key] = valueList;
  }
  return valueList;
};

/**
 * @return {?remoting.ClientSession.PerfStats} returns null if all fields are
 *     zero.
 */
remoting.StatsAccumulator.prototype.getPerfStats = function() {
  var stats = new remoting.ClientSession.PerfStats();
  stats.videoBandwidth = this.calcMean('videoBandwidth');
  stats.captureLatency = this.calcMean('captureLatency');
  stats.maxCaptureLatency = this.calcMax('maxCaptureLatency');
  stats.encodeLatency = this.calcMean('encodeLatency');
  stats.maxEncodeLatency = this.calcMax('maxEncodeLatency');
  stats.decodeLatency = this.calcMean('decodeLatency');
  stats.maxDecodeLatency = this.calcMax('maxDecodeLatency');
  stats.renderLatency = this.calcMean('renderLatency');
  stats.maxRenderLatency = this.calcMax('maxRenderLatency');
  stats.roundtripLatency = this.calcMean('roundtripLatency');
  stats.maxRoundtripLatency = this.calcMax('maxRoundtripLatency');

  for (var key in stats) {
    if (stats[key] !== 0) {
      return stats;
    }
  }
  return null;
};