/**
 * @fileoverview Provides an implementation of the SystemTimer interface based
 * on window's timer methods.
 */
'use strict';

/**
 * Creates an implementation of the SystemTimer interface based on window's
 * timer methods.
 * @constructor
 * @implements {SystemTimer}
 */
function WindowTimer() {
}

/**
 * Sets a single-shot timer.
 * @param {function()} func Called back when the timer expires.
 * @param {number} timeoutMillis How long until the timer fires, in
 *     milliseconds.
 * @return {number} A timeout ID, which can be used to cancel the timer.
 */
WindowTimer.prototype.setTimeout = function(func, timeoutMillis) {
  return window.setTimeout(func, timeoutMillis);
};

/**
 * Clears a previously set timer.
 * @param {number} timeoutId The ID of the timer to clear.
 */
WindowTimer.prototype.clearTimeout = function(timeoutId) {
  window.clearTimeout(timeoutId);
};

/**
 * Sets a repeating interval timer.
 * @param {function()} func Called back each time the timer fires.
 * @param {number} timeoutMillis How long until the timer fires, in
 *     milliseconds.
 * @return {number} A timeout ID, which can be used to cancel the timer.
 */
WindowTimer.prototype.setInterval = function(func, timeoutMillis) {
  return window.setInterval(func, timeoutMillis);
};

/**
 * Clears a previously set interval timer.
 * @param {number} timeoutId The ID of the timer to clear.
 */
WindowTimer.prototype.clearInterval = function(timeoutId) {
  window.clearInterval(timeoutId);
};
