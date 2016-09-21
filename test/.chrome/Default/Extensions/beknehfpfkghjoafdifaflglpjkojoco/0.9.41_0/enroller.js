/**
 * @fileoverview Handles web page requests for gnubby enrollment.
 * @author juanlang@google.com (Juan Lang)
 */

'use strict';

/**
 * Handles a U2F enroll request.
 * @param {MessageSender} messageSender The message sender.
 * @param {Object} request The web page's enroll request.
 * @param {Function} sendResponse Called back with the result of the enroll.
 * @return {Closeable} A handler object to be closed when the browser channel
 *     closes.
 */
function handleU2fEnrollRequest(messageSender, request, sendResponse) {
  var sentResponse = false;
  var closeable = null;

  function sendErrorResponse(error) {
    var response = makeU2fErrorResponse(request, error.errorCode,
        error.errorMessage);
    sendResponseOnce(sentResponse, closeable, response, sendResponse);
  }

  function sendSuccessResponse(u2fVersion, info, clientData) {
    var enrollChallenges = request['registerRequests'];
    var enrollChallenge =
        findEnrollChallengeOfVersion(enrollChallenges, u2fVersion);
    if (!enrollChallenge) {
      sendErrorResponse({errorCode: ErrorCodes.OTHER_ERROR});
      return;
    }
    var responseData =
        makeEnrollResponseData(enrollChallenge, u2fVersion, info, clientData);
    var response = makeU2fSuccessResponse(request, responseData);
    sendResponseOnce(sentResponse, closeable, response, sendResponse);
  }

  function timeout() {
    sendErrorResponse({errorCode: ErrorCodes.TIMEOUT});
  }

  var sender = createSenderFromMessageSender(messageSender);
  if (!sender) {
    sendErrorResponse({errorCode: ErrorCodes.BAD_REQUEST});
    return null;
  }
  if (sender.origin.indexOf('http://') == 0 && !HTTP_ORIGINS_ALLOWED) {
    sendErrorResponse({errorCode: ErrorCodes.BAD_REQUEST});
    return null;
  }

  if (!isValidEnrollRequest(request)) {
    sendErrorResponse({errorCode: ErrorCodes.BAD_REQUEST});
    return null;
  }

  var timeoutValueSeconds = getTimeoutValueFromRequest(request);
  // Attenuate watchdog timeout value less than the enroller's timeout, so the
  // watchdog only fires after the enroller could reasonably have called back,
  // not before.
  var watchdogTimeoutValueSeconds = attenuateTimeoutInSeconds(
      timeoutValueSeconds, MINIMUM_TIMEOUT_ATTENUATION_SECONDS / 2);
  var watchdog = new WatchdogRequestHandler(watchdogTimeoutValueSeconds,
      timeout);
  var wrappedErrorCb = watchdog.wrapCallback(sendErrorResponse);
  var wrappedSuccessCb = watchdog.wrapCallback(sendSuccessResponse);

  var timer = createAttenuatedTimer(
      FACTORY_REGISTRY.getCountdownFactory(), timeoutValueSeconds);
  var logMsgUrl = request['logMsgUrl'];
  var enroller = new Enroller(timer, sender, sendErrorResponse,
      sendSuccessResponse, logMsgUrl);
  watchdog.setCloseable(/** @type {!Closeable} */ (enroller));
  closeable = watchdog;

  var registerRequests = request['registerRequests'];
  var signRequests = getSignRequestsFromEnrollRequest(request);
  enroller.doEnroll(registerRequests, signRequests, request['appId']);

  return closeable;
}

/**
 * Returns whether the request appears to be a valid enroll request.
 * @param {Object} request The request.
 * @return {boolean} Whether the request appears valid.
 */
function isValidEnrollRequest(request) {
  if (!request.hasOwnProperty('registerRequests'))
    return false;
  var enrollChallenges = request['registerRequests'];
  if (!enrollChallenges.length)
    return false;
  var hasAppId = request.hasOwnProperty('appId');
  if (!isValidEnrollChallengeArray(enrollChallenges, !hasAppId))
    return false;
  var signChallenges = getSignChallenges(request);
  // A missing sign challenge array is ok, in the case the user is not already
  // enrolled.
  // A challenge value need not necessarily be supplied with every challenge.
  var challengeRequired = false;
  if (signChallenges &&
      !isValidSignChallengeArray(signChallenges, challengeRequired, !hasAppId))
    return false;
  return true;
}

/**
 * @typedef {{
 *   version: (string|undefined),
 *   challenge: string,
 *   appId: string
 * }}
 */
var EnrollChallenge;

/**
 * @param {Array<EnrollChallenge>} enrollChallenges The enroll challenges to
 *     validate.
 * @param {boolean} appIdRequired Whether the appId property is required on
 *     each challenge.
 * @return {boolean} Whether the given array of challenges is a valid enroll
 *     challenges array.
 */
function isValidEnrollChallengeArray(enrollChallenges, appIdRequired) {
  var seenVersions = {};
  for (var i = 0; i < enrollChallenges.length; i++) {
    var enrollChallenge = enrollChallenges[i];
    var version = enrollChallenge['version'];
    if (!version) {
      // Version is implicitly V1 if not specified.
      version = 'U2F_V1';
    }
    if (version != 'U2F_V1' && version != 'U2F_V2') {
      return false;
    }
    if (seenVersions[version]) {
      // Each version can appear at most once.
      return false;
    }
    seenVersions[version] = version;
    if (appIdRequired && !enrollChallenge['appId']) {
      return false;
    }
    if (!enrollChallenge['challenge']) {
      // The challenge is required.
      return false;
    }
  }
  return true;
}

/**
 * Finds the enroll challenge of the given version in the enroll challlenge
 * array.
 * @param {Array<EnrollChallenge>} enrollChallenges The enroll challenges to
 *     search.
 * @param {string} version Version to search for.
 * @return {?EnrollChallenge} The enroll challenge with the given versions, or
 *     null if it isn't found.
 */
function findEnrollChallengeOfVersion(enrollChallenges, version) {
  for (var i = 0; i < enrollChallenges.length; i++) {
    if (enrollChallenges[i]['version'] == version) {
      return enrollChallenges[i];
    }
  }
  return null;
}

/**
 * Makes a responseData object for the enroll request with the given parameters.
 * @param {EnrollChallenge} enrollChallenge The enroll challenge used to
 *     register.
 * @param {string} u2fVersion Version of gnubby that enrolled.
 * @param {string} registrationData The registration data.
 * @param {string=} opt_clientData The client data, if available.
 * @return {Object} The responseData object.
 */
function makeEnrollResponseData(enrollChallenge, u2fVersion, registrationData,
    opt_clientData) {
  var responseData = {};
  responseData['registrationData'] = registrationData;
  // Echo the used challenge back in the reply.
  for (var k in enrollChallenge) {
    responseData[k] = enrollChallenge[k];
  }
  if (u2fVersion == 'U2F_V2') {
    // For U2F_V2, the challenge sent to the gnubby is modified to be the
    // hash of the client data. Include the client data.
    responseData['clientData'] = opt_clientData;
  }
  return responseData;
}

/**
 * Gets the expanded sign challenges from an enroll request, potentially by
 * modifying the request to contain a challenge value where one was omitted.
 * (For enrolling, the server isn't interested in the value of a signature,
 * only whether the presented key handle is already enrolled.)
 * @param {Object} request The request.
 * @return {Array<SignChallenge>}
 */
function getSignRequestsFromEnrollRequest(request) {
  var signChallenges;
  if (request.hasOwnProperty('registeredKeys')) {
    signChallenges = request['registeredKeys'];
  } else {
    signChallenges = request['signRequests'];
  }
  if (signChallenges) {
    for (var i = 0; i < signChallenges.length; i++) {
      // Make sure each sign challenge has a challenge value.
      // The actual value doesn't matter, as long as it's a string.
      if (!signChallenges[i].hasOwnProperty('challenge')) {
        signChallenges[i]['challenge'] = '';
      }
    }
  }
  return signChallenges;
}

/**
 * Creates a new object to track enrolling with a gnubby.
 * @param {!Countdown} timer Timer for enroll request.
 * @param {!WebRequestSender} sender The sender of the request.
 * @param {function(U2fError)} errorCb Called upon enroll failure.
 * @param {function(string, string, (string|undefined))} successCb Called upon
 *     enroll success with the version of the succeeding gnubby, the enroll
 *     data, and optionally the browser data associated with the enrollment.
 * @param {string=} opt_logMsgUrl The url to post log messages to.
 * @constructor
 */
function Enroller(timer, sender, errorCb, successCb, opt_logMsgUrl) {
  /** @private {Countdown} */
  this.timer_ = timer;
  /** @private {WebRequestSender} */
  this.sender_ = sender;
  /** @private {function(U2fError)} */
  this.errorCb_ = errorCb;
  /** @private {function(string, string, (string|undefined))} */
  this.successCb_ = successCb;
  /** @private {string|undefined} */
  this.logMsgUrl_ = opt_logMsgUrl;

  /** @private {boolean} */
  this.done_ = false;

  /** @private {Object<string, string>} */
  this.browserData_ = {};
  /** @private {Array<EnrollHelperChallenge>} */
  this.encodedEnrollChallenges_ = [];
  /** @private {Array<SignHelperChallenge>} */
  this.encodedSignChallenges_ = [];
  // Allow http appIds for http origins. (Broken, but the caller deserves
  // what they get.)
  /** @private {boolean} */
  this.allowHttp_ =
      this.sender_.origin ? this.sender_.origin.indexOf('http://') == 0 : false;
  /** @private {Closeable} */
  this.handler_ = null;
}

/**
 * Default timeout value in case the caller never provides a valid timeout.
 */
Enroller.DEFAULT_TIMEOUT_MILLIS = 30 * 1000;

/**
 * Performs an enroll request with the given enroll and sign challenges.
 * @param {Array<EnrollChallenge>} enrollChallenges A set of enroll challenges.
 * @param {Array<SignChallenge>} signChallenges A set of sign challenges for
 *     existing enrollments for this user and appId.
 * @param {string=} opt_appId The app id for the entire request.
 */
Enroller.prototype.doEnroll = function(enrollChallenges, signChallenges,
    opt_appId) {
  /** @private {Array<EnrollChallenge>} */
  this.enrollChallenges_ = enrollChallenges;
  /** @private {Array<SignChallenge>} */
  this.signChallenges_ = signChallenges;
  /** @private {(string|undefined)} */
  this.appId_ = opt_appId;
  var self = this;
  getTabIdWhenPossible(this.sender_).then(function() {
    if (self.done_) return;
    self.approveOrigin_();
  }, function() {
    self.close();
    self.notifyError_({errorCode: ErrorCodes.BAD_REQUEST});
  });
};

/**
 * Ensures the user has approved this origin to use security keys, sending
 * to the request to the handler if/when the user has done so.
 * @private
 */
Enroller.prototype.approveOrigin_ = function() {
  var self = this;
  FACTORY_REGISTRY.getApprovedOrigins()
      .isApprovedOrigin(this.sender_.origin, this.sender_.tabId)
      .then(function(result) {
        if (self.done_) return;
        if (!result) {
          // Origin not approved: rather than give an explicit indication to
          // the web page, let a timeout occur.
          // NOTE: if you are looking at this in a debugger, this line will
          // always be false since the origin of the debugger is different
          // than origin of requesting page
          if (self.timer_.expired()) {
            self.notifyTimeout_();
            return;
          }
          var newTimer = self.timer_.clone(self.notifyTimeout_.bind(self));
          self.timer_.clearTimeout();
          self.timer_ = newTimer;
          return;
        }
        self.sendEnrollRequestToHelper_();
      });
};

/**
 * Notifies the caller of a timeout error.
 * @private
 */
Enroller.prototype.notifyTimeout_ = function() {
  this.notifyError_({errorCode: ErrorCodes.TIMEOUT});
};

/**
 * Performs an enroll request with this instance's enroll and sign challenges,
 * by encoding them into a helper request and passing the resulting request to
 * the factory registry's helper.
 * @private
 */
Enroller.prototype.sendEnrollRequestToHelper_ = function() {
  var encodedEnrollChallenges =
      this.encodeEnrollChallenges_(this.enrollChallenges_, this.appId_);
  // If the request didn't contain a sign challenge, provide one. The value
  // doesn't matter.
  var defaultSignChallenge = '';
  var encodedSignChallenges =
      encodeSignChallenges(this.signChallenges_, defaultSignChallenge,
          this.appId_);
  var request = {
    type: 'enroll_helper_request',
    enrollChallenges: encodedEnrollChallenges,
    signData: encodedSignChallenges,
    logMsgUrl: this.logMsgUrl_
  };
  if (!this.timer_.expired()) {
    request.timeout = this.timer_.millisecondsUntilExpired() / 1000.0;
    request.timeoutSeconds = this.timer_.millisecondsUntilExpired() / 1000.0;
  }

  // Begin fetching/checking the app ids.
  var enrollAppIds = [];
  if (this.appId_) {
    enrollAppIds.push(this.appId_);
  }
  for (var i = 0; i < this.enrollChallenges_.length; i++) {
    if (this.enrollChallenges_[i].hasOwnProperty('appId')) {
      enrollAppIds.push(this.enrollChallenges_[i]['appId']);
    }
  }
  // Sanity check
  if (!enrollAppIds.length) {
    console.warn(UTIL_fmt('empty enroll app ids?'));
    this.notifyError_({errorCode: ErrorCodes.BAD_REQUEST});
    return;
  }
  var self = this;
  this.checkAppIds_(enrollAppIds, function(result) {
    if (self.done_) return;
    if (result) {
      self.handler_ = FACTORY_REGISTRY.getRequestHelper().getHandler(request);
      if (self.handler_) {
        var helperComplete =
            /** @type {function(HelperReply)} */
            (self.helperComplete_.bind(self));
        self.handler_.run(helperComplete);
      } else {
        self.notifyError_({errorCode: ErrorCodes.OTHER_ERROR});
      }
    } else {
      self.notifyError_({errorCode: ErrorCodes.BAD_REQUEST});
    }
  });
};

/**
 * Encodes the enroll challenge as an enroll helper challenge.
 * @param {EnrollChallenge} enrollChallenge The enroll challenge to encode.
 * @param {string=} opt_appId The app id for the entire request.
 * @return {EnrollHelperChallenge} The encoded challenge.
 * @private
 */
Enroller.encodeEnrollChallenge_ = function(enrollChallenge, opt_appId) {
  var encodedChallenge = {};
  var version;
  if (enrollChallenge['version']) {
    version = enrollChallenge['version'];
  } else {
    // Version is implicitly V1 if not specified.
    version = 'U2F_V1';
  }
  encodedChallenge['version'] = version;
  encodedChallenge['challengeHash'] = enrollChallenge['challenge'];
  var appId;
  if (enrollChallenge['appId']) {
    appId = enrollChallenge['appId'];
  } else {
    appId = opt_appId;
  }
  if (!appId) {
    // Sanity check. (Other code should fail if it's not set.)
    console.warn(UTIL_fmt('No appId?'));
  }
  encodedChallenge['appIdHash'] = B64_encode(sha256HashOfString(appId));
  return /** @type {EnrollHelperChallenge} */ (encodedChallenge);
};

/**
 * Encodes the given enroll challenges using this enroller's state.
 * @param {Array<EnrollChallenge>} enrollChallenges The enroll challenges.
 * @param {string=} opt_appId The app id for the entire request.
 * @return {!Array<EnrollHelperChallenge>} The encoded enroll challenges.
 * @private
 */
Enroller.prototype.encodeEnrollChallenges_ = function(enrollChallenges,
    opt_appId) {
  var challenges = [];
  for (var i = 0; i < enrollChallenges.length; i++) {
    var enrollChallenge = enrollChallenges[i];
    var version = enrollChallenge.version;
    if (!version) {
      // Version is implicitly V1 if not specified.
      version = 'U2F_V1';
    }

    if (version == 'U2F_V2') {
      var modifiedChallenge = {};
      for (var k in enrollChallenge) {
        modifiedChallenge[k] = enrollChallenge[k];
      }
      // V2 enroll responses contain signatures over a browser data object,
      // which we're constructing here. The browser data object contains, among
      // other things, the server challenge.
      var serverChallenge = enrollChallenge['challenge'];
      var browserData = makeEnrollBrowserData(
          serverChallenge, this.sender_.origin, this.sender_.tlsChannelId);
      // Replace the challenge with the hash of the browser data.
      modifiedChallenge['challenge'] =
          B64_encode(sha256HashOfString(browserData));
      this.browserData_[version] =
          B64_encode(UTIL_StringToBytes(browserData));
      challenges.push(Enroller.encodeEnrollChallenge_(
          /** @type {EnrollChallenge} */ (modifiedChallenge), opt_appId));
    } else {
      challenges.push(
          Enroller.encodeEnrollChallenge_(enrollChallenge, opt_appId));
    }
  }
  return challenges;
};

/**
 * Checks the app ids associated with this enroll request, and calls a callback
 * with the result of the check.
 * @param {!Array<string>} enrollAppIds The app ids in the enroll challenge
 *     portion of the enroll request.
 * @param {function(boolean)} cb Called with the result of the check.
 * @private
 */
Enroller.prototype.checkAppIds_ = function(enrollAppIds, cb) {
  var appIds =
      UTIL_unionArrays(enrollAppIds, getDistinctAppIds(this.signChallenges_));
  FACTORY_REGISTRY.getOriginChecker()
      .canClaimAppIds(this.sender_.origin, appIds)
      .then(this.originChecked_.bind(this, appIds, cb));
};

/**
 * Called with the result of checking the origin. When the origin is allowed
 * to claim the app ids, begins checking whether the app ids also list the
 * origin.
 * @param {!Array<string>} appIds The app ids.
 * @param {function(boolean)} cb Called with the result of the check.
 * @param {boolean} result Whether the origin could claim the app ids.
 * @private
 */
Enroller.prototype.originChecked_ = function(appIds, cb, result) {
  if (!result) {
    this.notifyError_({errorCode: ErrorCodes.BAD_REQUEST});
    return;
  }
  var appIdChecker = FACTORY_REGISTRY.getAppIdCheckerFactory().create();
  appIdChecker.
      checkAppIds(
          this.timer_.clone(), this.sender_.origin, appIds, this.allowHttp_,
          this.logMsgUrl_)
      .then(cb);
};

/** Closes this enroller. */
Enroller.prototype.close = function() {
  if (this.handler_) {
    this.handler_.close();
    this.handler_ = null;
  }
  this.done_ = true;
};

/**
 * Notifies the caller with the error.
 * @param {U2fError} error Error.
 * @private
 */
Enroller.prototype.notifyError_ = function(error) {
  if (this.done_)
    return;
  this.close();
  this.done_ = true;
  this.errorCb_(error);
};

/**
 * Notifies the caller of success with the provided response data.
 * @param {string} u2fVersion Protocol version
 * @param {string} info Response data
 * @param {string|undefined} opt_browserData Browser data used
 * @private
 */
Enroller.prototype.notifySuccess_ =
    function(u2fVersion, info, opt_browserData) {
  if (this.done_)
    return;
  this.close();
  this.done_ = true;
  this.successCb_(u2fVersion, info, opt_browserData);
};

/**
 * Called by the helper upon completion.
 * @param {EnrollHelperReply} reply The result of the enroll request.
 * @private
 */
Enroller.prototype.helperComplete_ = function(reply) {
  if (reply.code) {
    var reportedError = mapDeviceStatusCodeToU2fError(reply.code);
    console.log(UTIL_fmt('helper reported ' + reply.code.toString(16) +
        ', returning ' + reportedError.errorCode));
    this.notifyError_(reportedError);
  } else {
    console.log(UTIL_fmt('Gnubby enrollment succeeded!!!!!'));
    var browserData;

    if (reply.version == 'U2F_V2') {
      // For U2F_V2, the challenge sent to the gnubby is modified to be the hash
      // of the browser data. Include the browser data.
      browserData = this.browserData_[reply.version];
    }

    this.notifySuccess_(/** @type {string} */ (reply.version),
                        /** @type {string} */ (reply.enrollData),
                        browserData);
  }
};
