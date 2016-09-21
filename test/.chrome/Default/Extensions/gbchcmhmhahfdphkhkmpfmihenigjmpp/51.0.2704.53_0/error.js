// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * A wrapper for remoting.Error.Tag.  Having a wrapper makes it
 * possible to use instanceof checks on caught exceptions.  It also
 * allows adding more detailed error information if desired.
 *
 * @constructor
 * @param {remoting.Error.Tag} tag
 * @param {string=} opt_detail
 */
remoting.Error = function(tag, opt_detail) {
  /** @private @const {remoting.Error.Tag} */
  this.tag_ = tag;

  /** @const {?string} */
  this.detail_ = opt_detail || null;
};

/**
 * @override
 */
remoting.Error.prototype.toString = function() {
  var result = this.tag_;
  if (this.detail_ != null) {
    result += ' (' + this.detail_ + ')';
  }
  return result;
};

/**
 * @return {remoting.ChromotingEvent.ConnectionError} error
 */
remoting.Error.prototype.toConnectionError = function() {
  var Tag = remoting.Error.Tag;
  var ConnectionError = remoting.ChromotingEvent.ConnectionError;
  switch (this.tag_) {
    case Tag.NONE:
      return ConnectionError.NONE;
    case Tag.CLIENT_SUSPENDED:
      return ConnectionError.CLIENT_SUSPENDED;
    case Tag.INVALID_ACCESS_CODE:
      return ConnectionError.INVALID_ACCESS_CODE;
    case Tag.MISSING_PLUGIN:
      return ConnectionError.MISSING_PLUGIN;
    case Tag.AUTHENTICATION_FAILED:
      return ConnectionError.AUTHENTICATION_FAILED;
    case Tag.HOST_IS_OFFLINE:
      return ConnectionError.HOST_OFFLINE;
    case Tag.INCOMPATIBLE_PROTOCOL:
      return ConnectionError.INCOMPATIBLE_PROTOCOL;
    case Tag.BAD_VERSION:
      return ConnectionError.BAD_VERSION;
    case Tag.NETWORK_FAILURE:
      return ConnectionError.NETWORK_FAILURE;
    case Tag.HOST_OVERLOAD:
      return ConnectionError.HOST_OVERLOAD;
    case Tag.MAX_SESSION_LENGTH:
      return ConnectionError.MAX_SESSION_LENGTH;
    case Tag.HOST_CONFIGURATION_ERROR:
      return ConnectionError.HOST_CONFIGURATION_ERROR;
    case Tag.P2P_FAILURE:
      return ConnectionError.P2P_FAILURE;
    case Tag.NACL_DISABLED:
      return ConnectionError.NACL_DISABLED;
    case Tag.UNEXPECTED:
      return ConnectionError.UNEXPECTED;
    case Tag.NACL_PLUGIN_CRASHED:
      return ConnectionError.NACL_PLUGIN_CRASHED;
    // For errors that don't have a corresponding ConnectionError mapping,
    // default to Error.UNKNOWN_ERROR.
    case Tag.SERVICE_UNAVAILABLE:
    case Tag.NOT_AUTHENTICATED:
    case Tag.NOT_FOUND:
    case Tag.INVALID_HOST_DOMAIN:
    case Tag.REGISTRATION_FAILED:
    case Tag.NOT_AUTHORIZED:
    case Tag.APP_NOT_AUTHORIZED:
    case Tag.CANCELLED:
      return ConnectionError.UNKNOWN_ERROR;
  }
  return ConnectionError.UNKNOWN_ERROR;
};

/**
 * @return {remoting.Error.Tag} The tag used to create this Error.
 */
remoting.Error.prototype.getTag = function() {
  return this.tag_;
};

/**
 * @return {?string} The detail string passed to the constructor, if any.
 */
remoting.Error.prototype.getDetail = function() {
  return this.detail_;
};

/**
 * Checks the type of an error.
 * @param {remoting.Error.Tag} tag
 * @param {...remoting.Error.Tag} var_args
 * @return {boolean} True if this object has one of the specified tags.
 * @suppress {reportUnknownTypes}
 */
remoting.Error.prototype.hasTag = function(tag, var_args) {
  var thisTag = this.tag_;
  return Array.prototype.some.call(
      arguments,
      function(/** remoting.Error.Tag */ tag) {
        return thisTag == tag;
      });
};

/**
 * @return {boolean} True if this object's tag is NONE, meaning this
 *     object represents the lack of an error.
 */
remoting.Error.prototype.isNone = function() {
  return this.hasTag(remoting.Error.Tag.NONE);
};

/**
 * @return {boolean} True if this object's tag is CANCELLED, meaning this
 *     object represents the lack of an error.
 */
remoting.Error.prototype.isCancel = function() {
  return this.hasTag(remoting.Error.Tag.CANCELLED);
};

/**
 * Convenience method for creating the second most common error type.
 * @return {!remoting.Error}
 */
remoting.Error.none = function() {
  return new remoting.Error(remoting.Error.Tag.NONE);
};

/**
 * Convenience method for creating the most common error type.
 * @param {string=} opt_detail
 * @return {!remoting.Error}
 */
remoting.Error.unexpected = function(opt_detail) {
  return new remoting.Error(remoting.Error.Tag.UNEXPECTED, opt_detail);
};

/**
 * @enum {string} All error messages from messages.json
 */
remoting.Error.Tag = {
  NONE: '',

  // Used to signify that an operation was cancelled by the user. This should
  // not normally cause the error text to be shown to the user, so the
  // i18n-content prefix is not needed in this case.
  CANCELLED: '__CANCELLED__',

  // Used to signify that the local computer was suspended for long enough that
  // the connection is expected to drop, allowing a reconnect attempt to be
  // scheduled sooner.
  CLIENT_SUSPENDED: /*i18n-content*/ 'ERROR_NETWORK_FAILURE',

  INVALID_ACCESS_CODE: /*i18n-content*/ 'ERROR_INVALID_ACCESS_CODE',
  MISSING_PLUGIN: /*i18n-content*/ 'ERROR_MISSING_PLUGIN',
  NACL_PLUGIN_CRASHED: /*i18n-content*/ 'ERROR_NACL_PLUGIN_CRASHED',
  AUTHENTICATION_FAILED: /*i18n-content*/ 'ERROR_AUTHENTICATION_FAILED',
  HOST_IS_OFFLINE: /*i18n-content*/ 'ERROR_HOST_IS_OFFLINE',
  INCOMPATIBLE_PROTOCOL: /*i18n-content*/ 'ERROR_INCOMPATIBLE_PROTOCOL',
  BAD_VERSION: /*i18n-content*/ 'ERROR_BAD_PLUGIN_VERSION',
  NETWORK_FAILURE: /*i18n-content*/ 'ERROR_NETWORK_FAILURE',
  HOST_OVERLOAD: /*i18n-content*/ 'ERROR_HOST_OVERLOAD',
  MAX_SESSION_LENGTH: /*i18n-content*/ 'ERROR_MAX_SESSION_LENGTH',
  HOST_CONFIGURATION_ERROR: /*i18n-content*/ 'ERROR_HOST_CONFIGURATION_ERROR',
  UNEXPECTED: /*i18n-content*/ 'ERROR_UNEXPECTED',
  SERVICE_UNAVAILABLE: /*i18n-content*/ 'ERROR_SERVICE_UNAVAILABLE',
  NOT_AUTHENTICATED: /*i18n-content*/ 'ERROR_NOT_AUTHENTICATED',
  NOT_FOUND: /*i18n-content*/ 'ERROR_NOT_FOUND',
  INVALID_HOST_DOMAIN: /*i18n-content*/ 'ERROR_INVALID_HOST_DOMAIN',
  P2P_FAILURE: /*i18n-content*/ 'ERROR_P2P_FAILURE',
  REGISTRATION_FAILED: /*i18n-content*/ 'ERROR_HOST_REGISTRATION_FAILED',
  NOT_AUTHORIZED: /*i18n-content*/ 'ERROR_NOT_AUTHORIZED',
  // TODO(garykac): Move app-specific errors into separate location.
  APP_NOT_AUTHORIZED: /*i18n-content*/ 'ERROR_APP_NOT_AUTHORIZED',
  NACL_DISABLED: /*i18n-content*/ 'ERROR_NACL_DISABLED',
};

// A whole bunch of semi-redundant constants, mostly to reduce to size
// of the diff that introduced the remoting.Error class.
//
// Please don't add any more constants here; just call the
// remoting.Error constructor directly

/**
 * @param {number} httpStatus An HTTP status code.
 * @return {!remoting.Error} The remoting.Error enum corresponding to the
 *     specified HTTP status code.
 */
remoting.Error.fromHttpStatus = function(httpStatus) {
  if (httpStatus == 0) {
    return new remoting.Error(remoting.Error.Tag.NETWORK_FAILURE);
  } else if (httpStatus >= 200 && httpStatus < 300) {
    return remoting.Error.none();
  } else if (httpStatus == 400 || httpStatus == 401) {
    return new remoting.Error(remoting.Error.Tag.AUTHENTICATION_FAILED);
  } else if (httpStatus == 403) {
    return new remoting.Error(remoting.Error.Tag.NOT_AUTHORIZED);
  } else if (httpStatus == 404) {
    return new remoting.Error(remoting.Error.Tag.NOT_FOUND);
  } else if (httpStatus >= 500 && httpStatus < 600) {
    return new remoting.Error(remoting.Error.Tag.SERVICE_UNAVAILABLE);
  } else {
    console.warn('Unexpected HTTP error code: ' + httpStatus);
    return remoting.Error.unexpected();
  }
};

/**
 * Create an error-handling function suitable for passing to a
 * Promise's "catch" method.
 *
 * @param {function(!remoting.Error):void} onError
 * @return {function(*):void}
 */
remoting.Error.handler = function(onError) {
  return function(/** * */ error) {
    if (error instanceof remoting.Error) {
      onError(/** @type {!remoting.Error} */ (error));
    } else {
      console.error('Unexpected error:', error);
      onError(remoting.Error.unexpected());
    }
  };
};
