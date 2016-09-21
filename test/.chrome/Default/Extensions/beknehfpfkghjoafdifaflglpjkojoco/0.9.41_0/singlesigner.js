/**
 * @fileoverview A single gnubby signer wraps the process of opening a gnubby,
 * signing each challenge in an array of challenges until a success condition
 * is satisfied, and finally yielding the gnubby upon success.
 *
 * @author juanlang@google.com (Juan Lang)
 */

'use strict';

/**
 * @typedef {{
 *   code: number,
 *   gnubby: (Gnubby|undefined),
 *   challenge: (SignHelperChallenge|undefined),
 *   info: (ArrayBuffer|undefined)
 * }}
 */
var SingleSignerResult;

/**
 * Creates a new sign handler with a gnubby. This handler will perform a sign
 * operation using each challenge in an array of challenges until its success
 * condition is satisified, or an error or timeout occurs. The success condition
 * is defined differently depending whether this signer is used for enrolling
 * or for signing:
 *
 * For enroll, success is defined as each challenge yielding wrong data. This
 * means this gnubby is not currently enrolled for any of the appIds in any
 * challenge.
 *
 * For sign, success is defined as any challenge yielding ok.
 *
 * The complete callback is called only when the signer reaches success or
 * failure, i.e.  when there is no need for this signer to continue trying new
 * challenges.
 *
 * @param {GnubbyDeviceId} gnubbyId Which gnubby to open.
 * @param {boolean} forEnroll Whether this signer is signing for an attempted
 *     enroll operation.
 * @param {function(SingleSignerResult)}
 *     completeCb Called when this signer completes, i.e. no further results are
 *     possible.
 * @param {Countdown} timer An advisory timer, beyond whose expiration the
 *     signer will not attempt any new operations, assuming the caller is no
 *     longer interested in the outcome.
 * @param {string=} opt_logMsgUrl A URL to post log messages to.
 * @constructor
 */
function SingleGnubbySigner(gnubbyId, forEnroll, completeCb, timer,
    opt_logMsgUrl) {
  /** @private {GnubbyDeviceId} */
  this.gnubbyId_ = gnubbyId;
  /** @private {SingleGnubbySigner.State} */
  this.state_ = SingleGnubbySigner.State.INIT;
  /** @private {boolean} */
  this.forEnroll_ = forEnroll;
  /** @private {function(SingleSignerResult)} */
  this.completeCb_ = completeCb;
  /** @private {Countdown} */
  this.timer_ = timer;
  /** @private {string|undefined} */
  this.logMsgUrl_ = opt_logMsgUrl;

  /** @private {!Array<!SignHelperChallenge>} */
  this.challenges_ = [];
  /** @private {number} */
  this.challengeIndex_ = 0;
  /** @private {boolean} */
  this.challengesSet_ = false;

  /** @private {!Object<string, number>} */
  this.cachedError_ = [];

  /** @private {(function()|undefined)} */
  this.openCanceller_;
}

/** @enum {number} */
SingleGnubbySigner.State = {
  /** Initial state. */
  INIT: 0,
  /** The signer is attempting to open a gnubby. */
  OPENING: 1,
  /** The signer's gnubby opened, but is busy. */
  BUSY: 2,
  /** The signer has an open gnubby, but no challenges to sign. */
  IDLE: 3,
  /** The signer is currently signing a challenge. */
  SIGNING: 4,
  /** The signer got a final outcome. */
  COMPLETE: 5,
  /** The signer is closing its gnubby. */
  CLOSING: 6,
  /** The signer is closed. */
  CLOSED: 7
};

/**
 * @return {GnubbyDeviceId} This device id of the gnubby for this signer.
 */
SingleGnubbySigner.prototype.getDeviceId = function() {
  return this.gnubbyId_;
};

/**
 * Closes this signer's gnubby, if it's held.
 */
SingleGnubbySigner.prototype.close = function() {
  if (this.state_ == SingleGnubbySigner.State.OPENING) {
    if (this.openCanceller_)
      this.openCanceller_();
  }

  if (!this.gnubby_) return;
  this.state_ = SingleGnubbySigner.State.CLOSING;
  this.gnubby_.closeWhenIdle(this.closed_.bind(this));
};

/**
 * Called when this signer's gnubby is closed.
 * @private
 */
SingleGnubbySigner.prototype.closed_ = function() {
  this.gnubby_ = null;
  this.state_ = SingleGnubbySigner.State.CLOSED;
};

/**
 * Begins signing the given challenges.
 * @param {Array<SignHelperChallenge>} challenges The challenges to sign.
 * @return {boolean} Whether the challenges were accepted.
 */
SingleGnubbySigner.prototype.doSign = function(challenges) {
  if (this.challengesSet_) {
    // Can't add new challenges once they've been set.
    return false;
  }

  if (challenges) {
    console.log(this.gnubby_);
    console.log(UTIL_fmt('adding ' + challenges.length + ' challenges'));
    for (var i = 0; i < challenges.length; i++) {
      this.challenges_.push(challenges[i]);
    }
  }
  this.challengesSet_ = true;

  switch (this.state_) {
    case SingleGnubbySigner.State.INIT:
      this.open_();
      break;
    case SingleGnubbySigner.State.OPENING:
      // The open has already commenced, so accept the challenges, but don't do
      // anything.
      break;
    case SingleGnubbySigner.State.IDLE:
      if (this.challengeIndex_ < challenges.length) {
        // Challenges set: start signing.
        this.doSign_(this.challengeIndex_);
      } else {
        // An empty list of challenges can be set during enroll, when the user
        // has no existing enrolled gnubbies. It's unexpected during sign, but
        // returning WRONG_DATA satisfies the caller in either case.
        var self = this;
        window.setTimeout(function() {
          self.goToError_(DeviceStatusCodes.WRONG_DATA_STATUS);
        }, 0);
      }
      break;
    case SingleGnubbySigner.State.SIGNING:
      // Already signing, so don't kick off a new sign, but accept the added
      // challenges.
      break;
    default:
      return false;
  }
  return true;
};

/**
 * Attempts to open this signer's gnubby, if it's not already open.
 * @private
 */
SingleGnubbySigner.prototype.open_ = function() {
  var appIdHash;
  if (this.challenges_.length) {
    // Assume the first challenge's appId is representative of all of them.
    appIdHash = B64_encode(this.challenges_[0].appIdHash);
  }
  if (this.state_ == SingleGnubbySigner.State.INIT) {
    this.state_ = SingleGnubbySigner.State.OPENING;
    this.openCanceller_ = DEVICE_FACTORY_REGISTRY.getGnubbyFactory().openGnubby(
        this.gnubbyId_,
        this.forEnroll_,
        this.openCallback_.bind(this),
        appIdHash,
        this.logMsgUrl_,
        'singlesigner.js:SingleGnubbySigner.prototype.open_');
  }
};

/**
 * How long to delay retrying a failed open.
 */
SingleGnubbySigner.OPEN_DELAY_MILLIS = 200;

/**
 * How long to delay retrying a sign requiring touch.
 */
SingleGnubbySigner.SIGN_DELAY_MILLIS = 200;

/**
 * @param {number} rc The result of the open operation.
 * @param {Gnubby=} gnubby The opened gnubby, if open was successful (or busy).
 * @private
 */
SingleGnubbySigner.prototype.openCallback_ = function(rc, gnubby) {
  if (this.state_ != SingleGnubbySigner.State.OPENING &&
      this.state_ != SingleGnubbySigner.State.BUSY) {
    // Open completed after close, perhaps? Ignore.
    return;
  }

  switch (rc) {
    case DeviceStatusCodes.OK_STATUS:
      if (!gnubby) {
        console.warn(UTIL_fmt('open succeeded but gnubby is null, WTF?'));
      } else {
        this.gnubby_ = gnubby;
        this.gnubby_.version(this.versionCallback_.bind(this));
      }
      break;
    case DeviceStatusCodes.BUSY_STATUS:
      this.gnubby_ = gnubby;
      this.state_ = SingleGnubbySigner.State.BUSY;
      // If there's still time, retry the open.
      if (!this.timer_ || !this.timer_.expired()) {
        var self = this;
        window.setTimeout(function() {
          if (self.gnubby_) {
            this.openCanceller_ = DEVICE_FACTORY_REGISTRY
              .getGnubbyFactory().openGnubby(
                self.gnubbyId_,
                self.forEnroll_,
                self.openCallback_.bind(self),
                self.logMsgUrl_,
                'singlesigner.js:SingleGnubbySigner.prototype.openCallback_');
          }
        }, SingleGnubbySigner.OPEN_DELAY_MILLIS);
      } else {
        this.goToError_(DeviceStatusCodes.BUSY_STATUS);
      }
      break;
    default:
      // TODO(juanlang): This won't be confused with success, but should it be
      // part of the same namespace as the other error codes, which are
      // always in DeviceStatusCodes.*?
      this.goToError_(rc, true);
  }
};

/**
 * Called with the result of a version command.
 * @param {number} rc Result of version command.
 * @param {ArrayBuffer=} opt_data Version.
 * @private
 */
SingleGnubbySigner.prototype.versionCallback_ = function(rc, opt_data) {
  if (rc == DeviceStatusCodes.BUSY_STATUS) {
    if (this.timer_ && this.timer_.expired()) {
      this.goToError_(DeviceStatusCodes.TIMEOUT_STATUS);
      return;
    }
    // There's still time: resync and retry.
    var self = this;
    this.gnubby_.sync(function(code) {
      if (code) {
        self.goToError_(code, true);
        return;
      }
      self.gnubby_.version(self.versionCallback_.bind(self));
    });
    return;
  }
  if (rc) {
    this.goToError_(rc, true);
    return;
  }
  this.state_ = SingleGnubbySigner.State.IDLE;
  this.version_ = UTIL_BytesToString(new Uint8Array(opt_data || []));
  this.doSign_(this.challengeIndex_);
};

/**
 * @param {number} challengeIndex Index of challenge to sign
 * @private
 */
SingleGnubbySigner.prototype.doSign_ = function(challengeIndex) {
  if (!this.gnubby_) {
    // Already closed? Nothing to do.
    return;
  }
  if (this.timer_ && this.timer_.expired()) {
    // If the timer is expired, that means we never got a success response.
    // We could have gotten wrong data on a partial set of challenges, but this
    // means we don't yet know the final outcome. In any event, we don't yet
    // know the final outcome: return timeout.
    this.goToError_(DeviceStatusCodes.TIMEOUT_STATUS);
    return;
  }
  if (!this.challengesSet_) {
    this.state_ = SingleGnubbySigner.State.IDLE;
    return;
  }

  this.state_ = SingleGnubbySigner.State.SIGNING;

  if (challengeIndex >= this.challenges_.length) {
    this.signCallback_(challengeIndex, DeviceStatusCodes.WRONG_DATA_STATUS);
    return;
  }

  var challenge = this.challenges_[challengeIndex];
  var challengeHash = challenge.challengeHash;
  var appIdHash = challenge.appIdHash;
  var keyHandle = challenge.keyHandle;
  if (this.cachedError_.hasOwnProperty(keyHandle)) {
    // Cache hit: return wrong data again.
    this.signCallback_(challengeIndex, this.cachedError_[keyHandle]);
  } else if (challenge.version && challenge.version != this.version_) {
    // Sign challenge for a different version of gnubby: return wrong data.
    this.signCallback_(challengeIndex, DeviceStatusCodes.WRONG_DATA_STATUS);
  } else {
    var nowink = false;
    this.gnubby_.sign(challengeHash, appIdHash, keyHandle,
        this.signCallback_.bind(this, challengeIndex),
        nowink);
  }
};

/**
 * @param {number} code The result of a sign operation.
 * @return {boolean} Whether the error indicates the key handle is invalid
 *     for this gnubby.
 */
SingleGnubbySigner.signErrorIndicatesInvalidKeyHandle = function(code) {
  return (code == DeviceStatusCodes.WRONG_DATA_STATUS ||
      code == DeviceStatusCodes.WRONG_LENGTH_STATUS ||
      code == DeviceStatusCodes.INVALID_DATA_STATUS);
};

/**
 * Called with the result of a single sign operation.
 * @param {number} challengeIndex the index of the challenge just attempted
 * @param {number} code the result of the sign operation
 * @param {ArrayBuffer=} opt_info Optional result data
 * @private
 */
SingleGnubbySigner.prototype.signCallback_ =
    function(challengeIndex, code, opt_info) {
  console.log(UTIL_fmt('gnubby ' + JSON.stringify(this.gnubbyId_) +
      ', challenge ' + challengeIndex + ' yielded ' + code.toString(16)));
  if (this.state_ != SingleGnubbySigner.State.SIGNING) {
    console.log(UTIL_fmt('already done!'));
    // We're done, the caller's no longer interested.
    return;
  }

  // Cache certain idempotent errors, re-asking the gnubby to sign it
  // won't produce different results.
  if (SingleGnubbySigner.signErrorIndicatesInvalidKeyHandle(code)) {
    if (challengeIndex < this.challenges_.length) {
      var challenge = this.challenges_[challengeIndex];
      if (!this.cachedError_.hasOwnProperty(challenge.keyHandle)) {
        this.cachedError_[challenge.keyHandle] = code;
      }
    }
  }

  var self = this;
  switch (code) {
    case DeviceStatusCodes.GONE_STATUS:
      this.goToError_(code);
      break;

    case DeviceStatusCodes.TIMEOUT_STATUS:
      this.gnubby_.sync(this.synced_.bind(this));
      break;

    case DeviceStatusCodes.BUSY_STATUS:
      this.doSign_(this.challengeIndex_);
      break;

    case DeviceStatusCodes.OK_STATUS:
      // Lower bound on the minimum length, signature length can vary.
      var MIN_SIGNATURE_LENGTH = 7;
      if (!opt_info || opt_info.byteLength < MIN_SIGNATURE_LENGTH) {
        console.error(UTIL_fmt('Got short response to sign request (' +
            (opt_info ? opt_info.byteLength : 0) + ' bytes), WTF?'));
      }
      if (this.forEnroll_) {
        this.goToError_(code);
      } else {
        this.goToSuccess_(code, this.challenges_[challengeIndex], opt_info);
      }
      break;

    case DeviceStatusCodes.WAIT_TOUCH_STATUS:
      window.setTimeout(function() {
        self.doSign_(self.challengeIndex_);
      }, SingleGnubbySigner.SIGN_DELAY_MILLIS);
      break;

    case DeviceStatusCodes.WRONG_DATA_STATUS:
    case DeviceStatusCodes.WRONG_LENGTH_STATUS:
    case DeviceStatusCodes.INVALID_DATA_STATUS:
      if (this.challengeIndex_ < this.challenges_.length - 1) {
        this.doSign_(++this.challengeIndex_);
      } else if (this.forEnroll_) {
        this.goToSuccess_(code);
      } else {
        this.goToError_(code);
      }
      break;

    default:
      if (this.forEnroll_) {
        this.goToError_(code, true);
      } else if (this.challengeIndex_ < this.challenges_.length - 1) {
        this.doSign_(++this.challengeIndex_);
      } else {
        this.goToError_(code, true);
      }
  }
};

/**
 * Called with the response of a sync command, called when a sign yields a
 * timeout to reassert control over the gnubby.
 * @param {number} code Error code
 * @private
 */
SingleGnubbySigner.prototype.synced_ = function(code) {
  if (code) {
    this.goToError_(code, true);
    return;
  }
  this.doSign_(this.challengeIndex_);
};

/**
 * Switches to the error state, and notifies caller.
 * @param {number} code Error code
 * @param {boolean=} opt_warn Whether to warn in the console about the error.
 * @private
 */
SingleGnubbySigner.prototype.goToError_ = function(code, opt_warn) {
  this.state_ = SingleGnubbySigner.State.COMPLETE;
  var logFn = opt_warn ? console.warn.bind(console) : console.log.bind(console);
  logFn(UTIL_fmt('failed (' + code.toString(16) + ')'));
  var result = { code: code };
  if (!this.forEnroll_ && code == DeviceStatusCodes.WRONG_DATA_STATUS) {
    // When a device yields WRONG_DATA to all sign challenges, and this is a
    // sign request, we don't want to yield to the web page that it's not
    // enrolled just yet: we want the user to tap the device first. We'll
    // report the gnubby to the caller and let it close it instead of closing
    // it here.
    result.gnubby = this.gnubby_;
  } else {
    // Since this gnubby can no longer produce a useful result, go ahead and
    // close it.
    this.close();
  }
  this.completeCb_(result);
};

/**
 * Switches to the success state, and notifies caller.
 * @param {number} code Status code
 * @param {SignHelperChallenge=} opt_challenge The challenge signed
 * @param {ArrayBuffer=} opt_info Optional result data
 * @private
 */
SingleGnubbySigner.prototype.goToSuccess_ =
    function(code, opt_challenge, opt_info) {
  this.state_ = SingleGnubbySigner.State.COMPLETE;
  console.log(UTIL_fmt('success (' + code.toString(16) + ')'));
  var result = { code: code, gnubby: this.gnubby_ };
  if (opt_challenge || opt_info) {
    if (opt_challenge) {
      result['challenge'] = opt_challenge;
    }
    if (opt_info) {
      result['info'] = opt_info;
    }
  }
  this.completeCb_(result);
  // this.gnubby_ is now owned by completeCb_.
  this.gnubby_ = null;
};
