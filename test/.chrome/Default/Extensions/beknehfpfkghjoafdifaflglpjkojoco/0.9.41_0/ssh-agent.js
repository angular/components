/**
 * @fileoverview Javascript ssh agent that mostly only knows about Gnubby.
 */

'use strict';

/**
 * @param {Function} handler for bottom-half messages.
 * @constructor
 */
function SshAgent(handler) {
  this.emergency_ = false;
  this.lookup_ = [];
  this.ssh_token_ = null;
  this.ecr_token_ = null;
  this.ecr_session_ = null;
  this.handler_ = handler;

  function safeGetLocalStorageValue(key) {
    return new Promise(function(resolve, reject) {
      if (!chrome || !chrome.storage) {
        reject();
        return;
      }

      chrome.storage.local.get(key, function(data) {
        if (chrome.runtime.lastError) {
          console.warn(UTIL_fmt(chrome.runtime.lastError.message));
          reject();
          return;
        }
        if (!data) {
          reject();
          return;
        }
        resolve(data[key]);
      });
    });
  }

  // Try recover token and emergency mode from local storage.
  // These likely will have finished before a request that wants to use it
  // is active. Hence no need for callback chaining.
  safeGetLocalStorageValue('ssh_token').then(function(token) {
    if (typeof token === 'string') {
      this.ssh_token_ = UTIL_HexToArray(token);
    }
  }.bind(this));
  safeGetLocalStorageValue('emergency_mode').then(function(value) {
    if (typeof value === 'boolean') {
      this.emergency_ = value;
    }
  }.bind(this));
}


/**
 * Our singleton agent. Lazily initialized.
 * @type {SshAgent}
 */
var sshAgent = null;


/** @const */
SshAgent.CORP_NORMAL = 0;
/** @const */
SshAgent.PROD_NORMAL = 1;
/** @const */
SshAgent.CORP_EMERGENCY = 2;
/** @const */
SshAgent.PROD_EMERGENCY = 3;
/** @const */
SshAgent.NON_ROTATING = 4;
/** @const */
SshAgent.E2E_DECRYPT_MULTI = 6;
/** @const */
SshAgent.E2E_DECRYPT_SINGLE = 7;
/** @const */
SshAgent.GNUBBY_QUOTE_REQUEST_PREFIX = 'k7xA#mvD&S2m8e%3';
/** @const */
SshAgent.slotNames = [
    'corp/normal',
    'prod/normal',
    'corp/emergency',
    'prod/emergency',
    'non-rotating',
    'e2e-decrypt-multi',
    'e2e-decrypt-single'
];


/**
 * Reply with generic ssh failure code.
 * @param {Function} sendResponse callback.
 */
SshAgent.sendGenericFailure = function(sendResponse) {
  var rsp = new SshBlob();
  rsp.appendByte(SSH2_AGENT_FAILURE);
  var respJson = {
    'type': 'auth-agent@openssh.com',
    'data': rsp.data()
  };
  sendResponse(respJson);
};


/**
 * Reply with an ssh message.
 * @param {Function} sendResponse callback.
 * @param {SshBlob} rsp to send.
 */
SshAgent.sendSshBlob = function(sendResponse, rsp) {
  var respJson = {
    'type': 'auth-agent@openssh.com',
    'data': rsp.data()
  };
  sendResponse(respJson);
};


/**
 * Parse public key and signature out of a message reply.
 * @param {Object} reply message to parse from.
 * @param {SshBlob} pk public key destination.
 * @param {SshBlob} sig signature destination.
 */
SshAgent.parsePubkeyAndSignature = function(reply, pk, sig) {
  if (reply.exponent) {
    // rsa
    var type = 'ssh-rsa';
    pk.appendString(type);
    var exp = UTIL_HexToArray(reply.exponent);
    pk.appendSize(exp.length);
    pk.appendBytes(exp);
    var pub = UTIL_HexToArray(reply.publickey);
    pk.appendSize(pub.length);
    pk.appendBytes(pub);
    //pk.print('pk');

    if (reply.signature) {
      sig.appendString(type);
      var s = new SshBlob();
      var sg = UTIL_HexToArray(reply.signature);
      sig.appendSize(sg.length);
      sig.appendBytes(sg);
    }
  } else {
    // ecdsa
    var type = 'ecdsa-sha2-nistp256';
    pk.appendString(type);
    pk.appendString('nistp256');
    pk.appendSize(65);
    pk.appendBytes(UTIL_HexToArray(reply.publickey));

    if (reply.signature) {
      // Signature is ASN1 DER sequence of two signed ints.
      // Translate into ssh format.
      var bytes = UTIL_HexToArray(reply.signature);

      sig.appendString(type);

      var i = 2;
      var r = bytes.slice(2 + i, 2 + i + bytes[1 + i]);
      i += 2 + r.length;
      var s = bytes.slice(2 + i, 2 + i + bytes[1 + i]);

      var rs = new SshBlob();
      rs.appendSize(r.length);
      rs.appendBytes(r);
      rs.appendSize(s.length);
      rs.appendBytes(s);

      sig.appendSshBlob(rs);
    }
  }
};


/**
 * Return SSH2 key blob as printable string.
 * @param {SshBlob} pk to format.
 * @return {string} formatted pk.
 */
SshAgent.printSSH = function(pk) {
  var result = pk.copy().readString();
  result += ' ' + base64_encode(pk.data()) + ' corp/normal';
  return result;
};


/**
 * Set or unset emergency mode.
 * @param {boolean} value to set.
 */
SshAgent.prototype.setEmergency = function(value) {
  if (value != this.emergency_) {
    if (chrome && chrome.storage) {
      chrome.storage.local.set(
          { 'emergency_mode': value },
          function() {});
    }
    this.emergency_ = value;
  }
};


/**
 * Get emergency mode setting.
 * @return {boolean} current setting.
 */
SshAgent.prototype.getEmergency = function() {
  return this.emergency_;
};


/**
 * Read out all identities we care about and cache their fingerprints,
 * taking emergency mode into account.
 *
 * @param {Function} sendResponse callback.
 */
SshAgent.prototype.requestIdentities = function(sendResponse) {
  var publickeyPk;
  var corpCert;
  var prodCert;

  var self = this;

  function reportKeys() {
    var rsp = new SshBlob();
    rsp.appendByte(SSH2_AGENT_IDENTITIES_ANSWER);
    var n = 0;
    if (publickeyPk) ++n;
    if (corpCert) ++n;
    if (prodCert) ++n;
    rsp.appendSize(n);
    var suffix = self.emergency_ ? '/emergency!' : '/normal';

    if (publickeyPk) {
      rsp.appendSshBlob(publickeyPk);
      rsp.appendString('publickey');
    }
    if (corpCert) {
      rsp.appendSshBlob(corpCert);
      rsp.appendString('corp' + suffix);
    }
    if (prodCert) {
      rsp.appendSshBlob(prodCert);
      rsp.appendString('prod' + suffix);
    }
    SshAgent.sendSshBlob(sendResponse, rsp);
  }

  this.lookup_ = [];  // Clear lookup state.

  this.getSSH(SshAgent.NON_ROTATING, false,
      function(rc, pk) {
        if (rc === 0) {
          publickeyPk = pk;
          self.lookup_[pk.fingerprint()] = SshAgent.NON_ROTATING;
        }

        var certId = self.emergency_ ?
            SshAgent.PROD_EMERGENCY : SshAgent.PROD_NORMAL;
        self.certRead(certId,
            function(rc, cert) {
              if (rc === 0) {
                var c = new SshBlob(cert);
                c.crop(4);  // Drop length field.
                prodCert = c;
                self.lookup_[c.fingerprint()] = certId;
              }

              certId = self.emergency_ ?
                  SshAgent.CORP_EMERGENCY : SshAgent.CORP_NORMAL;
              self.certRead(certId,
                  function(rc, cert) {
                    if (rc === 0) {
                      var c = new SshBlob(cert);
                      c.crop(4);
                      corpCert = c;
                      self.lookup_[c.fingerprint()] = certId;
                    }

                    reportKeys();
                  });
            }
        );
      }
  );
};


/**
 * @param {SshBlob} key or cert to look up.
 * @return {number} which slot identity lives at or -1 if not found.
 */
SshAgent.prototype.getIdentity = function(key) {
  var fingerprint = key.fingerprint();
  if (!this.lookup_.hasOwnProperty(fingerprint)) {
    return -1;
  }
  return this.lookup_[fingerprint];
};


/**
 * Get a pk with proof of gnubby residence.
 *
 * @param {number} which slot.
 * @param {boolean} alternate to get the alternate key for slot.
 * @param {Function} cb callback.
 * @param {Array=} opt_challenge to challenge proof.
 */
SshAgent.prototype.getSSH = function(which, alternate, cb, opt_challenge) {
  opt_challenge = opt_challenge || UTIL_getRandom(16);
  var self = this;
  this.handler_(
      {
        'type': 'SSH_PUBKEY',
        'which': which | 0,
        'alternate': (alternate == true),
        'challenge': UTIL_BytesToHex(opt_challenge)
      },
      { 'id': chrome.runtime.id },
      function(reply) {
        if (reply.rc === 0) {
          console.log(reply);

          var pk = new SshBlob();
          var sig = new SshBlob();

          SshAgent.parsePubkeyAndSignature(reply, pk, sig);

          self.lookup_[pk.fingerprint()] = which;

          var pkStr = SshAgent.printSSH(pk);

          // Forward all other challenge / response attributes to caller.
          var raw_pk = reply.publickey && UTIL_HexToArray(reply.publickey);
          var device_pk = reply.devicekey && UTIL_HexToArray(reply.devicekey);
          var device_fp =
              reply.fingerprint && UTIL_HexToArray(reply.fingerprint);
          var ecdh = reply.ecdh && UTIL_HexToArray(reply.ecdh);
          var meta = reply.meta && UTIL_HexToArray(reply.meta);

          // Verify attestation.
          var ecdsa = new crypto_custom.gnubbyd.ecdsa(device_pk);

          // Signature is in ASN1 format.
          var signature =
              UTIL_Asn1SignatureToJson(UTIL_HexToArray(reply.signature));

          // Attestation is over concatenation of
          //   {challenge, meta?, publickey, ecdh}
          var message = opt_challenge.slice(0);
          message = message.concat(meta || []);
          message = message.concat(raw_pk);
          message = message.concat(ecdh);

          var verified =
              raw_pk && raw_pk.length == 65 &&
              ecdh && ecdh.length == 65 &&
              signature && ecdsa.verify(message, signature);

          // TODO(mschilder) warn on first sight of fingerprint?

          if (cb) {
            if (verified) {
              cb(0, pk, ecdh, pkStr, opt_challenge, device_pk, device_fp,
                  sig, meta);
            } else {
              cb(-666);
            }
          }
        } else {
          if (cb) {
            cb(reply.rc);
          }
        }
      });
};


/**
 * Exchange PIN for cmac token.
 *
 * @param {!Array<number>} ec gnubby' ecdh public point.
 * @param {Array<number>} pin as byte array.
 * @param {Function} cb callback.
 * @param {?number} opt_ecr_duration seconds to keep a session alive for.
 */
SshAgent.prototype.unlockSSH = function(ec, pin, cb, opt_ecr_duration) {
  // Compute ecdh shared secret.
  var dh = new crypto_custom.gnubbyd.ecdh();
  var key = dh.computeSecret(ec);

  // Pad PIN w/ random to fill aes block.
  var r = UTIL_getRandom(16);
  for (var i = 0; i < pin.length; ++i) r[i] = pin[i];

  var aes_enc = new AES_ECB(key.slice(0, 16));
  var aes_dec = new AES_ECB(key.slice(16, 32));

  var encrypted_pin = aes_enc.encryptBlock(r);

  aes_enc.clear();

  UTIL_clear(r);
  UTIL_clear(key);

  var self = this;
  this.handler_(
      {
        'type': 'SSH_UNLOCK',
        'ecdh': dh.getPublicKey(),
        'duration': opt_ecr_duration,
        'pin': encrypted_pin
      },
      { 'id': chrome.runtime.id },
      function(reply) {
        console.log(reply);
        if (reply.rc === 0) {
          var encrypted_token = UTIL_HexToArray(reply.token);
          var decrypted_token = aes_dec.decryptBlock(encrypted_token);
          var token = decrypted_token;
          if (opt_ecr_duration) {
            self.ecr_token_ = token;
            self.ecr_session_ = reply.sessionId;
          } else {
            self.ssh_token_ = token;
            // Also try save token in local storage, in case we get reaped
            // and restarted.
            if (chrome && chrome.storage) {
              chrome.storage.local.set(
                  { 'ssh_token': UTIL_BytesToHex(token) },
                  function() {});
            }
          }
        } else {
          self.ssh_token_ = null;
          self.ecr_token_ = null;
          self.ecr_session_ = null;
        }
        aes_dec.clear();
        if (cb) cb(reply.rc);
      });
};


/**
 * Sign input using SSH private key.
 *
 * @param {number} which key to use.
 * @param {Array<number>} input to sign.
 * @param {Function} cb callback.
 */
SshAgent.prototype.signSSH = function(which, input, cb) {
  var token = this.ssh_token_ || [];

  // aes-cmac-16 the request with token as key.
  var cmacInput;
  var sha = new SHA256();
  sha.update(input);

  cmacInput = input = sha.digest();
  var cmacer = new AES_CMAC(token);
  var cmac = UTIL_BytesToHex(cmacer.cmac(cmacInput));
  cmacer.clear();

  this.handler_(
      {
        'type': 'SSH_SIGN',
        'which': which | 0,
        'token': cmac,
        'input': input
      },
      { 'id': chrome.runtime.id },
      function(reply) {
        console.log(reply);
        if (reply.rc == 0 && reply.publickey && reply.signature) {
          var pk = new SshBlob();
          var sig = new SshBlob();

          SshAgent.parsePubkeyAndSignature(reply, pk, sig);

          cb(0, pk, sig);
        } else {
          cb(reply.rc);
        }
      });
};

/**
 * Get KEK for given fp and input.
 *
 * @param {Array<number>} meta data for key to use.
 * @param {Array<number>} fp fingerprint to apply in KDF.
 * @param {Array<number>} input dh point.
 * @param {Function} cb callback.
 */
SshAgent.prototype.e2eDecrypt = function(meta, fp, input, cb) {
  var which = meta[2];
  var token = this.ssh_token_ || [];
  var sessionId = null;
  if (meta[0] & SSH2_KF_ALWAYS_AUTH) {
    token = this.ecr_token_ || [];
    sessionId = this.ecr_session_ || '';
  }

  // aes-cmac-16 the request with token as key.
  var cmacInput;
  var sha = new SHA256();
  sha.update(fp);
  sha.update(input);

  cmacInput = sha.digest();
  var cmacer = new AES_CMAC(token);
  var cmac = cmacer.cmac(cmacInput);
  cmacer.clear();

  var req = {
        'type': 'E2E_DECRYPT',
        'which': which | 0,
        'token': UTIL_BytesToHex(cmac),
        'fp': UTIL_BytesToHex(fp),
        'input': UTIL_BytesToHex(input)
  };

  if (meta[0] & SSH2_KF_ALWAYS_AUTH) {
    req.sessionId = sessionId;
  }

  this.handler_(
      req,
      { 'id': chrome.runtime.id },
      function(reply) {
        console.log(reply);
        if (reply.rc == 0 && reply.encrypted_key) {

          // Decrypt using sha(cmac,token)[0..15] as key
          sha.reset();
          sha.update(token);
          sha.update(cmac);
          var aes = new AES_ECB(sha.digest().slice(0, 16));
          var decrypted_key = aes.decryptBlock(
              UTIL_HexToArray(reply.encrypted_key));

          var result = new SshBlob();
          result.appendSize(decrypted_key.length);
          result.appendBytes(decrypted_key);

          cb(0, result.data());
        } else {
          cb(reply.rc);
        }
      });
};

/**
 * Read a block from Emergency Credential store.
 *
 * @param {number} which block to read.
 * @param {Function} cb callback.
 */
SshAgent.prototype.readECred = function(which, cb) {
  which = which || 0;
  var token = this.ecr_token_ || [];
  var sessionId = this.ecr_session_ || '';

  var cmacer = new AES_CMAC(token);

  var sha = new SHA256();
  sha.update([which]);
  var cmac = UTIL_BytesToHex(cmacer.cmac(sha.digest()));
  cmacer.clear();

  this.handler_(
      {
        'type': 'ECR_READ',
        'sessionId': sessionId,
        'block': which,
        'token': cmac
      },
      { 'id': chrome.runtime.id },
      function(reply) {
        if (reply.rc == 0 && reply.data) {
          var data = UTIL_HexToArray(reply.data);
          cb(0, data);
        } else {
          cb(reply.rc);
        }
      });
};


/**
 * Write a block of the Emergency Credential store.
 *
 * @param {number} which block to write.
 * @param {Array} data to write.
 * @param {Function} cb callback.
 */
SshAgent.prototype.writeECred = function(which, data, cb) {
  which = which || 0;
  var token = this.ecr_token_ || [];
  var sessionId = this.ecr_session_ || '';

  var cmacer = new AES_CMAC(token);
  var u8 = new Uint8Array(data);
  var block = new Uint8Array(1 + 1024);

  block[0] = which;
  for (var i = 0; i < 1024; ++i) {
    block[1 + i] = u8[i];
  }

  var sha = new SHA256();
  sha.update(block);
  var cmac = UTIL_BytesToHex(cmacer.cmac(sha.digest()));
  cmacer.clear();

  this.handler_(
      {
        'type': 'ECR_WRITE',
        'sessionId': sessionId,
        'block': which,
        'data': UTIL_BytesToHex(block.subarray(1)),
        'token': cmac
      },
      { 'id': chrome.runtime.id },
      function(reply) {
        cb(reply.rc);
      });
};


/**
 * Read a certificate slot.
 *
 * @param {number} which slot to read.
 * @param {Function} cb callback.
 */
SshAgent.prototype.certRead = function(which, cb) {
  this.handler_(
      {
        'type': 'SSH_CERT_READ',
        'which': which | 0
      },
      { 'id': chrome.runtime.id },
      function(reply) {
        if (reply.rc === 0) {
          cb(0, UTIL_HexToArray(reply.cert));
        } else {
          cb(reply.rc);
        }
      });
};


/**
 * Write certificate slot.
 *
 * @param {number} which slot to write.
 * @param {boolean} promote whether to switch to alternate key.
 * @param {Array<number>} cert data to write.
 * @param {Function} cb callback.
 */
SshAgent.prototype.certWrite = function(which, promote, cert, cb) {
  this.handler_(
      {
        'type': 'SSH_CERT_WRITE',
        'which': which | 0,
        'promote': (promote == true),
        'cert': UTIL_BytesToHex(cert)
      },
      { 'id': chrome.runtime.id },
      function(reply) {
        cb(reply.rc);
      });
};


/**
 * End a gnubbyd session.
 *
 * @param {Function} cb callback.
 * @param {?boolean} opt_reset to reset the gnubby upon release.
 */
SshAgent.prototype.releaseSSH = function(cb, opt_reset) {
  var sessionId = this.ecr_session_;
  if (sessionId) {
    this.ecr_token_ = null;
    this.ecr_session_ = null;
    var req = {
          'type': 'SSH_RELEASE',
          'sessionId': sessionId
        };
    if (opt_reset) req.reset = true;
    this.handler_(
        req,
        { 'id': chrome.runtime.id },
        function(reply) {
          cb(reply.rc);
        });
  } else {
    cb(0);
  }
};


/**
 * Analyzes callback response code and decides what the next step should be.
 *
 * @param {number} rc
 * @param {Object} arg1
 * @param {Object} arg2
 * @param {function(number, Object, Object)} onSuccess
 * @this {Object} state bound to.
 */
SshAgent.unboundInterpretResponse = function(rc, arg1, arg2, onSuccess) {
  if (this.cancelled) return;  // Done already
  switch (rc) {
    case 0: {
      this.ui.cancel();
      onSuccess(rc, arg1, arg2);  // Whee!
    } break;
    case 0x6985: {  // Touch
      this.onTouchRequired();
    } break;
    case 0x63c0: {
      this.onFailure('(security key locked out :-()');
    } break;
    case 0x63c1:
    case 0x63c2:
    case 0x63c3:
    case 0x63c4:
    case 0x63c5:
    case 0x63c6:
    case 0x63c7:
    case 0x63c8:
    case 0x63c9:
    case 0x63ca: {  // PIN
      var nLeft = rc - 0x63c0;
      if (this.showTriesLeft) {
        var msg = '(wrong security key password!, ' + nLeft + ' tries left!)';
        this.ui.showMessage(msg, 2500);
        var self = this;
        window.setTimeout(function() { self.onPINRequired(); }, 2500);
      } else {
        this.showTriesLeft = true;
        this.onPINRequired();
      }
    } break;
    case -0x60: case -0x61: case -0x62: case -0x63:
    case -0x64: case -0x65: case -0x66: case -0x67:
    case -0x68: case -0x69: case -0x6a: case -0x6b:
    case -0x6c: case -0x6d: case -0x6e: case -0x6f:
    case -0x70: case -0x71: case -0x72: case -0x73:
    case -0x74: case -0x75: case -0x76: case -0x77:
    case -0x78: case -0x79: case -0x7a: case -0x7b:
    case -0x7c: case -0x7d: case -0x7e: case -0x7f: {
      // Bad stuff. Cardlet / NXP chip wedged.
      // Reset it, before reporting error so a retry might work.
      this.onFailure('(wedged :/ Try again, reload?)', true);
    } break;
    default: {
      // TODO(mschilder) tolerate some number of BUSY?
      this.onFailure();
    } break;
  }
};

/**
 * Handles the case of a failure.
 * @param {SshAgent} agent to work with.
 * @param {Function} cb A callback to call when the connection is closed.
 * @param {string} msg The message to display to the user.
 * @param {boolean=} opt_reset Whether to reset the connection.
 * @this {Object} state bound to.
 */
SshAgent.unboundFailure = function(agent, cb, msg, opt_reset) {
  msg = msg || '(failed)';

  this.cancelled = true;
  this.ui.cancel();
  this.ui.showMessage(msg, 600);

  agent.releaseSSH(
      function() { SshAgent.sendGenericFailure(cb); },
      opt_reset);
};

/**
 * @param {string} msg The message to display to the user.
 * @this {Object} state bound to.
 */
SshAgent.unboundTouchDialog = function(msg) {
  var self = this;
  this.ui.showMessage(msg,
      null,
      function() { self.onFailure('(escape!)'); }
  );

  // Wait a bit and try again.
  window.setTimeout(
    function() {
      if (!self.cancelled) {
        self.request(function(rc, arg1, arg2) {
            self.interpretResponse(rc, arg1, arg2, self.onSuccess);
          });
      }
    },
    250);
};


/**
 * @param {SshAgent} agent to work with.
 * @param {string} msg The message to display to the user.
 * @param {?number} opt_duration The amount of time to wait to
 *     get the PIN.
 * @this {Object} state bound to.
 */
SshAgent.unboundPINDialog = function(agent, msg, opt_duration) {
  var self = this;
  this.ui.getPIN(msg,
      function() {
        var pin = this.input.slice();

        if (pin.length != 6) {
          // User provided password; hash it down.
          var sha = new SHA256();
          sha.update(pin);
          UTIL_clear(pin);
          var digest = sha.digest();
          pin = digest.slice(0, 6);
          UTIL_clear(digest);
        }

        // Fetch current ecdh to encrypt PIN with.
        // Note: small race here that might result in a wrong PIN attempt,
        //       if other tab sent successful unlock in parallel right now,
        //       which causes the ecdh point to change.
        agent.getSSH(0, false, function(rc, pk, ecdh) {
          if (rc == 0) {
            agent.unlockSSH(ecdh, pin,
              function(rc, arg1, arg2) {
                UTIL_clear(pin);

                self.interpretResponse(rc, arg1, arg2, function() {
                    self.request(function(rc, arg1, arg2) {
                        self.interpretResponse(rc, arg1, arg2, self.onSuccess);
                      });
                  });
              },
              opt_duration);
          } else {
            self.onFailure('(failed to get ecdh. Reload?)');
          }
        });
      },
      function() { self.onFailure('(escape!)'); }
  );
};


/**
 * Handles gnubby capability inquiry.
 * @param {SshBlob} req The inquiry request.
 * @param {Function} cb Callback.
 */
function handleGnubbyRequestCommand(req, cb) {
  var manifest = {};

  if (chrome.runtime && chrome.runtime.getManifest)
      manifest = chrome.runtime.getManifest();

  var rsp = new SshBlob();

  rsp.appendByte(SSH2_AGENT_SUCCESS);
  rsp.appendSize(1000);  // (1000+ == gnubbyd)
  rsp.appendString(manifest.name || 'test');  // sysname
  rsp.appendString('');  // nodename
  rsp.appendString('');  // release
  rsp.appendString(manifest.version || 'test');  // version
  rsp.appendString(window.navigator.userAgent);  // machine
  SshAgent.sendSshBlob(cb, rsp);
}

/**
 * Handles a gnubby sign command.
 * @param {UsbHelper} helper Helper to use to sign the sign request.
 * @param {SshBlob} req The gnubby sign request.
 * @param {Function} cb Callback.
 */
function handleGnubbySignCommand(helper, req, cb) {
  var timeoutSeconds = req.readByte();
  var n = req.readSize();
  var signData = [];
  for (var i = 0; i < n; ++i) {
    var b = req.readSshBlob();
    var version = b.readString();
    var challengeHash = b.readByteString();
    var originHash = b.readByteString();
    var keyHandle = b.readByteString();
    signData.push({
        'version': version,
        'appIdHash': B64_encode(originHash),
        'challengeHash': B64_encode(challengeHash),
        'keyHandle': B64_encode(keyHandle)
    });
  }
  var signRequest = {
    'type': 'sign_helper_request',
    'timeout': timeoutSeconds,
    'timeoutSeconds': timeoutSeconds,
    'signData': signData
  };

  function handlerResponse(response) {
    var rsp = new SshBlob();
    if (response.code == 0) {
      // {
      // code: 0
      // responseData: {
      //   version
      //   appIdHash, challengeHash, keyHandle, signatureData
      //   }
      // }
      rsp.appendByte(SSH2_AGENT_GNUBBY_SIGN_RESPONSE);
      rsp.appendSize(response.code);
      var tmp = new SshBlob();
      if (response.responseData.version) {
        tmp.appendString(response.responseData.version);
      } else {
        tmp.appendSize(0);
      }
      tmp.appendByteString(
          B64_decode(response.responseData.challengeHash));
      tmp.appendByteString(B64_decode(response.responseData.appIdHash));
      tmp.appendByteString(B64_decode(response.responseData.keyHandle));
      tmp.appendByteString(
          B64_decode(response.responseData.signatureData));
      rsp.appendSshBlob(tmp);
    } else {
      var code = response.code || SSH2_AGENT_FAILURE;
      rsp.appendByte(SSH2_AGENT_GNUBBY_SIGN_RESPONSE);
      rsp.appendSize(code);
    }
    SshAgent.sendSshBlob(cb, rsp);
  }

  var handler = helper.getHandler(signRequest);
  if (!handler || !handler.run(handlerResponse)) {
    SshAgent.sendGenericFailure(cb);
  }
}

/**
 * Handles a gnubby quote-and-sign command.
 * @param {SshBlob} request The gnubby quote-and-sign request.
 * @param {Function} sendResponse Callback.
 */
function handleGnubbyQuoteAndSignCommand(request, sendResponse) {
  var pk = request.readSshBlob();
  var dataBlob = request.readSshBlob();
  var flags = request.readSize();

  var keyIdentity = sshAgent.getIdentity(pk);
  if (keyIdentity == -1) {
    console.log(UTIL_fmt('Given public key not found on gnubby.'));
    SshAgent.sendGenericFailure(sendResponse);
    return;
  }

  var quoteMetadata = dataBlob.readSshBlob();
  var dataToSign = dataBlob.readString();

  var state = {
    'ui': new SshAgentUI()
  };

  var metadataType = quoteMetadata.readByte();
  if (metadataType == GNUBBY_QUOTE_USER_AND_PURPOSE) {
    var username = quoteMetadata.readString();
    var purpose = quoteMetadata.readString();
    var slotType = SshAgent.slotNames[keyIdentity] || '(unknown)';
    console.log(UTIL_fmt('username: ' + username));
    console.log(UTIL_fmt('purpose: ' + purpose));
    state.onTouchRequired = SshAgent.unboundTouchDialog.bind(
        state, 'Touch for ' + purpose + ' with key ' + slotType +
        '  as ' + username);
    state.onPINRequired = SshAgent.unboundPINDialog.bind(
        state, sshAgent,
        'Approval for ' + purpose + ' needs Security Key password');
  } else {
    // TODO(przydatek): add metadataType for certificate requests
    console.log(UTIL_fmt('Metadata type ' + metadataType + ' not supported.'));
    SshAgent.sendGenericFailure(sendResponse);
    return;
  }

  var fullBlobToSign = new SshBlob();
  fullBlobToSign.appendString(SshAgent.GNUBBY_QUOTE_REQUEST_PREFIX);
  fullBlobToSign.appendSshBlob(quoteMetadata);
  fullBlobToSign.appendString(dataToSign);

  state.request = sshAgent.signSSH.bind(sshAgent, keyIdentity,
                                        fullBlobToSign.data());
  state.interpretResponse = SshAgent.unboundInterpretResponse.bind(state);
  state.onSuccess = function(rc, pk, sig) {
    var rsp = new SshBlob();
    rsp.appendByte(SSH2_AGENT_GNUBBY_QUOTE_RESPONSE);
    rsp.appendSshBlob(sig);
    SshAgent.sendSshBlob(sendResponse, rsp);
  };

  state.onFailure = SshAgent.unboundFailure.bind(
      state, sshAgent, sendResponse);

  state.request(function(rc, arg1, arg2) {
    state.interpretResponse(rc, arg1, arg2, state.onSuccess);
  });
}

/**
 * Releases a gnubby with the SSH applet selected.
 * @param {Gnubby} g The gnubby.
 * @param {function()|undefined} opt_cb Callback when the gnubby is release.
 */
function releaseGnubby(g, opt_cb) {
  g.unlock(function(rcIgnored) {
    g.close();
    if (opt_cb) opt_cb();
  });
}

function callOnSshApplet(g, which, f) {
  function fail(rc) {
    console.warn(UTIL_fmt('rc: ' + rc));
    releaseGnubby(g, f.bind(null, rc));
  }

  var defaultLockTime = 5;

  g.open(which, GnubbyEnumerationTypes.VID_PID, function(rc) {
    if (rc != 0) { fail(rc); return; }
    g.sync(function(rc) {
      if (rc != 0) { fail(rc); return; }
      var lockTime = new Uint8Array([defaultLockTime]);
      g.lock(lockTime.buffer, function(rc) {
        if (rc != 0) { fail(rc); return; }
        g.selectSSH(function(rc, data) {
          if (rc != 0) { fail(rc); return; }
          f(rc);
        });
      });
    });
  }, 'ssh-agent.js:callOnSshApplet');
}

/**
 * @param {Function} sendResponse callback.
 */
function handleGetVersionCommand(sendResponse) {
  var outer = new SshBlob();
  var nDone = 0;

  function gotSshApplet(gnubby, i, indexes, rc) {
    function failed(rc) {
      console.warn(UTIL_fmt('rc: ' + rc));
      gnubby.unlock(function(rcIgnored) {
        gnubby.close();
        if (++nDone == indexes.length) {
          SshAgent.sendGenericFailure(sendResponse);
        }
      });
    }

    if (rc) { failed(rc); return; }

    gnubby.sshSysInfo(function(rc, info) {
      if (rc) { failed(rc); return; }

      var u8 = new Uint8Array(info);
      var sshMajor = u8[0];
      var sshMinor = u8[1];
      var sshBuild = u8[2];

      gnubby.unlock(function(rcIgnored) {
        // Unlock switches applet back to main.
        gnubby.appletVersion(function(rc, info) {
          if (rc) { failed(rc); return; }

          u8 = new Uint8Array(info);
          var major = u8[0];
          var minor = u8[1];
          var build = u8[2];

          var versionBlob = new SshBlob();
          versionBlob.appendByte(major);
          versionBlob.appendByte(minor);
          versionBlob.appendByte(build);
          var sshVersionBlob = new SshBlob();
          sshVersionBlob.appendByte(sshMajor);
          sshVersionBlob.appendByte(sshMinor);
          sshVersionBlob.appendByte(sshBuild);
          var pair = new SshBlob();
          pair.appendSshBlob(versionBlob);
          pair.appendSshBlob(sshVersionBlob);
          outer.appendSshBlob(pair);

          if (++nDone == indexes.length) {
            var rsp = new SshBlob();
            rsp.appendByte(SSH2_AGENT_GNUBBY_GET_VERSION_ANSWER);
            rsp.appendSshBlob(outer);
            SshAgent.sendSshBlob(sendResponse, rsp);
          }
          releaseGnubby(gnubby);
        });
      });
    });
  }

  gnubbies.enumerate(function(rc, indexes) {
    if (rc || !indexes.length) {
      SshAgent.sendGenericFailure(sendResponse);
    } else {
      for (var i = 0; i < indexes.length; i++) {
        (function(gnubby, i, indexes) {
          callOnSshApplet.call(null, gnubby, indexes[i],
              gotSshApplet.bind(null, gnubby, i, indexes));
        })(new Gnubby(), i, indexes);
      }
    }
  }, GnubbyEnumerationTypes.VID_PID);
}

/**
 * @param {Function} sendResponse callback.
 */
function handleSshRequestIdentities(sendResponse) {
  sshAgent.requestIdentities(sendResponse);
}

/**
 * @param {Array<number>} dataToSign data to be checked for prefix.
 * @return {boolean} true if dataToSign starts with SshBlob-String
 *                   equal to SshAgent.GNUBBY_QUOTE_REQUEST_PREFIX.
 */
function hasQuoteRequestPrefix(dataToSign) {
  var prefix = new SshBlob();
  prefix.appendString(SshAgent.GNUBBY_QUOTE_REQUEST_PREFIX);
  var hasPrefix = (prefix.data().length <= dataToSign.length);
  var i = 0;
  while (hasPrefix && i < prefix.data().length) {
    if (prefix.data()[i] != dataToSign[i]) {
      hasPrefix = false;
    }
    i++;
  }
  return hasPrefix;
}

/**
 * @param {SshBlob} request to sign.
 * @param {Function} sendResponse callback.
 */
function handleSshSignRequest(request, sendResponse) {
  var pk = request.readSshBlob();
  var challenge = request.readSshBlob();
  var flags = request.readSize();
  var sessSize = challenge.readSize();
  var session = challenge.readBytes(sessSize);
  var cmd = challenge.readByte();
  var username = challenge.readString();
  var what = challenge.readString();

  console.log(UTIL_fmt('username: ' + username));
  console.log(UTIL_fmt('what: ' + what));

  var datatosign = challenge.data();

  // Reject regular siging requests if datatosign starts with the prefix
  // (i.e. the prefix is allowed for quote-signatures only).
  if (hasQuoteRequestPrefix(datatosign)) {
    console.log(UTIL_fmt(
        'Signing data equal to GNUBBY_QUOTE_REQUEST_PREFIX is forbidden.'));
    SshAgent.sendGenericFailure(sendResponse);
    return;
  }

  var which = sshAgent.getIdentity(pk);
  if (which == -1) {
    SshAgent.sendGenericFailure(sendResponse);
    return;
  }

  var state = {
    'ui': new SshAgentUI()
  };

  state.request = sshAgent.signSSH.bind(sshAgent, which, datatosign);

  state.interpretResponse = SshAgent.unboundInterpretResponse.bind(state);

  state.onSuccess = function(rc, pk, sig) {
    var rsp = new SshBlob();
    rsp.appendByte(SSH2_AGENT_SIGN_RESPONSE);
    rsp.appendSshBlob(sig);
    SshAgent.sendSshBlob(sendResponse, rsp);
  };

  state.onFailure = SshAgent.unboundFailure.bind(
      state, sshAgent, sendResponse);

  var slotType = SshAgent.slotNames[which] || '(unknown)';
  state.onTouchRequired = SshAgent.unboundTouchDialog.bind(
      state, 'Touch for ' + what + ' with key ' + slotType + ' as ' + username);

  state.onPINRequired = SshAgent.unboundPINDialog.bind(
      state, sshAgent, 'SSH needs Security Key password');

  state.request(function(rc, arg1, arg2) {
    state.interpretResponse(rc, arg1, arg2, state.onSuccess);
  });
}

/**
 * @param {SshBlob} request to decrypt.
 * @param {Function} sendResponse callback.
 */
function handleE2eDecrypt(request, sendResponse) {
  var meta = request.readBytes(request.readSize());
  var pk = request.readSshBlob();
  var fp = request.readSshBlob();
  var input = request.readSshBlob();

  var which = sshAgent.getIdentity(pk);
  if (which == -1 || meta.length < 3 || which != meta[2]) {
    console.warn(UTIL_fmt('identity not found'));
    SshAgent.sendGenericFailure(sendResponse);
    return;
  }

  // TODO: whitelist check fp?

  var state = {
    'ui': new SshAgentUI()
  };

  state.request = sshAgent.e2eDecrypt.bind(sshAgent, meta, fp.data(),
      input.data());

  state.interpretResponse = SshAgent.unboundInterpretResponse.bind(state);

  state.onSuccess = function(rc, answer) {
    sshAgent.releaseSSH(function() {
      var rsp = new SshBlob();
      rsp.appendByte(SSH2_AGENT_E2E_DECRYPT_RESPONSE);
      rsp.appendSshBlob(new SshBlob(answer));
      SshAgent.sendSshBlob(sendResponse, rsp);
    });
  };

  state.onFailure = SshAgent.unboundFailure.bind(
      state, sshAgent, sendResponse);

  var slotType = SshAgent.slotNames[which] || '(unknown)';
  state.onTouchRequired = SshAgent.unboundTouchDialog.bind(
      state, 'Touch for E2E decrypt using key ' + slotType);


  if (meta.length >= 3 && !(meta[0] & SSH2_KF_ALWAYS_AUTH)) {
    // Multi decrypt / touch.
    state.onPINRequired = SshAgent.unboundPINDialog.bind(
        state, sshAgent, 'E2E needs Security Key password');

    state.request(function(rc, arg1, arg2) {
      state.interpretResponse(rc, arg1, arg2, state.onSuccess);
    });
  } else {
    // Single decrypt / pin & touch.
    state.onPINRequired = SshAgent.unboundPINDialog.bind(
        state, sshAgent, 'E2E needs Security Key password', 60);

    state.onPINRequired();
  }
}


/**
 * @param {SshBlob} request parameters.
 * @param {Function} sendResponse callback.
 */
function handleSshPkChallenge(request, sendResponse) {
  var which = request.readByte();
  var alternate = request.readByte();
  var size = request.readSize();
  if (size != 16) throw 'challenge needs to be 128 bit';
  var challenge = request.readBytes(size);

  sshAgent.getSSH(which, alternate != 0,
      function(rc, pk, ecdh, pkStr, chal, dk, fp, sig, meta) {
        var rsp = new SshBlob();
        rsp.appendByte(SSH2_AGENT_PK_RESPONSE);
        if (rc === 0) {
          rsp.appendSize(1);
          rsp.appendSize(chal.length);
          rsp.appendBytes(chal);
          rsp.appendSshBlob(pk);

          // Construct ecdh point in ssh2 format.
          var b = new SshBlob();
          b.appendString('ecdh-nistp256');
          b.appendString('nistp256');
          b.appendSize(ecdh.length);
          b.appendBytes(ecdh);
          rsp.appendSshBlob(b);

          // Construct device pk in ssh2 format.
          b.clear();
          b.appendString('ecdsa-sha2-nistp256');
          b.appendString('nistp256');
          b.appendSize(dk.length);
          b.appendBytes(dk);
          rsp.appendSshBlob(b);

          // Construct device cert fingerprint record.
          b.clear();
          b.appendString('sha2');
          b.appendSize(fp.length);
          b.appendBytes(fp);
          rsp.appendSshBlob(b);

          // Append signature blob.
          rsp.appendSshBlob(sig);

          // Append meta array, if present.
          if (meta) {
            rsp.appendSize(meta.length);
            rsp.appendBytes(meta);
          }
        } else {
          rsp.appendSize(0);
        }
        SshAgent.sendSshBlob(sendResponse, rsp);
      },
      challenge);
}


/**
 * @param {SshBlob} request parameters.
 * @param {Function} sendResponse callback.
 */
function handleSshCertRead(request, sendResponse) {
  var which = request.readByte();
  sshAgent.certRead(which, function(rc, cert) {
    var rsp = new SshBlob();
    if (rc === 0) {
      rsp.appendByte(SSH2_AGENT_CERT_READ_ANSWER);
      rsp.appendSize(cert.length);
      rsp.appendBytes(cert);
    } else {
      rsp.appendByte(SSH2_AGENT_FAILURE);
    }
    SshAgent.sendSshBlob(sendResponse, rsp);
  });
}


/**
 * @param {SshBlob} request parameters.
 * @param {Function} sendResponse callback.
 */
function handleSshCertWrite(request, sendResponse) {
  var which = request.readByte();
  var promote = request.readByte();
  var cert = request.readSshBlob();
  sshAgent.certWrite(which, promote != 0, cert.data(), function(rc) {
    var rsp = new SshBlob();
    if (rc === 0) {
      rsp.appendByte(SSH2_AGENT_SUCCESS);
    } else {
      rsp.appendByte(SSH2_AGENT_FAILURE);
    }
    SshAgent.sendSshBlob(sendResponse, rsp);
  });
}


/**
 * @param {SshBlob} request to sign.
 * @param {Function} sendResponse callback.
 */
function handleSshEcredsWrite(request, sendResponse) {
  var accu = request.readSshBlob();
  var blockno = 0;

  var state = {
    'ui': new SshAgentUI()
  };

  state.request = sshAgent.writeECred.bind(sshAgent, blockno, accu.data());

  state.interpretResponse = SshAgent.unboundInterpretResponse.bind(state);

  state.onSuccess = function(rc, data) {
    ++blockno;
    state.ui.showMessage('ECredz wrote ' + blockno + 'K!');
    accu.crop(1024);

    if (blockno < 10) {
      state.request = sshAgent.writeECred.bind(sshAgent, blockno, accu.data());
      state.request(function(rc, arg1, arg2) {
        state.interpretResponse(rc, arg1, arg2, state.onSuccess);
      });
    } else {
      sshAgent.releaseSSH(function() {
        state.ui.cancel();
        var rsp = new SshBlob();
        rsp.appendByte(SSH2_AGENT_SUCCESS);
        SshAgent.sendSshBlob(sendResponse, rsp);
      });
    }
  };

  state.onFailure = SshAgent.unboundFailure.bind(
      state, sshAgent, sendResponse);

  state.onTouchRequired = SshAgent.unboundTouchDialog.bind(
      state, 'ECredz-Write needs touch ');

  state.onPINRequired = SshAgent.unboundPINDialog.bind(
      state, sshAgent, 'ECredz-Write needs Security Key password', 60);

  state.onPINRequired();
}


/**
 * @param {Function} sendResponse callback.
 */
function handleSshEcredsRead(sendResponse) {
  var accu = new SshBlob();
  var blockno = 0;

  var state = {
    'ui': new SshAgentUI()
  };

  state.request = sshAgent.readECred.bind(sshAgent, blockno);

  state.interpretResponse = SshAgent.unboundInterpretResponse.bind(state);

  state.onSuccess = function(rc, data) {
    ++blockno;
    state.ui.showMessage('ECredz read ' + blockno + 'K!');
    accu.appendBytes(data);

    if (blockno < 10) {
      state.request = sshAgent.readECred.bind(sshAgent, blockno);
      state.request(function(rc, arg1, arg2) {
        state.interpretResponse(rc, arg1, arg2, state.onSuccess);
      });
    } else {
      var rsp = new SshBlob();
      rsp.appendByte(SSH2_AGENT_ECREDS_READ_ANSWER);
      rsp.appendSshBlob(accu);
      sshAgent.releaseSSH(function() {
        state.ui.cancel();
        SshAgent.sendSshBlob(sendResponse, rsp);
      });
    }
  };

  state.onFailure = SshAgent.unboundFailure.bind(
      state, sshAgent, sendResponse);

  state.onTouchRequired = SshAgent.unboundTouchDialog.bind(
      state, 'ECredz-Read needs touch ');

  state.onPINRequired = SshAgent.unboundPINDialog.bind(
      state, sshAgent, 'ECredz-Read needs Security Key password', 60);

  state.onPINRequired();
}


/**
 * @param {SshBlob} request to process.
 * @param {Function} sendResponse callback.
 */
function handleSshGetEmergency(request, sendResponse) {
  var current = sshAgent.getEmergency();
  var rsp = new SshBlob();
  rsp.appendByte(SSH2_AGENT_GET_EMERGENCY_REPLY);
  rsp.appendByte(current ? 1 : 0);
  SshAgent.sendSshBlob(sendResponse, rsp);
}


/**
 * @param {SshBlob} request to process.
 * @param {Function} sendResponse callback.
 */
function handleSshSetEmergency(request, sendResponse) {
  var panic = !!request.readByte();
  var current = sshAgent.getEmergency();
  if (panic && !current) {
    new SshAgentUI().showMessage('Switching to emergency mode!', 2000);
  }
  sshAgent.setEmergency(panic);
  var rsp = new SshBlob();
  rsp.appendByte(SSH2_AGENT_SUCCESS);
  SshAgent.sendSshBlob(sendResponse, rsp);
}


/**
 * @param {HelperRequest} request The request to handle.
 * @param {UsbHelper} helper The USB helper to use for lower-level requests.
 * @constructor
 * @implements {RequestHandler}
 */
function SshAgentHandler(request, helper) {
  /** @private {HelperRequest} */
  this.request_ = request;
  /** @private {UsbHelper} */
  this.helper_ = helper;
}


/** No-op close command. */
SshAgentHandler.prototype.close = function() {
};


/**
 * @param {RequestHandlerCallback} cb Called with the result of the request.
 * @return {boolean} Whether the handler could be run.
 */
SshAgentHandler.prototype.run = function(cb) {
  var req = new SshBlob(this.request_.data);
  try {

  var cmd = req.readByte();

  switch (cmd) {
    case SSH2_AGENTC_REQUEST_GNUBBY: {
      handleGnubbyRequestCommand(req, cb);
    } break;

    case SSH2_AGENTC_GNUBBY_SIGN_REQUEST: {
      handleGnubbySignCommand(this.helper_, req, cb);
    } break;

    case SSH2_AGENTC_GNUBBY_QUOTE_REQUEST: {
      handleGnubbyQuoteAndSignCommand(req, cb);
    } break;

    case SSH2_AGENTC_GNUBBY_GET_VERSION: {
      handleGetVersionCommand(cb);
    } break;

    case SSH2_AGENTC_REQUEST_IDENTITIES: {
      handleSshRequestIdentities(cb);
    } break;

    case SSH2_AGENTC_SIGN_REQUEST: {
      handleSshSignRequest(req, cb);
    } break;

    case SSH2_AGENTC_CERT_READ: {
      handleSshCertRead(req, cb);
    } break;

    case SSH2_AGENTC_CERT_WRITE: {
      handleSshCertWrite(req, cb);
    } break;

    case SSH2_AGENTC_PK_CHALLENGE: {
      handleSshPkChallenge(req, cb);
    } break;

    case SSH2_AGENTC_ECREDS_READ: {
      handleSshEcredsRead(cb);
      break;
    }

    case SSH2_AGENTC_ECREDS_WRITE: {
      handleSshEcredsWrite(req, cb);
      break;
    }

    case SSH2_AGENT_SET_EMERGENCY: {
      handleSshSetEmergency(req, cb);
    } break;

    case SSH2_AGENT_GET_EMERGENCY: {
      handleSshGetEmergency(req, cb);
    } break;

    case SSH2_AGENTC_E2E_DECRYPT_REQUEST: {
      handleE2eDecrypt(req, cb);
    } break;

    default: {
      throw 'unknown cmd: ' + cmd;
    } break;
  }

  } catch (err) {
    console.log(UTIL_fmt('catch: ' + err));
    console.log(err);
    SshAgent.sendGenericFailure(cb);
  }
  return true;
};


/**
 * Registers the SSH agent message handler with the provided helper.
 * @param {UsbHelper} helper The helper to register with.
 */
function initSshAgent(helper) {
  // Create singleton agent if it does not exist yet.
  if (!sshAgent) sshAgent = new SshAgent(messageHandler);
  helper.registerHandlerFactory('auth-agent@openssh.com', function(request) {
    return new SshAgentHandler(request, helper);
  });
}


function handleSshAgentCommand(request, sender, sendResponse) {
  function sendResponseOnce(response) {
    if (sendResponse) {
      sendResponse(response);
      sendResponse = null;
    }
  }

  var handler = requestHelper.getHandler(request);
  if (!handler || !handler.run(sendResponseOnce)) {
    SshAgent.sendGenericFailure(sendResponseOnce);
  }
}


/**
 * @param {Object} port request was received on.
 * @param {Object} request to handle first.
 */
function handleSshAgentConnect(port, request) {
  var onMessage = function(request) {
    console.log(UTIL_fmt('request'));
    console.log(request);
    handleSshAgentCommand(request, port.sender,
        function(response) {
          port.postMessage(response);
        });
  };

  var onDisconnect = function() {
    port.onMessage.removeListener(onMessage);
    port.onDisconnect.removeListener(onDisconnect);
    // TODO(mschilder): wire up to cancel handler somehow.
  };

  port.onMessage.addListener(onMessage);
  port.onDisconnect.addListener(onDisconnect);

  // Start work on initial message.
  onMessage(request);
}
