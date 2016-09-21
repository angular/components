// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Intercept and record various classes of log messages. By default, such
 * messages will be reported by Chrome Developer Tools as coming from this
 * file, making source-line hyperlinks useless. To fix this click the "gear"
 * icon in Developer Tools, click "Manage framework blocking..." under
 * "Sources" and add console_wrapper.js as a "Blackbox" component.
 */


/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

/**
 * @constructor
 * @private
 */
remoting.ConsoleWrapper = function() {
  console.assert(instance_ == null,
                 'Duplicate remoting.ConsoleWrapper constructor.');
  /** @private {number} The number of log entries to save. */
  this.historyMaxSize_ = 0;
  /** @private {Array<remoting.ConsoleWrapper.LogEntry>} */
  this.history_ = [];
  /** @private {Object<function(*)>} */
  this.savedMethods_ = {};
};

/**
 * Activate the console wrapper for the specified log types.
 *
 * @param {number} historyMaxSize The number of log entries to keep.
 * @param {...remoting.ConsoleWrapper.LogType} var_logTypes The log types to
 *     intercept.
 * @suppress {reportUnknownTypes}
 */
remoting.ConsoleWrapper.prototype.activate =
    function(historyMaxSize, var_logTypes) {
  this.historyMaxSize_ = historyMaxSize;
  this.history_ = [];
  // Restore previous wrappers.
  for (var key in remoting.ConsoleWrapper.LogType) {
    var type = remoting.ConsoleWrapper.LogType[key];
    if (this.savedMethods_[type]) {
      console[type] = this.savedMethods_[type];
      delete this.savedMethods_[type];
    }
  }
  // Activate new wrappers
  for (var i = 1; i < arguments.length; ++i) {
    var type = arguments[i];
    this.savedMethods_[type] = console[type];
    console[arguments[i]] = this.recordAndLog_.bind(this, arguments[i]);
  }
};

/**
 * Deactivate the console wrapper for all log types.
 */
remoting.ConsoleWrapper.prototype.deactivate = function() {
  this.activate(0);
};

/**
 * @return {Array<remoting.ConsoleWrapper.LogEntry>} The most recent log
 *     entries as configured by activate().
 */
remoting.ConsoleWrapper.prototype.getHistory = function() {
  return this.history_;
};

/**
 * @param {remoting.ConsoleWrapper.LogType} type The type of log.
 * @param {...*} var_args The items to log.
 * @private
 * @suppress {reportUnknownTypes}
 */
remoting.ConsoleWrapper.prototype.recordAndLog_ =
    function(type, var_args) {
  // Construct a new arguments array by removing the first argument.
  var args = Array.prototype.slice.call(arguments, 1);
  // Find the caller, ignoring the top-most stack frame.
  var caller = new base.Callstack().callstack[1];
  var location = 'unknown';
  if (caller) {
    location = caller.file + ':' + caller.line;
  }
  // Save to history.
  if (this.historyMaxSize_ > 0) {
    var log = {
      type: type,
      message: JSON.stringify(args),
      caller: location,
      timestamp: new Date()
    };
    // Only save assertions if they fail.
    if (log.type != 'assert' || !args[0]) {
      this.history_.push(log);
      if (this.history_.length > this.historyMaxSize_) {
        this.history_.shift();
      }
    }
  }
  // Log the message, appending the caller.
  // TODO(jamiewalch): Make the caller gray so that it's less intrusive. This
  // can be done using a %c formatter in the first argument, but care needs to
  // be taken to support the multi-argument case.
  args.push(location);
  this.savedMethods_[type].apply(console, args);
}

/**
 * @type {remoting.ConsoleWrapper}
 */
var instance_ = null;

/**
 * @return {remoting.ConsoleWrapper} The singleton ConsoleWrapper.
 */
remoting.ConsoleWrapper.getInstance = function() {
  if (!instance_) {
    instance_ = new remoting.ConsoleWrapper();
  }
  return instance_;
};

})();

/**
 * @typedef {{type: string, message: string, caller: string, timestamp: Date}}
 */
remoting.ConsoleWrapper.LogEntry;

/**
 * @enum {string} The log types that can be intercepted. These must match the
 *     names of the corresponding console methods.
 */
remoting.ConsoleWrapper.LogType = {
  LOG: 'log',
  WARN: 'warn',
  ERROR: 'error',
  ASSERT: 'assert'
};
