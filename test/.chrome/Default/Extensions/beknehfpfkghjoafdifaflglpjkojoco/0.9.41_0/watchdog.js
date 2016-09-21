/**
 * @fileoverview Provides a watchdog around a collection of callback functions.
 */
'use strict';

/**
 * Creates a watchdog around a collection of callback functions,
 * ensuring at least one of them is called before the timeout expires.
 * If a timeout function is provided, calls the timeout function upon timeout
 * expiration if none of the callback functions has been called.
 * @param {number} timeoutValueSeconds Timeout value, in seconds.
 * @param {function()=} opt_timeoutCb Callback function to call on timeout.
 * @constructor
 * @implements {Closeable}
 */
function WatchdogRequestHandler(timeoutValueSeconds, opt_timeoutCb) {
  /** @private {number} */
  this.timeoutValueSeconds_ = timeoutValueSeconds;
  /** @private {function()|undefined} */
  this.timeoutCb_ = opt_timeoutCb;
  /** @private {boolean} */
  this.calledBack_ = false;
  /** @private {Countdown} */
  this.timer_ = FACTORY_REGISTRY.getCountdownFactory().createTimer(
      this.timeoutValueSeconds_ * 1000, this.timeout_.bind(this));
  /** @private {Closeable|undefined} */
  this.closeable_ = undefined;
  /** @private {boolean} */
  this.closed_ = false;
}

/**
 * Wraps a callback function, such that the fact that the callback function
 * was or was not called gets tracked by this watchdog object.
 * @param {function(...?)} cb The callback function to wrap.
 * @return {function(...?)} A wrapped callback function.
 */
WatchdogRequestHandler.prototype.wrapCallback = function(cb) {
  return this.wrappedCallback_.bind(this, cb);
};

/** Closes this watchdog. */
WatchdogRequestHandler.prototype.close = function() {
  this.closed_ = true;
  this.timer_.clearTimeout();
  if (this.closeable_) {
    this.closeable_.close();
    this.closeable_ = undefined;
  }
};

/**
 * Sets this watchdog's closeable.
 * @param {!Closeable} closeable The closeable.
 */
WatchdogRequestHandler.prototype.setCloseable = function(closeable) {
  this.closeable_ = closeable;
};

/**
 * Called back when the watchdog expires.
 * @private
 */
WatchdogRequestHandler.prototype.timeout_ = function() {
  if (!this.calledBack_ && !this.closed_) {
    var logMsg = 'Not called back within ' + this.timeoutValueSeconds_ +
        ' second timeout';
    if (this.timeoutCb_) {
      logMsg += ', calling default callback';
      console.warn(UTIL_fmt(logMsg));
      this.timeoutCb_();
    } else {
      console.warn(UTIL_fmt(logMsg));
    }
  }
};

/**
 * Wrapped callback function.
 * @param {function(...?)} cb The callback function to call.
 * @param {...?} var_args The callback function's arguments.
 * @private
 */
WatchdogRequestHandler.prototype.wrappedCallback_ = function(cb, var_args) {
  if (!this.closed_) {
    this.calledBack_ = true;
    this.timer_.clearTimeout();
    var originalArgs = Array.prototype.slice.call(arguments, 1);
    cb.apply(null, originalArgs);
  }
};
