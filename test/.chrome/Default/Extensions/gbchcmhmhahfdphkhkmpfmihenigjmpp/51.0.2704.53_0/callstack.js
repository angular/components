// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** @suppress {duplicate} */
var base = base || {};

/**
 * A single stack-frame describing a call-site.
 *
 *   fn:     The calling function.
 *   url:    URL component of the file name. For extensions, this will typically
 *           be chrome-extension://<id>
 *   file:   The file containing the calling function.
 *   line:   The line number.
 *   column: The column number.
 *
 * @typedef {{
 *   fn: string,
 *   url: string,
 *   file: string,
 *   line: number,
 *   column: number
 * }}
 */
base.StackFrame;


(function() {

/**
 * @param {Error=} opt_error If present, an Error object from which to extract
 *     the callstack; if not specified, the current callstack (excluding this
 *     constructor) will be used.
 * @constructor
 */
base.Callstack = function(opt_error) {
  /** @type {Array<base.StackFrame>} */
  this.callstack = [];

  this.getCallstackFromError_(opt_error || new Error());

  // If no explicit Error was specified, remove this frame from the stack.
  if (!opt_error) {
    this.callstack.splice(0, 1);
  }
};

/**
 * @return {string} The callstack as a newline-separated string.
 */
base.Callstack.prototype.toString = function() {
  /**
   * @param {base.StackFrame} frame
   * @return {string}
   */
  var frameToString = function(frame) {
    var location = frame.file + ':' + frame.line + ':' + frame.column;
    if (frame.url) {
      location = frame.url + '/' + location;
    }
    if (frame.fn) {
      location = ' (' + location + ')';
    }
    return frame.fn + location;
  }

  return this.callstack.map(frameToString).join('\n');
};

/**
 * Parse the callstack of the specified Error.
 *
 * @param {Error} error
 * @private
 */
base.Callstack.prototype.getCallstackFromError_ = function(error) {
  /**
   * @param {string} frame
   * @return {base.StackFrame}
   */
  var stringToFrame = function(frame) {
    var result = {};
    // Function name (optional) and location are separated by a space. If a
    // function name is present, location is enclosed in parentheses.
    var fnAndLocation = frame.split(' ');
    var location = fnAndLocation.pop().replace(/[()]/g, '');
    result.fn = fnAndLocation.shift() || '';
    // Location, line and column are separated by colons. Colons are also
    // used to separate the protocol and URL, so there may be more than two
    // colons in the location.
    var fullUrlAndLineAndCol = location.split(':');
    result.column = parseInt(fullUrlAndLineAndCol.pop(), 10);
    result.line = parseInt(fullUrlAndLineAndCol.pop(), 10);
    var fullUrl = fullUrlAndLineAndCol.join(':');
    // URL and file are separated by slashes. Slashes also separate the protocol
    // and URL.
    var urlAndFile = fullUrl.split('/');
    result.file = urlAndFile.pop();
    result.url = urlAndFile.join('/');
    return result;
  };

  var callstack = error.stack
      .replace(/^\s+at\s+/gm, '') // Remove 'at' and indentation.
      .split('\n');
  callstack.splice(0, 1); // Remove 'Error'
  this.callstack = callstack.map(stringToFrame);
}

})();
