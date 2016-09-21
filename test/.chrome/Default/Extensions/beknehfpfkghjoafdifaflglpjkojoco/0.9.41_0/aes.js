// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview AES-128; CTR, ECB and CMAC.
 * @author mschilder@google.com (Marius Schilder)
 *
 * AES_CTR(key[16], iv[16]);
 * AES_CTR._crypt(inout[16]);      // in-place crypt w/o touching iv
 * AES_CTR.crypt(inout[], ?size);  // Multiples of 16 please
 * AES_CTR.clear();                // Wipe state
 *
 * AES_ECB(key[16]);
 * output[16] = AES_ECN.encryptBlock(input[16]);
 * output[16] = AES_ECN.decryptBlock(input[16]);
 * AES_ECB.clear();
 *
 * AES_CMAC(key[16]);
 * output[16] = AES_CMAC.cmac(input, ?output, ?output_offset);
 * AES_CMAC.clear();
 */

'use strict';


/**
 * @constructor
 */
function AES() {}

/**
 * SubBytes lookup for encryption.
 * @type {Array<number>}
 */
AES.e = [
99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118,
202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192,
183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21,
4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117,
9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227, 47, 132,
83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207,
208, 239, 170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168,
81, 163, 64, 143, 146, 157, 56, 245, 188, 182, 218, 33, 16, 255, 243, 210,
205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115,
96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219,
224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121,
231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8,
186, 120, 37, 46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138,
112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158,
225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223,
140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22
];


/**
 * SubBytes lookup for decryption.
 * @type {Array<number>}
 */
AES.d = [
82, 9, 106, 213, 48, 54, 165, 56, 191, 64, 163, 158, 129, 243, 215, 251,
124, 227, 57, 130, 155, 47, 255, 135, 52, 142, 67, 68, 196, 222, 233, 203,
84, 123, 148, 50, 166, 194, 35, 61, 238, 76, 149, 11, 66, 250, 195, 78,
8, 46, 161, 102, 40, 217, 36, 178, 118, 91, 162, 73, 109, 139, 209, 37,
114, 248, 246, 100, 134, 104, 152, 22, 212, 164, 92, 204, 93, 101, 182, 146,
108, 112, 72, 80, 253, 237, 185, 218, 94, 21, 70, 87, 167, 141, 157, 132,
144, 216, 171, 0, 140, 188, 211, 10, 247, 228, 88, 5, 184, 179, 69, 6,
208, 44, 30, 143, 202, 63, 15, 2, 193, 175, 189, 3, 1, 19, 138, 107,
58, 145, 17, 65, 79, 103, 220, 234, 151, 242, 207, 206, 240, 180, 230, 115,
150, 172, 116, 34, 231, 173, 53, 133, 226, 249, 55, 232, 28, 117, 223, 110,
71, 241, 26, 113, 29, 41, 197, 137, 111, 183, 98, 14, 170, 24, 190, 27,
252, 86, 62, 75, 198, 210, 121, 32, 154, 219, 192, 254, 120, 205, 90, 244,
31, 221, 168, 51, 136, 7, 199, 49, 177, 18, 16, 89, 39, 128, 236, 95,
96, 81, 127, 169, 25, 181, 74, 13, 45, 229, 122, 159, 147, 201, 156, 239,
160, 224, 59, 77, 174, 42, 245, 176, 200, 235, 187, 60, 131, 83, 153, 97,
23, 43, 4, 126, 186, 119, 214, 38, 225, 105, 20, 99, 85, 33, 12, 125
];


/**
 * Multiply lookup: i *= 2; if (i & 0x100) i ^= 0x11b;
 * @type {Array<number>}
 */
AES.x = [
0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30,
32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62,
64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94,
96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126,
128, 130, 132, 134, 136, 138, 140, 142, 144, 146, 148, 150, 152, 154, 156, 158,
160, 162, 164, 166, 168, 170, 172, 174, 176, 178, 180, 182, 184, 186, 188, 190,
192, 194, 196, 198, 200, 202, 204, 206, 208, 210, 212, 214, 216, 218, 220, 222,
224, 226, 228, 230, 232, 234, 236, 238, 240, 242, 244, 246, 248, 250, 252, 254,
27, 25, 31, 29, 19, 17, 23, 21, 11, 9, 15, 13, 3, 1, 7, 5,
59, 57, 63, 61, 51, 49, 55, 53, 43, 41, 47, 45, 35, 33, 39, 37,
91, 89, 95, 93, 83, 81, 87, 85, 75, 73, 79, 77, 67, 65, 71, 69,
123, 121, 127, 125, 115, 113, 119, 117, 107, 105, 111, 109, 99, 97, 103, 101,
155, 153, 159, 157, 147, 145, 151, 149, 139, 137, 143, 141, 131, 129, 135, 133,
187, 185, 191, 189, 179, 177, 183, 181, 171, 169, 175, 173, 163, 161, 167, 165,
219, 217, 223, 221, 211, 209, 215, 213, 203, 201, 207, 205, 195, 193, 199, 197,
251, 249, 255, 253, 243, 241, 247, 245, 235, 233, 239, 237, 227, 225, 231, 229
];


/**
 * Compute and return expanded key.
 * @param {Array<number>} key The key to expand.
 * @return {Array<number>} The expanded key.
 */
AES._expand = function(key) {
  var out = key.slice(0, 16);
  var xorval = 1;
  var tmp = out.slice(0, 16);
  for (var nrounds = 0; nrounds < 10; ++nrounds) {
    tmp[0] ^= AES.e[tmp[13]] ^ xorval;
    tmp[1] ^= AES.e[tmp[14]];
    tmp[2] ^= AES.e[tmp[15]];
    tmp[3] ^= AES.e[tmp[12]];

    tmp[4] ^= tmp[0];
    tmp[5] ^= tmp[1];
    tmp[6] ^= tmp[2];
    tmp[7] ^= tmp[3];

    tmp[8] ^= tmp[4];
    tmp[9] ^= tmp[5];
    tmp[10] ^= tmp[6];
    tmp[11] ^= tmp[7];

    tmp[12] ^= tmp[8];
    tmp[13] ^= tmp[9];
    tmp[14] ^= tmp[10];
    tmp[15] ^= tmp[11];

    xorval = AES.x[xorval];
    out = out.concat(tmp);
  }
  return out;
};


/**
 * Xor two 128-bit blocks.
 *
 * @param {Array} a The first array.
 * @param {number} a_offset The offset into a to start at.
 * @param {Array} b The second array.
 * @param {number} b_offset The offset into b to start at.
 */
AES._xor = function(a, a_offset, b, b_offset) {
  for (var i = 0; i < 16; ++i) {
    a[i + a_offset] ^= b[i + b_offset];
  }
};


/**
 * Increment 128-bit block.
 * @param {Array} b The array to increment.
 */
AES._inc = function(b) {
  for (var i = 15; i >= 0; i--) {
    if (++b[i] < 256) break;
    b[i] = 0;
  }
};


/**
 * Left shift by 1; b := a << 1
 * @param {Array} a The first array to shift.
 * @param {Array} b The resulting array shifted into.
 */
AES._ls1 = function(a, b) {
  var accu = 0;
  for (var i = 15; i >= 0; --i) {
    b[i] = (a[i] << 1) | accu;
    accu = b[i] >> 8;
    b[i] &= 255;
  }
};


/**
 * Encrypts the given input with the key.
 * @param {Array} key
 * @param {Array} input
 * @return {Array<number>}
 */
AES._encrypt = function(key, input) {
  var state = input.slice(0, 16);
  var nrounds = 10;
  var k_offset = 0;
  var tmp = 0;

  AES._xor(state, 0, key, k_offset);

  do {
    state[0] = AES.e[state[0]];
    state[4] = AES.e[state[4]];
    state[8] = AES.e[state[8]];
    state[12] = AES.e[state[12]];

    tmp = state[1];
    state[1] = AES.e[state[5]];
    state[5] = AES.e[state[9]];
    state[9] = AES.e[state[13]];
    state[13] = AES.e[tmp];

    tmp = state[2];
    state[2] = AES.e[state[10]];
    state[10] = AES.e[tmp];
    tmp = state[6];
    state[6] = AES.e[state[14]];
    state[14] = AES.e[tmp];

    tmp = state[3];
    state[3] = AES.e[state[15]];
    state[15] = AES.e[state[11]];
    state[11] = AES.e[state[7]];
    state[7] = AES.e[tmp];

    if (--nrounds > 0) {
      for (var j = 0; j < 16; j += 4) {
        tmp = state[j + 0] ^ state[j + 1] ^ state[j + 2] ^ state[j + 3];

        state[j + 0] ^= AES.x[state[j + 0] ^ state[j + 1]] ^ tmp;
        state[j + 1] ^= AES.x[state[j + 1] ^ state[j + 2]] ^ tmp;
        state[j + 2] ^= AES.x[state[j + 2] ^ state[j + 3]] ^ tmp;
        state[j + 3] = state[j + 0] ^ state[j + 1] ^ state[j + 2] ^ tmp;
      }
    }

    k_offset += 16;
    AES._xor(state, 0, key, k_offset);
  } while (nrounds != 0);

  return state;
};


/**
 * Decrypts the given input with the key.
 * @param {Array} key
 * @param {Array} input
 * @return {Array<number>}
 */
AES._decrypt = function(key, input) {
  var state = input.slice(0, 16);
  var nrounds = 10;
  var k_offset = nrounds * 16;
  var tmp = 0;

  AES._xor(state, 0, key, k_offset);

  do {
    if (--nrounds != 9) {
      for (var j = 0; j < 16; j += 4) {
        var tmp_1 = state[j + 0] ^ state[j + 1] ^ state[j + 2] ^ state[j + 3];
        var tmp_e = AES.x[state[j + 0] ^ state[j + 2]];
        var tmp_o = AES.x[state[j + 1] ^ state[j + 3]];
        var tmp_2 = AES.x[AES.x[tmp_e ^ tmp_o]] ^ tmp_1;

        state[j + 0] ^=
            tmp_2 ^ AES.x[state[j + 0] ^ state[j + 1] ^ tmp_e];
        state[j + 1] ^=
            tmp_2 ^ AES.x[state[j + 1] ^ state[j + 2] ^ tmp_o];
        state[j + 2] ^=
            tmp_2 ^ AES.x[state[j + 2] ^ state[j + 3] ^ tmp_e];
        state[j + 3] = state[j + 0] ^ state[j + 1] ^ state[j + 2] ^ tmp_1;
      }
    }

    state[0] = AES.d[state[0]];
    state[4] = AES.d[state[4]];
    state[8] = AES.d[state[8]];
    state[12] = AES.d[state[12]];

    tmp = state[1];
    state[1] = AES.d[state[13]];
    state[13] = AES.d[state[9]];
    state[9] = AES.d[state[5]];
    state[5] = AES.d[tmp];

    tmp = state[2];
    state[2] = AES.d[state[10]];
    state[10] = AES.d[tmp];
    tmp = state[6];
    state[6] = AES.d[state[14]];
    state[14] = AES.d[tmp];

    tmp = state[3];
    state[3] = AES.d[state[7]];
    state[7] = AES.d[state[11]];
    state[11] = AES.d[state[15]];
    state[15] = AES.d[tmp];

    k_offset -= 16;
    AES._xor(state, 0, key, k_offset);
  } while (nrounds != 0);

  return state;
};


/**
 * aes-128-ecb
 * @param {Array<number>} key
 * @constructor
 */
function AES_ECB(key) {
  this.key_ = AES._expand(key);
}

/**
 * Clease the AES key.
 */
AES_ECB.prototype.clear = function() {
  for (var i = 0; i < this.key_.length; ++i) this.key_[i] = 0;
};


/**
 * Decrypts the given block.
 * @param {Array} input The input to decrypt.
 * @return {Array} The decrypted input.
 */
AES_ECB.prototype.decryptBlock = function(input) {
  return AES._decrypt(this.key_, input);
};


/**
 * Encrypts the given block.
 * @param {Array} input The input to encrypt.
 * @return {Array} The encrypted input.
 */
AES_ECB.prototype.encryptBlock = function(input) {
  return AES._encrypt(this.key_, input);
};


/**
 * aes-128-ctr
 * @param {Array<number>} key
 * @param {Array<number>} iv
 * @constructor
 */
function AES_CTR(key, iv) {
  this.key_ = AES._expand(key);
  this.iv_ = iv.slice(0);
}

/**
 * Clears the key.
 */
AES_CTR.prototype.clear = function() {
  for (var i = 0; i < this.key_.length; ++i) this.key_[i] = 0;
  for (var i = 0; i < this.iv_.length; ++i) this.iv_[i] = 0;
};


/**
 * Cryps the given block.
 * @param {Array} b
 */
AES_CTR.prototype._crypt = function(b) {
  AES._xor(b, 0,
      AES._encrypt(this.key_, this.iv_), 0);
};


/**
 * Cryps the given block.
 * @param {Array} inout The block to crypt.
 * @param {number} length The length of inout.
 */
AES_CTR.prototype.crypt = function(inout, length) {
  var end = length ? length : inout.length;
  if (end & 15) throw 'crypt() needs multiple of 16!';
  for (var i = 0; i < end; i += 16) {
    AES._xor(inout, i,
        AES._encrypt(this.key_, this.iv_), 0);
    AES._inc(this.iv_);
  }
};


/**
 * rfc4493 cmac-16 functions.
 * @param {Array<number>} key
 * @constructor
 */
function AES_CMAC(key) {
  this.key_ = AES._expand(key);
  this.K1_ = new Array(16);
  this.K2_ = new Array(16);

  var L = AES._encrypt(this.key_,
      new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0));

  AES._ls1(L, this.K1_);
  if (L[0] & 0x80) this.K1_[15] ^= 0x87;

  AES._ls1(this.K1_, this.K2_);
  if (this.K1_[0] & 0x80) this.K2_[15] ^= 0x87;
}


/**
 * Clears the key.
 */
AES_CMAC.prototype.clear = function() {
  for (var i = 0; i < this.key_.length; ++i) this.key_[i] = 0;
  for (var i = 0; i < this.K1_.length; ++i) this.K1_[i] = 0;
  for (var i = 0; i < this.K2_.length; ++i) this.K2_[i] = 0;
};

/**
 * @param {Array<number>} input
 * @param {Array<number>=} output
 * @param {number=} output_offset
 * @return {Array<number>}
 */
AES_CMAC.prototype.cmac = function(input, output, output_offset) {
  var accu = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

  // TODO: handle input.length == 0?
  for (var i = 0; i < input.length; i += 16) {
    var j = 0;
    for (; j < 16 && i + j < input.length; ++j) {
      accu[j] ^= input[i + j];
    }
    if (j != 16) {
      accu[j] ^= 0x80;  // pad
      AES._xor(accu, 0, this.K2_, 0);  // ^ K2
    } else {
      if (i + j == input.length) {  // last block?
        AES._xor(accu, 0, this.K1_, 0);  // ^ K1
      }
    }
    accu = AES._encrypt(this.key_, accu);
  }

  if (output) {
    var o = output_offset ? output_offset : 0;
    for (var j = 0; j < 16; ++j) output[o++] = accu[j++];
  }

  return accu;
};
