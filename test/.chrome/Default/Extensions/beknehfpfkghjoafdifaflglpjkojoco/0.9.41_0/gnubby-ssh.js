/**
 * @fileoverview Gnubby methods relating to the SSH applet.
 */
'use strict';

// Commands and parametes of the SSH applet
// GOOGLE-INTERNAL //depot/google3/security/tools/gnubby/applet/SSH.java
Gnubby.SSH_SYSINFO = 0x11;
Gnubby.SSH_PIN_SIGN = 0x40;
Gnubby.SSH_PIN_GENKEY = 0x41;
Gnubby.SSH_PIN_UNLOCK = 0x42;
Gnubby.SSH_PIN_PUBKEY = 0x43;
Gnubby.E2E_DECRYPT = 0x44;

Gnubby.ECR_READ = 0x50;
Gnubby.ECR_WRITE = 0x51;

Gnubby.SSH_CERT_WRITE = 0x60;
Gnubby.SSH_CERT_READ = 0x61;

// APDU.P2 flags
Gnubby.F_ALTERNATE_KEY = 0x01;  // APDU.INS = SSH_PIN_PUBKEY
Gnubby.F_PROMOTE_ALTERNATE_KEY = 0x80;  // APDU.INS = SSH_CERT_WRITE

// APDU.P2 values
Gnubby.UNLOCK_SSH = 0x00;  // APDU.INS = SSH_PIN_UNLOCK
Gnubby.UNLOCK_ECREDZ = 0x01;  // APDU.INS = SSH_PIN_UNLOCK
Gnubby.UNLOCK_CHANGE = 0x02;  // APDU.ins = SSH_PIN_UNLOCK

/**
 * @param {Uint8Array} frame to redact.
 * @return {?string} alterative string to submit to log.
 */
Gnubby.redactRequestLog = function(frame) {
  // Make sure this is an APDU frame.
  // 7 for usb framing header + 5 for minimal APDU header.
  if (frame.length < 7 + 5 || frame[4] != GnubbyDevice.CMD_APDU) return null;

  // Reference to the apdu payload.
  var apdu = frame.subarray(7);

  // 1) Filter out PIN from GENKEY request.
  if (apdu.length == 5 + 6 && apdu[1] == Gnubby.SSH_PIN_GENKEY) {
    var result = UTIL_BytesToHex(frame.subarray(0, frame.length - 6));
    result += '(redacted security key password)';
    return result;
  }

  // No filter found.
  return null;
};

/**
 * Select the SSH applet.
 * @param {function(number, Uint8Array=)} cb Call with result of request.
 */
Gnubby.prototype.selectSSH = function(cb) {
  var apdu = new Uint8Array([
      // Select applet APDU
      0x00, 0xa4, 0x04, 0x00, 0x06,
      // SSH applet AID
      0x53, 0x53, 0x48, 0x00, 0x01, 0x01]);

  this.apduReply(apdu.buffer, cb);
};

/**
 * Gets the version of the SSH applet.
 * @param {function(number, Uint8Array=)} cb Called back with result of request.
 */
Gnubby.prototype.sshSysInfo = function(cb) {
  var apdu = new Uint8Array([0x00, Gnubby.SSH_SYSINFO, 0x00, 0x00, 0x00]);

  this.apduReply(apdu.buffer, cb);
};

/**
 * Set PIN and re-generate keys.
 *
 * @param {Array} pin
 * @param {Function} cb callback.
 */
Gnubby.prototype.generateProtectedKey = function(pin, cb) {
  var apdu = new Uint8Array(
      [0x00, Gnubby.SSH_PIN_GENKEY, 0, 0, pin.length]);
  var u8 = new Uint8Array(apdu.length + pin.length);
  for (var i = 0; i < apdu.length; ++i) u8[i] = apdu[i];
  for (var i = 0; i < pin.length; ++i) {
    u8[i + apdu.length] = pin[i];
  }

  this.apduReply(u8.buffer, cb);
};

/**
 * Read public key w/ proof of Gnubby residence.
 *
 * @param {Array} challenge to get fresh proof.
 * @param {number} which slot.
 * @param {boolean} alternate to read alternate key for slot.
 * @param {Function} cb callback.
 */
Gnubby.prototype.getProtectedPublicKey =
    function(challenge, which, alternate, cb) {
  var p2 = 0;
  if (alternate) p2 |= Gnubby.F_ALTERNATE_KEY;
  var apdu = new Uint8Array(
      [0x00, Gnubby.SSH_PIN_PUBKEY, which, p2, 0, 0, challenge.length]);
  var u8 = new Uint8Array(apdu.length + challenge.length + 2);
  for (var i = 0; i < apdu.length; ++i) u8[i] = apdu[i];
  for (var i = 0; i < challenge.length; ++i) {
    u8[i + apdu.length] = challenge[i];
  }

  this.apduReply(u8.buffer, cb);
};

/**
 * Present PIN and get cmac key in return.
 *
 * @param {Array} ecdh handshake curve point.
 * @param {Array} epin encrypted w/ ephemeral dh secret.
 * @param {number} which cmac key to get.
 * @param {Function} cb callback.
 */
Gnubby.prototype.unlockProtectedKey = function(ecdh, epin, which, cb) {
  var p2 = which;
  var apdu = new Uint8Array(
      [0x00, Gnubby.SSH_PIN_UNLOCK, 0, p2, ecdh.length + epin.length]);
  var u8 = new Uint8Array(apdu.length + ecdh.length + epin.length);
  for (var i = 0; i < apdu.length; ++i) u8[i] = apdu[i];
  for (var i = 0; i < ecdh.length; ++i) u8[i + apdu.length] = ecdh[i];
  for (var i = 0; i < epin.length; ++i) {
    u8[i + apdu.length + ecdh.length] = epin[i];
  }

  this.apduReply(u8.buffer, cb);
};

/**
 * Sign a request.
 *
 * @param {Array} cmac over input to proof possesion of ssh cmac key.
 * @param {number} which key to use.
 * @param {Array} input to sign.
 * @param {Function} cb callback.
 */
Gnubby.prototype.signProtectedKey = function(cmac, which, input, cb) {
  var p1 = which | 0;
  var len = cmac.length + input.length;
  var apdu = new Uint8Array(
      [0x00, Gnubby.SSH_PIN_SIGN, p1, 0, 0, len >> 8, len & 255]);
  var u8 = new Uint8Array(apdu.length + len + 2);
  for (var i = 0; i < apdu.length; ++i) u8[i] = apdu[i];
  for (var i = 0; i < cmac.length; ++i) u8[i + apdu.length] = cmac[i];
  for (var i = 0; i < input.length; ++i) {
    u8[i + apdu.length + cmac.length] = input[i];
  }

  this.apduReply(u8.buffer, cb);
};

/**
 * Decrypt a wrapped key.
 *
 * @param {number} which key to use.
 * @param {Array} cmac over input to proof possession of token.
 * @param {Array} fp pk fingerprint.
 * @param {Array} input dh point.
 * @param {Function} cb callback.
 */
Gnubby.prototype.e2eDecrypt = function(which, cmac, fp, input, cb) {
  var p1 = which | 0;
  var len = cmac.length + fp.length + input.length;
  var apdu = new Uint8Array(
      [0x00, Gnubby.E2E_DECRYPT, p1, 0, 0, len >> 8, len & 255]);
  var u8 = new Uint8Array(apdu.length + len + 2);
  for (var i = 0; i < apdu.length; ++i) u8[i] = apdu[i];
  for (var i = 0; i < cmac.length; ++i) {
    u8[i + apdu.length] = cmac[i];
  }
  for (var i = 0; i < fp.length; ++i) {
    u8[i + apdu.length + cmac.length] = fp[i];
  }
  for (var i = 0; i < input.length; ++i) {
    u8[i + apdu.length + cmac.length + fp.length] = input[i];
  }

  this.apduReply(u8.buffer, cb);
};

/**
 * Read ecredz locker.
 *
 * @param {number} block to read.
 * @param {Array} cmac to proof possesion of ecredz cmac key.
 * @param {Function} cb callback.
 */
Gnubby.prototype.ecredsRead = function(block, cmac, cb) {
  var apdu = new Uint8Array(
      [0x00, Gnubby.ECR_READ, 0x00, block & 255, 0, 0, cmac.length]);
  var u8 = new Uint8Array(apdu.length + cmac.length + 2);
  for (var i = 0; i < apdu.length; ++i) u8[i] = apdu[i];
  for (var i = 0; i < cmac.length; ++i) u8[i + apdu.length] = cmac[i];

  this.apduReply(u8.buffer, cb);
};

/**
 * Write ecredz locker.
 *
 * @param {number} block to write.
 * @param {Array} cmac to proof possesion of ecredz cmac key.
 * @param {Array} input data to write.
 * @param {Function} cb callback.
 */
Gnubby.prototype.ecredsWrite = function(block, cmac, input, cb) {
  var len = input.length + cmac.length;
  var apdu = new Uint8Array(
      [0x00, Gnubby.ECR_WRITE, 0x00, block & 255, 0,
       len >> 8, len & 255]);
  var u8 = new Uint8Array(apdu.length + input.length + cmac.length + 2);
  for (var i = 0; i < apdu.length; ++i) u8[i] = apdu[i];
  for (var i = 0; i < input.length; ++i) u8[i + apdu.length] = input[i];
  for (var i = 0; i < cmac.length; ++i) {
    u8[i + apdu.length + input.length] = cmac[i];
  }

  this.apduReply(u8.buffer, cb);
};

Gnubby.prototype.certWriteBlock_ =
    function(which, block, promote, input, cb) {
  var len = input.length;
  if (promote) block |= Gnubby.F_PROMOTE_ALTERNATE_KEY;
  var apdu = new Uint8Array(
      [0x00, Gnubby.SSH_CERT_WRITE, which, block, 0,
       len >> 8, len & 255]);
  var u8 = new Uint8Array(apdu.length + input.length + 2);
  for (var i = 0; i < apdu.length; ++i) u8[i] = apdu[i];
  for (var i = 0; i < input.length; ++i) u8[i + apdu.length] = input[i];

  this.apduReply(u8.buffer, cb);
};

/**
 * Write certificate slot.
 *
 * @param {number} which slot to write.
 * @param {Array} input data to write.
 * @param {boolean} promote_alternate to also switch to alternate key for slot.
 * @param {Function} cb callback.
 */
Gnubby.prototype.certWrite =
    function(which, input, promote_alternate, cb) {
  if (!cb) cb = Gnubby.defaultCallback;

  var i8 = new Uint8Array(input);
  var len = (i8[0] << 24) | (i8[1] << 16) | (i8[2] << 8) | i8[3];
  if (len != i8.length - 4 || i8.length > 2 * 1024) {
    cb(0x6a84);  // Rubbish input; return ISO7816.SW_FILE_FULL
    return;
  }

  var block = 0;
  var blockData = new Uint8Array(i8.subarray(block * 1024, (block + 1) * 1024));
  var self = this;
  var promoteFirst = promote_alternate && (i8.length <= 1024);  // Single block.
  this.certWriteBlock_(which, block, promoteFirst, blockData, function(rc) {
    if (rc != 0 || i8.length <= 1024) { cb(rc); return; }
    ++block;
    blockData = new Uint8Array(i8.subarray(block * 1024, (block + 1) * 1024));
    self.certWriteBlock_(which, block, promote_alternate, blockData, cb);
  });
};

Gnubby.prototype.certReadBlock_ = function(which, block, cb) {
  var apdu = new Uint8Array(
      [0x00, Gnubby.SSH_CERT_READ, which, block, 0, 0, 0, 0, 0]);
  this.apduReply(apdu.buffer, cb);
};

/**
 * Read a certificate slot.
 *
 * @param {number} which slot to read.
 * @param {Function} cb callback.
 */
Gnubby.prototype.certRead = function(which, cb) {
  if (!cb) cb = Gnubby.defaultCallback;

  var cert = new Uint8Array([]);

  function appendToCert(data) {
    var u8 = new Uint8Array(data);
    var len = cert.length + u8.length;
    var newCert = new Uint8Array(len);
    for (var i = 0; i < cert.length; ++i) newCert[i] = cert[i];
    for (var i = 0; i < u8.length; ++i) newCert[cert.length + i] = u8[i];
    cert = newCert;
  };

  var block = 0;
  var self = this;
  this.certReadBlock_(which, block, function(rc, data) {
    if (rc != 0) { cb(rc); return; }
    ++block;
    appendToCert(data);
    if (cert.length == 1024) {
      self.certReadBlock_(which, block, function(rc, data) {
        if (rc != 0) { cb(rc); return; }
        appendToCert(data);
        cb(0, cert);
      });
    } else {
      cb(0, cert);
    }
  });
};

