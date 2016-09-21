/** @fileoverview Various string utility functions */
// GOOGLE-INTERNAL by mschilder@google.com
'use strict';

/**
 * Converts a string to an array of bytes.
 * @param {string} s The string to convert.
 * @param {(Array|Uint8Array)=} bytes The Array-like object into which to store
 *     the bytes. A new Array will be created if not provided.
 * @return {(Array|Uint8Array)} An array of bytes representing the string.
 */
function UTIL_StringToBytes(s, bytes) {
  bytes = bytes || new Array(s.length);
  for (var i = 0; i < s.length; ++i)
    bytes[i] = s.charCodeAt(i);
  return bytes;
}

/**
 * Converts a byte array to a string.
 * @param {(Uint8Array|Array<number>)} b input byte array.
 * @return {string} result.
 */
function UTIL_BytesToString(b) {
  return String.fromCharCode.apply(null, b);
}

/**
 * Converts a byte array to a hex string.
 * @param {(Uint8Array|Array<number>)} b input byte array.
 * @return {string} result.
 */
function UTIL_BytesToHex(b) {
  if (!b) return '(null)';
  var hexchars = '0123456789ABCDEF';
  var hexrep = new Array(b.length * 2);

  for (var i = 0; i < b.length; ++i) {
    hexrep[i * 2 + 0] = hexchars.charAt((b[i] >> 4) & 15);
    hexrep[i * 2 + 1] = hexchars.charAt(b[i] & 15);
  }
  return hexrep.join('');
}

function UTIL_BytesToHexWithSeparator(b, sep) {
  var hexchars = '0123456789ABCDEF';
  var stride = 2 + (sep ? 1 : 0);
  var hexrep = new Array(b.length * stride);

  for (var i = 0; i < b.length; ++i) {
    if (sep) hexrep[i * stride + 0] = sep;
    hexrep[i * stride + stride - 2] = hexchars.charAt((b[i] >> 4) & 15);
    hexrep[i * stride + stride - 1] = hexchars.charAt(b[i] & 15);
  }
  return (sep ? hexrep.slice(1) : hexrep).join('');
}

function UTIL_HexToBytes(h) {
  var hexchars = '0123456789ABCDEFabcdef';
  var res = new Uint8Array(h.length / 2);
  for (var i = 0; i < h.length; i += 2) {
    if (hexchars.indexOf(h.substring(i, i + 1)) == -1) break;
    res[i / 2] = parseInt(h.substring(i, i + 2), 16);
  }
  return res;
}

function UTIL_HexToArray(h) {
  var hexchars = '0123456789ABCDEFabcdef';
  var res = new Array(h.length / 2);
  for (var i = 0; i < h.length; i += 2) {
    if (hexchars.indexOf(h.substring(i, i + 1)) == -1) break;
    res[i / 2] = parseInt(h.substring(i, i + 2), 16);
  }
  return res;
}

function UTIL_equalArrays(a, b) {
  if (!a || !b) return false;
  if (a.length != b.length) return false;
  var accu = 0;
  for (var i = 0; i < a.length; ++i)
    accu |= a[i] ^ b[i];
  return accu === 0;
}

function UTIL_ltArrays(a, b) {
  if (a.length < b.length) return true;
  if (a.length > b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] < b[i]) return true;
    if (a[i] > b[i]) return false;
  }
  return false;
}

function UTIL_gtArrays(a, b) {
  return UTIL_ltArrays(b, a);
}

function UTIL_geArrays(a, b) {
  return !UTIL_ltArrays(a, b);
}

function UTIL_unionArrays(a, b) {
  var obj = {};
  for (var i = 0; i < a.length; i++) {
    obj[a[i]] = a[i];
  }
  for (var i = 0; i < b.length; i++) {
    obj[b[i]] = b[i];
  }
  var union = [];
  for (var k in obj) {
    union.push(obj[k]);
  }
  return union;
}

function UTIL_getRandom(a) {
  var tmp = new Array(a);
  var rnd = new Uint8Array(a);
  window.crypto.getRandomValues(rnd);  // Yay!
  for (var i = 0; i < a; ++i) tmp[i] = rnd[i] & 255;
  return tmp;
}

function UTIL_setFavicon(icon) {
  // Construct a new favion link tag
  var faviconLink = document.createElement('link');
  faviconLink.rel = 'Shortcut Icon';
  faviconLink.type = 'image/x-icon';
  faviconLink.href = icon;

  // Remove the old favion, if it exists
  var head = document.getElementsByTagName('head')[0];
  var links = head.getElementsByTagName('link');
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    if (link.type == faviconLink.type && link.rel == faviconLink.rel) {
      head.removeChild(link);
    }
  }

  // Add in the new one
  head.appendChild(faviconLink);
}

// Erase all entries in array
function UTIL_clear(a) {
  if (a instanceof Array) {
    for (var i = 0; i < a.length; ++i)
      a[i] = 0;
  }
}

// Type tags used for ASN.1 encoding of ECDSA signatures
/** @const */
var UTIL_ASN_INT = 0x02;
/** @const */
var UTIL_ASN_SEQUENCE = 0x30;

/**
 * Parse SEQ(INT, INT) from ASN1 byte array.
 * @param {(Uint8Array|Array<number>)} a input to parse from.
 * @return {{'r': !Array<number>, 's': !Array<number>}|null}
 */
function UTIL_Asn1SignatureToJson(a) {
  if (a.length < 6) return null;  // Too small to be valid
  if (a[0] != UTIL_ASN_SEQUENCE) return null;
  var l = a[1] & 255;
  if (l & 0x80) return null;  // SEQ.size too large
  if (a.length != 2 + l) return null;  // SEQ size does not match input

  function parseInt(off) {
    if (a[off] != UTIL_ASN_INT) return null;
    var l = a[off + 1] & 255;
    if (l & 0x80) return null;  // INT.size too large
    if (off + 2 + l > a.length) return null;  // Out of bounds
    return a.slice(off + 2, off + 2 + l);
  }

  var r = parseInt(2);
  if (!r) return null;

  var s = parseInt(2 + 2 + r.length);
  if (!s) return null;

  return {'r': r, 's': s};
}

/**
 * Encode a JSON signature {r,s} as an ASN1 SEQ(INT, INT). May modify sig
 * @param {{'r': (!Array<number>|undefined), 's': !Array<number>}} sig
 * @return {!Uint8Array}
 */
function UTIL_JsonSignatureToAsn1(sig) {
  var rbytes = sig.r;
  var sbytes = sig.s;

  // ASN.1 integers are arbitrary length msb first and signed.
  // sig.r and sig.s are 256 bits msb first but _unsigned_, so we must
  // prepend a zero byte in case their high bit is set.
  if (rbytes[0] & 0x80)
    rbytes.unshift(0);
  if (sbytes[0] & 0x80)
    sbytes.unshift(0);

  var len = 4 + rbytes.length + sbytes.length;
  var buf = new Uint8Array(2 + len);
  var i = 0;
  buf[i++] = UTIL_ASN_SEQUENCE;
  buf[i++] = len;

  buf[i++] = UTIL_ASN_INT;
  buf[i++] = rbytes.length;
  buf.set(rbytes, i);
  i += rbytes.length;

  buf[i++] = UTIL_ASN_INT;
  buf[i++] = sbytes.length;
  buf.set(sbytes, i);

  return buf;
}

function UTIL_prepend_zero(s, n) {
  if (s.length == n) return s;
  var l = s.length;
  for (var i = 0; i < n - l; ++i) {
    s = '0' + s;
  }
  return s;
}

// hr:min:sec.milli string
function UTIL_time() {
  var d = new Date();
  var m = UTIL_prepend_zero((d.getMonth() + 1).toString(), 2);
  var t = UTIL_prepend_zero(d.getDate().toString(), 2);
  var H = UTIL_prepend_zero(d.getHours().toString(), 2);
  var M = UTIL_prepend_zero(d.getMinutes().toString(), 2);
  var S = UTIL_prepend_zero(d.getSeconds().toString(), 2);
  var L = UTIL_prepend_zero((d.getMilliseconds() * 1000).toString(), 6);
  return m + t + ' ' + H + ':' + M + ':' + S + '.' + L;
}

var UTIL_events = [];
var UTIL_max_events = 500;

function UTIL_fmt(s) {
  var line = UTIL_time() + ': ' + s;
  if (UTIL_events.push(line) > UTIL_max_events) {
    // Drop from head.
    UTIL_events.splice(0, UTIL_events.length - UTIL_max_events);
  }
  return line;
}
