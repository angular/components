// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Class handling creation and teardown of a remoting client session.
 *
 * The ClientSession class controls lifetime of the client plugin
 * object and provides the plugin with the functionality it needs to
 * establish connection, e.g. delivers incoming/outgoing signaling
 * messages.
 *
 * This class should not access the plugin directly, instead it should
 * do it through ClientPlugin class which abstracts plugin version
 * differences.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @param {remoting.ClientPlugin} plugin
 * @param {remoting.SignalStrategy} signalStrategy Signal strategy.
 * @param {remoting.SessionLogger} logger
 * @param {remoting.ClientSession.EventHandler} listener
 *
 * @constructor
 * @extends {base.EventSourceImpl}
 * @implements {base.Disposable}
 * @implements {remoting.ClientPlugin.ConnectionEventHandler}
 */
remoting.ClientSession = function(
    plugin, signalStrategy, logger, listener) {
  base.inherits(this, base.EventSourceImpl);

  /** @private */
  this.state_ = remoting.ClientSession.State.INITIALIZING;

  /** @private {!remoting.Error} */
  this.error_ = remoting.Error.none();

  /** @private {remoting.Host} */
  this.host_ = null;

  /** @private {remoting.CredentialsProvider} */
  this.credentialsProvider_ = null;

  /** @private */
  this.sessionId_ = '';

  /** @private */
  this.listener_ = listener;

  /** @private */
  this.hasReceivedFrame_ = false;

  /** @private */
  this.logger_ = logger;

  /** @private */
  this.signalStrategy_ = signalStrategy;

  var state = this.signalStrategy_.getState();
  console.assert(state == remoting.SignalStrategy.State.CONNECTED,
                 'ClientSession ctor called in state ' + state + '.');
  this.signalStrategy_.setIncomingStanzaCallback(
      this.onIncomingMessage_.bind(this));

  /** @private {remoting.FormatIq} */
  this.iqFormatter_ = null;

  /** @private {remoting.XmppErrorCache} */
  this.xmppErrorCache_ = new remoting.XmppErrorCache();


  /** @private {remoting.ClientPlugin} */
  this.plugin_ = plugin;
  plugin.setConnectionEventHandler(this);

  /** @private  */
  this.connectedDisposables_ = new base.Disposables();

  this.defineEvents(Object.keys(remoting.ClientSession.Events));
};

/** @enum {string} */
remoting.ClientSession.Events = {
  videoChannelStateChanged: 'videoChannelStateChanged'
};

/**
 * @interface
 * [START]-------> [onConnected] ------> [onDisconnected]
 *    |
 *    |-----> [OnConnectionFailed]
 *
 */
remoting.ClientSession.EventHandler = function() {};

/**
 * Called when the connection failed before it is connected.
 *
 * @param {!remoting.Error} error
 */
remoting.ClientSession.EventHandler.prototype.onConnectionFailed =
    function(error) {};

/**
 * Called when a new session has been connected.  The |connectionInfo| will be
 * valid until onDisconnected() is called.
 *
 * @param {!remoting.ConnectionInfo} connectionInfo
 */
remoting.ClientSession.EventHandler.prototype.onConnected =
    function(connectionInfo) {};

/**
 * Called when the current session has been disconnected.
 *
 * @param {!remoting.Error} reason Reason that the session is disconnected.
 *     Set to remoting.Error.none() if there is no error.
 */
remoting.ClientSession.EventHandler.prototype.onDisconnected =
    function(reason) {};

// Note that the positive values in both of these enums are copied directly
// from connection_to_host.h and must be kept in sync. Code in
// chromoting_instance.cc converts the C++ enums into strings that must match
// the names given here.
// The negative values represent state transitions that occur within the
// web-app that have no corresponding plugin state transition.
//
// TODO(kelvinp): Merge this enum with remoting.ChromotingEvent.SessionState
// once we have migrated away from XMPP-based logging (crbug.com/523423).
//
// NOTE: The enums here correspond to the Chromoting.Connections enumerated
// histogram defined in src/tools/metrics/histograms/histograms.xml. UMA
// histograms don't work well with negative values, so only non-negative values
// have been used for Chromoting.Connections.
// The maximum values for the UMA enumerated histogram is included here for use
// when uploading values to UMA.
// The 2 lists should be kept in sync, and any new enums should be append-only.
/** @enum {number} */
remoting.ClientSession.State = {
  MIN_STATE_ENUM: -3,
  CONNECTION_CANCELED: -3,  // Connection closed (gracefully) before connecting.
  CONNECTION_DROPPED: -2,  // Succeeded, but subsequently closed with an error.
  CREATED: -1,
  UNKNOWN: 0,
  INITIALIZING: 1,
  CONNECTING: 2,
  AUTHENTICATED: 3,
  CONNECTED: 4,
  CLOSED: 5,
  FAILED: 6,
  MAX_STATE_ENUM: 6,
};

/**
 * @param {string} state The state name.
 * @return {remoting.ClientSession.State} The session state enum value.
 */
remoting.ClientSession.State.fromString = function(state) {
  if (!remoting.ClientSession.State.hasOwnProperty(state)) {
    throw "Invalid ClientSession.State: " + state;
  }
  return remoting.ClientSession.State[state];
};

/** @enum {number} */
remoting.ClientSession.ConnectionError = {
  UNKNOWN: -1,
  NONE: 0,
  HOST_IS_OFFLINE: 1,
  SESSION_REJECTED: 2,
  INCOMPATIBLE_PROTOCOL: 3,
  NETWORK_FAILURE: 4,
  HOST_OVERLOAD: 5,
  MAX_SESSION_LENGTH: 6,
  HOST_CONFIGURATION_ERROR: 7,
  NACL_PLUGIN_CRASHED: 8
};

/**
 * @param {string} error The connection error name.
 * @return {remoting.ClientSession.ConnectionError} The connection error enum.
 */
remoting.ClientSession.ConnectionError.fromString = function(error) {
  if (!remoting.ClientSession.ConnectionError.hasOwnProperty(error)) {
    console.error('Unexpected ClientSession.ConnectionError string: ', error);
    return remoting.ClientSession.ConnectionError.UNKNOWN;
  }
  return remoting.ClientSession.ConnectionError[error];
}

/**
 * Type used for performance statistics collected by the plugin.
 * @constructor
 */
remoting.ClientSession.PerfStats = function() {};
/** @type {number} */
remoting.ClientSession.PerfStats.prototype.videoBandwidth;
/** @type {number} */
remoting.ClientSession.PerfStats.prototype.videoFrameRate;
/** @type {number} */
remoting.ClientSession.PerfStats.prototype.captureLatency;
/** @type {number} */
remoting.ClientSession.PerfStats.prototype.encodeLatency;
/** @type {number} */
remoting.ClientSession.PerfStats.prototype.decodeLatency;
/** @type {number} */
remoting.ClientSession.PerfStats.prototype.renderLatency;
/** @type {number} */
remoting.ClientSession.PerfStats.prototype.roundtripLatency;

// Keys for connection statistics.
remoting.ClientSession.STATS_KEY_VIDEO_BANDWIDTH = 'videoBandwidth';
remoting.ClientSession.STATS_KEY_VIDEO_FRAME_RATE = 'videoFrameRate';
remoting.ClientSession.STATS_KEY_CAPTURE_LATENCY = 'captureLatency';
remoting.ClientSession.STATS_KEY_ENCODE_LATENCY = 'encodeLatency';
remoting.ClientSession.STATS_KEY_DECODE_LATENCY = 'decodeLatency';
remoting.ClientSession.STATS_KEY_RENDER_LATENCY = 'renderLatency';
remoting.ClientSession.STATS_KEY_ROUNDTRIP_LATENCY = 'roundtripLatency';

/**
 * Set of capabilities for which hasCapability() can be used to test.
 *
 * @enum {string}
 */
remoting.ClientSession.Capability = {
  // When enabled this capability causes the client to send its screen
  // resolution to the host once connection has been established. See
  // this.plugin_.notifyClientResolution().
  SEND_INITIAL_RESOLUTION: 'sendInitialResolution',

  // Let the host know that we're interested in knowing whether or not it
  // rate limits desktop-resize requests.
  // TODO(kelvinp): This has been supported since M-29.  Currently we only have
  // <1000 users on M-29 or below. Remove this and the capability on the host.
  RATE_LIMIT_RESIZE_REQUESTS: 'rateLimitResizeRequests',

  // Indicates native touch input support. If the host does not support
  // touch then the client will let Chrome synthesize mouse events from touch
  // input, for compatibility with non-touch-aware systems.
  TOUCH_EVENTS: 'touchEvents',

  // Indicates whether the client supports security key request forwarding.
  SECURITY_KEY: 'securityKey',
};

/**
 * Connects to |host| using |credentialsProvider| as the credentails.
 *
 * @param {remoting.Host} host
 * @param {remoting.CredentialsProvider} credentialsProvider
 */
remoting.ClientSession.prototype.connect = function(host, credentialsProvider) {
  this.host_ = host;
  this.credentialsProvider_ = credentialsProvider;
  this.iqFormatter_ =
      new remoting.FormatIq(this.signalStrategy_.getJid(), host.jabberId);
  this.plugin_.connect(this.host_, this.signalStrategy_.getJid(),
                       credentialsProvider);
};

/**
 * Disconnect the current session with a particular |error|.  The session will
 * raise a |stateChanged| event in response to it.  The caller should then call
 * dispose() to remove and destroy the <embed> element.
 *
 * @param {!remoting.Error} error The reason for the disconnection.  Use
 *    remoting.Error.none() if there is no error.
 * @return {void} Nothing.
 */
remoting.ClientSession.prototype.disconnect = function(error) {
  if (this.isFinished()) {
    // Do not send the session-terminate Iq if disconnect() is already called or
    // if it is initiated by the host.
    return;
  }

  console.assert(this.host_ != null, 'disconnect() is called before connect()');
  this.sendIq_(
    '<cli:iq ' +
        'to="' + this.host_.jabberId + '" ' +
        'type="set" ' +
        'id="session-terminate" ' +
        'xmlns:cli="jabber:client">' +
      '<jingle ' +
          'xmlns="urn:xmpp:jingle:1" ' +
          'action="session-terminate" ' +
          'sid="' + this.sessionId_ + '">' +
        '<reason><success/></reason>' +
      '</jingle>' +
    '</cli:iq>');

  var state = remoting.ClientSession.State.FAILED;
  if (error.hasTag(
          remoting.Error.Tag.NONE,
          remoting.Error.Tag.CLIENT_SUSPENDED)) {
    state = remoting.ClientSession.State.CLOSED;
  }

  this.error_ = error;
  this.setState_(state);
};

/**
 * Deletes the <embed> element from the container and disconnects.
 *
 * @return {void} Nothing.
 */
remoting.ClientSession.prototype.dispose = function() {
  base.dispose(this.connectedDisposables_);
  this.connectedDisposables_ = null;
  base.dispose(this.plugin_);
  this.plugin_ = null;
};

/**
 * @return {remoting.ClientSession.State} The current state.
 */
remoting.ClientSession.prototype.getState = function() {
  return this.state_;
};

/**
 * @return {remoting.SessionLogger}.
 */
remoting.ClientSession.prototype.getLogger = function() {
  return this.logger_;
};

/**
 * @return {!remoting.Error} The current error code.
 */
remoting.ClientSession.prototype.getError = function() {
  return this.error_;
};

/**
 * Drop the session when the computer is suspended for more than
 * |suspendDurationInMS|.
 *
 * @param {number} suspendDurationInMS maximum duration of suspension allowed
 *     before the session will be dropped.
 */
remoting.ClientSession.prototype.dropSessionOnSuspend = function(
    suspendDurationInMS) {
  if (this.state_ !== remoting.ClientSession.State.CONNECTED) {
    console.error('The session is not connected.');
    return;
  }

  var suspendDetector = new remoting.SuspendDetector(suspendDurationInMS);
  this.connectedDisposables_.add(
      suspendDetector,
      new base.EventHook(
          suspendDetector, remoting.SuspendDetector.Events.resume,
          this.disconnect.bind(
              this, new remoting.Error(remoting.Error.Tag.CLIENT_SUSPENDED))));
};

/**
 * Called when the client receives its first frame.
 *
 * @return {void} Nothing.
 */
remoting.ClientSession.prototype.onFirstFrameReceived = function() {
  this.hasReceivedFrame_ = true;
};

/**
 * @return {boolean} Whether the client has received a video buffer.
 */
remoting.ClientSession.prototype.hasReceivedFrame = function() {
  return this.hasReceivedFrame_;
};

/**
 * Sends a signaling message.
 *
 * @param {string} message XML string of IQ stanza to send to server.
 * @return {void} Nothing.
 * @private
 */
remoting.ClientSession.prototype.sendIq_ = function(message) {
  // Extract the session id, so we can close the session later.
  var parser = new DOMParser();
  var iqNode = parser.parseFromString(message, 'text/xml').firstChild;
  var jingleNode = iqNode.firstChild;
  if (jingleNode) {
    var action = jingleNode.getAttribute('action');
    if (jingleNode.nodeName == 'jingle' && action == 'session-initiate') {
      this.sessionId_ = jingleNode.getAttribute('sid');
    }
  }

  console.log(base.timestamp() + this.iqFormatter_.prettifySendIq(message));
  if (this.signalStrategy_.getState() !=
      remoting.SignalStrategy.State.CONNECTED) {
    console.log("Message above is dropped because signaling is not connected.");
    return;
  }

  this.signalStrategy_.sendMessage(message);
};

/**
 * @param {string} message XML string of IQ stanza to send to server.
 */
remoting.ClientSession.prototype.onOutgoingIq = function(message) {
  this.sendIq_(message);
};

/**
 * @param {string} msg
 */
remoting.ClientSession.prototype.onDebugMessage = function(msg) {
  console.log('plugin: ' + msg.trimRight());
};

/**
 * @param {Element} message
 * @private
 */
remoting.ClientSession.prototype.onIncomingMessage_ = function(message) {
  if (!this.plugin_) {
    return;
  }
  var formatted = new XMLSerializer().serializeToString(message);
  console.log(base.timestamp() +
              this.iqFormatter_.prettifyReceiveIq(formatted));
  this.xmppErrorCache_.processStanza(message);
  this.plugin_.onIncomingIq(formatted);
};

/**
 * Callback that the plugin invokes to indicate that the connection
 * status has changed.
 *
 * @param {remoting.ClientSession.State} status The plugin's status.
 * @param {remoting.ClientSession.ConnectionError} error The plugin's error
 *        state, if any.
 */
remoting.ClientSession.prototype.onConnectionStatusUpdate =
    function(status, error) {
  if (status == remoting.ClientSession.State.FAILED) {
    var errorTag = remoting.Error.Tag.UNEXPECTED;
    switch (error) {
      case remoting.ClientSession.ConnectionError.HOST_IS_OFFLINE:
        errorTag = remoting.Error.Tag.HOST_IS_OFFLINE;
        break;
      case remoting.ClientSession.ConnectionError.SESSION_REJECTED:
        errorTag = remoting.Error.Tag.INVALID_ACCESS_CODE;
        break;
      case remoting.ClientSession.ConnectionError.INCOMPATIBLE_PROTOCOL:
        errorTag = remoting.Error.Tag.INCOMPATIBLE_PROTOCOL;
        break;
      case remoting.ClientSession.ConnectionError.NETWORK_FAILURE:
        errorTag = remoting.Error.Tag.P2P_FAILURE;
        break;
      case remoting.ClientSession.ConnectionError.HOST_OVERLOAD:
        errorTag = remoting.Error.Tag.HOST_OVERLOAD;
        break;
      case remoting.ClientSession.ConnectionError.MAX_SESSION_LENGTH:
        errorTag = remoting.Error.Tag.MAX_SESSION_LENGTH;
        break;
      case remoting.ClientSession.ConnectionError.HOST_CONFIGURATION_ERROR:
        errorTag = remoting.Error.Tag.HOST_CONFIGURATION_ERROR;
        break;
      case remoting.ClientSession.ConnectionError.NACL_PLUGIN_CRASHED:
        errorTag = remoting.Error.Tag.NACL_PLUGIN_CRASHED;
        break;
      default:
        this.error_ = remoting.Error.unexpected();
    }
    this.error_ = new remoting.Error(
        errorTag, this.xmppErrorCache_.getFirstErrorStanza());
  }
  this.setState_(status);
};

/**
 * Callback that the plugin invokes to indicate that the connection type for
 * a channel has changed.
 *
 * @param {string} channel The channel name.
 * @param {string} connectionType The new connection type.
 * @private
 */
remoting.ClientSession.prototype.onRouteChanged = function(channel,
                                                           connectionType) {
  this.logger_.setConnectionType(connectionType);
};

/**
 * Callback that the plugin invokes to indicate when the connection is
 * ready.
 *
 * @param {boolean} ready True if the connection is ready.
 */
remoting.ClientSession.prototype.onConnectionReady = function(ready) {
  // TODO(jamiewalch): Currently, the logic for determining whether or not the
  // connection is available is based solely on whether or not any video frames
  // have been received recently. which leads to poor UX on slow connections.
  // Re-enable this once crbug.com/435315 has been fixed.
  var ignoreVideoChannelState = true;
  if (ignoreVideoChannelState) {
    console.log('Video channel ' + (ready ? '' : 'not ') + 'ready.');
    return;
  }

  this.raiseEvent(remoting.ClientSession.Events.videoChannelStateChanged,
                  ready);
};

/** @return {boolean} */
remoting.ClientSession.prototype.isFinished = function() {
  var finishedStates = [
    remoting.ClientSession.State.CLOSED,
    remoting.ClientSession.State.FAILED,
    remoting.ClientSession.State.CONNECTION_CANCELED,
    remoting.ClientSession.State.CONNECTION_DROPPED
  ];
  return finishedStates.indexOf(this.getState()) !== -1;
};
/**
 * @param {remoting.ClientSession.State} newState The new state for the session.
 * @return {void} Nothing.
 * @private
 */
remoting.ClientSession.prototype.setState_ = function(newState) {
  // If we are at a finished state, ignore further state changes.
  if (this.isFinished()) {
    return;
  }

  var oldState = this.state_;
  this.state_ = this.translateState_(oldState, newState);

  if (newState == remoting.ClientSession.State.CONNECTED) {
    this.connectedDisposables_.add(
        new base.RepeatingTimer(this.reportStatistics.bind(this), 1000));
    if (this.plugin_.hasCapability(
          remoting.ClientSession.Capability.TOUCH_EVENTS)) {
      this.plugin_.enableTouchEvents(true);
    }
  } else if (this.isFinished()) {
    base.dispose(this.connectedDisposables_);
    this.connectedDisposables_ = null;
  }

  this.logAuthMethod_();
  this.notifyStateChanges_(oldState, this.state_);
  // Record state count in an UMA enumerated histogram.
  recordState(this.state_);
  this.logger_.logSessionStateChange(toSessionState(this.state_), this.error_);
};

/** @private */
remoting.ClientSession.prototype.logAuthMethod_ = function() {
  // The AuthMethod is undefined before the AUTHENTICATED stage for a
  // successful connection or the FAILED stage for a failed connection.
  if (this.state_ == remoting.ClientSession.State.AUTHENTICATED ||
      this.state_ == remoting.ClientSession.State.FAILED) {
    var authMethod = this.credentialsProvider_.getAuthMethod();
    if (authMethod != null) {
      this.logger_.setAuthMethod(authMethod);
    }
  }
};

/**
 * Records a Chromoting Connection State, stored in an UMA enumerated histogram.
 * @param {remoting.ClientSession.State} state State identifier.
 */
function recordState(state) {
  // According to src/base/metrics/histogram.h, for a UMA enumerated histogram,
  // the upper limit should be 1 above the max-enum.
  var histogram_max = remoting.ClientSession.State.MAX_STATE_ENUM -
      remoting.ClientSession.State.MIN_STATE_ENUM + 1;

  var metricDescription = {
    metricName: 'Chromoting.Connections',
    type: 'histogram-linear',
    // According to histogram.h, minimum should be 1. Values less than minimum
    // end up in the 0th bucket.
    min: 1,
    max: histogram_max,
    // The # of buckets should include 1 for underflow.
    buckets: histogram_max + 1
  };

  chrome.metricsPrivate.recordValue(metricDescription, state -
      remoting.ClientSession.State.MIN_STATE_ENUM);
}

/**
 * @param {remoting.ClientSession.State} oldState The new state for the session.
 * @param {remoting.ClientSession.State} newState The new state for the session.
 * @private
 */
remoting.ClientSession.prototype.notifyStateChanges_ =
    function(oldState, newState) {
  var error = this.getError();
  switch (this.state_) {
    case remoting.ClientSession.State.CONNECTED:
      console.log('Connection established.');
      var connectionInfo = new remoting.ConnectionInfo(
          this.host_, this.credentialsProvider_, this, this.plugin_);
      this.listener_.onConnected(connectionInfo);
      break;

    case remoting.ClientSession.State.CONNECTING:
      remoting.identity.getEmail().then(function(/** string */ email) {
        console.log('Connecting as ' + email);
      });
      break;

    case remoting.ClientSession.State.AUTHENTICATED:
      console.log('Connection authenticated.');
      break;

    case remoting.ClientSession.State.INITIALIZING:
      console.log('Connection initializing .');
      break;

    case remoting.ClientSession.State.CLOSED:
      console.log('Connection closed.');
      this.listener_.onDisconnected(error);
      break;

    case remoting.ClientSession.State.CONNECTION_CANCELED:
    case remoting.ClientSession.State.FAILED:
      if (!error.isNone()) {
        console.error('Connection failed: ' + error.toString());
      }
      this.listener_.onConnectionFailed(error);
      break;

    case remoting.ClientSession.State.CONNECTION_DROPPED:
      console.error('Connection dropped: ' + error.toString());
      this.listener_.onDisconnected(error);
      break;

    default:
      console.error('Unexpected client plugin state: ' + newState);
  }
};

/**
 * TODO(kelvinp): Consolidate the two enums (crbug.com/504200)
 * @param {remoting.ClientSession.State} state
 * @return {remoting.ChromotingEvent.SessionState}
 */
function toSessionState(state) {
  var SessionState = remoting.ChromotingEvent.SessionState;
  switch(state) {
    case remoting.ClientSession.State.UNKNOWN:
      return SessionState.UNKNOWN;
    case remoting.ClientSession.State.INITIALIZING:
      return SessionState.INITIALIZING;
    case remoting.ClientSession.State.CONNECTING:
      return SessionState.CONNECTING;
    case remoting.ClientSession.State.AUTHENTICATED:
      return SessionState.AUTHENTICATED;
    case remoting.ClientSession.State.CONNECTED:
      return SessionState.CONNECTED;
    case remoting.ClientSession.State.CLOSED:
      return SessionState.CLOSED;
    case remoting.ClientSession.State.FAILED:
      return SessionState.CONNECTION_FAILED;
    case remoting.ClientSession.State.CONNECTION_DROPPED:
      return SessionState.CONNECTION_DROPPED;
    case remoting.ClientSession.State.CONNECTION_CANCELED:
      return SessionState.CONNECTION_CANCELED;
    default:
      throw new Error('Unknown session state : ' + state);
  }
}

/**
 * @param {remoting.ClientSession.State} previous
 * @param {remoting.ClientSession.State} current
 * @return {remoting.ClientSession.State}
 * @private
 */
remoting.ClientSession.prototype.translateState_ = function(previous, current) {
  var State = remoting.ClientSession.State;
  if (previous == State.CONNECTING || previous == State.AUTHENTICATED) {
    if (current == State.CLOSED) {
      return remoting.ClientSession.State.CONNECTION_CANCELED;
    }
  } else if (previous == State.CONNECTED && current == State.FAILED) {
    return State.CONNECTION_DROPPED;
  }
  return current;
};

/** @private */
remoting.ClientSession.prototype.reportStatistics = function() {
  this.logger_.logStatistics(this.plugin_.getPerfStats());
};
