/**
 * @fileoverview Provides a countdown-based timer implementation.
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * Constructs a new timer.  The timer has a very limited resolution, and does
 * not attempt to be millisecond accurate. Its intended use is as a
 * low-precision timer that pauses while debugging.
 * @param {!SystemTimer} sysTimer The system timer implementation.
 * @param {number=} timeoutMillis how long, in milliseconds, the countdown
 *     lasts.
 * @param {Function=} cb called back when the countdown expires.
 * @constructor
 * @implements {Countdown}
 */
function CountdownTimer(sysTimer, timeoutMillis, cb) {
  /** @private {!SystemTimer} */
  this.sysTimer_ = sysTimer;
  this.remainingMillis = 0;
  this.setTimeout(timeoutMillis || 0, cb);
}

/** Timer interval */
CountdownTimer.TIMER_INTERVAL_MILLIS = 200;

/**
 * Sets a new timeout for this timer. Only possible if the timer is not
 * currently active.
 * @param {number} timeoutMillis how long, in milliseconds, the countdown lasts.
 * @param {Function=} cb called back when the countdown expires.
 * @return {boolean} whether the timeout could be set.
 */
CountdownTimer.prototype.setTimeout = function(timeoutMillis, cb) {
  if (this.timeoutId)
    return false;
  if (!timeoutMillis || timeoutMillis < 0)
    return false;
  this.remainingMillis = timeoutMillis;
  this.cb = cb;
  if (this.remainingMillis > CountdownTimer.TIMER_INTERVAL_MILLIS) {
    this.timeoutId =
        this.sysTimer_.setInterval(this.timerTick.bind(this),
            CountdownTimer.TIMER_INTERVAL_MILLIS);
  } else {
    // Set a one-shot timer for the last interval.
    this.timeoutId =
        this.sysTimer_.setTimeout(
            this.timerTick.bind(this), this.remainingMillis);
  }
  return true;
};

/** Clears this timer's timeout. Timers that are cleared become expired. */
CountdownTimer.prototype.clearTimeout = function() {
  if (this.timeoutId) {
    this.sysTimer_.clearTimeout(this.timeoutId);
    this.timeoutId = undefined;
  }
  this.remainingMillis = 0;
};

/**
 * @return {number} how many milliseconds are remaining until the timer expires.
 */
CountdownTimer.prototype.millisecondsUntilExpired = function() {
  return this.remainingMillis > 0 ? this.remainingMillis : 0;
};

/** @return {boolean} whether the timer has expired. */
CountdownTimer.prototype.expired = function() {
  return this.remainingMillis <= 0;
};

/**
 * Constructs a new clone of this timer, while overriding its callback.
 * @param {Function=} cb callback for new timer.
 * @return {!Countdown} new clone.
 */
CountdownTimer.prototype.clone = function(cb) {
  return new CountdownTimer(this.sysTimer_, this.remainingMillis, cb);
};

/** Timer callback. */
CountdownTimer.prototype.timerTick = function() {
  this.remainingMillis -= CountdownTimer.TIMER_INTERVAL_MILLIS;
  if (this.expired()) {
    this.sysTimer_.clearTimeout(this.timeoutId);
    this.timeoutId = undefined;
    if (this.cb) {
      this.cb();
    }
  }
};

/**
 * A factory for creating CountdownTimers.
 * @param {!SystemTimer} sysTimer The system timer implementation.
 * @constructor
 * @implements {CountdownFactory}
 */
function CountdownTimerFactory(sysTimer) {
  /** @private {!SystemTimer} */
  this.sysTimer_ = sysTimer;
}

/**
 * Creates a new timer.
 * @param {number} timeoutMillis How long, in milliseconds, the countdown lasts.
 * @param {function()=} opt_cb Called back when the countdown expires.
 * @return {!Countdown} The timer.
 */
CountdownTimerFactory.prototype.createTimer =
    function(timeoutMillis, opt_cb) {
  return new CountdownTimer(this.sysTimer_, timeoutMillis, opt_cb);
};

/**
 * Minimum timeout attenuation, below which a response couldn't be reasonably
 * guaranteed, in seconds.
 * @const
 */
var MINIMUM_TIMEOUT_ATTENUATION_SECONDS = 1;

/**
 * @param {number} timeoutSeconds Timeout value in seconds.
 * @param {number=} opt_attenuationSeconds Attenuation value in seconds.
 * @return {number} The timeout value, attenuated to ensure a response can be
 *     given before the timeout's expiration.
 */
function attenuateTimeoutInSeconds(timeoutSeconds, opt_attenuationSeconds) {
  var attenuationSeconds =
      opt_attenuationSeconds || MINIMUM_TIMEOUT_ATTENUATION_SECONDS;
  if (timeoutSeconds < attenuationSeconds)
    return 0;
  return timeoutSeconds - attenuationSeconds;
}

/**
 * Default request timeout when none is present in the request, in seconds.
 * @const
 */
var DEFAULT_REQUEST_TIMEOUT_SECONDS = 30;

/**
 * Gets the timeout value from the request, if any, substituting
 * opt_defaultTimeoutSeconds or DEFAULT_REQUEST_TIMEOUT_SECONDS if the request
 * does not contain a timeout value.
 * @param {Object} request The request containing the timeout.
 * @param {number=} opt_defaultTimeoutSeconds
 * @return {number} Timeout value, in seconds.
 */
function getTimeoutValueFromRequest(request, opt_defaultTimeoutSeconds) {
  var timeoutValueSeconds;
  if (request.hasOwnProperty('timeoutSeconds')) {
    timeoutValueSeconds = request['timeoutSeconds'];
  } else if (request.hasOwnProperty('timeout')) {
    timeoutValueSeconds = request['timeout'];
  } else if (opt_defaultTimeoutSeconds !== undefined) {
    timeoutValueSeconds = opt_defaultTimeoutSeconds;
  } else {
    timeoutValueSeconds = DEFAULT_REQUEST_TIMEOUT_SECONDS;
  }
  return timeoutValueSeconds;
}

/**
 * Creates a new countdown for the given timeout value, attenuated to ensure a
 * response is given prior to the countdown's expiration, using the given timer
 * factory.
 * @param {CountdownFactory} timerFactory The factory to use.
 * @param {number} timeoutValueSeconds
 * @param {number=} opt_attenuationSeconds Attenuation value in seconds.
 * @return {!Countdown} A countdown timer.
 */
function createAttenuatedTimer(timerFactory, timeoutValueSeconds,
    opt_attenuationSeconds) {
  timeoutValueSeconds = attenuateTimeoutInSeconds(timeoutValueSeconds,
      opt_attenuationSeconds);
  return timerFactory.createTimer(timeoutValueSeconds * 1000);
}
