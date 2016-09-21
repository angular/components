/**
 * @fileoverview U2F message types.
 */
'use strict';

/**
 * Message types for messsages to/from the extension
 * @const
 * @enum {string}
 */
var MessageTypes = {
  U2F_REGISTER_REQUEST: 'u2f_register_request',
  U2F_SIGN_REQUEST: 'u2f_sign_request',
  U2F_REGISTER_RESPONSE: 'u2f_register_response',
  U2F_SIGN_RESPONSE: 'u2f_sign_response',
  U2F_GET_API_VERSION_REQUEST: 'u2f_get_api_version_request',
  U2F_GET_API_VERSION_RESPONSE: 'u2f_get_api_version_response'
};
