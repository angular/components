/**
 * @fileoverview Implements a delegating helper, i.e. one that delegates its
 * operations to other helpers.
 * @author juanlang@google.com (Juan Lang)
 */

/**
 * @typedef {{
 *   helper: !RequestHelper,
 *   handler: RequestHandler,
 *   complete: boolean
 * }}
 */
var DelegatedHandlerTracker;

/**
 * @param {!HelperRequest} request Request to handle.
 * @param {!Array<!RequestHelper>} helpers Helpers to delegate to.
 * @constructor
 * @implements {RequestHandler}
 */
function DelegatingRequestHandler(request, helpers) {
  /** @private {!HelperRequest} */
  this.request_ = request;
  /** @private {!Array<!DelegatedHandlerTracker>} */
  this.trackers_ = [];
  for (var i = 0; i < helpers.length; i++) {
    var tracker = {
      helper: helpers[i],
      handler: null,
      done: false
    };
    this.trackers_.push(tracker);
  }
  /** @private {boolean} */
  this.done_ = false;
  /** @private {number} */
  this.stillRunningHelpers_ = 0;
}

/**
 * @param {RequestHandlerCallback} cb Called with the result of the request and
 *     an optional source for the result.
 * @return {boolean} Whether any of this helper's helpers accepted the request.
 */
DelegatingRequestHandler.prototype.run = function(cb) {
  if (this.cb_) {
    // Can only handle one request.
    return false;
  }
  /** @private {RequestHandlerCallback} */
  this.cb_ = cb;

  var accepted = false;
  for (var i = 0; i < this.trackers_.length; i++) {
    var tracker = this.trackers_[i];
    tracker.handler = tracker.helper.getHandler(this.request_);
    if (tracker.handler) {
      if (tracker.handler.run(this.helperComplete_.bind(this, tracker, i))) {
        console.log(UTIL_fmt('helper ' + i + ' accepted request'));
        accepted = true;
        this.stillRunningHelpers_++;
      }
    }
  }
  return accepted;
};

/** Closes this helper. */
DelegatingRequestHandler.prototype.close = function() {
  this.done_ = true;
  for (var i = 0; i < this.trackers_.length; i++) {
    if (this.trackers_[i].handler) {
      this.trackers_[i].handler.close();
    }
  }
};

/**
 * Called by a helper upon completion.
 * @param {DelegatedHandlerTracker} tracker The object tracking the helper.
 * @param {number} index The index of the helper that completed.
 * @param {HelperReply} reply The result of the sign request.
 * @param {string=} opt_source The source of the sign result.
 * @private
 */
DelegatingRequestHandler.prototype.helperComplete_ =
    function(tracker, index, reply, opt_source) {
  var logMsg = 'helper ' + index + ' completed ';
  if (reply.code !== undefined) {
    logMsg += 'with ' + reply.code.toString(16);
  }
  if (this.done_) {
    logMsg += ' after completion, ignoring';
    console.log(UTIL_fmt(logMsg));
    return;
  }
  if (tracker.complete) {
    logMsg += ' after helper completion, ignoring';
    console.warn(UTIL_fmt(logMsg));
    return;
  }
  console.log(UTIL_fmt(logMsg));
  tracker.complete = true;
  if (reply.code) {
    if (!this.stillRunningHelpers_) {
      console.error('Wtf? helperComplete has no helper left.');
    } else if (!--this.stillRunningHelpers_) {
      this.close();
      console.log(UTIL_fmt('last delegated helper completed, returning ' +
          reply.code.toString(16)));
      this.cb_(reply, opt_source);
    }
  } else {
    this.close();
    this.cb_(reply, opt_source);
  }
};

/**
 * A helper that delegates to other helpers.
 * @constructor
 * @implements {RequestHelper}
 */
function DelegatingHelper() {
  /** @private {!Array<!RequestHelper>} */
  this.helpers_ = [];
  /** @private {!Object<string, string>} */
  this.externalHelperIds_ = {};
}

/**
 * Adds a helper to this helper's helpers, if it's not already present.
 * @param {!RequestHelper} helper Helper to add.
 */
DelegatingHelper.prototype.addHelper = function(helper) {
  // The external helper is a little special, because it's dynamically
  // created and registered in response to registration events, and could be
  // registered more than once. (It sucks to have to do this, but without a
  // pattern like Java's .equals(), I'm not sure what else to do.)
  if (helper.constructor == ExternalHelper) {
    if (!this.externalHelperIds_[helper.getHelperAppId()]) {
      this.externalHelperIds_[helper.getHelperAppId()] =
          helper.getHelperAppId();
      this.helpers_.push(helper);
    } else {
      // Same app id already exists, but maybe it's gotten stale for whatever
      // reason. Replace the existing helper with the one given.
      var found = false;
      for (var i = 0; i < this.helpers_.length; i++) {
        if (this.helpers_[i].constructor == ExternalHelper &&
            this.helpers_[i].getHelperAppId() == helper.getHelperAppId()) {
          this.helpers_[i] = helper;
          found = true;
          break;
        }
      }
      if (!found) {
        // Inconsistent state, the app id was in this.externalHelperIds_ but
        // not found in this.helpers_. Just add to this.helpers_.
        this.helpers_.push(helper);
      }
    }
  } else if (this.helpers_.indexOf(helper) == -1) {
    this.helpers_.push(helper);
  }
};

/**
 * Gets a handler for a request.
 * @param {HelperRequest} request The request to handle.
 * @return {RequestHandler} A handler for the request.
 */
DelegatingHelper.prototype.getHandler = function(request) {
  var handler = new DelegatingRequestHandler(request, this.helpers_);
  return /** @type {RequestHandler} */ (handler);
};
