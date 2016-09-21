// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {
'use strict';

/**
 * @param {*} value
 * @return {boolean}
 */
var isArray = function(value) {
  return Array.isArray(value);
};

/**
 * @param {*} value
 * @return {boolean}
 */
var isBoolean = function(value) {
  return typeof value == 'boolean';
};

/**
 * @param {*} value
 * @return {boolean}
 */
var isNumber = function(value) {
  return typeof value == 'number';
};

/**
 * @param {*} value
 * @return {boolean}
 */
var isObject = function(value) {
  return value != null && typeof value == 'object' && !Array.isArray(value);
};

/**
 * @param {*} value
 * @return {boolean}
 */
var isString = function(value) {
  return typeof value == 'string';
};

/**
 * @param {*} value
 * @return {string}
 */
var jsonTypeOf = function(value) {
  if (typeof value == 'object') {
    if (value === null) {
      return 'null';
    } else if (Array.isArray(value)) {
      return 'array';
    } else {
      return 'object';
    }
  } else {
    return typeof value;
  }
};

/**
 * @param {*} value the value to check; must be an object
 * @param {function(*):boolean} pred
 * @param {string} typeDesc
 * @return {*} the argument
 */
var assertType = function(value, pred, typeDesc) {
  if (pred(value)) {
    return value;
  } else {
    throw new Error('Invalid data type' +
                    ' (expected: ' + typeDesc +
                    ', actual: ' + jsonTypeOf(value) + ')');
  }
};

/**
 * @param {*} value the value to check; must be an object
 * @return {!Array} the argument
 */
base.assertArray = function(value) {
  return /** @type {!Array} */ (assertType(value, isArray, 'array'));
};

/**
 * @param {*} value the value to check; must be a boolean
 * @return {boolean} the argument
 */
base.assertBoolean = function(value) {
  return /** @type {boolean} */ (assertType(value, isBoolean, 'boolean'));
};

/**
 * @param {*} value the value to check; must be a number
 * @return {number} the argument
 */
base.assertNumber = function(value) {
  return /** @type {number} */ (assertType(value, isNumber, 'number'));
};

/**
 * @param {*} value the value to check; must be an object
 * @return {!Object} the argument
 */
base.assertObject = function(value) {
  return /** @type {!Object} */ (assertType(value, isObject, 'object'));
};

/**
 * @param {*} value the value to check; must be a string
 * @return {string} the argument
 */
base.assertString = function(value) {
  return /** @type {string} */ (assertType(value, isString, 'string'));
};

/**
 * @param {Object<*>} dict The dictionary containing the |key|
 * @param {string} key The key to typecheck in the |dict|.
 * @param {function(*):boolean} pred
 * @param {string} typeDesc
 * @param {*=} opt_default The value to return if pred returns false.
 * @return {*} The |key| attribute value.
 */
var getTypedAttr = function(dict, key, pred, typeDesc, opt_default) {
  var value = /** @type {*} */ (dict[key]);
  if (pred(value)) {
    return value;
  } else if (opt_default !== undefined) {
    return opt_default;
  } else {
    throw new Error('Invalid data type for ' + key +
                    ' (expected: ' + typeDesc + ', actual: ' +
                    jsonTypeOf(value) + ')');
  }
};

/**
 * Get the |key| attribute in the given |dict| and verify that it is an
 * array value.
 *
 * If the attribute is not an array, then an exception will be thrown unless
 * a default value is specified in |opt_default|.
 *
 * @param {Object<*>} dict The dictionary containing the |key|
 * @param {string} key The key to typecheck in the |dict|.
 * @param {Array=} opt_default The value to return if the key is not a bool.
 * @return {Array} The |key| attribute value as an object.
 */
base.getArrayAttr = function(dict, key, opt_default) {
  return /** @type {Array} */ (
      getTypedAttr(dict, key, isArray, 'array', opt_default));
};

/**
 * Get the |key| attribute in the given |dict| and verify that it is a
 * boolean value.
 *
 * If the attribute is not a boolean, then an exception will be thrown unless
 * a default value is specified in |opt_default|.
 *
 * @param {Object<*>} dict The dictionary containing the |key|
 * @param {string} key The key to typecheck in the |dict|.
 * @param {boolean=} opt_default The value to return if the key is not a bool.
 * @return {boolean} The |key| attribute value as a boolean.
 */
base.getBooleanAttr = function(dict, key, opt_default) {
  var value = /** @type {*} */ (dict[key]);
  if (value == 'true' || value == 'false') {
    return value == 'true';
  }
  return /** @type {boolean} */ (
      getTypedAttr(dict, key, isBoolean, 'boolean', opt_default));
};

/**
 * Get the |key| attribute in the given |dict| and verify that it is a
 * number value.
 *
 * If the attribute is not a number, then an exception will be thrown unless
 * a default value is specified in |opt_default|.
 *
 * @param {Object<*>} dict The dictionary containing the |key|
 * @param {string} key The key to typecheck in the |dict|.
 * @param {number=} opt_default The value to return if the key is not a number.
 * @return {number} The |key| attribute value as a number.
 */
base.getNumberAttr = function(dict, key, opt_default) {
  return /** @type {number} */ (
      getTypedAttr(dict, key, isNumber, 'number', opt_default));
};

/**
 * Get the |key| attribute in the given |dict| and verify that it is an
 * object value.
 *
 * If the attribute is not an object, then an exception will be thrown unless
 * a default value is specified in |opt_default|.
 *
 * @param {Object<*>} dict The dictionary containing the |key|
 * @param {string} key The key to typecheck in the |dict|.
 * @param {Object=} opt_default The value to return if the key is not a bool.
 * @return {!Object} The |key| attribute value as an object.
 */
base.getObjectAttr = function(dict, key, opt_default) {
  return /** @type {!Object} */ (
      getTypedAttr(dict, key, isObject, 'object', opt_default));
};

/**
 * Get the |key| attribute in the given |dict| and verify that it is a
 * string value.
 *
 * If the attribute is not a string, then an exception will be thrown unless
 * a default value is specified in |opt_default|.
 *
 * @param {Object<*>} dict The dictionary containing the |key|
 * @param {string} key The key to typecheck in the |dict|.
 * @param {string=} opt_default The value to return if the key is not a string.
 * @return {string} The |key| attribute value as a string.
 */
base.getStringAttr = function(dict, key, opt_default) {
  return /** @type {string} */ (
      getTypedAttr(dict, key, isString, 'string', opt_default));
};

/**
 * Return a JSON object parsed from a string.
 *
 * If the string cannot be parsed, or does not result in an object, then an
 * exception will be thrown.
 *
 * @param {string} jsonString The JSON string to parse.
 * @return {Object} The JSON object created from the |jsonString|.
 */
base.getJsonObjectFromString = function(jsonString) {
  return base.assertObject(base.jsonParseSafe(jsonString));
};

})();
