/**
 * @fileoverview Debugging related routines.
 */


/**
 * Creates a browser data object with the given values.
 * @param {!string} type A string representing the "type" of this browser data
 *     object.
 * @param {!string} serverChallenge The server's challenge, as a base64-
 *     encoded string.
 * @param {!string} origin The server's origin, as seen by the browser.
 * @param {Object|string|undefined} opt_tlsChannelId TLS Channel Id
 * @return {string} A string representation of the browser data object.
 * @private
 */
function originStrippingMakeBrowserData_(
    type, serverChallenge, origin, opt_tlsChannelId) {
  var browserDataString = original_makeBrowserData(type, serverChallenge,
      origin, opt_tlsChannelId);
  var browserData = JSON.parse(browserDataString);
  delete browserData.origin;
  return JSON.stringify(browserData);
}

/**
 * An implementation of AppIdChecker that always returns true.
 * @constructor
 * @implements AppIdChecker
 */
function AllowAnyAppIdChecker() {}

/**
 * Checks whether all the app ids provided can be asserted by the given origin.
 * @param {!Countdown} timer A timer by which to resolve all provided app ids.
 * @param {string} origin The origin to check.
 * @param {!Array<string>} appIds The app ids to check.
 * @param {boolean} allowHttp Whether to allow http:// URLs.
 * @param {string=} opt_logMsgUrl A log message URL.
 * @return {Promise<boolean>} A promise for the result of the check
 */
AllowAnyAppIdChecker.prototype.checkAppIds =
    function(timer, origin, appIds, allowHttp, opt_logMsgUrl) {
  return Promise.resolve(true);
};

/** Closes this checker. */
AllowAnyAppIdChecker.prototype.close = function() {};

/**
 * A factory to create a AllowAnyAppIdChecker.
 * @implements AppIdCheckerFactory
 * @constructor
 */
function AllowAnyAppIdCheckerFactory() {
  /** @private {!AppIdChecker} */
  this.checker_ = new AllowAnyAppIdChecker();
}

/**
 * @return {!AppIdChecker} A new AppIdChecker.
 */
AllowAnyAppIdCheckerFactory.prototype.create = function() {
  return this.checker_;
};

var original_makeBrowserData;
var original_appIdCheckerFactory;

function enableLocalTestingHacks() {
  window.HTTP_ORIGINS_ALLOWED = true;
  if (!original_makeBrowserData) {
    original_makeBrowserData = makeBrowserData;
    makeBrowserData = originStrippingMakeBrowserData_;
  }
  if (!original_appIdCheckerFactory) {
    original_appIdCheckerFactory = FACTORY_REGISTRY.getAppIdCheckerFactory();
    FACTORY_REGISTRY.appIdCheckerFactory_ = new AllowAnyAppIdCheckerFactory();
  }
}

function disableLocalTestingHacks() {
  window.HTTP_ORIGINS_ALLOWED = false;
  if (original_makeBrowserData) {
    // Static type inference FTL. original_makeBrowserData is obviously not
    // undefined here, due to the if clause that got us here, but the assignment
    // below appears to confuse the static type checker.
    makeBrowserData =
        /** @type {function(string, string, string, (Object|string|undefined)):
         *      string}
         */
        (original_makeBrowserData);
    original_makeBrowserData = undefined;
  }
  if (original_appIdCheckerFactory) {
    FACTORY_REGISTRY.appIdCheckerFactory_ = original_appIdCheckerFactory;
    original_appIdCheckerFactory = undefined;
  }
}
