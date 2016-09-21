// WebSafeBase64Escape and Unescape.
// GOOGLE-INTERNAL mschilder@google.com
function B64_encode(bytes, opt_length) {
  if (!opt_length) opt_length = bytes.length;
  var b64out =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  var result = '';
  var shift = 0;
  var accu = 0;
  var inputIndex = 0;
  while (opt_length--) {
    accu <<= 8;
    accu |= bytes[inputIndex++];
    shift += 8;
    while (shift >= 6) {
      var i = (accu >> (shift - 6)) & 63;
      result += b64out.charAt(i);
      shift -= 6;
    }
  }
  if (shift) {
    accu <<= 8;
    shift += 8;
    var i = (accu >> (shift - 6)) & 63;
    result += b64out.charAt(i);
  }
  return result;
}

// Normal base64 encode; not websafe, including padding.
function base64_encode(bytes, opt_length) {
  if (!opt_length) opt_length = bytes.length;
  var b64out =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var result = '';
  var shift = 0;
  var accu = 0;
  var inputIndex = 0;
  while (opt_length--) {
    accu <<= 8;
    accu |= bytes[inputIndex++];
    shift += 8;
    while (shift >= 6) {
      var i = (accu >> (shift - 6)) & 63;
      result += b64out.charAt(i);
      shift -= 6;
    }
  }
  if (shift) {
    accu <<= 8;
    shift += 8;
    var i = (accu >> (shift - 6)) & 63;
    result += b64out.charAt(i);
  }
  while (result.length % 4) result += '=';
  return result;
}

var B64_inmap =
[
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 0, 0,
 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 0, 0, 0, 0, 0, 0,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 0, 0, 0, 0, 64,
  0, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 0, 0, 0, 0, 0
];

function B64_decode(string) {
  var bytes = [];
  var accu = 0;
  var shift = 0;
  for (var i = 0; i < string.length; ++i) {
    var c = string.charCodeAt(i);
    if (c < 32 || c > 127 || !B64_inmap[c - 32]) return [];
    accu <<= 6;
    accu |= (B64_inmap[c - 32] - 1);
    shift += 6;
    if (shift >= 8) {
      bytes.push((accu >> (shift - 8)) & 255);
      shift -= 8;
    }
  }
  return bytes;
}
