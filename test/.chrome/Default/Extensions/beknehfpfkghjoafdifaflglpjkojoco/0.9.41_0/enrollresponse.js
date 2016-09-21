/**
 * @fileoverview Provides utilities to parse an enroll response.
 */
'use strict';

/**
 * Gets the byte length of a length field from its first byte.
 * @param {number} b The first byte of the length field.
 * @return {number} The number of length bytes.
 */
function getLenBytes(b) {
  if (b <= 0x80) {
    return 1;
  }
  return 1 + (b & 0x7f);
}

/** @const */
var ASN_LENGTH_INDEFINITE = 0xffffffff;

/**
 * Gets the length of the DER-encoded input.
 * @param {Uint8Array} u8 The DER-encoded input.
 * @return {number} The length of the input, or ASN_LENGTH_INDEFINITE if the
 *     input has indefinite-length encoding.
 */
function getLengthIndefinite(u8) {
  if (u8[1] <= 0x7f) {
    return u8[1];
  }
  if (u8[1] == 0x80) {
    return ASN_LENGTH_INDEFINITE;
  }
  var lenLen = getLenBytes(u8[1]);
  var out = 0;
  var offs = 2;
  while (--lenLen) {
    out <<= 8;
    out |= u8[offs++];
  }
  return out;
}

/**
 * @typedef {{
 *   publicKey: Uint8Array,
 *   keyHandle: Uint8Array,
 *   cert: Uint8Array
 * }}
 */
var U2fEnrollResponse;

/**
 * Parses the gnubby enroll response into easier-to-parse fields.
 * @param {Uint8Array} u8 The enroll response from the gnubby.
 * @return {?U2fEnrollResponse} The parsed enroll response.
 */
function parseEnrollResponse(u8) {
  if (u8[0] != 5) {
    console.warn(UTIL_fmt('Unexpected initial byte: ' +
        UTIL_BytesToHex([u8[0]])));
    return null;
  }
  if (u8[1] != 4) {
    console.warn(UTIL_fmt('Unexpected start of public key: ' +
        UTIL_BytesToHex([u8[1]])));
    return null;
  }
  var response = {};
  var khOffs = 66;
  response.publicKey = u8.subarray(1, khOffs);
  var khLen = u8[khOffs];
  response.keyHandle = u8.subarray(khOffs + 1, khOffs + khLen + 1);
  var certOffs = khOffs + 1 + khLen;
  if (u8[certOffs] != UTIL_ASN_SEQUENCE) {
    console.warn(UTIL_fmt('Unexpected certificate initial byte: ' +
        UTIL_BytesToHex([u8[certOffs]])));
    return null;
  }
  var innerCertLen = getLengthIndefinite(u8.subarray(certOffs));
  if (innerCertLen == ASN_LENGTH_INDEFINITE) {
    console.warn(UTIL_fmt('Indefinite length unsupported'));
    return null;
  }
  var certLen = 1 + getLenBytes(u8[certOffs + 1]) + innerCertLen;
  var certBytes = u8.subarray(certOffs, certOffs + certLen + 1);
  response.cert = certBytes;
  return response;
}

