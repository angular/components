/**
 * @fileoverview Implements a sign handler using USB gnubbies.
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

var CORRUPT_sign = false;

/**
 * @param {!SignHelperRequest} request The sign request.
 * @constructor
 * @implements {RequestHandler}
 */
function UsbSignHandler(request) {
  /** @private {!SignHelperRequest} */
  this.request_ = request;

  /** @private {boolean} */
  this.notified_ = false;
  /** @private {boolean} */
  this.anyGnubbiesFound_ = false;
  /** @private {!Array<!Gnubby>} */
  this.notEnrolledGnubbies_ = [];
}

/**
 * Default timeout value in case the caller never provides a valid timeout.
 * @const
 */
UsbSignHandler.DEFAULT_TIMEOUT_MILLIS = 30 * 1000;

/**
 * Attempts to run this handler's request.
 * @param {RequestHandlerCallback} cb Called with the result of the request and
 *     an optional source for the sign result.
 * @return {boolean} whether this set of challenges was accepted.
 */
UsbSignHandler.prototype.run = function(cb) {
  if (this.cb_) {
    // Can only handle one request.
    return false;
  }
  /** @private {RequestHandlerCallback} */
  this.cb_ = cb;
  if (!this.request_.signData || !this.request_.signData.length) {
    // Fail a sign request with an empty set of challenges.
    return false;
  }
  var timeoutMillis =
      this.request_.timeoutSeconds ?
      this.request_.timeoutSeconds * 1000 :
      UsbSignHandler.DEFAULT_TIMEOUT_MILLIS;
  /** @private {MultipleGnubbySigner} */
  this.signer_ = new MultipleGnubbySigner(
      false /* forEnroll */,
      this.signerCompleted_.bind(this),
      this.signerFoundGnubby_.bind(this),
      timeoutMillis,
      this.request_.logMsgUrl);
  return this.signer_.doSign(this.request_.signData);
};


/**
 * Called when a MultipleGnubbySigner completes.
 * @param {boolean} anyPending Whether any gnubbies are pending.
 * @private
 */
UsbSignHandler.prototype.signerCompleted_ = function(anyPending) {
  if (!this.anyGnubbiesFound_ || anyPending) {
    this.notifyError_(DeviceStatusCodes.TIMEOUT_STATUS);
  } else if (this.signerError_ !== undefined) {
    this.notifyError_(this.signerError_);
  } else {
    // Do nothing: signerFoundGnubby_ will have returned results from other
    // gnubbies.
  }
};

/**
 * Called when a MultipleGnubbySigner finds a gnubby that has completed signing
 * its challenges.
 * @param {MultipleSignerResult} signResult Signer result object
 * @param {boolean} moreExpected Whether the signer expects to produce more
 *     results.
 * @private
 */
UsbSignHandler.prototype.signerFoundGnubby_ =
    function(signResult, moreExpected) {
  this.anyGnubbiesFound_ = true;
  if (!signResult.code) {
    var gnubby = signResult['gnubby'];
    var challenge = signResult['challenge'];
    var info = new Uint8Array(signResult['info']);
    this.notifySuccess_(gnubby, challenge, info);
  } else if (signResult.code == DeviceStatusCodes.WRONG_DATA_STATUS) {
    var gnubby = signResult['gnubby'];
    this.notEnrolledGnubbies_.push(gnubby);
    this.sendBogusEnroll_(gnubby);
  } else if (!moreExpected) {
    // If the signer doesn't expect more results, return the error directly to
    // the caller.
    this.notifyError_(signResult.code);
  } else {
    // Record the last error, to report from the complete callback if no other
    // eligible gnubbies are found.
    /** @private {number} */
    this.signerError_ = signResult.code;
  }
};

/** @const */
UsbSignHandler.BOGUS_APP_ID_HASH = [
    0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41,
    0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41,
    0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41,
    0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41
];

/** @const */
UsbSignHandler.BOGUS_CHALLENGE_V1 = [
    0x04, 0xA2, 0x24, 0x7D, 0x5C, 0x0B, 0x76, 0xF1,
    0xDC, 0xCD, 0x44, 0xAF, 0x91, 0x9A, 0xA2, 0x3F,
    0x3F, 0xBA, 0x65, 0x9F, 0x06, 0x78, 0x82, 0xFB,
    0x93, 0x4B, 0xBF, 0x86, 0x55, 0x95, 0x66, 0x46,
    0x76, 0x90, 0xDC, 0xE1, 0xE8, 0x6C, 0x86, 0x86,
    0xC3, 0x03, 0x4E, 0x65, 0x52, 0x4C, 0x32, 0x6F,
    0xB6, 0x44, 0x0D, 0x50, 0xF9, 0x16, 0xC0, 0xA3,
    0xDA, 0x31, 0x4B, 0xD3, 0x3F, 0x94, 0xA5, 0xF1,
    0xD3
];

/** @const */
UsbSignHandler.BOGUS_CHALLENGE_V2 = [
    0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x42,
    0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x42,
    0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x42,
    0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x42
];

/**
 * Sends a bogus enroll command to the not-enrolled gnubby, to force the user
 * to tap the gnubby before revealing its state to the caller.
 * @param {Gnubby} gnubby The gnubby to "enroll" on.
 * @private
 */
UsbSignHandler.prototype.sendBogusEnroll_ = function(gnubby) {
  var self = this;
  gnubby.version(function(rc, opt_data) {
    if (rc) {
      self.notifyError_(rc);
      return;
    }
    var enrollChallenge;
    var version = UTIL_BytesToString(new Uint8Array(opt_data || []));
    switch (version) {
      case Gnubby.U2F_V1:
        enrollChallenge = UsbSignHandler.BOGUS_CHALLENGE_V1;
        break;
      case Gnubby.U2F_V2:
        enrollChallenge = UsbSignHandler.BOGUS_CHALLENGE_V2;
        break;
      default:
        self.notifyError_(DeviceStatusCodes.INVALID_DATA_STATUS);
    }
    gnubby.enroll(
        /** @type {Array<number>} */ (enrollChallenge),
        UsbSignHandler.BOGUS_APP_ID_HASH,
        self.enrollCallback_.bind(self, gnubby));
  });
};

/**
 * Called with the result of the (bogus, tap capturing) enroll command.
 * @param {Gnubby} gnubby The gnubby "enrolled".
 * @param {number} code The result of the enroll command.
 * @param {ArrayBuffer=} infoArray Returned data.
 * @private
 */
UsbSignHandler.prototype.enrollCallback_ = function(gnubby, code, infoArray) {
  if (this.notified_)
    return;
  switch (code) {
    case DeviceStatusCodes.WAIT_TOUCH_STATUS:
      this.sendBogusEnroll_(gnubby);
      return;

    case DeviceStatusCodes.OK_STATUS:
      // Got a successful enroll => user tapped gnubby.
      // Send a WRONG_DATA_STATUS finally. (The gnubby is implicitly closed
      // by notifyError_.)
      this.notifyError_(DeviceStatusCodes.WRONG_DATA_STATUS);
      return;
  }
};

/**
 * Reports the result of a successful sign operation.
 * @param {Gnubby} gnubby Gnubby instance
 * @param {SignHelperChallenge} challenge Challenge signed
 * @param {Uint8Array} info Result data
 * @private
 */
UsbSignHandler.prototype.notifySuccess_ = function(gnubby, challenge, info) {
  if (this.notified_)
    return;
  this.notified_ = true;

  gnubby.closeWhenIdle();
  this.close();

  if (CORRUPT_sign) {
    CORRUPT_sign = false;
    info[info.length - 1] = info[info.length - 1] ^ 0xff;
  }
  var responseData = {
    'appIdHash': B64_encode(challenge['appIdHash']),
    'challengeHash': B64_encode(challenge['challengeHash']),
    'keyHandle': B64_encode(challenge['keyHandle']),
    'signatureData': B64_encode(info)
  };
  var reply = {
    'type': 'sign_helper_reply',
    'code': DeviceStatusCodes.OK_STATUS,
    'responseData': responseData
  };
  this.cb_(reply, 'USB');
};

/**
 * Reports error to the caller.
 * @param {number} code error to report
 * @private
 */
UsbSignHandler.prototype.notifyError_ = function(code) {
  if (this.notified_)
    return;
  this.notified_ = true;
  this.close();
  var reply = {
    'type': 'sign_helper_reply',
    'code': code
  };
  this.cb_(reply);
};

/**
 * Closes the MultipleGnubbySigner, if any.
 */
UsbSignHandler.prototype.close = function() {
  while (this.notEnrolledGnubbies_.length != 0) {
    var gnubby = this.notEnrolledGnubbies_.shift();
    gnubby.closeWhenIdle();
  }
  if (this.signer_) {
    this.signer_.close();
    this.signer_ = null;
  }
};
