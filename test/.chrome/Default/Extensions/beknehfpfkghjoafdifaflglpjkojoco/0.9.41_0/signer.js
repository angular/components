/**
 * @fileoverview Handles web page requests for gnubby sign requests.
 *
 * @author juanlang@google.com (Juan Lang)
 */

'use strict';

var gnubbySignRequestQueue;

function initRequestQueue() {
  gnubbySignRequestQueue = new OriginKeyedRequestQueue(
      FACTORY_REGISTRY.getSystemTimer());
}

/**
 * Handles a U2F sign request.
 * @param {MessageSender} messageSender The message sender.
 * @param {Object} request The web page's sign request.
 * @param {Function} sendResponse Called back with the result of the sign.
 * @return {Closeable} Request handler that should be closed when the browser
 *     message channel is closed.
 */
function handleU2fSignRequest(messageSender, request, sendResponse) {
  var sentResponse = false;
  var queuedSignRequest;

  function sendErrorResponse(error) {
    sendResponseOnce(sentResponse, queuedSignRequest,
        makeU2fErrorResponse(request, error.errorCode, error.errorMessage),
        sendResponse);
  }

  function sendSuccessResponse(challenge, info, browserData) {
    var responseData = makeU2fSignResponseDataFromChallenge(challenge);
    addSignatureAndBrowserDataToResponseData(responseData, info, browserData,
        'clientData');
    var response = makeU2fSuccessResponse(request, responseData);
    sendResponseOnce(sentResponse, queuedSignRequest, response, sendResponse);
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

  queuedSignRequest =
      validateAndEnqueueSignRequest(
          sender, request, sendErrorResponse, sendSuccessResponse);
  return queuedSignRequest;
}

/**
 * Creates a base U2F responseData object from the server challenge.
 * @param {SignChallenge} challenge The server challenge.
 * @return {Object} The responseData object.
 */
function makeU2fSignResponseDataFromChallenge(challenge) {
  var responseData = {
    'keyHandle': challenge['keyHandle']
  };
  return responseData;
}

/**
 * Adds the browser data and signature values to a responseData object.
 * @param {Object} responseData The "base" responseData object.
 * @param {string} signatureData The signature data.
 * @param {string} browserData The browser data generated from the challenge.
 * @param {string} browserDataName The name of the browser data key in the
 *     responseData object.
 */
function addSignatureAndBrowserDataToResponseData(responseData, signatureData,
    browserData, browserDataName) {
  responseData[browserDataName] = B64_encode(UTIL_StringToBytes(browserData));
  responseData['signatureData'] = signatureData;
}

/**
 * Validates a sign request using the given sign challenges name, and, if valid,
 * enqueues the sign request for eventual processing.
 * @param {WebRequestSender} sender The sender of the message.
 * @param {Object} request The web page's sign request.
 * @param {function(U2fError)} errorCb Error callback.
 * @param {function(SignChallenge, string, string)} successCb Success callback.
 * @return {Closeable} Request handler that should be closed when the browser
 *     message channel is closed.
 */
function validateAndEnqueueSignRequest(sender, request, errorCb, successCb) {
  function timeout() {
    errorCb({errorCode: ErrorCodes.TIMEOUT});
  }

  if (!isValidSignRequest(request)) {
    errorCb({errorCode: ErrorCodes.BAD_REQUEST});
    return null;
  }

  // The typecast is necessary because getSignChallenges can return undefined.
  // On the other hand, a valid sign request can't contain an undefined sign
  // challenge list, so the typecast is safe.
  var signChallenges = /** @type {!Array<SignChallenge>} */ (
      getSignChallenges(request));
  var appId;
  if (request['appId']) {
    appId = request['appId'];
  } else if (signChallenges.length) {
    appId = signChallenges[0]['appId'];
  }
  // Sanity check
  if (!appId) {
    console.warn(UTIL_fmt('empty sign appId?'));
    errorCb({errorCode: ErrorCodes.BAD_REQUEST});
    return null;
  }
  var timeoutValueSeconds = getTimeoutValueFromRequest(request);
  // Attenuate watchdog timeout value less than the signer's timeout, so the
  // watchdog only fires after the signer could reasonably have called back,
  // not before.
  timeoutValueSeconds = attenuateTimeoutInSeconds(timeoutValueSeconds,
      MINIMUM_TIMEOUT_ATTENUATION_SECONDS / 2);
  var watchdog = new WatchdogRequestHandler(timeoutValueSeconds, timeout);
  var wrappedErrorCb = watchdog.wrapCallback(errorCb);
  var wrappedSuccessCb = watchdog.wrapCallback(successCb);

  var timer = createAttenuatedTimer(
      FACTORY_REGISTRY.getCountdownFactory(), timeoutValueSeconds);
  var logMsgUrl = request['logMsgUrl'];

  // Queue sign requests from the same origin, to protect against simultaneous
  // sign-out on many tabs resulting in repeated sign-in requests.
  var queuedSignRequest = new QueuedSignRequest(signChallenges,
      timer, sender, wrappedErrorCb, wrappedSuccessCb, request['challenge'],
      appId, logMsgUrl);
  if (!gnubbySignRequestQueue) {
    initRequestQueue();
  }
  var requestToken = gnubbySignRequestQueue.queueRequest(appId, sender.origin,
      queuedSignRequest.begin.bind(queuedSignRequest), timer);
  queuedSignRequest.setToken(requestToken);

  watchdog.setCloseable(queuedSignRequest);
  return watchdog;
}

/**
 * Returns whether the request appears to be a valid sign request.
 * @param {Object} request The request.
 * @return {boolean} Whether the request appears valid.
 */
function isValidSignRequest(request) {
  var signChallenges = getSignChallenges(request);
  if (!signChallenges) {
    return false;
  }
  var hasDefaultChallenge = request.hasOwnProperty('challenge');
  var hasAppId = request.hasOwnProperty('appId');
  // If the sign challenge array is empty, the global appId is required.
  if (!hasAppId && (!signChallenges || !signChallenges.length)) {
    return false;
  }
  return isValidSignChallengeArray(signChallenges, !hasDefaultChallenge,
      !hasAppId);
}

/**
 * Adapter class representing a queued sign request.
 * @param {!Array<SignChallenge>} signChallenges The sign challenges.
 * @param {Countdown} timer Timeout timer
 * @param {WebRequestSender} sender Message sender.
 * @param {function(U2fError)} errorCb Error callback
 * @param {function(SignChallenge, string, string)} successCb Success callback
 * @param {string|undefined} opt_defaultChallenge A default sign challenge
 *     value, if a request does not provide one.
 * @param {string|undefined} opt_appId The app id for the entire request.
 * @param {string|undefined} opt_logMsgUrl Url to post log messages to
 * @constructor
 * @implements {Closeable}
 */
function QueuedSignRequest(signChallenges, timer, sender, errorCb,
    successCb, opt_defaultChallenge, opt_appId, opt_logMsgUrl) {
  /** @private {!Array<SignChallenge>} */
  this.signChallenges_ = signChallenges;
  /** @private {Countdown} */
  this.timer_ = timer.clone(this.close.bind(this));
  /** @private {WebRequestSender} */
  this.sender_ = sender;
  /** @private {function(U2fError)} */
  this.errorCb_ = errorCb;
  /** @private {function(SignChallenge, string, string)} */
  this.successCb_ = successCb;
  /** @private {string|undefined} */
  this.defaultChallenge_ = opt_defaultChallenge;
  /** @private {string|undefined} */
  this.appId_ = opt_appId;
  /** @private {string|undefined} */
  this.logMsgUrl_ = opt_logMsgUrl;
  /** @private {boolean} */
  this.begun_ = false;
  /** @private {boolean} */
  this.closed_ = false;
}

/** Closes this sign request. */
QueuedSignRequest.prototype.close = function() {
  if (this.closed_) return;
  var hadBegunSigning = false;
  if (this.begun_ && this.signer_) {
    this.signer_.close();
    hadBegunSigning = true;
  }
  if (this.token_) {
    if (hadBegunSigning) {
      console.log(UTIL_fmt('closing in-progress request'));
    } else {
      console.log(UTIL_fmt('closing timed-out request before processing'));
    }
    this.token_.complete();
  }
  this.closed_ = true;
};

/**
 * @param {QueuedRequestToken} token Token for this sign request.
 */
QueuedSignRequest.prototype.setToken = function(token) {
  /** @private {QueuedRequestToken} */
  this.token_ = token;
};

/**
 * Called when this sign request may begin work.
 * @param {QueuedRequestToken} token Token for this sign request.
 */
QueuedSignRequest.prototype.begin = function(token) {
  if (this.timer_.expired()) {
    console.log(UTIL_fmt('Queued request begun after timeout'));
    this.close();
    this.errorCb_({errorCode: ErrorCodes.TIMEOUT});
    return;
  }
  this.begun_ = true;
  this.setToken(token);
  this.signer_ = new Signer(this.timer_, this.sender_,
      this.signerFailed_.bind(this), this.signerSucceeded_.bind(this),
      this.logMsgUrl_);
  if (!this.signer_.setChallenges(this.signChallenges_, this.defaultChallenge_,
      this.appId_)) {
    token.complete();
    this.errorCb_({errorCode: ErrorCodes.BAD_REQUEST});
  }
  // Signer now has responsibility for maintaining timeout.
  this.timer_.clearTimeout();
};

/**
 * Called when this request's signer fails.
 * @param {U2fError} error The failure reported by the signer.
 * @private
 */
QueuedSignRequest.prototype.signerFailed_ = function(error) {
  this.token_.complete();
  this.errorCb_(error);
};

/**
 * Called when this request's signer succeeds.
 * @param {SignChallenge} challenge The challenge that was signed.
 * @param {string} info The sign result.
 * @param {string} browserData Browser data JSON
 * @private
 */
QueuedSignRequest.prototype.signerSucceeded_ =
    function(challenge, info, browserData) {
  this.token_.complete();
  this.successCb_(challenge, info, browserData);
};

/**
 * Creates an object to track signing with a gnubby.
 * @param {Countdown} timer Timer for sign request.
 * @param {WebRequestSender} sender The message sender.
 * @param {function(U2fError)} errorCb Called when the sign operation fails.
 * @param {function(SignChallenge, string, string)} successCb Called when the
 *     sign operation succeeds.
 * @param {string=} opt_logMsgUrl The url to post log messages to.
 * @constructor
 */
function Signer(timer, sender, errorCb, successCb, opt_logMsgUrl) {
  /** @private {Countdown} */
  this.timer_ = timer.clone();
  /** @private {WebRequestSender} */
  this.sender_ = sender;
  /** @private {function(U2fError)} */
  this.errorCb_ = errorCb;
  /** @private {function(SignChallenge, string, string)} */
  this.successCb_ = successCb;
  /** @private {string|undefined} */
  this.logMsgUrl_ = opt_logMsgUrl;

  /** @private {boolean} */
  this.challengesSet_ = false;
  /** @private {boolean} */
  this.done_ = false;

  /** @private {Object<string, string>} */
  this.browserData_ = {};
  /** @private {Object<string, SignChallenge>} */
  this.serverChallenges_ = {};
  // Allow http appIds for http origins. (Broken, but the caller deserves
  // what they get.)
  /** @private {boolean} */
  this.allowHttp_ = this.sender_.origin ?
      this.sender_.origin.indexOf('http://') == 0 : false;
  /** @private {Closeable} */
  this.handler_ = null;
}

/**
 * Sets the challenges to be signed.
 * @param {Array<SignChallenge>} signChallenges The challenges to set.
 * @param {string=} opt_defaultChallenge A default sign challenge
 *     value, if a request does not provide one.
 * @param {string=} opt_appId The app id for the entire request.
 * @return {boolean} Whether the challenges could be set.
 */
Signer.prototype.setChallenges = function(signChallenges, opt_defaultChallenge,
    opt_appId) {
  if (this.challengesSet_ || this.done_)
    return false;
  if (this.timer_.expired()) {
    this.notifyError_({errorCode: ErrorCodes.TIMEOUT});
    return true;
  }
  /** @private {Array<SignChallenge>} */
  this.signChallenges_ = signChallenges;
  /** @private {string|undefined} */
  this.defaultChallenge_ = opt_defaultChallenge;
  /** @private {string|undefined} */
  this.appId_ = opt_appId;
  /** @private {boolean} */
  this.challengesSet_ = true;

  this.checkAppIds_();
  return true;
};

/**
 * Checks the app ids of incoming requests.
 * @private
 */
Signer.prototype.checkAppIds_ = function() {
  var appIds = getDistinctAppIds(this.signChallenges_);
  if (this.appId_) {
    appIds = UTIL_unionArrays([this.appId_], appIds);
  }
  if (!appIds || !appIds.length) {
    var error = {
      errorCode: ErrorCodes.BAD_REQUEST,
      errorMessage: 'missing appId'
    };
    this.notifyError_(error);
    return;
  }
  FACTORY_REGISTRY.getOriginChecker()
      .canClaimAppIds(this.sender_.origin, appIds)
      .then(this.originChecked_.bind(this, appIds));
};

/**
 * Called with the result of checking the origin. When the origin is allowed
 * to claim the app ids, begins checking whether the app ids also list the
 * origin.
 * @param {!Array<string>} appIds The app ids.
 * @param {boolean} result Whether the origin could claim the app ids.
 * @private
 */
Signer.prototype.originChecked_ = function(appIds, result) {
  if (!result) {
    var error = {
      errorCode: ErrorCodes.BAD_REQUEST,
      errorMessage: 'bad appId'
    };
    this.notifyError_(error);
    return;
  }
  var appIdChecker = FACTORY_REGISTRY.getAppIdCheckerFactory().create();
  appIdChecker.
      checkAppIds(
          this.timer_.clone(), this.sender_.origin,
          /** @type {!Array<string>} */ (appIds), this.allowHttp_,
          this.logMsgUrl_)
      .then(this.appIdChecked_.bind(this));
};

/**
 * Called with the result of checking app ids.  When the app ids are valid,
 * adds the sign challenges to those being signed.
 * @param {boolean} result Whether the app ids are valid.
 * @private
 */
Signer.prototype.appIdChecked_ = function(result) {
  if (!result) {
    var error = {
      errorCode: ErrorCodes.BAD_REQUEST,
      errorMessage: 'bad appId'
    };
    this.notifyError_(error);
    return;
  }
  if (!this.doSign_()) {
    this.notifyError_({errorCode: ErrorCodes.BAD_REQUEST});
    return;
  }
};

/**
 * Begins signing this signer's challenges.
 * @return {boolean} Whether the challenge could be added.
 * @private
 */
Signer.prototype.doSign_ = function() {
  // Create the browser data for each challenge.
  for (var i = 0; i < this.signChallenges_.length; i++) {
    var challenge = this.signChallenges_[i];
    var serverChallenge;
    if (challenge.hasOwnProperty('challenge')) {
      serverChallenge = challenge['challenge'];
    } else {
      serverChallenge = this.defaultChallenge_;
    }
    if (!serverChallenge) {
      console.warn(UTIL_fmt('challenge missing'));
      return false;
    }
    var keyHandle = challenge['keyHandle'];

    var browserData =
        makeSignBrowserData(serverChallenge, this.sender_.origin,
            this.sender_.tlsChannelId);
    this.browserData_[keyHandle] = browserData;
    this.serverChallenges_[keyHandle] = challenge;
  }

  var encodedChallenges = encodeSignChallenges(this.signChallenges_,
      this.defaultChallenge_, this.appId_, this.getChallengeHash_.bind(this));

  var timeoutSeconds = this.timer_.millisecondsUntilExpired() / 1000.0;
  var request = makeSignHelperRequest(encodedChallenges, timeoutSeconds,
      this.logMsgUrl_);
  this.handler_ =
      FACTORY_REGISTRY.getRequestHelper()
          .getHandler(/** @type {HelperRequest} */ (request));
  if (!this.handler_)
    return false;
  return this.handler_.run(this.helperComplete_.bind(this));
};

/**
 * @param {string} keyHandle The key handle used with the challenge.
 * @param {string} challenge The challenge.
 * @return {string} The hashed challenge associated with the key
 *     handle/challenge pair.
 * @private
 */
Signer.prototype.getChallengeHash_ = function(keyHandle, challenge) {
  return B64_encode(sha256HashOfString(this.browserData_[keyHandle]));
};

/** Closes this signer. */
Signer.prototype.close = function() {
  this.close_();
};

/**
 * Closes this signer, and optionally notifies the caller of error.
 * @param {boolean=} opt_notifying When true, this method is being called in the
 *     process of notifying the caller of an existing status. When false,
 *     the caller is notified with a default error value, ErrorCodes.TIMEOUT.
 * @private
 */
Signer.prototype.close_ = function(opt_notifying) {
  if (this.handler_) {
    this.handler_.close();
    this.handler_ = null;
  }
  this.timer_.clearTimeout();
  if (!opt_notifying) {
    this.notifyError_({errorCode: ErrorCodes.TIMEOUT});
  }
};

/**
 * Notifies the caller of error.
 * @param {U2fError} error Error.
 * @private
 */
Signer.prototype.notifyError_ = function(error) {
  if (this.done_)
    return;
  this.done_ = true;
  this.close_(true);
  this.errorCb_(error);
};

/**
 * Notifies the caller of success.
 * @param {SignChallenge} challenge The challenge that was signed.
 * @param {string} info The sign result.
 * @param {string} browserData Browser data JSON
 * @private
 */
Signer.prototype.notifySuccess_ = function(challenge, info, browserData) {
  if (this.done_)
    return;
  this.done_ = true;
  this.close_(true);
  this.successCb_(challenge, info, browserData);
};

/**
 * Called by the helper upon completion.
 * @param {HelperReply} helperReply The result of the sign request.
 * @param {string=} opt_source The source of the sign result.
 * @private
 */
Signer.prototype.helperComplete_ = function(helperReply, opt_source) {
  if (helperReply.type != 'sign_helper_reply') {
    this.notifyError_({errorCode: ErrorCodes.OTHER_ERROR});
    return;
  }
  var reply = /** @type {SignHelperReply} */ (helperReply);

  if (reply.code) {
    var reportedError = mapDeviceStatusCodeToU2fError(reply.code);
    console.log(UTIL_fmt('helper reported ' + reply.code.toString(16) +
        ', returning ' + reportedError.errorCode));
    this.notifyError_(reportedError);
  } else {
    if (this.logMsgUrl_ && opt_source) {
      var logMsg = 'signed&source=' + opt_source;
      logMessage(logMsg, this.logMsgUrl_);
    }

    var key = reply.responseData['keyHandle'];
    var browserData = this.browserData_[key];
    // Notify with server-provided challenge, not the encoded one: the
    // server-provided challenge contains additional fields it relies on.
    var serverChallenge = this.serverChallenges_[key];
    this.notifySuccess_(serverChallenge, reply.responseData.signatureData,
        browserData);
  }
};
