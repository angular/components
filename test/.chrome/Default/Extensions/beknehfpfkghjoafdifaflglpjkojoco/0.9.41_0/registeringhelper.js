/**
 * @fileoverview Implements a helper that allows other helpers to be registered
 * to it, at one of two priorities, remote forwarding priority and local device
 * priority.
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * @constructor
 * @implements {RequestHelper}
 */
function RegisteringHelper() {
  /**
   * @private
   *     {Object<RegisteringHelper.Priority, Helper>}
   */
  this.helpers_ = {};
}

/** @enum {number} */
RegisteringHelper.Priority = {
  REMOTE_FORWARDING_PRIORITY: 1,
  LOCAL_DEVICE_PRIORITY: 2
};

/**
 * Gets the helper at the given priority, if any.
 * @param {RegisteringHelper.Priority} priority
 * @return {(RequestHelper|undefined)} Helper, if any, at the given priority.
 * @private
 */
RegisteringHelper.prototype.getHelper_ = function(priority) {
  return this.helpers_[priority];
};

/**
 * Sets the helper at the given priority.
 * @param {RegisteringHelper.Priority} priority
 * @param {RequestHelper} helper Helper to set.
 * @private
 */
RegisteringHelper.prototype.setHelper_ = function(priority, helper) {
  this.helpers_[priority] = helper;
};

/**
 * Gets the next-higher-priority helper, if any.
 * @param {RegisteringHelper.Priority} priority Current priority.
 * @return {(RequestHelper|undefined)} Helper, if any, at a higher priority
 *     than the given priority.
 * @private
 */
RegisteringHelper.prototype.getHigherPriorityHelper_ = function(priority) {
  return this.helpers_[priority - 1];
};

/**
 * Sets the next-higher-priority helper.
 * @param {RegisteringHelper.Priority} priority Current priority.
 * @param {!RequestHelper} helper Helper to set as the higher-priority helper.
 * @private
 */
RegisteringHelper.prototype.setHigherPriorityHelper_ =
    function(priority, helper) {
  this.helpers_[priority - 1] = helper;
};

/**
 * Gets the next-lower-priority helper, if any.
 * @param {RegisteringHelper.Priority} priority Current priority.
 * @return {(RequestHelper|undefined)} Helper, if any, at a lower priority than
 *     the givepriority.
 * @private
 */
RegisteringHelper.prototype.getLowerPriorityHelper_ = function(priority) {
  return this.helpers_[priority + 1];
};

/**
 * @param {!RequestHelper} helper Helper to add.
 * @param {(RegisteringHelper.Priority|undefined)} opt_priority
 *     Priority at which to add this helper. (The default is local device
 *     priority.)
 * @param {(function(number): boolean)|undefined} opt_retryPredicate
 *     A function that returns, for a given helper error state, whether to
 *     retry the error with the next-lower-priority helper.
 */
RegisteringHelper.prototype.addHelper =
    function(helper, opt_priority, opt_retryPredicate) {
  var priority = opt_priority ? opt_priority :
      RegisteringHelper.Priority.LOCAL_DEVICE_PRIORITY;
  var existingHelper = this.getHelper_(priority);
  if (existingHelper) {
    var peerHelper = this.addHelperAsPeer_(existingHelper, helper);
    this.setHelper_(priority, peerHelper);
    // If there's a higher priority helper, it chains to the existing,
    // lower-priority one. The lower priority one may change as a result of
    // adding the new peer, so reset the higher-priority's chained helper.
    var higherPriorityHelper = this.getHigherPriorityHelper_(priority);
    if (higherPriorityHelper) {
      higherPriorityHelper.setChainedHelper(peerHelper);
    }
  } else {
    // First one at this priority?
    var lowerPriorityHelper = this.getLowerPriorityHelper_(priority);
    var higherPriorityHelper = this.getHigherPriorityHelper_(priority);
    if (lowerPriorityHelper && higherPriorityHelper) {
      // This code branch should be unreachable, because this class only
      // supports two priorities. This exception is thrown as a failsafe.
      throw new Error('More than two priorities not supported.');
    } else if (lowerPriorityHelper) {
      // If there's one of a lower priority, wrap the new helper in a chained
      // helper that chains to the lower priority one.
      var chainedHelper = new ChainedHelper(
          helper, lowerPriorityHelper, opt_retryPredicate);
      this.setHelper_(priority, chainedHelper);
    } else if (higherPriorityHelper) {
      // If there's one of a higher priority, the higher priority helper needs
      // to be chained to this one. (Because helper is the first at this
      // priority, the higher priority helper is implicitly not yet a chained
      // helper.)
      var chainedHelper = new ChainedHelper(
          higherPriorityHelper, helper, this.pendingRetryPredicate_);
      delete this.pendingRetryPredicate_;
      this.setHigherPriorityHelper_(priority, chainedHelper);
      this.setHelper_(priority, helper);
    } else {
      // First one at this priority, none at a higher or lower priority:
      // just add it, but keep the retry predicate around in case it's needed
      // later.
      this.setHelper_(priority, helper);
      /** @private {(function(number): boolean)|undefined} */
      this.pendingRetryPredicate_ = opt_retryPredicate;
    }
  }
};

/**
 * Adds a helper as a peer to an existing helper.
 * @param {!RequestHelper} existingHelper
 * @param {!RequestHelper} helper
 * @return {!RequestHelper} A helper containing the newly added helper as
 *     a peer of the existing helper.
 * @private
 */
RegisteringHelper.prototype.addHelperAsPeer_ =
    function(existingHelper, helper) {
  var delegatingHelper;
  // To make helper a peer of existingHelper, we need to add them both to a
  // delegating helper.  First we need to find whether there's an existing
  // delegating helper to add to, or whether we have to wrap the existing
  // helper in one.
  if (existingHelper.constructor == ChainedHelper) {
    // It's a chained helper: get the chained helper's delegate.
    var chainedHelper = existingHelper;
    delegatingHelper = chainedHelper.getDelegatedHelper();
    if (delegatingHelper.constructor == DelegatingHelper) {
      // If the delegate is itself a delegating helper, just add to it.
      delegatingHelper.addHelper(helper);
    } else {
      // Otherwise, wrap the existing delegate in a new delegating helper
      // and add the new helper alongside the existing delegate.
      delegatingHelper = new DelegatingHelper();
      delegatingHelper.addHelper(chainedHelper.getDelegatedHelper());
      delegatingHelper.addHelper(helper);
      chainedHelper.setDelegatedHelper(delegatingHelper);
    }
    return existingHelper;
  } else if (existingHelper.constructor == DelegatingHelper) {
    // If the existing helper helper is already a delegating helper, just
    // add the new helper to it.
    existingHelper.addHelper(helper);
    return existingHelper;
  } else {
    // Otherwise, create a delegating helper to contain the previous helper
    // and the newly added one.
    delegatingHelper = new DelegatingHelper();
    delegatingHelper.addHelper(existingHelper);
    delegatingHelper.addHelper(helper);
    return delegatingHelper;
  }
};

/**
 * Gets a handler for a request.
 * @param {HelperRequest} request The request to handle.
 * @return {RequestHandler} A handler for the request.
 */
RegisteringHelper.prototype.getHandler = function(request) {
  var helper = this.getHelper_(
      RegisteringHelper.Priority.REMOTE_FORWARDING_PRIORITY);
  if (!helper) {
    helper = this.getHelper_(
        RegisteringHelper.Priority.LOCAL_DEVICE_PRIORITY);
  }
  if (helper) {
    return helper.getHandler(request);
  }
  return null;
};
