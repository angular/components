/**
 * @fileoverview Implements a check whether an origin is allowed to assert an
 * app id.
 *
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * Implements half of the app id policy: whether an origin is allowed to claim
 * an app id. For checking whether the app id also lists the origin,
 * @see AppIdChecker.
 * @interface
 */
function OriginChecker() {}

/**
 * Checks whether the origin is allowed to claim the app ids.
 * @param {string} origin The origin claiming the app id.
 * @param {!Array<string>} appIds The app ids being claimed.
 * @return {Promise<boolean>} A promise for the result of the check.
 */
OriginChecker.prototype.canClaimAppIds = function(origin, appIds) {};
