// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// `7MM"""Mq.                       `7MM
//   MM   `MM.                        MM
//   MM   ,M9  .gP"Ya   ,6"Yb.   ,M""bMM  `7MMpMMMb.pMMMb.  .gP"Ya
//   MMmmdM9  ,M'   Yb 8)   MM ,AP    MM    MM    MM    MM ,M'   Yb
//   MM  YM.  8M""""""  ,pm9MM 8MI    MM    MM    MM    MM 8M""""""
//   MM   `Mb.YM.    , 8M   MM `Mb    MM    MM    MM    MM YM.    ,
// .JMML. .JMM.`Mbmmd' `Moo9^Yo.`Wbmd"MML..JMML  JMML  JMML.`Mbmmd'
//
// This file defines a JavaScript struct that corresponds to
// logs/proto/chromoting/chromoting_extensions.proto
//
// Please keep the two files in sync!
//

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/**
 * The members in this struct is used as the JSON payload in outgoing XHRs
 * so they must match the member definitions in chromoting_extensions.proto.
 *
 * @param {remoting.ChromotingEvent.Type} type
 *
 * @constructor
 * @struct
 */
remoting.ChromotingEvent = function(type) {
  /** @type {remoting.ChromotingEvent.Type} */
  this.type = type;
  /** @private {remoting.ChromotingEvent.Os} */
  this.os;
  /** @private {string} */
  this.os_version;
  /** @private {string} */
  this.browser_version;
  /** @private {string} */
  this.webapp_version;
  /** @type {remoting.ChromotingEvent.Os} */
  this.host_os;
  /** @type {string} */
  this.host_os_version;
  /** @type {string} */
  this.host_version;
  /** @private {string} */
  this.cpu;
  /** @type {remoting.ChromotingEvent.SessionState} */
  this.session_state;
  /** @type {remoting.ChromotingEvent.SessionState} */
  this.previous_session_state;
  /** @type {remoting.ChromotingEvent.ConnectionType} */
  this.connection_type;
  /** @private {string} */
  this.application_id;
  /** @type {string} */
  this.session_id;
  /** @type {remoting.ChromotingEvent.Role} */
  this.role;
  /** @type {remoting.ChromotingEvent.ConnectionError} */
  this.connection_error;
  /** @type {number} */
  this.session_duration;
  /** @type {number} */
  this.video_bandwidth;
  /** @type {number} */
  this.capture_latency;
  /** @type {number} */
  this.encode_latency;
  /** @type {number} */
  this.decode_latency;
  /** @type {number} */
  this.render_latency;
  /** @type {number} */
  this.roundtrip_latency;
  /** @type {number} */
  this.max_capture_latency;
  /** @type {number} */
  this.max_encode_latency;
  /** @type {number} */
  this.max_decode_latency;
  /** @type {number} */
  this.max_render_latency;
  /** @type {number} */
  this.max_roundtrip_latency;
  /** @type {remoting.ChromotingEvent.Mode} */
  this.mode;
  /** @type {remoting.ChromotingEvent.SignalStrategyType} */
  this.signal_strategy_type;
  /** @type {remoting.ChromotingEvent.SignalStrategyProgress} */
  this.signal_strategy_progress;
  /** @type {?remoting.ChromotingEvent.XmppError} */
  this.xmpp_error;
  /** @type {remoting.ChromotingEvent.SessionEntryPoint} */
  this.session_entry_point;
  /**
   * Elapsed time since last host list refresh in milliseconds.
   * @type {number}
   */
  this.host_status_update_elapsed_time;
  /** @type {remoting.ChromotingEvent.AuthMethod} */
  this.auth_method;
  /** @type {string} */
  this.raw_plugin_error;
  /** @type {remoting.ChromotingEvent.SessionSummary} */
  this.previous_session;
  /**
   * Elapsed time since the last host heartbeat in milliseconds.
   * @type {number}
   */
  this.host_last_heartbeat_elapsed_time;
  /**
    * To track features like number of ESC key press in a session.
    * @type {remoting.ChromotingEvent.FeatureTracker}
    */
  this.feature_tracker;
  this.init_();
};

/** @private */
remoting.ChromotingEvent.prototype.init_ = function() {
  // System Info.
  var systemInfo = remoting.getSystemInfo();
  this.cpu = systemInfo.cpu;
  this.os_version = systemInfo.osVersion;
  if (systemInfo.osName === remoting.Os.WINDOWS) {
    this.os = remoting.ChromotingEvent.Os.WINDOWS;
  } else if (systemInfo.osName === remoting.Os.LINUX) {
    this.os = remoting.ChromotingEvent.Os.LINUX;
  } else if (systemInfo.osName === remoting.Os.MAC) {
    this.os = remoting.ChromotingEvent.Os.MAC;
  } else if (systemInfo.osName === remoting.Os.CHROMEOS) {
    this.os = remoting.ChromotingEvent.Os.CHROMEOS;
  }
  this.browser_version = systemInfo.chromeVersion;

  // App Info.
  this.webapp_version = chrome.runtime.getManifest().version;
  this.application_id = chrome.runtime.id;
};

/**
 * Populates the corresponding fields in the logEntry based on |error|.
 *
 * @param {remoting.Error} error
 */
remoting.ChromotingEvent.prototype.setError = function(error) {
  var Tag = remoting.Error.Tag;
  var detail = /** @type {string} */ (error.getDetail());

  switch (error.getTag()) {
    case Tag.HOST_IS_OFFLINE:
      if (detail) {
        this.xmpp_error = new remoting.ChromotingEvent.XmppError(detail);
      }
      break;
    case Tag.MISSING_PLUGIN:
      console.assert(detail, 'Missing PNaCl plugin last error string.');
      this.raw_plugin_error = detail;
  }

  this.connection_error = error.toConnectionError();
};

/**
 * @param {remoting.ChromotingEvent} event
 * @return {boolean}
 */
remoting.ChromotingEvent.isEndOfSession = function(event) {
  if (event.type !== remoting.ChromotingEvent.Type.SESSION_STATE) {
    return false;
  }
  var endStates = [
    remoting.ChromotingEvent.SessionState.CLOSED,
    remoting.ChromotingEvent.SessionState.CONNECTION_DROPPED,
    remoting.ChromotingEvent.SessionState.CONNECTION_FAILED,
    remoting.ChromotingEvent.SessionState.CONNECTION_CANCELED
  ];
  return endStates.indexOf(event.session_state) !== -1;
};

/**
 * This is declared as a separate structure to match the proto format
 * on the cloud. The cloud will parse the raw stanza for more detailed
 * fields, e.g. error condition, error type, jingle action, etc.
 *
 * @param {string} stanza
 * @struct
 * @constructor
 */
remoting.ChromotingEvent.XmppError = function(stanza) {
  /** @type {string} */
  this.raw_stanza = stanza;
};

/**
 * See class comments on logs/proto/chromoting/chromoting_extensions.proto.
 *
 * @struct
 * @constructor
 */
remoting.ChromotingEvent.SessionSummary = function() {
  /** @type {string} */
  this.session_id;
  /** @type {remoting.ChromotingEvent.SessionState} */
  this.last_state;
  /** @type {remoting.ChromotingEvent.ConnectionError} */
  this.last_error;
  /** @type {number} */
  this.duration;
  /** @type {number} */
  this.session_end_elapsed_time;
  /** @type {remoting.ChromotingEvent.SessionEntryPoint} */
  this.entry_point;
};

/**
 * For tracking features like keypress count.
 * All counting fields will be initialized to 0.
 * @constructor
 */
remoting.ChromotingEvent.FeatureTracker = function() {
  /** @type {number} */
  this.fullscreen_esc_count = 0;
};

})();

/**
 * @enum {number}
 */
remoting.ChromotingEvent.Type = {
  SESSION_STATE: 1,
  CONNECTION_STATISTICS: 2,
  SESSION_ID_OLD: 3,
  SESSION_ID_NEW: 4,
  HEARTBEAT: 5,
  HEARTBEAT_REJECTED: 6,
  RESTART: 7,
  HOST_STATUS: 8,
  SIGNAL_STRATEGY_PROGRESS: 9,
  FEATURE_TRACKING: 10
};

/** @enum {number} */
remoting.ChromotingEvent.Role = {
  CLIENT: 0,
  HOST: 1
};

/** @enum {number} */
remoting.ChromotingEvent.Os = {
  LINUX: 1,
  CHROMEOS: 2,
  MAC: 3,
  WINDOWS: 4,
  OTHER: 5,
  ANDROID: 6,
  IOS: 7
};

/**
 * Convert the OS type String into the enum value.
 *
 * @param {string} type
 * @return {remoting.ChromotingEvent.Os}
 */
remoting.ChromotingEvent.toOs = function(type) {
  type = type.toLowerCase();
  switch (type) {
    case 'linux':
      return remoting.ChromotingEvent.Os.LINUX;
    case 'chromeos':
      return remoting.ChromotingEvent.Os.CHROMEOS;
    case 'mac':
      return remoting.ChromotingEvent.Os.MAC
    case 'windows':
      return remoting.ChromotingEvent.Os.WINDOWS;
    case 'android':
      return remoting.ChromotingEvent.Os.ANDROID;
    case 'ios':
      return remoting.ChromotingEvent.Os.IOS;
    default:
      return remoting.ChromotingEvent.Os.OTHER;
  }
};

/** @enum {number} */
remoting.ChromotingEvent.SessionState = {
  UNKNOWN: 1, // deprecated.
  CREATED: 2, // deprecated.
  BAD_PLUGIN_VERSION: 3, // deprecated.
  UNKNOWN_PLUGIN_ERROR: 4, // deprecated.
  CONNECTING: 5,
  INITIALIZING: 6, // deprecated.
  CONNECTED: 7,
  CLOSED: 8,
  CONNECTION_FAILED: 9,
  UNDEFINED: 10,
  PLUGIN_DISABLED: 11, // deprecated.
  CONNECTION_DROPPED: 12,
  CONNECTION_CANCELED: 13,
  AUTHENTICATED: 14,
  STARTED: 15,
  SIGNALING: 16,
  CREATING_PLUGIN: 17,
};

/** @enum {number} */
remoting.ChromotingEvent.SessionEntryPoint = {
  CONNECT_BUTTON: 1,
  RECONNECT_BUTTON: 2,
  AUTO_RECONNECT_ON_CONNECTION_DROPPED: 3,
  AUTO_RECONNECT_ON_HOST_OFFLINE: 4
};

/** @enum {number} */
remoting.ChromotingEvent.ConnectionType = {
  DIRECT: 1,
  STUN: 2,
  RELAY: 3
};

/** @enum {number} */
remoting.ChromotingEvent.ConnectionError = {
  NONE: 1,
  HOST_OFFLINE: 2,
  SESSION_REJECTED: 3,
  INCOMPATIBLE_PROTOCOL: 4,
  NETWORK_FAILURE: 5,
  UNKNOWN_ERROR: 6,
  INVALID_ACCESS_CODE: 7,
  MISSING_PLUGIN: 8,
  AUTHENTICATION_FAILED: 9,
  BAD_VERSION: 10,
  HOST_OVERLOAD: 11,
  P2P_FAILURE: 12,
  UNEXPECTED: 13,
  CLIENT_SUSPENDED: 14,
  NACL_DISABLED: 15,
  MAX_SESSION_LENGTH: 16,
  HOST_CONFIGURATION_ERROR: 17,
  NACL_PLUGIN_CRASHED: 18,
};

/** @enum {number} */
remoting.ChromotingEvent.Mode = {
  IT2ME: 1,
  ME2ME: 2,
  LGAPP: 3
};

/** @enum {number} */
remoting.ChromotingEvent.SignalStrategyType = {
  XMPP: 1,
  WCS: 2
};

/** @enum {number} */
remoting.ChromotingEvent.SignalStrategyProgress = {
  SUCCEEDED: 1,
  FAILED: 2,
  TIMED_OUT: 3,
  SUCCEEDED_LATE: 4,
  FAILED_LATE: 5
};

/** @enum {number} */
remoting.ChromotingEvent.AuthMethod = {
  PIN: 1,
  ACCESS_CODE: 2,
  PINLESS: 3,
  THIRD_PARTY: 4,
};
