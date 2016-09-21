// SHA256 in javascript.
// GOOGLE-INTERNAL by mschilder
//
// SHA256 {
//  SHA256();
//  void reset();
//  void update(byte[] data, opt_length);
//  byte[32] digest();
// }

/** @constructor */
function SHA256() {
  this._buf = new Array(64);
  this._W = new Array(64);
  this._pad = new Array(64);
  this._k = [
   0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
   0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
   0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
   0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
   0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
   0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
   0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
   0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
   0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
   0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
   0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
   0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
   0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
   0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
   0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
   0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

  this._pad[0] = 0x80;
  for (var i = 1; i < 64; ++i) this._pad[i] = 0;

  this.reset();
}

/** Reset the hasher */
SHA256.prototype.reset = function() {
  this._chain = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

  this._inbuf = 0;
  this._total = 0;
};

/** Hash the next block of 64 bytes
 * @param {Array<number>} buf A 64 byte buffer
 */
SHA256.prototype._compress = function(buf) {
  var W = this._W;
  var k = this._k;

  function _rotr(w, r) { return ((w << (32 - r)) | (w >>> r)); };

  // get 16 big endian words
  for (var i = 0; i < 64; i += 4) {
    var w = (buf[i] << 24) |
            (buf[i + 1] << 16) |
            (buf[i + 2] << 8) |
            (buf[i + 3]);
    W[i / 4] = w;
  }

  // expand to 64 words
  for (var i = 16; i < 64; ++i) {
    var s0 = _rotr(W[i - 15], 7) ^ _rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
    var s1 = _rotr(W[i - 2], 17) ^ _rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
    W[i] = (W[i - 16] + s0 + W[i - 7] + s1) & 0xffffffff;
  }

  var A = this._chain[0];
  var B = this._chain[1];
  var C = this._chain[2];
  var D = this._chain[3];
  var E = this._chain[4];
  var F = this._chain[5];
  var G = this._chain[6];
  var H = this._chain[7];

  for (var i = 0; i < 64; ++i) {
    var S0 = _rotr(A, 2) ^ _rotr(A, 13) ^ _rotr(A, 22);
    var maj = (A & B) ^ (A & C) ^ (B & C);
    var t2 = (S0 + maj) & 0xffffffff;
    var S1 = _rotr(E, 6) ^ _rotr(E, 11) ^ _rotr(E, 25);
    var ch = (E & F) ^ ((~E) & G);
    var t1 = (H + S1 + ch + k[i] + W[i]) & 0xffffffff;

    H = G;
    G = F;
    F = E;
    E = (D + t1) & 0xffffffff;
    D = C;
    C = B;
    B = A;
    A = (t1 + t2) & 0xffffffff;
  }

  this._chain[0] += A;
  this._chain[1] += B;
  this._chain[2] += C;
  this._chain[3] += D;
  this._chain[4] += E;
  this._chain[5] += F;
  this._chain[6] += G;
  this._chain[7] += H;
};

/** Update the hash with additional data
 * @param {Array<number>|Uint8Array} bytes The data
 * @param {number=} opt_length How many bytes to hash, if not all */
SHA256.prototype.update = function(bytes, opt_length) {
  if (!opt_length) opt_length = bytes.length;

  this._total += opt_length;
  for (var n = 0; n < opt_length; ++n) {
    this._buf[this._inbuf++] = bytes[n];
    if (this._inbuf == 64) {
      this._compress(this._buf);
      this._inbuf = 0;
    }
  }
};

/** Update the hash with a specified range from a data buffer
 * @param {Array<number>} bytes The data buffer
 * @param {number} start Starting index of the range in bytes
 * @param {number} end End index, will not be included in range
 */
SHA256.prototype.updateRange = function(bytes, start, end) {
  this._total += (end - start);
  for (var n = start; n < end; ++n) {
    this._buf[this._inbuf++] = bytes[n];
    if (this._inbuf == 64) {
      this._compress(this._buf);
      this._inbuf = 0;
    }
  }
};

/**
 * Optionally update the hash with additional arguments, and return the
 * resulting hash value.
 * @param {...*} var_args Data buffers to hash
 * @return {Array<number>} the SHA256 hash value.
 */
SHA256.prototype.digest = function(var_args) {
  for (var i = 0; i < arguments.length; ++i)
    this.update(arguments[i]);

  var digest = new Array(32);
  var totalBits = this._total * 8;

  // add pad 0x80 0x00*
  if (this._inbuf < 56)
    this.update(this._pad, 56 - this._inbuf);
  else
    this.update(this._pad, 64 - (this._inbuf - 56));

  // add # bits, big endian
  for (var i = 63; i >= 56; --i) {
    this._buf[i] = totalBits & 255;
    totalBits >>>= 8;
  }

  this._compress(this._buf);

  var n = 0;
  for (var i = 0; i < 8; ++i)
    for (var j = 24; j >= 0; j -= 8)
      digest[n++] = (this._chain[i] >> j) & 255;

  return digest;
};
