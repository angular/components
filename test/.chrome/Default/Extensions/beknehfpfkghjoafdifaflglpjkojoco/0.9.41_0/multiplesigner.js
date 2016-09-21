/**
 * @fileoverview A multiple gnubby signer wraps the process of opening a number
 * of gnubbies, signing each challenge in an array of challenges until a
 * success condition is satisfied, and yielding each succeeding gnubby.
 *
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * @typedef {{
 *   code: number,
 *   gnubbyId: GnubbyDeviceId,
 *   challenge: (SignHelperChallenge|undefined),
 *   info: (ArrayBuffer|undefined)
 * }}
 */
var MultipleSignerResult;

/**
 * Creates a new sign handler that manages signing with all the available
 * gnubbies.
 * @param {boolean} forEnroll Whether this signer is signing for an attempted
 *     enroll operation.
 * @param {function(boolean)} allCompleteCb Called when this signer completes
 *     sign attempts, i.e. no further results will be produced. The parameter
 *     indicates whether any gnubbies are present that have not yet produced a
 *     final result.
 * @param {function(MultipleSignerResult, boolean)} gnubbyCompleteCb
 *     Called with each gnubby/challenge that yields a final result, along with
 *     whether this signer expects to produce more results. The boolean is a
 *     hint rather than a promise: it's possible for this signer to produce
 *     further results after saying it doesn't expect more, or to fail to
 *     produce further results after saying it does.
 * @param {number} timeoutMillis A timeout value, beyond whose expiration the
 *     signer will not attempt any new operations, assuming the caller is no
 *     longer interested in the outcome.
 * @param {string=} opt_logMsgUrl A URL to post log messages to.
 * @constructor
 */
function MultipleGnubbySigner(forEnroll, allCompleteCb, gnubbyCompleteCb,
    timeoutMillis, opt_logMsgUrl) {
  /** @private {boolean} */
  this.forEnroll_ = forEnroll;
  /** @private {function(boolean)} */
  this.allCompleteCb_ = allCompleteCb;
  /** @private {function(MultipleSignerResult, boolean)} */
  this.gnubbyCompleteCb_ = gnubbyCompleteCb;
  /** @private {string|undefined} */
  this.logMsgUrl_ = opt_logMsgUrl;

  /** @private {Array<SignHelperChallenge>} */
  this.challenges_ = [];
  /** @private {boolean} */
  this.challengesSet_ = false;
  /** @private {boolean} */
  this.complete_ = false;
  /** @private {number} */
  this.numComplete_ = 0;
  /** @private {!Object<string, GnubbyTracker>} */
  this.gnubbies_ = {};
  /** @private {Countdown} */
  this.timer_ = DEVICE_FACTORY_REGISTRY.getCountdownFactory()
      .createTimer(timeoutMillis);
  /** @private {Countdown} */
  this.reenumerateTimer_ = DEVICE_FACTORY_REGISTRY.getCountdownFactory()
      .createTimer(timeoutMillis);
}

/**
 * @typedef {{
 *   index: string,
 *   signer: SingleGnubbySigner,
 *   stillGoing: boolean,
 *   errorStatus: number
 * }}
 */
var GnubbyTracker;

/**
 * Closes this signer's gnubbies, if any are open.
 */
MultipleGnubbySigner.prototype.close = function() {
  for (var k in this.gnubbies_) {
    this.gnubbies_[k].signer.close();
  }
  this.reenumerateTimer_.clearTimeout();
  this.timer_.clearTimeout();
  if (this.reenumerateIntervalTimer_) {
    this.reenumerateIntervalTimer_.clearTimeout();
  }
};

/**
 * Begins signing the given challenges.
 * @param {Array<SignHelperChallenge>} challenges The challenges to sign.
 * @return {boolean} whether the challenges were successfully added.
 */
MultipleGnubbySigner.prototype.doSign = function(challenges) {
  if (this.challengesSet_) {
    // Can't add new challenges once they're finalized.
    return false;
  }

  if (challenges) {
    for (var i = 0; i < challenges.length; i++) {
      var decodedChallenge = {};
      var challenge = challenges[i];
      decodedChallenge['challengeHash'] =
          B64_decode(challenge['challengeHash']);
      decodedChallenge['appIdHash'] = B64_decode(challenge['appIdHash']);
      decodedChallenge['keyHandle'] = B64_decode(challenge['keyHandle']);
      if (challenge['version']) {
        decodedChallenge['version'] = challenge['version'];
      }
      this.challenges_.push(decodedChallenge);
    }
  }
  this.challengesSet_ = true;
  this.enumerateGnubbies_();
  return true;
};

/**
 * Signals this signer to rescan for gnubbies. Useful when the caller has
 * knowledge that the last device has been removed, and can notify this class
 * before it will discover it on its own.
 */
MultipleGnubbySigner.prototype.reScanDevices = function() {
  if (this.reenumerateIntervalTimer_) {
    this.reenumerateIntervalTimer_.clearTimeout();
  }
  this.maybeReEnumerateGnubbies_(true);
};

/**
 * Enumerates gnubbies.
 * @private
 */
MultipleGnubbySigner.prototype.enumerateGnubbies_ = function() {
  DEVICE_FACTORY_REGISTRY.getGnubbyFactory().enumerate(
      this.enumerateCallback_.bind(this));
};

/**
 * Called with the result of enumerating gnubbies.
 * @param {number} rc The return code from enumerating.
 * @param {Array<GnubbyDeviceId>} ids The gnubbies enumerated.
 * @private
 */
MultipleGnubbySigner.prototype.enumerateCallback_ = function(rc, ids) {
  if (this.complete_) {
    return;
  }
  if (rc || !ids || !ids.length) {
    this.maybeReEnumerateGnubbies_(true);
    return;
  }
  for (var i = 0; i < ids.length; i++) {
    this.addGnubby_(ids[i]);
  }
  this.maybeReEnumerateGnubbies_(false);
};

/**
 * How frequently to reenumerate gnubbies when none are found, in milliseconds.
 * @const
 */
MultipleGnubbySigner.ACTIVE_REENUMERATE_INTERVAL_MILLIS = 200;

/**
 * How frequently to reenumerate gnubbies when some are found, in milliseconds.
 * @const
 */
MultipleGnubbySigner.PASSIVE_REENUMERATE_INTERVAL_MILLIS = 3000;

/**
 * Reenumerates gnubbies if there's still time.
 * @param {boolean} activeScan Whether to poll more aggressively, e.g. if
 *     there are no devices present.
 * @private
 */
MultipleGnubbySigner.prototype.maybeReEnumerateGnubbies_ =
    function(activeScan) {
  if (this.reenumerateTimer_.expired()) {
    // If the timer is expired, call timeout_ if there aren't any still-running
    // gnubbies. (If there are some still running, the last will call timeout_
    // itself.)
    if (!this.anyPending_()) {
      this.timeout_(false);
    }
    return;
  }
  // Reenumerate more aggressively if there are no gnubbies present than if
  // there are any.
  var reenumerateTimeoutMillis;
  if (activeScan) {
    reenumerateTimeoutMillis =
        MultipleGnubbySigner.ACTIVE_REENUMERATE_INTERVAL_MILLIS;
  } else {
    reenumerateTimeoutMillis =
        MultipleGnubbySigner.PASSIVE_REENUMERATE_INTERVAL_MILLIS;
  }
  if (reenumerateTimeoutMillis >
      this.reenumerateTimer_.millisecondsUntilExpired()) {
    reenumerateTimeoutMillis =
        this.reenumerateTimer_.millisecondsUntilExpired();
  }
  /** @private {Countdown} */
  this.reenumerateIntervalTimer_ =
      DEVICE_FACTORY_REGISTRY.getCountdownFactory().createTimer(
          reenumerateTimeoutMillis, this.enumerateGnubbies_.bind(this));
};

/**
 * Adds a new gnubby to this signer's list of gnubbies. (Only possible while
 * this signer is still signing: without this restriction, the completed
 * callback could be called more than once, in violation of its contract.)
 * If this signer has challenges to sign, begins signing on the new gnubby with
 * them.
 * @param {GnubbyDeviceId} gnubbyId The id of the gnubby to add.
 * @return {boolean} Whether the gnubby was added successfully.
 * @private
 */
MultipleGnubbySigner.prototype.addGnubby_ = function(gnubbyId) {
  var index = JSON.stringify(gnubbyId);
  if (this.gnubbies_.hasOwnProperty(index)) {
    // Can't add the same gnubby twice.
    return false;
  }
  var tracker = {
      index: index,
      errorStatus: 0,
      stillGoing: false,
      signer: null
  };
  tracker.signer = new SingleGnubbySigner(
      gnubbyId,
      this.forEnroll_,
      this.signCompletedCallback_.bind(this, tracker),
      this.timer_.clone(),
      this.logMsgUrl_);
  this.gnubbies_[index] = tracker;
  this.gnubbies_[index].stillGoing =
      tracker.signer.doSign(this.challenges_);
  if (!this.gnubbies_[index].errorStatus) {
    this.gnubbies_[index].errorStatus = 0;
  }
  return true;
};

/**
 * Called by a SingleGnubbySigner upon completion.
 * @param {GnubbyTracker} tracker The tracker object of the gnubby whose result
 *     this is.
 * @param {SingleSignerResult} result The result of the sign operation.
 * @private
 */
MultipleGnubbySigner.prototype.signCompletedCallback_ =
    function(tracker, result) {
  console.log(
      UTIL_fmt((result.code ? 'failure.' : 'success!') +
          ' gnubby ' + tracker.index +
          ' got code ' + result.code.toString(16)));
  if (!tracker.stillGoing) {
    console.log(UTIL_fmt('gnubby ' + tracker.index + ' no longer running!'));
    // Shouldn't ever happen? Disregard.
    return;
  }
  tracker.stillGoing = false;
  tracker.errorStatus = result.code;
  var moreExpected = this.tallyCompletedGnubby_();
  switch (result.code) {
    case DeviceStatusCodes.GONE_STATUS:
      // Squelch removed gnubbies: the caller can't act on them. But if this
      // was the last one, speed up reenumerating.
      if (!moreExpected) {
        this.maybeReEnumerateGnubbies_(true);
      }
      break;

    default:
      // Report any other results directly to the caller.
      this.notifyGnubbyComplete_(tracker, result, moreExpected);
      break;
  }
  if (!moreExpected && this.timer_.expired()) {
    this.timeout_(false);
  }
};

/**
 * Counts another gnubby has having completed, and returns whether more results
 * are expected.
 * @return {boolean} Whether more gnubbies are still running.
 * @private
 */
MultipleGnubbySigner.prototype.tallyCompletedGnubby_ = function() {
  this.numComplete_++;
  return this.anyPending_();
};

/**
 * @return {boolean} Whether more gnubbies are still running.
 * @private
 */
MultipleGnubbySigner.prototype.anyPending_ = function() {
  return this.numComplete_ < Object.keys(this.gnubbies_).length;
};

/**
 * Called upon timeout.
 * @param {boolean} anyPending Whether any gnubbies are awaiting results.
 * @private
 */
MultipleGnubbySigner.prototype.timeout_ = function(anyPending) {
  if (this.complete_) return;
  this.complete_ = true;
  // Defer notifying the caller that all are complete, in case the caller is
  // doing work in response to a gnubbyFound callback and has an inconsistent
  // view of the state of this signer.
  var self = this;
  window.setTimeout(function() {
    self.allCompleteCb_(anyPending);
  }, 0);
};

/**
 * @param {GnubbyTracker} tracker The tracker object of the gnubby whose result
 *     this is.
 * @param {SingleSignerResult} result Result object.
 * @param {boolean} moreExpected Whether more gnubbies may still produce an
 *     outcome.
 * @private
 */
MultipleGnubbySigner.prototype.notifyGnubbyComplete_ =
    function(tracker, result, moreExpected) {
  console.log(UTIL_fmt('gnubby ' + tracker.index + ' complete (' +
      result.code.toString(16) + ')'));
  var signResult = {
    'code': result.code,
    'gnubby': result.gnubby,
    'gnubbyId': tracker.signer.getDeviceId()
  };
  if (result['challenge'])
    signResult['challenge'] = result['challenge'];
  if (result['info'])
    signResult['info'] = result['info'];
  this.gnubbyCompleteCb_(signResult, moreExpected);
};
