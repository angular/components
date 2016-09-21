/**
 * @fileoverview Implements a helper that interacts with external (not in this
 * browser/app) helpers.
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * @typedef {{
     source: string,
     appId: string,
     sendMessage: Function,
     defaultError: number
 * }}
 */
var ExternalHelperConfig;

/**
 * @param {!HelperRequest} request The request to handle.
 * @param {!ExternalHelperConfig} helperConfig How to reach the external helper.
 * @constructor
 * @implements {RequestHandler}
 */
function ExternalHandler(request, helperConfig) {
  /** @private {!HelperRequest} */
  this.request_ = request;
  /** @private {!ExternalHelperConfig} */
  this.helperConfig_ = helperConfig;
}

/**
 * @param {RequestHandlerCallback} cb Called with the result of the request,
 *     and an optional source for the result.
 * @return {boolean} Whether this handler accepted the request.
 */
ExternalHandler.prototype.run = function(cb) {
  var self = this;
  this.helperConfig_.sendMessage(this.helperConfig_.appId, this.request_,
      function(response) {
        if (self.closed_) {
          console.log(
              UTIL_fmt('got a response from external helper after close'));
          return;
        }
        if (!response || !response.type) {
          // A missing or malformed response implies the helper's output
          // can't be trusted: report the default error.
          cb(self.makeDefaultErrorReply_(self.request_));
          return;
        }
        console.log(UTIL_fmt('got a response from external helper'));
        console.log(response);
        cb(response, self.helperConfig_.source);
      });
  return true;
};

/** Closes this handler. */
ExternalHandler.prototype.close = function() {
  /** @private {boolean} */
  this.closed_ = true;

  this.helperConfig_.sendMessage(this.helperConfig_.appId, {type: 'close'},
    function() {});

};


/**
 * Makes a default, generic error response to the given request.
 * @param {HelperRequest} request The request.
 * @return {HelperReply} The reply to the request.
 * @private
 */
ExternalHandler.prototype.makeDefaultErrorReply_ = function(request) {
  return makeHelperErrorResponse(request,
      /** @type {DeviceStatusCodes} */ (this.helperConfig_.defaultError));
};

/**
 * @param {!ExternalHelperConfig} helperConfig How to reach the external helper.
 * @constructor
 * @implements {RequestHelper}
 */
function ExternalHelper(helperConfig) {
  /** @private {!ExternalHelperConfig} */
  this.helperConfig_ = helperConfig;
}

/**
 * Gets a handler for a request.
 * @param {HelperRequest} request The request to handle.
 * @return {RequestHandler} A handler for the request.
 */
ExternalHelper.prototype.getHandler = function(request) {
  return new ExternalHandler(request, this.helperConfig_);
};

/**
 * Gets the helper's app id.
 * @return {string} The helper's app id.
 */
ExternalHelper.prototype.getHelperAppId = function() {
  return this.helperConfig_.appId;
};

/**
 * (Re)sets the helper's app id.
 * @param {string} helperId
 */
ExternalHelper.prototype.setHelperAppId = function(helperId) {
  this.helperConfig_.appId = helperId;
};
