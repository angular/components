/**
 * @fileoverview Provides an implementation of approved origins that always
 * (and only) allows google.com to use security keys.
 *
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * Allows the caller to check whether the user has approved the use of
 * security keys from an origin.
 * @constructor
 * @implements {ApprovedOrigins}
 */
function GoogleApprovedOrigins() {}

/**
 * Checks whether the origin is approved to use security keys. (If not, an
 * approval prompt may be shown.)
 * @param {string} origin The origin to approve.
 * @param {number=} opt_tabId A tab id to display approval prompt in, if
 *     necessary.
 * @return {Promise<boolean>} A promise for the result of the check.
 */
GoogleApprovedOrigins.prototype.isApprovedOrigin = function(origin, opt_tabId) {
  var anchor = document.createElement('a');
  anchor.href = origin;
  return Promise.resolve(/^([0-9a-z\-]+\.)*google\.com$/.test(anchor.hostname));
};
