/**
 * @fileoverview Provides a client view of a gnubby, aka USB security key.
 * @author mschilder@google.com
 */
'use strict';

/**
 * Creates a Gnubby client. There may be more than one simultaneous Gnubby
 * client of a physical device. This client manages multiplexing access to the
 * low-level device to maintain the illusion that it is the only client of the
 * device.
 * @constructor
 * @param {number=} opt_busySeconds to retry an exchange upon a BUSY result.
 */
function Gnubby(opt_busySeconds) {
  this.dev = null;
  this.gnubbyInstance = ++Gnubby.gnubbyId_;
  this.cid = Gnubby.BROADCAST_CID;
  this.rxframes = [];
  this.synccnt = 0;
  this.rxcb = null;
  this.closed = false;
  this.commandPending = false;
  this.notifyOnClose = [];
  this.busyMillis = (opt_busySeconds ? opt_busySeconds * 1000 : 9500);
}

/**
 * Global Gnubby instance counter.
 * @private {number}
 */
Gnubby.gnubbyId_ = 0;

/**
 * Sets Gnubby's Gnubbies singleton.
 * @param {Gnubbies} gnubbies Gnubbies singleton instance
 */
Gnubby.setGnubbies = function(gnubbies) {
  /** @private {Gnubbies} */
  Gnubby.gnubbies_ = gnubbies;
};

/**
 * Return cid as hex string.
 * @param {number} cid to convert.
 * @return {string} hexadecimal string.
 */
Gnubby.hexCid = function(cid) {
  var tmp = [(cid >>> 24) & 255,
             (cid >>> 16) & 255,
             (cid >>> 8) & 255,
             (cid >>> 0) & 255];
  return UTIL_BytesToHex(tmp);
};

/**
 * Cancels open attempt for this gnubby, if available.
 */
Gnubby.prototype.cancelOpen = function() {
  if (this.which)
    Gnubby.gnubbies_.cancelAddClient(this.which);
};

/**
 * Opens the gnubby with the given index, or the first found gnubby if no
 * index is specified.
 * @param {GnubbyDeviceId} which The device to open. If null, the first
 *     gnubby found is opened.
 * @param {GnubbyEnumerationTypes=} opt_type Which type of device to enumerate.
 * @param {function(number)|undefined} opt_cb Called with result of opening the
 *     gnubby.
 * @param {string=} opt_caller Identifier for the caller.
 */
Gnubby.prototype.open = function(which, opt_type, opt_cb, opt_caller) {
  var cb = opt_cb ? opt_cb : Gnubby.defaultCallback;
  if (this.closed) {
    cb(-GnubbyDevice.NODEVICE);
    return;
  }
  this.closingWhenIdle = false;
  if (opt_caller) {
    this.caller_ = opt_caller;
  }

  var self = this;

  function setCid(which) {
    // Set a default channel ID, in case the caller never sets a better one.
    self.cid = Gnubby.defaultChannelId_(self.gnubbyInstance, which);
  }

  var enumerateRetriesRemaining = 3;
  function enumerated(rc, devs) {
    if (!devs.length)
      rc = -GnubbyDevice.NODEVICE;
    if (rc) {
      cb(rc);
      return;
    }
    which = devs[0];
    setCid(which);
    self.which = which;
    Gnubby.gnubbies_.addClient(which, self, function(rc, device) {
      if (rc == -GnubbyDevice.NODEVICE && enumerateRetriesRemaining-- > 0) {
        // We were trying to open the first device, but now it's not there?
        // Do over.
        Gnubby.gnubbies_.enumerate(enumerated, opt_type);
        return;
      }
      self.dev = device;
      if (self.closeHook_) {
        self.dev.setDestroyHook(self.closeHook_);
      }
      cb(rc);
    });
  }

  if (which) {
    setCid(which);
    self.which = which;
    Gnubby.gnubbies_.addClient(which, self, function(rc, device) {
      if (!rc) {
        self.dev = device;
        if (self.closeHook_) {
          self.dev.setDestroyHook(self.closeHook_);
        }
      }
      cb(rc);
    });
  } else {
    Gnubby.gnubbies_.enumerate(enumerated, opt_type);
  }
};

/**
 * Generates a default channel id value for a gnubby instance that won't
 * collide within this application, but may when others simultaneously access
 * the device.
 * @param {number} gnubbyInstance An instance identifier for a gnubby.
 * @param {GnubbyDeviceId} which The device identifer for the gnubby device.
 * @return {number} The channel id.
 * @private
 */
Gnubby.defaultChannelId_ = function(gnubbyInstance, which) {
  var cid = (gnubbyInstance) & 0x00ffffff;
  cid |= ((which.device + 1) << 24);  // For debugging.
  return cid;
};

/**
 * @return {boolean} Whether this gnubby has any command outstanding.
 * @private
 */
Gnubby.prototype.inUse_ = function() {
  return this.commandPending;
};

/** Closes this gnubby. */
Gnubby.prototype.close = function() {
  this.closed = true;

  if (this.dev) {
    console.log(UTIL_fmt('Gnubby.close()'));
    this.rxframes = [];
    this.rxcb = null;
    var dev = this.dev;
    this.dev = null;
    var self = this;
    // Wait a bit in case simpleton client tries open next gnubby.
    // Without delay, gnubbies would drop all idle devices, before client
    // gets to the next one.
    window.setTimeout(
        function() {
          Gnubby.gnubbies_.removeClient(dev, self);
        }, 300);
  }
};

/**
 * Asks this gnubby to close when it gets a chance.
 * @param {Function=} cb called back when closed.
 */
Gnubby.prototype.closeWhenIdle = function(cb) {
  if (!this.inUse_()) {
    this.close();
    if (cb) cb();
    return;
  }
  this.closingWhenIdle = true;
  if (cb) this.notifyOnClose.push(cb);
};

/**
 * Sets a callback that will get called when this gnubby is closed.
 * @param {function() : (Promise|null)} cb Called back when closed. Callback
 *     may yield a promise that resolves when the close hook completes.
 */
Gnubby.prototype.setCloseHook = function(cb) {
  this.closeHook_ = /** @private {(function() : (Promise|null)|null)} */ (cb);
};

/**
 * Close and notify every caller that it is now closed.
 * @private
 */
Gnubby.prototype.idleClose_ = function() {
  this.close();
  while (this.notifyOnClose.length != 0) {
    var cb = this.notifyOnClose.shift();
    cb();
  }
};

/**
 * Notify callback for every frame received.
 * @param {function()} cb Callback
 * @private
 */
Gnubby.prototype.notifyFrame_ = function(cb) {
  if (this.rxframes.length != 0) {
    // Already have frames; continue.
    if (cb) window.setTimeout(cb, 0);
  } else {
    this.rxcb = cb;
  }
};

/**
 * Called by low level driver with a frame.
 * @param {ArrayBuffer|Uint8Array} frame Data frame
 * @return {boolean} Whether this client is still interested in receiving
 *     frames from its device.
 */
Gnubby.prototype.receivedFrame = function(frame) {
  if (this.closed) return false;  // No longer interested.

  if (!this.checkCID_(frame)) {
    // Not for me, ignore.
    return true;
  }

  this.rxframes.push(frame);

  // Callback self in case we were waiting. Once.
  var cb = this.rxcb;
  this.rxcb = null;
  if (cb) window.setTimeout(cb, 0);

  return true;
};

/**
 * @return {number|undefined} The last read error seen by this device.
 */
Gnubby.prototype.getLastReadError = function() {
  return this.lastReadError_;
};

/**
 * @return {ArrayBuffer|Uint8Array} oldest received frame. Throw if none.
 * @private
 */
Gnubby.prototype.readFrame_ = function() {
  if (this.rxframes.length == 0) throw 'rxframes empty!';

  var frame = this.rxframes.shift();
  return frame;
};

/** Poll from rxframes[].
 * @param {number} cmd Command
 * @param {number} timeout timeout in seconds.
 * @param {?function(...)} cb Callback
 * @private
 */
Gnubby.prototype.read_ = function(cmd, timeout, cb) {
  if (this.closed) { cb(-GnubbyDevice.GONE); return; }
  if (!this.dev) { cb(-GnubbyDevice.GONE); return; }

  var tid = null;  // timeout timer id.
  var callback = cb;
  var self = this;

  var msg = null;
  var seqno = 0;
  var count = 0;

  /**
   * Schedule call to cb if not called yet.
   * @param {number} a Return code.
   * @param {Object=} b Optional data.
   */
  function schedule_cb(a, b) {
    self.commandPending = false;
    if (tid) {
      // Cancel timeout timer.
      window.clearTimeout(tid);
      tid = null;
    }
    self.lastReadError_ = /** @private {number|undefined} */ (a);
    var c = callback;
    if (c) {
      callback = null;
      window.setTimeout(function() { c(a, b); }, 0);
    }
    if (self.closingWhenIdle) self.idleClose_();
  };

  function read_timeout() {
    if (!callback || !tid) return;  // Already done.

    console.error(UTIL_fmt(
        '[' + Gnubby.hexCid(self.cid) + '] timeout!'));

    if (self.dev) {
      self.dev.destroy();  // Stop pretending this thing works.
    }

    tid = null;

    schedule_cb(-GnubbyDevice.TIMEOUT);
  };

  function cont_frame() {
    if (!callback || !tid) return;  // Already done.

    var f = new Uint8Array(self.readFrame_());
    var rcmd = f[4];
    var totalLen = (f[5] << 8) + f[6];

    if (rcmd == GnubbyDevice.CMD_ERROR && totalLen == 1) {
      // Error from device; forward.
      console.log(UTIL_fmt(
          '[' + Gnubby.hexCid(self.cid) + '] error frame ' +
          UTIL_BytesToHex(f)));
      if (f[7] == GnubbyDevice.GONE) {
        self.closed = true;
      }
      schedule_cb(-f[7]);
      return;
    }

    if ((rcmd & 0x80)) {
      // Not an CONT frame, ignore.
      console.log(UTIL_fmt(
          '[' + Gnubby.hexCid(self.cid) + '] ignoring non-cont frame ' +
          UTIL_BytesToHex(f)));
      self.notifyFrame_(cont_frame);
      return;
    }

    var seq = (rcmd & 0x7f);
    if (seq != seqno++) {
      console.log(UTIL_fmt(
          '[' + Gnubby.hexCid(self.cid) + '] bad cont frame ' +
          UTIL_BytesToHex(f)));
      schedule_cb(-GnubbyDevice.INVALID_SEQ);
      return;
    }

    // Copy payload.
    for (var i = 5; i < f.length && count < msg.length; ++i) {
      msg[count++] = f[i];
    }

    if (count == msg.length) {
      // Done.
      schedule_cb(-GnubbyDevice.OK, msg.buffer);
    } else {
      // Need more CONT frame(s).
      self.notifyFrame_(cont_frame);
    }
  }

  function init_frame() {
    if (!callback || !tid) return;  // Already done.

    var f = new Uint8Array(self.readFrame_());

    var rcmd = f[4];
    var totalLen = (f[5] << 8) + f[6];

    if (rcmd == GnubbyDevice.CMD_ERROR && totalLen == 1) {
      // Error from device; forward.
      // Don't log busy frames, they're "normal".
      if (f[7] != GnubbyDevice.BUSY) {
        console.log(UTIL_fmt(
            '[' + Gnubby.hexCid(self.cid) + '] error frame ' +
            UTIL_BytesToHex(f)));
      }
      if (f[7] == GnubbyDevice.GONE) {
        self.closed = true;
      }
      schedule_cb(-f[7]);
      return;
    }

    if (!(rcmd & 0x80)) {
      // Not an init frame, ignore.
      console.log(UTIL_fmt(
          '[' + Gnubby.hexCid(self.cid) + '] ignoring non-init frame ' +
          UTIL_BytesToHex(f)));
      self.notifyFrame_(init_frame);
      return;
    }

    if (rcmd != cmd) {
      // Not expected ack, read more.
      console.log(UTIL_fmt(
          '[' + Gnubby.hexCid(self.cid) + '] ignoring non-ack frame ' +
          UTIL_BytesToHex(f)));
      self.notifyFrame_(init_frame);
      return;
    }

    // Copy payload.
    msg = new Uint8Array(totalLen);
    for (var i = 7; i < f.length && count < msg.length; ++i) {
      msg[count++] = f[i];
    }

    if (count == msg.length) {
      // Done.
      schedule_cb(-GnubbyDevice.OK, msg.buffer);
    } else {
      // Need more CONT frame(s).
      self.notifyFrame_(cont_frame);
    }
  }

  // Start timeout timer.
  tid = window.setTimeout(read_timeout, 1000.0 * timeout);

  // Schedule read of first frame.
  self.notifyFrame_(init_frame);
};

/**
  * @const
  */
Gnubby.NOTIFICATION_CID = 0;

/**
  * @const
  */
Gnubby.BROADCAST_CID = (0xff << 24) | (0xff << 16) | (0xff << 8) | 0xff;

/**
 * @param {ArrayBuffer|Uint8Array} frame Data frame
 * @return {boolean} Whether frame is for my channel.
 * @private
 */
Gnubby.prototype.checkCID_ = function(frame) {
  var f = new Uint8Array(frame);
  var c = (f[0] << 24) |
          (f[1] << 16) |
          (f[2] << 8) |
          (f[3]);
  return c === this.cid ||
         c === Gnubby.NOTIFICATION_CID;
};

/**
 * Queue command for sending.
 * @param {number} cmd The command to send.
 * @param {ArrayBuffer|Uint8Array} data Command data
 * @private
 */
Gnubby.prototype.write_ = function(cmd, data) {
  if (this.closed) return;
  if (!this.dev) return;

  this.commandPending = true;

  this.dev.queueCommand(this.cid, cmd, data);
};

/**
 * Writes the command, and calls back when the command's reply is received.
 * @param {number} cmd The command to send.
 * @param {ArrayBuffer|Uint8Array} data Command data
 * @param {number} timeout Timeout in seconds.
 * @param {function(number, ArrayBuffer=)} cb Callback
 * @private
 */
Gnubby.prototype.exchange_ = function(cmd, data, timeout, cb) {
  var busyWait = new CountdownTimer(Gnubby.SYS_TIMER_, this.busyMillis);
  var self = this;

  function retryBusy(rc, rc_data) {
    if (rc == -GnubbyDevice.BUSY && !busyWait.expired()) {
      if (Gnubby.gnubbies_) {
        Gnubby.gnubbies_.resetInactivityTimer(timeout * 1000);
      }
      self.write_(cmd, data);
      self.read_(cmd, timeout, retryBusy);
    } else {
      busyWait.clearTimeout();
      cb(rc, rc_data);
    }
  }

  retryBusy(-GnubbyDevice.BUSY, undefined);  // Start work.
};

/**
 * Private instance of timers based on window's timer functions.
 * @const
 * @private
 */
Gnubby.SYS_TIMER_ = new WindowTimer();

/** Default callback for commands. Simply logs to console.
 * @param {number} rc Result status code
 * @param {(ArrayBuffer|Uint8Array|Array<number>|null)} data Result data
 */
Gnubby.defaultCallback = function(rc, data) {
  var msg = 'defaultCallback(' + rc;
  if (data) {
    if (typeof data == 'string') msg += ', ' + data;
    else msg += ', ' + UTIL_BytesToHex(new Uint8Array(data));
  }
  msg += ')';
  console.log(UTIL_fmt(msg));
};

/**
 * Ensures this device has temporary ownership of the USB device, by:
 * 1. Using the INIT command to allocate an unique channel id, if one hasn't
 *    been retrieved before, or
 * 2. Sending a nonce to device, flushing read queue until match.
 * @param {?function(...)} cb Callback
 */
Gnubby.prototype.sync = function(cb) {
  if (!cb) cb = Gnubby.defaultCallback;
  if (this.closed) {
    cb(-GnubbyDevice.GONE);
    return;
  }

  var done = false;
  var trycount = 6;
  var tid = null;
  var self = this;

  function returnValue(rc) {
    done = true;
    window.setTimeout(cb.bind(null, rc), 0);
    if (self.closingWhenIdle) self.idleClose_();
  }

  function callback(rc, opt_frame) {
    self.commandPending = false;
    if (tid) {
      window.clearTimeout(tid);
      tid = null;
    }
    completionAction(rc, opt_frame);
  }

  function sendSyncSentinel() {
    var cmd = GnubbyDevice.CMD_SYNC;
    var data = new Uint8Array(1);
    data[0] = ++self.synccnt;
    self.dev.queueCommand(self.cid, cmd, data.buffer);
  }

  function syncSentinelEquals(f) {
    return (f[4] == GnubbyDevice.CMD_SYNC &&
        (f.length == 7 || /* fw pre-0.2.1 bug: does not echo sentinel */
         f[7] == self.synccnt));
  }

  function syncCompletionAction(rc, opt_frame) {
    if (rc) console.warn(UTIL_fmt('sync failed: ' + rc));
    returnValue(rc);
  }

  function sendInitSentinel() {
    var cid = self.cid;
    // If we do not have a specific CID yet, reset to BROADCAST for init.
    if (self.cid == Gnubby.defaultChannelId_(self.gnubbyInstance, self.which)) {
      self.cid = Gnubby.BROADCAST_CID;
      cid = self.cid;
    }
    var cmd = GnubbyDevice.CMD_INIT;
    self.dev.queueCommand(cid, cmd, nonce);
  }

  function initSentinelEquals(f) {
    return (f[4] == GnubbyDevice.CMD_INIT &&
        f.length >= nonce.length + 7 &&
        UTIL_equalArrays(f.subarray(7, nonce.length + 7), nonce));
  }

  function initCmdUnsupported(rc) {
    // Different firmwares fail differently on different inputs, so treat any
    // of the following errors as indicating the INIT command isn't supported.
    return rc == -GnubbyDevice.INVALID_CMD ||
        rc == -GnubbyDevice.INVALID_PAR ||
        rc == -GnubbyDevice.INVALID_LEN;
  }

  function initCompletionAction(rc, opt_frame) {
    // Actual failures: bail out.
    if (rc && !initCmdUnsupported(rc)) {
      console.warn(UTIL_fmt('init failed: ' + rc));
      returnValue(rc);
    }

    var HEADER_LENGTH = 7;
    var MIN_LENGTH = HEADER_LENGTH + 4;  // 4 bytes for the channel id
    if (rc || !opt_frame || opt_frame.length < nonce.length + MIN_LENGTH) {
      // INIT command not supported or is missing the returned channel id:
      // Pick a random cid to try to prevent collisions on the USB bus.
      var rnd = UTIL_getRandom(2);
      self.cid = Gnubby.defaultChannelId_(self.gnubbyInstance, self.which);
      self.cid ^= (rnd[0] << 16) | (rnd[1] << 8);
      // Now sync with that cid, to make sure we've got it.
      setSync();
      timeoutLoop();
      return;
    }
    // Accept the provided cid.
    var offs = HEADER_LENGTH + nonce.length;
    self.cid = (opt_frame[offs] << 24) |
               (opt_frame[offs + 1] << 16) |
               (opt_frame[offs + 2] << 8) |
               opt_frame[offs + 3];
    returnValue(rc);
  }

  function checkSentinel() {
    var f = new Uint8Array(self.readFrame_());

    // Stop on errors and return them.
    if (f[4] == GnubbyDevice.CMD_ERROR &&
        f[5] == 0 && f[6] == 1) {
      if (f[7] == GnubbyDevice.BUSY) {
        // Not spec but some devices do this; retry.
        sendSentinel();
        self.notifyFrame_(checkSentinel);
        return;
      }
      if (f[7] == GnubbyDevice.GONE) {
        // Device disappeared on us.
        self.closed = true;
      }
      callback(-f[7]);
      return;
    }

    // Eat everything else but expected sentinel reply.
    if (!sentinelEquals(f)) {
      // Read more.
      self.notifyFrame_(checkSentinel);
      return;
    }

    // Done.
    callback(-GnubbyDevice.OK, f);
  };

  function timeoutLoop() {
    if (done) return;

    if (trycount == 0) {
      // Failed.
      callback(-GnubbyDevice.TIMEOUT);
      return;
    }

    --trycount;  // Try another one.
    sendSentinel();
    self.notifyFrame_(checkSentinel);
    tid = window.setTimeout(timeoutLoop, 500);
  };

  var sendSentinel;
  var sentinelEquals;
  var nonce;
  var completionAction;

  function setInit() {
    sendSentinel = sendInitSentinel;
    nonce = UTIL_getRandom(8);
    sentinelEquals = initSentinelEquals;
    completionAction = initCompletionAction;
  }

  function setSync() {
    sendSentinel = sendSyncSentinel;
    sentinelEquals = syncSentinelEquals;
    completionAction = syncCompletionAction;
  }

  if (Gnubby.gnubbies_.isSharedAccess(this.which)) {
    setInit();
  } else {
    setSync();
  }
  timeoutLoop();
};

/** Short timeout value in seconds */
Gnubby.SHORT_TIMEOUT = 1;
/** Normal timeout value in seconds */
Gnubby.NORMAL_TIMEOUT = 3;
// Max timeout usb firmware has for smartcard response is 30 seconds.
// Make our application level tolerance a little longer.
/** Maximum timeout in seconds */
Gnubby.MAX_TIMEOUT = 31;

/** Blink led
 * @param {number|ArrayBuffer|Uint8Array} data Command data or number
 *     of seconds to blink
 * @param {?function(...)} cb Callback
 */
Gnubby.prototype.blink = function(data, cb) {
  if (!cb) cb = Gnubby.defaultCallback;
  if (typeof data == 'number') {
    var d = new Uint8Array([data]);
    data = d.buffer;
  }
  this.exchange_(GnubbyDevice.CMD_PROMPT, data, Gnubby.NORMAL_TIMEOUT, cb);
};

/** Lock the gnubby
 * @param {number|ArrayBuffer|Uint8Array} data Command data
 * @param {?function(...)} cb Callback
 */
Gnubby.prototype.lock = function(data, cb) {
  if (!cb) cb = Gnubby.defaultCallback;
  if (typeof data == 'number') {
    var d = new Uint8Array([data]);
    data = d.buffer;
  }
  this.exchange_(GnubbyDevice.CMD_LOCK, data, Gnubby.NORMAL_TIMEOUT, cb);
};

/** Unlock the gnubby
 * @param {?function(...)} cb Callback
 */
Gnubby.prototype.unlock = function(cb) {
  if (!cb) cb = Gnubby.defaultCallback;
  var data = new Uint8Array([0]);
  this.exchange_(GnubbyDevice.CMD_LOCK, data.buffer,
      Gnubby.NORMAL_TIMEOUT, cb);
};

/** Request system information data.
 * @param {?function(...)} cb Callback
 */
Gnubby.prototype.sysinfo = function(cb) {
  if (!cb) cb = Gnubby.defaultCallback;
  this.exchange_(GnubbyDevice.CMD_SYSINFO, new ArrayBuffer(0),
      Gnubby.NORMAL_TIMEOUT, cb);
};

/** Send wink command
 * @param {?function(...)} cb Callback
 */
Gnubby.prototype.wink = function(cb) {
  if (!cb) cb = Gnubby.defaultCallback;
  this.exchange_(GnubbyDevice.CMD_WINK, new ArrayBuffer(0),
      Gnubby.NORMAL_TIMEOUT, cb);
};

/** Send DFU (Device firmware upgrade) command
 * @param {ArrayBuffer|Uint8Array} data Command data
 * @param {?function(...)} cb Callback
 */
Gnubby.prototype.dfu = function(data, cb) {
  if (!cb) cb = Gnubby.defaultCallback;
  this.exchange_(GnubbyDevice.CMD_DFU, data, Gnubby.NORMAL_TIMEOUT, cb);
};

/** Ping the gnubby
 * @param {number|ArrayBuffer|Uint8Array} data Command data
 * @param {?function(...)} cb Callback
 */
Gnubby.prototype.ping = function(data, cb) {
  if (!cb) cb = Gnubby.defaultCallback;
  if (typeof data == 'number') {
    var d = new Uint8Array(data);
    window.crypto.getRandomValues(d);
    data = d.buffer;
  }
  this.exchange_(GnubbyDevice.CMD_PING, data, Gnubby.NORMAL_TIMEOUT, cb);
};

/** Send a raw APDU command
 * @param {ArrayBuffer|Uint8Array} data Command data
 * @param {?function(...)} cb Callback
 */
Gnubby.prototype.apdu = function(data, cb) {
  if (!cb) cb = Gnubby.defaultCallback;
  this.exchange_(GnubbyDevice.CMD_APDU, data, Gnubby.MAX_TIMEOUT, cb);
};

/** Reset gnubby
 * @param {?function(...)} cb Callback
 */
Gnubby.prototype.reset = function(cb) {
  if (!cb) cb = Gnubby.defaultCallback;
  this.exchange_(GnubbyDevice.CMD_ATR, new ArrayBuffer(0),
      Gnubby.MAX_TIMEOUT, cb);
};

// byte args[3] = [delay-in-ms before disabling interrupts,
//                 delay-in-ms before disabling usb (aka remove),
//                 delay-in-ms before reboot (aka insert)]
/** Send usb test command
 * @param {ArrayBuffer|Uint8Array} args Command data
 * @param {?function(...)} cb Callback
 */
Gnubby.prototype.usb_test = function(args, cb) {
  if (!cb) cb = Gnubby.defaultCallback;
  var u8 = new Uint8Array(args);
  this.exchange_(GnubbyDevice.CMD_USB_TEST, u8.buffer,
      Gnubby.NORMAL_TIMEOUT, cb);
};

/** APDU command with reply
 * @param {ArrayBuffer|Uint8Array} request The request
 * @param {?function(...)} cb Callback
 * @param {boolean=} opt_nowink Do not wink
 */
Gnubby.prototype.apduReply = function(request, cb, opt_nowink) {
  if (!cb) cb = Gnubby.defaultCallback;
  var self = this;

  this.apdu(request, function(rc, data) {
    if (rc == 0) {
      var r8 = new Uint8Array(data);
      if (r8[r8.length - 2] == 0x90 && r8[r8.length - 1] == 0x00) {
        // strip trailing 9000
        var buf = new Uint8Array(r8.subarray(0, r8.length - 2));
        cb(-GnubbyDevice.OK, buf.buffer);
        return;
      } else {
        // return non-9000 as rc
        rc = r8[r8.length - 2] * 256 + r8[r8.length - 1];
        // wink gnubby at hand if it needs touching.
        if (rc == 0x6985 && !opt_nowink) {
          self.wink(function() { cb(rc); });
          return;
        }
      }
    }
    // Warn on errors other than waiting for touch, wrong data, and
    // unrecognized command.
    if (rc != 0x6985 && rc != 0x6a80 && rc != 0x6d00) {
      console.warn(UTIL_fmt('apduReply_ fail: ' + rc.toString(16)));
    }
    cb(rc);
  });
};
