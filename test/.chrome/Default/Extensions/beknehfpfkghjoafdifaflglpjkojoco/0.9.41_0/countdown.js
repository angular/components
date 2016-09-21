/**
 * @fileoverview Provides a countdown-based timer interface.
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * A countdown timer.
 * @interface
 */
function Countdown() {}

/**
 * Sets a new timeout for this timer.
 * @param {number} timeoutMillis how long, in milliseconds, the countdown lasts.
 * @param {Function=} cb called back when the countdown expires.
 * @return {boolean} whether the timeout could be set.
 */
Countdown.prototype.setTimeout = function(timeoutMillis, cb) {};

/** Clears this timer's timeout. Timers that are cleared become expired. */
Countdown.prototype.clearTimeout = function() {};

/**
 * @return {number} how many milliseconds are remaining until the timer expires.
 */
Countdown.prototype.millisecondsUntilExpired = function() {};

/** @return {boolean} whether the timer has expired. */
Countdown.prototype.expired = function() {};

/**
 * Constructs a new clone of this timer, while overriding its callback.
 * @param {Function=} cb callback for new timer.
 * @return {!Countdown} new clone.
 */
Countdown.prototype.clone = function(cb) {};

/**
 * A factory to create countdown timers.
 * @interface
 */
function CountdownFactory() {}

/**
 * Creates a new timer.
 * @param {number} timeoutMillis How long, in milliseconds, the countdown lasts.
 * @param {function()=} opt_cb Called back when the countdown expires.
 * @return {!Countdown} The timer.
 */
CountdownFactory.prototype.createTimer = function(timeoutMillis, opt_cb) {};
