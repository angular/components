/**
 * @fileoverview Implements a check whether an origin is allowed to assert an
 * app id based on a fixed set of allowed app ids for the google.com domain.
 *
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * Implements half of the app id policy: whether an origin is allowed to claim
 * an app id. For checking whether the app id also lists the origin,
 * @see AppIdChecker.
 * @implements OriginChecker
 * @constructor
 */
function GstaticOriginChecker() {
}

/**
 * Checks whether the origin is allowed to claim the app ids.
 * @param {string} origin The origin claiming the app id.
 * @param {!Array<string>} appIds The app ids being claimed.
 * @return {Promise<boolean>} A promise for the result of the check.
 */
GstaticOriginChecker.prototype.canClaimAppIds = function(origin, appIds) {
  return Promise.resolve(appIds.every(this.checkAppId_.bind(this, origin)));
};

/**
 * Checks if a Google appId can be asserted by the given hostname.
 * @param {string} hostname Hostname portion of the origin url.
 * @param {string} appId The appId to check.
 * @return {boolean} Whether the given origin can assert the app id.
 */
GstaticOriginChecker.isGoogleAppId = function(hostname, appId) {
  if (/^([0-9a-z\-]+\.)*google\.com$/.test(hostname)) {
    return (appId.indexOf('https://www.gstatic.com') == 0 ||
        appId.indexOf('https://static.corp.google.com') == 0);
  }
  return false;
};

/**
 * Checks if a single appId can be asserted by the given origin. This
 * function depends on the document object being present in the
 * runtime environment.
 * @param {string} origin The origin.
 * @param {string} appId The appId to check.
 * @return {boolean} Whether the given origin can assert the app id.
 * @private
 */
GstaticOriginChecker.prototype.checkAppId_ = function(origin, appId) {
  var anchor = document.createElement('a');
  anchor.href = origin;
  return (origin == appId) ||
      GstaticOriginChecker.isGoogleAppId(anchor.hostname, appId);
};
