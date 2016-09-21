// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview Class to parse and generate SSH binary messages.
 * @author mschilder@google.com (Marius Schilder)
 */
'use strict';

/**
 * A class for generating SSH-compatible public keys.
 * @param {Array<number>=} x Storage for this blob, will be created if not
 *    provided.
 * @constructor
 */
function SshBlob(x) {
  /**
   * This blob's buffer.
   * @type {Array<number>}
   * @private
   */
  this.buf_ = x ? x : [];
  /**
   * This blob's current read/write position.
   * @type {number}
   * @private
   */
  this.rptr_ = 0;
}

/** @return {number} This blob's length, in bytes. */
SshBlob.prototype.size = function() {
  return this.buf_.length;
};

/** @return {Array<number>} This blob's underlying buffer. */
SshBlob.prototype.data = function() {
  return this.buf_;
};

/** @return {SshBlob} a copy of this */
SshBlob.prototype.copy = function() {
  return new SshBlob(this.buf_.slice(0));
};

/**
 * Resets this blob's underlying array.
 * @param {Array<number>=} opt_array Array with which to reset the blob.
 */
SshBlob.prototype.reset = function(opt_array) {
  this.buf_ = opt_array ? opt_array : [];
  this.rptr_ = 0;
};

/** Sets this blob's buffer to all 0's, and resets the buffer. */
SshBlob.prototype.clear = function() {
  if (this.buf_) {
    for (var i = 0; i < this.buf_.length; ++i)
      this.buf_[i] = 0;
  }
  this.reset();
};

/** Resets the blob's read pointer to the beginning of the buffer. */
SshBlob.prototype.rewind = function() {
  this.rptr_ = 0;
};

/**
 * Resizes this blob to the given size, which must be within the blob's
 * existing size.
 * @param {number} s The new size of the blob.
 */
SshBlob.prototype.resize = function(s) {
  if (s < 0 || s > this.buf_.length) {
    throw new RangeError('Illegal resize ' + s);
  }
  this.buf_ = this.buf_.splice(0, s);
  this.rptr_ = 0;
};

/**
 * Crops this blob's buffer to begin at the current read position or the
 * specified position.
 * @param {?number} opt_cnt The beginning position at which to crop.
 */
SshBlob.prototype.crop = function(opt_cnt) {
  var cnt = opt_cnt ? opt_cnt : this.rptr_;
  this.buf_ = this.buf_.slice(cnt);
  this.rptr_ = 0;
};

/**
 * Unpads this blob the SSH way.
 * @param {number=} s
 * @return {SshBlob} This blob.
 */
SshBlob.prototype.unpad = function(s) {
  if (this.rptr_ != 0) {
    throw new RangeError('rptr_ != 0');
  }
  var size = s ? s : this.readSize();
  var padlen = this.readByte();
  if (size < (padlen + 1)) {
    throw new RangeError('SshBlob too small');
  }
  this.crop();
  size -= (padlen + 1);
  this.resize(size);
  return this;
};

/**
 * Reads the byte at the current read position.
 * @return {number} Read byte.
 */
SshBlob.prototype.readByte = function() {
  if (this.rptr_ + 1 > this.buf_.length) {
    throw new RangeError('End of SshBlob');
  }
  return this.buf_[this.rptr_++] & 255;
};

/**
 * Reads the big-endian integer at the current read position.
 * @return {number} The read size.
 */
SshBlob.prototype.readSize = function() {
  if (this.rptr_ + 4 > this.buf_.length) {
    throw new RangeError('End of SshBlob');
  }
  var rp = this.rptr_;
  var tmp = ((this.buf_[rp + 0] & 255) << 24) |
            ((this.buf_[rp + 1] & 255) << 16) |
            ((this.buf_[rp + 2] & 255) << 8) |
            ((this.buf_[rp + 3] & 255));
  this.rptr_ += 4;
  return tmp;
};

/**
 * Reads the specified number of bytes from this blob and returns them as an
 * array.
 * @param {number} n Number of bytes to read.
 * @return {Array<number>} Read bytes.
 */
SshBlob.prototype.readBytes = function(n) {
  if (this.rptr_ + n > this.buf_.length) {
    throw new RangeError('End of SshBlob');
  }
  var tmp = this.buf_.slice(this.rptr_, this.rptr_ + n);
  this.rptr_ += n;
  return tmp;
};

/**
 * Reads a length-prefixed byte string and returns its value.
 * @return {Array<number>} Read byte string.
 */
SshBlob.prototype.readByteString = function() {
  var n = this.readSize();
  return this.readBytes(n);
};

/**
 * Reads a length-prefixed character string and returns its value.
 * @return {string} Read string.
 */
SshBlob.prototype.readString = function() {
  var n = this.readSize();
  return UTIL_BytesToString(this.readBytes(n));
};

/**
 * Useful for reading initial hello out of socket receive buffer blob.
 * @return {Array<number>} Terminated by 0x0a.
 */
SshBlob.prototype.peekEoln = function() {
  if (this.rptr_ != 0) {
    throw new RangeError('rptr_ != 0');
  }
  var i = 0;
  var tmp = [];
  for (; i < this.buf_.length && this.buf_[i] !== 0xa; ++i) {
    if (this.buf_[i] !== 0x0d) {
      tmp.push(this.buf_[i]);
    }
  }
  if (i >= this.buf_.length) return null;
  this.buf_ = this.buf_.slice(i + 1);  // Drop read data from this.
  return tmp;
};

/**
 * @return {number} -1 if SshBlob < 4 bytes. Otherwise, return 32-bit value.
 */
SshBlob.prototype.peekSize = function() {
  if (this.rptr_ != 0) return -1;
  if (this.buf_.length < 4) return -1;
  var t = this.buf_.slice(0, 4);  // peek, don't read yet
  var n = ((t[0] & 255) << 24) |
          ((t[1] & 255) << 16) |
          ((t[2] & 255) << 8) |
          ((t[3] & 255));
  return n;
};

/**
 * Reads the length-prefixed blob at the current read position and returns it.
 * @return {SshBlob} Read blob.
 */
SshBlob.prototype.readSshBlob = function() {
  var n = this.readSize();
  return new SshBlob(this.readBytes(n));
};

/**
 * Appends the given byte to this blob.
 * @param {number} b
 */
SshBlob.prototype.appendByte = function(b) {
  this.buf_.push(b & 255);
};

/**
 * Appends the given array to this blob.
 * @param {Array<number>|Uint8Array} array The array to append.
 */
SshBlob.prototype.appendBytes = function(array) {
  var a = array;
  if (array.buffer) {  // Uint8Array argument.
    a = new Array(array.length);
    for (var i = 0; i < a.length; ++i) a[i] = array[i];
  }
  this.buf_ = this.buf_.concat(a);
};

/**
 * Appends the value of n as an integer to this blob.
 * @param {number} n
 */
SshBlob.prototype.appendSize = function(n) {
  this.buf_.push((n >> 24) & 255);
  this.buf_.push((n >> 16) & 255);
  this.buf_.push((n >> 8) & 255);
  this.buf_.push((n) & 255);
};

/**
 * Appends an array as a length-prefixed byte array to this blob.
 * @param {Array<number>|Uint8Array} array The array to append.
 */
SshBlob.prototype.appendByteString = function(array) {
  this.appendSize(array.length);
  this.appendBytes(array);
};

/**
 * Appends the given string to this blob.
 * @param {string} s
 */
SshBlob.prototype.appendString = function(s) {
  var a = UTIL_StringToBytes(s);
  this.appendSize(a.length);
  this.appendBytes(a);
};

/**
 * Appends the given blob to this one.
 * @param {SshBlob} b
 */
SshBlob.prototype.appendSshBlob = function(b) {
  this.appendSize(b.buf_.length);
  this.appendBytes(b.buf_);
};

/**
 * Formats this blob's contents for debugging.
 * @param {string=} tag value to prepend to debugging output.
 * @return {string} debug string.
 */
SshBlob.prototype.fmt = function(tag) {
  tag = tag ? (tag + '[' + this.buf_.length + ']:') : '';
  return UTIL_fmt(tag + UTIL_BytesToHex(this.buf_));
};

/**
 * Output debugging info with the provided tag.
 * @param {string=} tag
 */
SshBlob.prototype.print = function(tag) {
  console.log(this.fmt(tag));
};

/**
 * Compute string fingerprint for this.
 * @return {string} Base64-encoded SHA256 fingerprint.
 */
SshBlob.prototype.fingerprint = function() {
  var sha = new SHA256();
  sha.update(this.buf_);
  return B64_encode(sha.digest());
};
