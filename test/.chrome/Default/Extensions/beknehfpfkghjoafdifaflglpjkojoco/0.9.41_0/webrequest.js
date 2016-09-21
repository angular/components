/**
 * @fileoverview Does common handling for requests coming from web pages and
 * routes them to the provided handler.
 */

/**
 * FIDO U2F Javascript API Version
 * @const
 * @type {number}
 */
var JS_API_VERSION = 1.1;

/**
 * Gets the scheme + origin from a web url.
 * @param {string} url Input url
 * @return {?string} Scheme and origin part if url parses
 */
function getOriginFromUrl(url) {
  var re = new RegExp('^(https?://)[^/]*/?');
  var originarray = re.exec(url);
  if (originarray == null) return originarray;
  var origin = originarray[0];
  while (origin.charAt(origin.length - 1) == '/') {
    origin = origin.substring(0, origin.length - 1);
  }
  if (origin == 'http:' || origin == 'https:')
    return null;
  return origin;
}

/**
 * Returns whether the registered key appears to be valid.
 * @param {Object} registeredKey The registered key object.
 * @param {boolean} appIdRequired Whether the appId property is required on
 *     each challenge.
 * @return {boolean} Whether the object appears valid.
 */
function isValidRegisteredKey(registeredKey, appIdRequired) {
  if (appIdRequired && !registeredKey.hasOwnProperty('appId')) {
    return false;
  }
  if (!registeredKey.hasOwnProperty('keyHandle'))
    return false;
  if (registeredKey['version']) {
    if (registeredKey['version'] != 'U2F_V1' &&
        registeredKey['version'] != 'U2F_V2') {
      return false;
    }
  }
  return true;
}

/**
 * Returns whether the array of registered keys appears to be valid.
 * @param {Array<Object>} registeredKeys The array of registered keys.
 * @param {boolean} appIdRequired Whether the appId property is required on
 *     each challenge.
 * @return {boolean} Whether the array appears valid.
 */
function isValidRegisteredKeyArray(registeredKeys, appIdRequired) {
  return registeredKeys.every(function(key) {
    return isValidRegisteredKey(key, appIdRequired);
  });
}

/**
 * Gets the sign challenges from the request. The sign challenges may be the
 * U2F 1.0 variant, signRequests, or the U2F 1.1 version, registeredKeys.
 * @param {Object} request The request.
 * @return {!Array<SignChallenge>|undefined} The sign challenges, if found.
 */
function getSignChallenges(request) {
  if (!request) {
    return undefined;
  }
  var signChallenges;
  if (request.hasOwnProperty('signRequests')) {
    signChallenges = request['signRequests'];
  } else if (request.hasOwnProperty('registeredKeys')) {
    signChallenges = request['registeredKeys'];
  }
  return signChallenges;
}

/**
 * Returns whether the array of SignChallenges appears to be valid.
 * @param {Array<SignChallenge>} signChallenges The array of sign challenges.
 * @param {boolean} challengeValueRequired Whether each challenge object
 *     requires a challenge value.
 * @param {boolean} appIdRequired Whether the appId property is required on
 *     each challenge.
 * @return {boolean} Whether the array appears valid.
 */
function isValidSignChallengeArray(signChallenges, challengeValueRequired,
    appIdRequired) {
  for (var i = 0; i < signChallenges.length; i++) {
    var incomingChallenge = signChallenges[i];
    if (challengeValueRequired &&
        !incomingChallenge.hasOwnProperty('challenge'))
      return false;
    if (!isValidRegisteredKey(incomingChallenge, appIdRequired)) {
      return false;
    }
  }
  return true;
}

/**
 * @param {Object} request Request object
 * @param {MessageSender} sender Sender frame
 * @param {Function} sendResponse Response callback
 * @return {?Closeable} Optional handler object that should be closed when port
 *     closes
 */
function handleWebPageRequest(request, sender, sendResponse) {
  switch (request.type) {
    case MessageTypes.U2F_REGISTER_REQUEST:
      return handleU2fEnrollRequest(sender, request, sendResponse);

    case MessageTypes.U2F_SIGN_REQUEST:
      return handleU2fSignRequest(sender, request, sendResponse);

    case MessageTypes.U2F_GET_API_VERSION_REQUEST:
      sendResponse(
          makeU2fGetApiVersionResponse(request, JS_API_VERSION,
              MessageTypes.U2F_GET_API_VERSION_RESPONSE));
      return null;

    default:
      sendResponse(
          makeU2fErrorResponse(request, ErrorCodes.BAD_REQUEST, undefined,
              MessageTypes.U2F_REGISTER_RESPONSE));
      return null;
  }
}

/**
 * Makes a response to a request.
 * @param {Object} request The request to make a response to.
 * @param {string} responseSuffix How to name the response's type.
 * @param {string=} opt_defaultType The default response type, if none is
 *     present in the request.
 * @return {Object} The response object.
 */
function makeResponseForRequest(request, responseSuffix, opt_defaultType) {
  var type;
  if (request && request.type) {
    type = request.type.replace(/_request$/, responseSuffix);
  } else {
    type = opt_defaultType;
  }
  var reply = { 'type': type };
  if (request && request.requestId) {
    reply.requestId = request.requestId;
  }
  return reply;
}

/**
 * Makes a response to a U2F request with an error code.
 * @param {Object} request The request to make a response to.
 * @param {ErrorCodes} code The error code to return.
 * @param {string=} opt_detail An error detail string.
 * @param {string=} opt_defaultType The default response type, if none is
 *     present in the request.
 * @return {Object} The U2F error.
 */
function makeU2fErrorResponse(request, code, opt_detail, opt_defaultType) {
  var reply = makeResponseForRequest(request, '_response', opt_defaultType);
  var error = {'errorCode': code};
  if (opt_detail) {
    error['errorMessage'] = opt_detail;
  }
  reply['responseData'] = error;
  return reply;
}

/**
 * Makes a success response to a web request with a responseData object.
 * @param {Object} request The request to make a response to.
 * @param {Object} responseData The response data.
 * @return {Object} The web error.
 */
function makeU2fSuccessResponse(request, responseData) {
  var reply = makeResponseForRequest(request, '_response');
  reply['responseData'] = responseData;
  return reply;
}

/**
 * Maps a helper's error code from the DeviceStatusCodes namespace to a
 * U2fError.
 * @param {number} code Error code from DeviceStatusCodes namespace.
 * @return {U2fError} An error.
 */
function mapDeviceStatusCodeToU2fError(code) {
  switch (code) {
    case DeviceStatusCodes.WRONG_DATA_STATUS:
      return {errorCode: ErrorCodes.DEVICE_INELIGIBLE};

    case DeviceStatusCodes.TIMEOUT_STATUS:
    case DeviceStatusCodes.WAIT_TOUCH_STATUS:
      return {errorCode: ErrorCodes.TIMEOUT};

    default:
      var reportedError = {
        errorCode: ErrorCodes.OTHER_ERROR,
        errorMessage: 'device status code: ' + code.toString(16)
      };
      return reportedError;
  }
}

/**
 * Sends a response, using the given sentinel to ensure at most one response is
 * sent. Also closes the closeable, if it's given.
 * @param {boolean} sentResponse Whether a response has already been sent.
 * @param {?Closeable} closeable A thing to close.
 * @param {*} response The response to send.
 * @param {Function} sendResponse A function to send the response.
 */
function sendResponseOnce(sentResponse, closeable, response, sendResponse) {
  if (closeable) {
    closeable.close();
  }
  if (!sentResponse) {
    sentResponse = true;
    try {
      // If the page has gone away or the connection has otherwise gone,
      // sendResponse fails.
      sendResponse(response);
    } catch (exception) {
      console.warn('sendResponse failed: ' + exception);
    }
  } else {
    console.warn(UTIL_fmt('Tried to reply more than once!'));
  }
}

/**
 * @param {!string} string Input string
 * @return {Array<number>} SHA256 hash value of string.
 */
function sha256HashOfString(string) {
  var s = new SHA256();
  s.update(UTIL_StringToBytes(string));
  return s.digest();
}

var UNUSED_CID_PUBKEY_VALUE = 'unused';

/**
 * Normalizes the TLS channel ID value:
 * 1. Converts semantically empty values (undefined, null, 0) to the empty
 *     string.
 * 2. Converts valid JSON strings to a JS object.
 * 3. Otherwise, returns the input value unmodified.
 * @param {Object|string|undefined} opt_tlsChannelId TLS Channel id
 * @return {Object|string} The normalized TLS channel ID value.
 */
function tlsChannelIdValue(opt_tlsChannelId) {
  if (!opt_tlsChannelId) {
    // Case 1: Always set some value for TLS channel ID, even if it's the empty
    // string: this browser definitely supports them.
    return UNUSED_CID_PUBKEY_VALUE;
  }
  if (typeof opt_tlsChannelId === 'string') {
    try {
      var obj = JSON.parse(opt_tlsChannelId);
      if (!obj) {
        // Case 1: The string value 'null' parses as the Javascript object null,
        // so return an empty string: the browser definitely supports TLS
        // channel id.
        return UNUSED_CID_PUBKEY_VALUE;
      }
      // Case 2: return the value as a JS object.
      return /** @type {Object} */ (obj);
    } catch (e) {
      console.warn('Unparseable TLS channel ID value ' + opt_tlsChannelId);
      // Case 3: return the value unmodified.
    }
  }
  return opt_tlsChannelId;
}

/**
 * Creates a browser data object with the given values.
 * @param {!string} type A string representing the "type" of this browser data
 *     object.
 * @param {!string} serverChallenge The server's challenge, as a base64-
 *     encoded string.
 * @param {!string} origin The server's origin, as seen by the browser.
 * @param {Object|string|undefined} opt_tlsChannelId TLS Channel Id
 * @return {string} A string representation of the browser data object.
 */
function makeBrowserData(type, serverChallenge, origin, opt_tlsChannelId) {
  var browserData = {
    'typ' : type,
    'challenge' : serverChallenge,
    'origin' : origin
  };
  if (BROWSER_SUPPORTS_TLS_CHANNEL_ID) {
    browserData['cid_pubkey'] = tlsChannelIdValue(opt_tlsChannelId);
  }
  return JSON.stringify(browserData);
}

/**
 * Creates a browser data object for an enroll request with the given values.
 * @param {!string} serverChallenge The server's challenge, as a base64-
 *     encoded string.
 * @param {!string} origin The server's origin, as seen by the browser.
 * @param {Object|string|undefined} opt_tlsChannelId TLS Channel Id
 * @return {string} A string representation of the browser data object.
 */
function makeEnrollBrowserData(serverChallenge, origin, opt_tlsChannelId) {
  return makeBrowserData(
      'navigator.id.finishEnrollment', serverChallenge, origin,
      opt_tlsChannelId);
}

/**
 * Creates a browser data object for a sign request with the given values.
 * @param {!string} serverChallenge The server's challenge, as a base64-
 *     encoded string.
 * @param {!string} origin The server's origin, as seen by the browser.
 * @param {Object|string|undefined} opt_tlsChannelId TLS Channel Id
 * @return {string} A string representation of the browser data object.
 */
function makeSignBrowserData(serverChallenge, origin, opt_tlsChannelId) {
  return makeBrowserData(
      'navigator.id.getAssertion', serverChallenge, origin, opt_tlsChannelId);
}

/**
 * Makes a response to a U2F request with an error code.
 * @param {Object} request The request to make a response to.
 * @param {number=} version The JS API version to return.
 * @param {string=} opt_defaultType The default response type, if none is
 *     present in the request.
 * @return {Object} The GetJsApiVersionResponse.
 */
function makeU2fGetApiVersionResponse(request, version, opt_defaultType) {
  var reply = makeResponseForRequest(request, '_response', opt_defaultType);
  var data = {'js_api_version': version};
  reply['responseData'] = data;
  return reply;
}

/**
 * Encodes the sign data as an array of sign helper challenges.
 * @param {Array<SignChallenge>} signChallenges The sign challenges to encode.
 * @param {string|undefined} opt_defaultChallenge A default sign challenge
 *     value, if a request does not provide one.
 * @param {string=} opt_defaultAppId The app id to use for each challenge, if
 *     the challenge contains none.
 * @param {function(string, string): string=} opt_challengeHashFunction
 *     A function that produces, from a key handle and a raw challenge, a hash
 *     of the raw challenge. If none is provided, a default hash function is
 *     used.
 * @return {!Array<SignHelperChallenge>} The sign challenges, encoded.
 */
function encodeSignChallenges(signChallenges, opt_defaultChallenge,
    opt_defaultAppId, opt_challengeHashFunction) {
  function encodedSha256(keyHandle, challenge) {
    return B64_encode(sha256HashOfString(challenge));
  }
  var challengeHashFn = opt_challengeHashFunction || encodedSha256;
  var encodedSignChallenges = [];
  if (signChallenges) {
    for (var i = 0; i < signChallenges.length; i++) {
      var challenge = signChallenges[i];
      var keyHandle = challenge['keyHandle'];
      var challengeValue;
      if (challenge.hasOwnProperty('challenge')) {
        challengeValue = challenge['challenge'];
      } else {
        challengeValue = opt_defaultChallenge;
      }
      var challengeHash = challengeHashFn(keyHandle, challengeValue);
      var appId;
      if (challenge.hasOwnProperty('appId')) {
        appId = challenge['appId'];
      } else {
        appId = opt_defaultAppId;
      }
      var encodedChallenge = {
        'challengeHash': challengeHash,
        'appIdHash': B64_encode(sha256HashOfString(appId)),
        'keyHandle': keyHandle,
        'version': (challenge['version'] || 'U2F_V1')
      };
      encodedSignChallenges.push(encodedChallenge);
    }
  }
  return encodedSignChallenges;
}

/**
 * Makes a sign helper request from an array of challenges.
 * @param {Array<SignHelperChallenge>} challenges The sign challenges.
 * @param {number=} opt_timeoutSeconds Timeout value.
 * @param {string=} opt_logMsgUrl URL to log to.
 * @return {SignHelperRequest} The sign helper request.
 */
function makeSignHelperRequest(challenges, opt_timeoutSeconds, opt_logMsgUrl) {
  var request = {
    'type': 'sign_helper_request',
    'signData': challenges,
    'timeout': opt_timeoutSeconds || 0,
    'timeoutSeconds': opt_timeoutSeconds || 0
  };
  if (opt_logMsgUrl !== undefined) {
    request.logMsgUrl = opt_logMsgUrl;
  }
  return request;
}
