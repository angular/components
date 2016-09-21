/**
 * @fileoverview Implements a helper that delegates to one or more helpers, and
 * if those fail, chains to another helper upon failure.
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * @param {!HelperRequest} request The request to handle.
 * @param {RequestHelper} delegatedHelper A helper to delegate to.
 * @param {RequestHelper} chainedHelper A helper to retry with on certain
 *     failures.
 * @param {(function(number): boolean|undefined)} opt_retryPredicate
 *     A function that returns, for a given helper error state, whether to retry
 *     the error with the chained helper. (Not providing the function implies
 *     the chained helper is always tried on error.)
 * @constructor
 * @implements {RequestHandler}
 */
function ChainedHandler(request, delegatedHelper, chainedHelper,
    opt_retryPredicate) {
  /** @private {!HelperRequest} */
  this.request_ = request;
  /** @private {RequestHelper} */
  this.delegatedHelper_ = delegatedHelper;
  /** @private {RequestHelper} */
  this.chainedHelper_ = chainedHelper;
  /** @private {(function(number): boolean|undefined)} */
  this.retryPredicate_ = opt_retryPredicate;

  /** @private {boolean} */
  this.done_ = false;
}

/**
 * @param {RequestHandlerCallback} cb Called with the result of the request,
 *     and an optional source for the result.
 * @return {boolean} Whether the request was accepted.
 */
ChainedHandler.prototype.run = function(cb) {
  if (this.cb_) {
    // Can only handle one request.
    return false;
  }
  /** @private {RequestHandlerCallback} */
  this.cb_ = cb;
  /** @private {RequestHandler} */
  this.handler_ = this.delegatedHelper_.getHandler(this.request_);
  if (!this.handler_) {
    return false;
  }
  return this.handler_.run(this.helperComplete_.bind(this));
};

/** Closes this helper. */
ChainedHandler.prototype.close = function() {
  this.done_ = true;
  if (this.handler_) {
    this.handler_.close();
  }
};

/**
 * Called by this helper's delegated helper upon completion.
 * @param {HelperReply} reply The result of the request.
 * @param {string=} opt_source The source of the result.
 * @private
 */
ChainedHandler.prototype.helperComplete_ = function(reply, opt_source) {
  if (this.done_) {
    var logMsg = 'delegated helper returned';
    if (reply.code !== undefined) {
      logMsg += ' ' + reply.code.toString(16);
    }
    logMsg += ' after close, ignoring';
    console.log(UTIL_fmt(logMsg));
    return;
  }
  if (reply.code) {
    console.log(UTIL_fmt('delegated helper returned ' + reply.code));
    if (!this.retryPredicate_ || this.retryPredicate_(reply.code)) {
      console.log(UTIL_fmt('retrying with chained helper'));
      this.handler_ = this.chainedHelper_.getHandler(this.request_);
      if (!this.handler_.run(this.notifyComplete_.bind(this))) {
        // Seriously, closure? Why is this cast necessary?
        var handlerFailedErrorCode =
            /** @type {DeviceStatusCodes} */ (
                DeviceStatusCodes.INVALID_DATA_STATUS);
        var error = makeHelperErrorResponse(this.request_,
            handlerFailedErrorCode);
        this.notifyComplete_(error, opt_source);
      }
    } else {
      this.notifyComplete_(reply, opt_source);
    }
  } else {
    this.notifyComplete_(reply, opt_source);
  }
};

/**
 * Call to indicate result to the caller.
 * @param {HelperReply} reply The result of the sign request.
 * @param {string=} opt_source The source of the sign result.
 * @private
 */
ChainedHandler.prototype.notifyComplete_ = function(reply, opt_source) {
  if (this.done_)
    return;
  this.close();
  this.cb_(reply, opt_source);
};

/**
 * @param {RequestHelper} delegatedHelper A helper to delegate to.
 * @param {RequestHelper} chainedHelper A helper to retry with on certain
 *     failures.
 * @param {(function(number): boolean|undefined)} opt_retryPredicate
 *     A function that returns, for a given helper error state, whether to retry
 *     the error with the chained helper. (Not providing the function implies
 *     the chained helper is always tried on error.)
 * @constructor
 * @implements {RequestHelper}
 */
function ChainedHelper(delegatedHelper, chainedHelper, opt_retryPredicate) {
  /** @private {RequestHelper} */
  this.delegatedHelper_ = delegatedHelper;
  /** @private {RequestHelper} */
  this.chainedHelper_ = chainedHelper;
  /** @private {(function(number): boolean|undefined)} */
  this.retryPredicate_ = opt_retryPredicate;
}

/**
 * @return {RequestHelper} This helper's chained helper.
 */
ChainedHelper.prototype.getChainedHelper = function() {
  return this.chainedHelper_;
};

/**
 * Resets this helper's chained helper.
 * @param {RequestHelper} helper The new chained helper.
 */
ChainedHelper.prototype.setChainedHelper = function(helper) {
  this.chainedHelper_ = helper;
};

/**
 * @return {RequestHelper} This helper's delegated helper.
 */
ChainedHelper.prototype.getDelegatedHelper = function() {
  return this.delegatedHelper_;
};

/**
 * Resets this helper's delegated helper.
 * @param {RequestHelper} helper The new delegated helper.
 */
ChainedHelper.prototype.setDelegatedHelper = function(helper) {
  this.delegatedHelper_ = helper;
};

/**
 * Gets a handler for a request.
 * @param {HelperRequest} request The request to handle.
 * @return {RequestHandler} A handler for the request.
 */
ChainedHelper.prototype.getHandler = function(request) {
  return new ChainedHandler(request, this.delegatedHelper_,
      this.chainedHelper_, this.retryPredicate_);
};
