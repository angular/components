// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

remoting.TelemetryEventWriter = function() {};

/** @enum {string} */
var IpcNames = {
  WRITE: 'remoting.TelemetryEventWriter.write'
};

/**
 * @param {base.Ipc} ipc
 * @param {remoting.XhrEventWriter} eventWriter
 * @constructor
 * @implements {base.Disposable}
 */
remoting.TelemetryEventWriter.Service = function(ipc, eventWriter) {
  /** @private */
  this.eventWriter_ = eventWriter;
  /** @private */
  this.ipc_ = ipc;
  /** @private {base.Disposables} */
  this.eventHooks_ = new base.Disposables();

  /** @private */
  this.sessionMonitor_ = new SessionMonitor(this.eventWriter_);
};

/** @return {Promise} */
remoting.TelemetryEventWriter.Service.prototype.init = function() {
  /** @this {remoting.TelemetryEventWriter.Service} */
  function init() {
    this.eventHooks_.add(
        new base.DomEventHook(window, 'online',
                              this.eventWriter_.flush.bind(this.eventWriter_),
                              false),
        new base.ChromeEventHook(chrome.runtime.onSuspend,
                                 this.onSuspend_.bind(this)));

    this.ipc_.register(IpcNames.WRITE, this.write.bind(this));
    this.eventWriter_.flush();
  }
  // Only listen for new incoming requests after we have loaded the pending
  // ones.  This will ensure that we always process the requests in order.
  return this.eventWriter_.loadPendingRequests().then(init.bind(this));
};

remoting.TelemetryEventWriter.Service.prototype.dispose = function() {
  this.ipc_.unregister(IpcNames.WRITE);
  base.dispose(this.eventHooks_);
  this.eventHooks_ = null;
};

/**
 * Unbind any sessions that are associated with |windowId|.
 * @param {string} windowId
 */
remoting.TelemetryEventWriter.Service.prototype.unbindSession =
  function(windowId) {
    this.sessionMonitor_.unbindSession(windowId);
};

/**
 * @param {string} windowId  The source window id of the IPC.
 * @param {!Object} event  The event to be written to the server.
 */
remoting.TelemetryEventWriter.Service.prototype.write =
    function(windowId, event) {
  this.sessionMonitor_.trackSessionStateChanges(windowId, event);
  this.eventWriter_.write(event);
};

/**
 * @private
 */
remoting.TelemetryEventWriter.Service.prototype.onSuspend_ = function() {
  this.eventWriter_.writeToStorage();
};

/** @return {remoting.TelemetryEventWriter.Service} */
remoting.TelemetryEventWriter.Service.create = function() {
  return new remoting.TelemetryEventWriter.Service(
      base.Ipc.getInstance(),
      new remoting.XhrEventWriter(
          remoting.settings.TELEMETRY_API_BASE_URL,
          chrome.storage.local,
          'pending-log-requests'));
};

remoting.TelemetryEventWriter.Client = function() {};

/**
 * @param {!Object} event
 * @return {Promise} A promise that resolves when the log message is sent to the
 *     logging service.
 */
remoting.TelemetryEventWriter.Client.write = function(event) {
  return base.Ipc.invoke(IpcNames.WRITE, chrome.app.window.current().id, event);
};


/**
 * @struct
 * @constructor
 * @param {remoting.ChromotingEvent} event
 */
function SessionInfo(event) {
  this.event = event;
  this.timestamp = Date.now();
}

/**
 * When a window is closed using the context menu, the foreground page doesn't
 * have a chance to intercept the close event.
 * This class keeps track of all foreground windows with ongoing sessions, so
 * that we can report session termination when they are closed.
 *
 * @param {remoting.XhrEventWriter} eventWriter
 * @constructor
 */
var SessionMonitor = function(eventWriter) {
  /** @private */
  this.eventWriter_ = eventWriter;
  /** @private {Map<string, SessionInfo>} */
  this.sessionMap_ = new Map();
};

/**
 * @param {string} windowId
 * @param {Object} entry
 */
SessionMonitor.prototype.trackSessionStateChanges = function(windowId, entry) {
  var event = /** @type {remoting.ChromotingEvent} */ (base.deepCopy(entry));

  if (event.type !== remoting.ChromotingEvent.Type.SESSION_STATE) {
    return;
  }

  if (remoting.ChromotingEvent.isEndOfSession(event)) {
    this.sessionMap_.delete(windowId);
  } else {
    this.sessionMap_.set(windowId, new SessionInfo(event));
  }
};

/**
 * Unbinds a session with |windowId| and log any close events if necessary.
 * @param {string} windowId
 */
SessionMonitor.prototype.unbindSession = function(windowId) {
  if (this.sessionMap_.has(windowId)) {
    var sessionInfo = this.sessionMap_.get(windowId);
    console.assert(sessionInfo !== undefined);
    var event = createSessionEndEvent(/** @type {SessionInfo} */ (sessionInfo));
    this.eventWriter_.write(/** @type {Object} */ (event));
    this.sessionMap_.delete(windowId);
  }
};

/**
 * Inspects |sessionInfo| to generate a session termination state.  This is
 * called when the user closes the window using the context menu such that we
 * won't get a proper termination event.
 *
 * @param {SessionInfo} sessionInfo
 * @return {remoting.ChromotingEvent}
 */
function createSessionEndEvent(sessionInfo) {
  var event =
      /** @type{remoting.ChromotingEvent} */ (base.deepCopy(sessionInfo.event));
  var SessionState = remoting.ChromotingEvent.SessionState;

  switch (event.session_state) {
    case SessionState.STARTED:
    case SessionState.SIGNALING:
    case SessionState.CREATING_PLUGIN:
    case SessionState.CONNECTING:
    case SessionState.AUTHENTICATED:
      event.session_state = SessionState.CONNECTION_CANCELED;
      break;
    default:
      event.session_state = SessionState.CLOSED;
  }
  var elapsed = (Date.now() - sessionInfo.timestamp) / 1000.0;
  event.session_duration +=  elapsed;
  return event;
}

})();
