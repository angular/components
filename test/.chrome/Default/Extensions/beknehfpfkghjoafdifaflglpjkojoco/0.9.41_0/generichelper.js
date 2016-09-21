/**
 * @fileoverview Implements a "generic" RequestHelper that provides a default
 * response to unknown requests, and supports registering handlers for known
 * requests.
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * @typedef {function(HelperRequest): RequestHandler} */
var RequestHandlerFactory;

/**
 * Implements a "generic" RequestHelper that provides a default
 * response to unknown requests, and supports registering handlers for known
 * @constructor
 * @implements {RequestHelper}
 */
function GenericRequestHelper() {
  /** @private {Object<string, RequestHandlerFactory>} */
  this.handlerFactories_ = {};
}

/**
 * Gets a handler for a request.
 * @param {HelperRequest} request The request to handle.
 * @return {RequestHandler} A handler for the request.
 */
GenericRequestHelper.prototype.getHandler = function(request) {
  if (this.handlerFactories_.hasOwnProperty(request.type)) {
    return this.handlerFactories_[request.type](request);
  }
  return null;
};

/**
 * Registers a handler factory for a given type.
 * @param {string} type The request type.
 * @param {RequestHandlerFactory} factory A factory that can produce a handler
 *     for a request of a given type.
 */
GenericRequestHelper.prototype.registerHandlerFactory =
    function(type, factory) {
  this.handlerFactories_[type] = factory;
};
