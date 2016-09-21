/**
 * @fileoverview Implements an enroll handler using USB gnubbies.
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * @param {!EnrollHelperRequest} request The enroll request.
 * @constructor
 * @implements {RequestHandler}
 */
function UsbEnrollHandler(request) {
  /** @private {!EnrollHelperRequest} */
  this.request_ = request;

  /** @private {Array<Gnubby>} */
  this.waitingForTouchGnubbies_ = [];

  /** @private {boolean} */
  this.closed_ = false;
  /** @private {boolean} */
  this.notified_ = false;
}

/**
 * Default timeout value in case the caller never provides a valid timeout.
 * @const
 */
UsbEnrollHandler.DEFAULT_TIMEOUT_MILLIS = 30 * 1000;

/**
 * @param {RequestHandlerCallback} cb Called back with the result of the
 *     request, and an optional source for the result.
 * @return {boolean} Whether this handler could be run.
 */
UsbEnrollHandler.prototype.run = function(cb) {
  var timeoutMillis =
      this.request_.timeoutSeconds ?
      this.request_.timeoutSeconds * 1000 :
      UsbEnrollHandler.DEFAULT_TIMEOUT_MILLIS;
  /** @private {Countdown} */
  this.timer_ = DEVICE_FACTORY_REGISTRY.getCountdownFactory().createTimer(
      timeoutMillis);
  this.enrollChallenges = this.request_.enrollChallenges;
  /** @private {RequestHandlerCallback} */
  this.cb_ = cb;
  this.signer_ = new MultipleGnubbySigner(
      true /* forEnroll */,
      this.signerCompleted_.bind(this),
      this.signerFoundGnubby_.bind(this),
      timeoutMillis,
      this.request_.logMsgUrl);
  return this.signer_.doSign(this.request_.signData);
};

/** Closes this helper. */
UsbEnrollHandler.prototype.close = function() {
  this.closed_ = true;
  for (var i = 0; i < this.waitingForTouchGnubbies_.length; i++) {
    this.waitingForTouchGnubbies_[i].closeWhenIdle();
  }
  this.waitingForTouchGnubbies_ = [];
  if (this.signer_) {
    this.signer_.close();
    this.signer_ = null;
  }
};

/**
 * Called when a MultipleGnubbySigner completes its sign request.
 * @param {boolean} anyPending Whether any gnubbies are pending.
 * @private
 */
UsbEnrollHandler.prototype.signerCompleted_ = function(anyPending) {
  if (!this.anyGnubbiesFound_ || this.anyTimeout_ || anyPending ||
      this.timer_.expired()) {
    this.notifyError_(DeviceStatusCodes.TIMEOUT_STATUS);
  } else {
    // Do nothing: signerFoundGnubby will have been called with each succeeding
    // gnubby.
  }
};

/**
 * Called when a MultipleGnubbySigner finds a gnubby that can enroll.
 * @param {MultipleSignerResult} signResult Signature results
 * @param {boolean} moreExpected Whether the signer expects to report
 *     results from more gnubbies.
 * @private
 */
UsbEnrollHandler.prototype.signerFoundGnubby_ =
    function(signResult, moreExpected) {
  if (!signResult.code) {
    // If the signer reports a gnubby can sign, report this immediately to the
    // caller, as the gnubby is already enrolled. Map ok to WRONG_DATA, so the
    // caller knows what to do.
    this.notifyError_(DeviceStatusCodes.WRONG_DATA_STATUS);
  } else if (SingleGnubbySigner.signErrorIndicatesInvalidKeyHandle(
      signResult.code)) {
    var gnubby = signResult['gnubby'];
    // A valid helper request contains at least one enroll challenge, so use
    // the app id hash from the first challenge.
    var appIdHash = this.request_.enrollChallenges[0].appIdHash;
    DEVICE_FACTORY_REGISTRY.getGnubbyFactory().notEnrolledPrerequisiteCheck(
        gnubby, appIdHash, this.gnubbyPrerequisitesChecked_.bind(this));
  } else {
    // Unexpected error in signing? Send this immediately to the caller.
    this.notifyError_(signResult.code);
  }
};

/**
 * Called with the result of a gnubby prerequisite check.
 * @param {number} rc The result of the prerequisite check.
 * @param {Gnubby=} opt_gnubby The gnubby whose prerequisites were checked.
 * @private
 */
UsbEnrollHandler.prototype.gnubbyPrerequisitesChecked_ =
    function(rc, opt_gnubby) {
  if (rc || this.timer_.expired()) {
    // Do nothing:
    // If the timer is expired, the signerCompleted_ callback will indicate
    // timeout to the caller.
    // If there's an error, this gnubby is ineligible, but there's nothing we
    // can do about that here.
    return;
  }
  // If the callback succeeded, the gnubby is not null.
  var gnubby = /** @type {Gnubby} */ (opt_gnubby);
  this.anyGnubbiesFound_ = true;
  this.waitingForTouchGnubbies_.push(gnubby);
  this.matchEnrollVersionToGnubby_(gnubby);
};

/**
 * Attempts to match the gnubby's U2F version with an appropriate enroll
 * challenge.
 * @param {Gnubby} gnubby Gnubby instance
 * @private
 */
UsbEnrollHandler.prototype.matchEnrollVersionToGnubby_ = function(gnubby) {
  if (!gnubby) {
    console.warn(UTIL_fmt('no gnubby, WTF?'));
    return;
  }
  gnubby.version(this.gnubbyVersioned_.bind(this, gnubby));
};

/**
 * Called with the result of a version command.
 * @param {Gnubby} gnubby Gnubby instance
 * @param {number} rc result of version command.
 * @param {ArrayBuffer=} data version.
 * @private
 */
UsbEnrollHandler.prototype.gnubbyVersioned_ = function(gnubby, rc, data) {
  if (rc) {
    this.removeWrongVersionGnubby_(gnubby);
    return;
  }
  var version = UTIL_BytesToString(new Uint8Array(data || null));
  this.tryEnroll_(gnubby, version);
};

/**
 * Drops the gnubby from the list of eligible gnubbies.
 * @param {Gnubby} gnubby Gnubby instance
 * @private
 */
UsbEnrollHandler.prototype.removeWaitingGnubby_ = function(gnubby) {
  gnubby.closeWhenIdle();
  var index = this.waitingForTouchGnubbies_.indexOf(gnubby);
  if (index >= 0) {
    this.waitingForTouchGnubbies_.splice(index, 1);
  }
};

/**
 * Drops the gnubby from the list of eligible gnubbies, as it has the wrong
 * version.
 * @param {Gnubby} gnubby Gnubby instance
 * @private
 */
UsbEnrollHandler.prototype.removeWrongVersionGnubby_ = function(gnubby) {
  this.removeWaitingGnubby_(gnubby);
  if (!this.waitingForTouchGnubbies_.length) {
    // Whoops, this was the last gnubby.
    this.anyGnubbiesFound_ = false;
    if (this.timer_.expired()) {
      this.notifyError_(DeviceStatusCodes.TIMEOUT_STATUS);
    } else if (this.signer_) {
      this.signer_.reScanDevices();
    }
  }
};

/**
 * Attempts enrolling a particular gnubby with a challenge of the appropriate
 * version.
 * @param {Gnubby} gnubby Gnubby instance
 * @param {string} version Protocol version
 * @private
 */
UsbEnrollHandler.prototype.tryEnroll_ = function(gnubby, version) {
  var challenge = this.getChallengeOfVersion_(version);
  if (!challenge) {
    this.removeWrongVersionGnubby_(gnubby);
    return;
  }
  var challengeValue = B64_decode(challenge['challengeHash']);
  var appIdHash = challenge['appIdHash'];
  var individualAttest =
      DEVICE_FACTORY_REGISTRY.getIndividualAttestation().
          requestIndividualAttestation(appIdHash);
  gnubby.enroll(challengeValue, B64_decode(appIdHash),
      this.enrollCallback_.bind(this, gnubby, version), individualAttest);
};

/**
 * Finds the (first) challenge of the given version in this helper's challenges.
 * @param {string} version Protocol version
 * @return {Object} challenge, if found, or null if not.
 * @private
 */
UsbEnrollHandler.prototype.getChallengeOfVersion_ = function(version) {
  for (var i = 0; i < this.enrollChallenges.length; i++) {
    if (this.enrollChallenges[i]['version'] == version) {
      return this.enrollChallenges[i];
    }
  }
  return null;
};

/**
 * Called with the result of an enroll request to a gnubby.
 * @param {Gnubby} gnubby Gnubby instance
 * @param {string} version Protocol version
 * @param {number} code Status code
 * @param {ArrayBuffer=} infoArray Returned data
 * @private
 */
UsbEnrollHandler.prototype.enrollCallback_ =
    function(gnubby, version, code, infoArray) {
  if (this.notified_) {
    // Enroll completed after previous success or failure. Disregard.
    return;
  }
  switch (code) {
    case -GnubbyDevice.GONE:
        // Close this gnubby.
        this.removeWaitingGnubby_(gnubby);
        if (!this.waitingForTouchGnubbies_.length) {
          // Last enroll attempt is complete and last gnubby is gone.
          this.anyGnubbiesFound_ = false;
          if (this.timer_.expired()) {
            this.notifyError_(DeviceStatusCodes.TIMEOUT_STATUS);
          } else if (this.signer_) {
            this.signer_.reScanDevices();
          }
        }
      break;

    case DeviceStatusCodes.WAIT_TOUCH_STATUS:
    case DeviceStatusCodes.BUSY_STATUS:
    case DeviceStatusCodes.TIMEOUT_STATUS:
      if (this.timer_.expired()) {
        // Record that at least one gnubby timed out, to return a timeout status
        // from the complete callback if no other eligible gnubbies are found.
        /** @private {boolean} */
        this.anyTimeout_ = true;
        // Close this gnubby.
        this.removeWaitingGnubby_(gnubby);
        if (!this.waitingForTouchGnubbies_.length) {
          // Last enroll attempt is complete: return this error.
          console.log(UTIL_fmt('timeout (' + code.toString(16) +
              ') enrolling'));
          this.notifyError_(DeviceStatusCodes.TIMEOUT_STATUS);
        }
      } else {
        DEVICE_FACTORY_REGISTRY.getCountdownFactory().createTimer(
            UsbEnrollHandler.ENUMERATE_DELAY_INTERVAL_MILLIS,
            this.tryEnroll_.bind(this, gnubby, version));
      }
      break;

    case DeviceStatusCodes.OK_STATUS:
      var info = B64_encode(new Uint8Array(infoArray || []));
      this.notifySuccess_(version, info);
      break;

    default:
      console.log(UTIL_fmt('Failed to enroll gnubby: ' + code));
      this.notifyError_(code);
      break;
  }
};

/**
 * How long to delay between repeated enroll attempts, in milliseconds.
 * @const
 */
UsbEnrollHandler.ENUMERATE_DELAY_INTERVAL_MILLIS = 200;

/**
 * Notifies the callback with an error code.
 * @param {number} code The error code to report.
 * @private
 */
UsbEnrollHandler.prototype.notifyError_ = function(code) {
  if (this.notified_ || this.closed_)
    return;
  this.notified_ = true;
  this.close();
  var reply = {
    'type': 'enroll_helper_reply',
    'code': code
  };
  this.cb_(reply);
};

/**
 * @param {string} version Protocol version
 * @param {string} info B64 encoded success data
 * @private
 */
UsbEnrollHandler.prototype.notifySuccess_ = function(version, info) {
  if (this.notified_ || this.closed_)
    return;
  this.notified_ = true;
  this.close();
  var reply = {
    'type': 'enroll_helper_reply',
    'code': DeviceStatusCodes.OK_STATUS,
    'version': version,
    'enrollData': info
  };
  this.cb_(reply);
};
