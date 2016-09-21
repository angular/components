// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * A signal strategy encapsulating a primary and a back-up strategy. If the
 * primary fails or times out, then the secondary is used. Information about
 * which strategy was used, and why, is returned via |onProgressCallback|.
 *
 * @param {remoting.SignalStrategy} primary
 * @param {remoting.SignalStrategy} secondary
 *
 * @implements {remoting.SignalStrategy}
 * @constructor
 */
remoting.FallbackSignalStrategy = function(primary,
                                           secondary) {
  /** @private {remoting.SignalStrategy} */
  this.primary_ = primary;
  this.primary_.setStateChangedCallback(this.onPrimaryStateChanged_.bind(this));

  /** @private {remoting.SignalStrategy} */
  this.secondary_ = secondary;
  this.secondary_.setStateChangedCallback(
      this.onSecondaryStateChanged_.bind(this));

  /** @private {?function(remoting.SignalStrategy.State)} */
  this.onStateChangedCallback_ = null;

  /** @private {?function(Element):void} */
  this.onIncomingStanzaCallback_ = null;

  /**
   * @private {number}
   * @const
   */
  this.PRIMARY_CONNECT_TIMEOUT_MS_ = 10 * 1000;

  /**
   * @enum {string}
   * @private
   */
  this.State = {
    NOT_CONNECTED: 'not-connected',
    PRIMARY_PENDING: 'primary-pending',
    PRIMARY_SUCCEEDED: 'primary-succeeded',
    SECONDARY_PENDING: 'secondary-pending',
    SECONDARY_SUCCEEDED: 'secondary-succeeded',
    SECONDARY_FAILED: 'secondary-failed',
    CLOSED: 'closed'
  };

  /** @private {string} */
  this.state_ = this.State.NOT_CONNECTED;

  /** @private {?remoting.SignalStrategy.State} */
  this.externalState_ = null;

  /** @private {string} */
  this.server_ = '';

  /** @private {string} */
  this.username_ = '';

  /** @private {string} */
  this.authToken_ = '';

  /** @private {number} */
  this.primaryConnectTimerId_ = 0;

  /** @private */
  this.logger_ = new remoting.SessionLogger(
      remoting.ChromotingEvent.Role.CLIENT,
      remoting.TelemetryEventWriter.Client.write
  );

  /**
   * @type {Array<{strategyType: remoting.SignalStrategy.Type,
                    progress: remoting.FallbackSignalStrategy.Progress}>}
   */
  this.connectionSetupResults_ = [];

};

/**
 * @enum {string}
 */
remoting.FallbackSignalStrategy.Progress = {
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  TIMED_OUT: 'timed-out',
  SUCCEEDED_LATE: 'succeeded-late',
  FAILED_LATE: 'failed-late',
};

remoting.FallbackSignalStrategy.prototype.dispose = function() {
  this.primary_.dispose();
  this.secondary_.dispose();
};

/**
 * @param {function(remoting.SignalStrategy.State):void} onStateChangedCallback
 *   Callback to call on state change.
 */
remoting.FallbackSignalStrategy.prototype.setStateChangedCallback = function(
    onStateChangedCallback) {
  this.onStateChangedCallback_ = onStateChangedCallback;
};

/**
 * @param {?function(Element):void} onIncomingStanzaCallback Callback to call on
 *     incoming messages.
 */
remoting.FallbackSignalStrategy.prototype.setIncomingStanzaCallback =
    function(onIncomingStanzaCallback) {
  this.onIncomingStanzaCallback_ = onIncomingStanzaCallback;
  if (this.state_ == this.State.PRIMARY_PENDING ||
      this.state_ == this.State.PRIMARY_SUCCEEDED) {
    this.primary_.setIncomingStanzaCallback(onIncomingStanzaCallback);
  } else if (this.state_ == this.State.SECONDARY_PENDING ||
             this.state_ == this.State.SECONDARY_SUCCEEDED) {
    this.secondary_.setIncomingStanzaCallback(onIncomingStanzaCallback);
  }
};

/**
 * @param {string} server
 * @param {string} username
 * @param {string} authToken
 */
remoting.FallbackSignalStrategy.prototype.connect =
    function(server, username, authToken) {
  console.assert(this.state_ == this.State.NOT_CONNECTED,
                'connect() called in state ' + this.state_ + '.');
  console.assert(this.onStateChangedCallback_ != null,
                 'No state change callback registered.');
  this.server_ = server;
  this.username_ = username;
  this.authToken_ = authToken;
  this.state_ = this.State.PRIMARY_PENDING;
  this.primary_.setIncomingStanzaCallback(this.onIncomingStanzaCallback_);
  this.primary_.connect(server, username, authToken);
  this.primaryConnectTimerId_ =
      window.setTimeout(this.onPrimaryTimeout_.bind(this),
                        this.PRIMARY_CONNECT_TIMEOUT_MS_);
};

/**
 * Sends a message. Can be called only in CONNECTED state.
 * @param {string} message
 */
remoting.FallbackSignalStrategy.prototype.sendMessage = function(message) {
  this.getConnectedSignalStrategy_().sendMessage(message);
};

/** @return {remoting.SignalStrategy.State} Current state */
remoting.FallbackSignalStrategy.prototype.getState = function() {
  return (this.externalState_ === null)
      ? remoting.SignalStrategy.State.NOT_CONNECTED
      : this.externalState_;
};

/** @return {!remoting.Error} Error when in FAILED state. */
remoting.FallbackSignalStrategy.prototype.getError = function() {
  console.assert(this.state_ == this.State.SECONDARY_FAILED,
                'getError() called in state ' + this.state_ + '.');
  console.assert(
      this.secondary_.getState() == remoting.SignalStrategy.State.FAILED,
      'getError() called with secondary state ' + this.secondary_.getState() +
      '.');
  return this.secondary_.getError();
};

/** @return {string} Current JID when in CONNECTED state. */
remoting.FallbackSignalStrategy.prototype.getJid = function() {
  return this.getConnectedSignalStrategy_().getJid();
};

/** @return {remoting.SignalStrategy.Type} The signal strategy type. */
remoting.FallbackSignalStrategy.prototype.getType = function() {
  return this.getConnectedSignalStrategy_().getType();
};

/**
 * @return {remoting.SignalStrategy} The active signal strategy, if the
 *     connection has succeeded.
 * @private
 */
remoting.FallbackSignalStrategy.prototype.getConnectedSignalStrategy_ =
    function() {
  if (this.state_ == this.State.PRIMARY_SUCCEEDED) {
    console.assert(
        this.primary_.getState() == remoting.SignalStrategy.State.CONNECTED,
        'getConnectedSignalStrategy_() called with primary state ' +
        this.primary_.getState() + '.');
    return this.primary_;
  } else if (this.state_ == this.State.SECONDARY_SUCCEEDED) {
    console.assert(
        this.secondary_.getState() == remoting.SignalStrategy.State.CONNECTED,
        'getConnectedSignalStrategy_() called with secondary state ' +
        this.secondary_.getState() + '.');
    return this.secondary_;
  } else {
    console.assert(
        false,
        'getConnectedSignalStrategy() called in state ' + this.state_ + '.');
    return null;
  }
};

/**
 * @param {remoting.SignalStrategy.State} state
 * @private
 */
remoting.FallbackSignalStrategy.prototype.onPrimaryStateChanged_ =
    function(state) {
  switch (state) {
    case remoting.SignalStrategy.State.CONNECTED:
      if (this.state_ == this.State.PRIMARY_PENDING) {
        window.clearTimeout(this.primaryConnectTimerId_);
        this.updateProgress_(
            this.primary_,
            remoting.FallbackSignalStrategy.Progress.SUCCEEDED);
        this.state_ = this.State.PRIMARY_SUCCEEDED;
      } else {
        this.updateProgress_(
            this.primary_,
            remoting.FallbackSignalStrategy.Progress.SUCCEEDED_LATE);
      }
      break;

    case remoting.SignalStrategy.State.FAILED:
      if (this.state_ == this.State.PRIMARY_PENDING) {
        window.clearTimeout(this.primaryConnectTimerId_);
        this.updateProgress_(
            this.primary_,
            remoting.FallbackSignalStrategy.Progress.FAILED);
        this.connectSecondary_();
      } else {
        this.updateProgress_(
            this.primary_,
            remoting.FallbackSignalStrategy.Progress.FAILED_LATE);
      }
      return;  // Don't notify the external callback

    case remoting.SignalStrategy.State.CLOSED:
      this.state_ = this.State.CLOSED;
      break;
  }

  this.notifyExternalCallback_(state);
};

/**
 * @param {remoting.SignalStrategy.State} state
 * @private
 */
remoting.FallbackSignalStrategy.prototype.onSecondaryStateChanged_ =
    function(state) {
  switch (state) {
    case remoting.SignalStrategy.State.CONNECTED:
      this.updateProgress_(
          this.secondary_,
          remoting.FallbackSignalStrategy.Progress.SUCCEEDED);
      this.state_ = this.State.SECONDARY_SUCCEEDED;
      break;

    case remoting.SignalStrategy.State.FAILED:
      this.updateProgress_(
          this.secondary_,
          remoting.FallbackSignalStrategy.Progress.FAILED);
      this.state_ = this.State.SECONDARY_FAILED;
      break;

    case remoting.SignalStrategy.State.CLOSED:
      this.state_ = this.State.CLOSED;
      break;
  }

  this.notifyExternalCallback_(state);
};

/**
 * Notify the external callback of a change in state if it's consistent with
 * the allowed state transitions (ie, if it represents a later stage in the
 * connection process). Suppress state transitions that would violate this,
 * for example a CONNECTING -> NOT_CONNECTED transition when we switch from
 * the primary to the secondary signal strategy.
 *
 * @param {remoting.SignalStrategy.State} state
 * @private
 */
remoting.FallbackSignalStrategy.prototype.notifyExternalCallback_ =
    function(state) {
  if (this.externalState_ === null || state > this.externalState_) {
    this.externalState_ = state;
    this.onStateChangedCallback_(state);
  }
};

/**
 * @private
 */
remoting.FallbackSignalStrategy.prototype.connectSecondary_ = function() {
  console.assert(this.state_ == this.State.PRIMARY_PENDING,
                'connectSecondary_() called in state ' + this.state_ + '.');
  console.assert(this.server_ != '', 'No server address set.');
  console.assert(this.username_ != '', 'No username set.');
  console.assert(this.authToken_ != '', 'No auth token set.');

  this.state_ = this.State.SECONDARY_PENDING;
  this.primary_.setIncomingStanzaCallback(null);
  this.secondary_.setIncomingStanzaCallback(this.onIncomingStanzaCallback_);
  this.secondary_.connect(this.server_, this.username_, this.authToken_);
};

/**
 * @private
 */
remoting.FallbackSignalStrategy.prototype.onPrimaryTimeout_ = function() {
  this.updateProgress_(
      this.primary_,
      remoting.FallbackSignalStrategy.Progress.TIMED_OUT);
  this.connectSecondary_();
};

/**
 * @param {remoting.SignalStrategy} strategy
 * @param {remoting.FallbackSignalStrategy.Progress} progress
 * @private
 */
remoting.FallbackSignalStrategy.prototype.updateProgress_ = function(
    strategy, progress) {
  console.log('FallbackSignalStrategy progress: ' + strategy.getType() + ' ' +
      progress);
  this.logger_.logSignalStrategyProgress(strategy.getType(), progress);
};
