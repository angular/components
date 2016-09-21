/**
 * @fileoverview Provides a Google-specific implementation of appId checks,
 * with a built-in origin list to allow sign-in in case of gstatic.com failure.
 */
'use strict';

/**
 * Provides an object to track checking a list of appIds.
 * @param {!TextFetcher} fetcher A URL fetcher.
 * @constructor
 * @implements AppIdChecker
 */
function GoogleAppIdChecker(fetcher) {
  /** @private {!XhrAppIdChecker} */
  this.xhrAppIdChecker_ = new XhrAppIdChecker(fetcher);
}

/**
 * Checks whether all the app ids provided can be asserted by the given origin.
 * @param {!Countdown} timer A timer by which to resolve all provided app ids.
 * @param {string} origin The origin to check.
 * @param {!Array<string>} appIds The app ids to check.
 * @param {boolean} allowHttp Whether to allow http:// URLs.
 * @param {string=} opt_logMsgUrl A log message URL.
 * @return {Promise<boolean>} A promise for the result of the check
 */
GoogleAppIdChecker.prototype.checkAppIds =
    function(timer, origin, appIds, allowHttp, opt_logMsgUrl) {
  var appIdsMap = {};
  if (appIds) {
    for (var i = 0; i < appIds.length; i++) {
      appIdsMap[appIds[i]] = appIds[i];
    }
  }
  var distinctAppIds = Object.keys(appIdsMap);
  if (!distinctAppIds.length) {
    return Promise.resolve(false);
  }
  // Check the internal list first.
  if (this.originAllowedByInternalAppIds_(origin, distinctAppIds)) {
    return Promise.resolve(true);
  }
  return this.xhrAppIdChecker_.
      checkAppIds(timer, origin, appIds, allowHttp, opt_logMsgUrl);
};

/**
 * Checks whether the origin is allowed by all of the given appIds,
 * according to the built-in list.
 * @param {string} origin The origin to check.
 * @param {!Array<string>} appIds The app ids to check.
 * @return {boolean} Whether the origin is allowed by the internal list.
 * @private
 */
GoogleAppIdChecker.prototype.originAllowedByInternalAppIds_ =
    function(origin, appIds) {
  for (var i = 0; i < appIds.length; i++) {
    var appId = appIds[i];
    if (GoogleAppIdChecker.GSTATIC_KNOWN_ORIGINS.hasOwnProperty(appId)) {
      var allowedOrigins = GoogleAppIdChecker.GSTATIC_KNOWN_ORIGINS[appId];
      if (allowedOrigins.indexOf(origin) == -1) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
};

/**
 * The fixed, known origins for Google's appIds. This is a subset of all
 * allowed origins, but is sufficient to allow sign-in.
 * @const
 */
GoogleAppIdChecker.GSTATIC_KNOWN_ORIGINS = {
  'https://www.gstatic.com/securitykey/origins.json': [
      'https://accounts.google.com'
  ],
  'https://www.gstatic.com/securitykey/a/google.com/origins.json': [
      'https://accounts.google.com',
      'https://login.corp.google.com'
  ],
};

/**
 * A factory to create an GoogleAppIdChecker.
 * @implements AppIdCheckerFactory
 * @param {!TextFetcher} fetcher
 * @constructor
 */
function GoogleAppIdCheckerFactory(fetcher) {
  /** @private {!TextFetcher} */
  this.fetcher_ = fetcher;
}

/**
 * @return {!AppIdChecker} A new AppIdChecker.
 */
GoogleAppIdCheckerFactory.prototype.create = function() {
  return new GoogleAppIdChecker(this.fetcher_);
};
