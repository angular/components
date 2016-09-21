/**
 * @fileoverview Provides a "bottom half" helper to assist with raw requests.
 * This fills the same role as the Authenticator-Specific Module component of
 * U2F documents, although the API is different.
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * @typedef {{
 *   type: string,
 *   timeout: number
 * }}
 */
var HelperRequest;

/**
 * @typedef {{
 *   type: string,
 *   code: (number|undefined)
 * }}
 */
var HelperReply;

/**
 * A helper to process requests.
 * @interface
 */
function RequestHelper() {}

/**
 * Gets a handler for a request.
 * @param {HelperRequest} request The request to handle.
 * @return {RequestHandler} A handler for the request.
 */
RequestHelper.prototype.getHandler = function(request) {};

/**
 * A handler to track an outstanding request.
 * @extends {Closeable}
 * @interface
 */
function RequestHandler() {}

/** @typedef {function(HelperReply, string=)} */
var RequestHandlerCallback;

/**
 * @param {RequestHandlerCallback} cb Called with the result of the request,
 *     and an optional source for the result.
 * @return {boolean} Whether this handler could be run.
 */
RequestHandler.prototype.run = function(cb) {};

/** Closes this handler. */
RequestHandler.prototype.close = function() {};

/**
 * Makes a response to a helper request with an error code.
 * @param {HelperRequest} request The request to make a response to.
 * @param {DeviceStatusCodes} code The error code to return.
 * @param {string=} opt_defaultType The default response type, if none is
 *     present in the request.
 * @return {HelperReply} The helper error response.
 */
function makeHelperErrorResponse(request, code, opt_defaultType) {
  var type;
  if (request && request.type) {
    type = request.type.replace(/_request$/, '_reply');
  } else {
    type = opt_defaultType || 'unknown_type_reply';
  }
  var reply = {
    'type': type,
    'code': /** @type {number} */ (code)
  };
  return reply;
}
