/**
 * @fileoverview Provides an interface representing the browser/extension
 * system's timer interface.
 */
'use strict';

/**
 * An interface representing the browser/extension system's timer interface.
 * @interface
 */
function SystemTimer() {}

/**
 * Sets a single-shot timer.
 * @param {function()} func Called back when the timer expires.
 * @param {number} timeoutMillis How long until the timer fires, in
 *     milliseconds.
 * @return {number} A timeout ID, which can be used to cancel the timer.
 */
SystemTimer.prototype.setTimeout = function(func, timeoutMillis) {};

/**
 * Clears a previously set timer.
 * @param {number} timeoutId The ID of the timer to clear.
 */
SystemTimer.prototype.clearTimeout = function(timeoutId) {};

/**
 * Sets a repeating interval timer.
 * @param {function()} func Called back each time the timer fires.
 * @param {number} timeoutMillis How long until the timer fires, in
 *     milliseconds.
 * @return {number} A timeout ID, which can be used to cancel the timer.
 */
SystemTimer.prototype.setInterval = function(func, timeoutMillis) {};

/**
 * Clears a previously set interval timer.
 * @param {number} timeoutId The ID of the timer to clear.
 */
SystemTimer.prototype.clearInterval = function(timeoutId) {};
