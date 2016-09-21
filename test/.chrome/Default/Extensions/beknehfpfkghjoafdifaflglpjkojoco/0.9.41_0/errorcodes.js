/**
 * @fileoverview Errors reported by top-level request handlers.
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * Response status codes
 * @const
 * @enum {number}
 */
var ErrorCodes = {
  'OK': 0,
  'OTHER_ERROR': 1,
  'BAD_REQUEST': 2,
  'CONFIGURATION_UNSUPPORTED': 3,
  'DEVICE_INELIGIBLE': 4,
  'TIMEOUT': 5
};

/**
 * An error object for responses
 * @typedef {{
 *   errorCode: ErrorCodes,
 *   errorMessage: (?string|undefined)
 * }}
 */
var U2fError;
