// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Class to handle debug log messages sent by either the It2Me or Me2Me native
 * messaging hosts.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

/**
 * @constructor
 */
remoting.NativeMessageHostDebugMessageHandler = function() {
};

/**
 * Handle debug messages..
 *
 * @param {Object} message
 * @return {boolean} True if the message was handled.
 */
remoting.NativeMessageHostDebugMessageHandler.prototype.handleMessage =
    function(message)
{
  /** @type {string} */
  var type = base.getStringAttr(message, 'type', '');
  switch (type) {
    case '_debug_log':
      var timestamp = base.timestamp();
      var msg = base.getStringAttr(message, 'message', '<no message>');
      var severity = base.getStringAttr(message, 'severity', 'log');
      var file = base.getStringAttr(message, 'file', '<no file>');
      var line = base.getNumberAttr(message, 'line', -1);
      var location = file + ':' + line;
      var css = 'color: gray; font-style: italic'
      switch (severity) {
        case 'error':
          console.error('%s %s %c%s', timestamp, msg, css, location);
          break;
        case 'warn':
          console.warn('%s %s %c%s', timestamp, msg, css, location);
          break;
        default:
          console.log('%s %s %c%s', timestamp, msg, css, location);
      };
      return true;
  }
  return false;
};

})();
