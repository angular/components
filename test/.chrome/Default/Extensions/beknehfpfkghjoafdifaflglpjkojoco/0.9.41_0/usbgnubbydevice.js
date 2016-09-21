/**
 * @fileoverview Implements a low-level gnubby driver based on chrome.usb.
 */
'use strict';

/**
 * Low level gnubby 'driver'. One per physical USB device.
 * @param {Gnubbies} gnubbies The gnubbies instances this device is enumerated
 *     in.
 * @param {!chrome.usb.ConnectionHandle} dev The device.
 * @param {number} id The device's id.
 * @param {number} inEndpoint The device's in endpoint.
 * @param {number} outEndpoint The device's out endpoint.
 * @constructor
 * @implements {GnubbyDevice}
 */
function UsbGnubbyDevice(gnubbies, dev, id, inEndpoint, outEndpoint) {
  /** @private {Gnubbies} */
  this.gnubbies_ = gnubbies;
  this.dev = dev;
  this.id = id;
  this.inEndpoint = inEndpoint;
  this.outEndpoint = outEndpoint;
  this.txqueue = [];
  this.clients = [];
  this.lockCID = 0;     // channel ID of client holding a lock, if != 0.
  this.lockMillis = 0;  // current lock period.
  this.lockTID = null;  // timer id of lock timeout.
  this.closing = false;  // device to be closed by receive loop.
  this.updating = false;  // device firmware is in final stage of updating.
  this.inTransferPending = false;
  this.outTransferPending = false;
}

/**
 * Namespace for the UsbGnubbyDevice implementation.
 * @const
 */
UsbGnubbyDevice.NAMESPACE = 'usb';

/** Destroys this low-level device instance. */
UsbGnubbyDevice.prototype.destroy = function() {
  function closeLowLevelDevice(dev) {
    chrome.usb.releaseInterface(dev, 0, function() {
      if (chrome.runtime.lastError) {
        console.warn(UTIL_fmt('Device ' + dev.handle +
            ' couldn\'t be released:'));
        console.warn(UTIL_fmt(chrome.runtime.lastError.message));
        return;
      }
      console.log(UTIL_fmt('Device ' + dev.handle + ' released'));
      chrome.usb.closeDevice(dev, function() {
        if (chrome.runtime.lastError) {
          console.warn(UTIL_fmt('Device ' + dev.handle +
              ' couldn\'t be closed:'));
          console.warn(UTIL_fmt(chrome.runtime.lastError.message));
          return;
        }
        console.log(UTIL_fmt('Device ' + dev.handle + ' closed'));
      });
    });
  }

  if (!this.dev) return;  // Already dead.

  this.gnubbies_.removeOpenDevice(
      {namespace: UsbGnubbyDevice.NAMESPACE, device: this.id});
  this.closing = true;

  console.log(UTIL_fmt('UsbGnubbyDevice.destroy()'));

  // Synthesize a close error frame to alert all clients,
  // some of which might be in read state.
  //
  // Use magic CID 0 to address all.
  this.publishFrame_(new Uint8Array([
        0, 0, 0, 0,  // broadcast CID
        GnubbyDevice.CMD_ERROR,
        0, 1,  // length
        GnubbyDevice.GONE]).buffer);

  // Set all clients to closed status and remove them.
  while (this.clients.length != 0) {
    var client = this.clients.shift();
    if (client) client.closed = true;
  }

  if (this.lockTID) {
    window.clearTimeout(this.lockTID);
    this.lockTID = null;
  }

  var dev = this.dev;
  this.dev = null;
  var reallyCloseDevice = closeLowLevelDevice.bind(null, dev);

  if (this.destroyHook_) {
    var p = this.destroyHook_();
    if (!p) {
      reallyCloseDevice();
      return;
    }
    p.then(reallyCloseDevice);
  } else {
    reallyCloseDevice();
  }
};

/**
 * Sets a callback that will get called when this device instance is destroyed.
 * @param {function() : (Promise|null)} cb Called back when closed. Callback may
 *     yield a promise that resolves when the close hook completes.
 */
UsbGnubbyDevice.prototype.setDestroyHook = function(cb) {
  this.destroyHook_ = /** @private {(function() : (Promise|null)|null)} */ (cb);
};

/**
 * Push frame to all clients.
 * @param {ArrayBuffer} f Data frame
 * @private
 */
UsbGnubbyDevice.prototype.publishFrame_ = function(f) {
  var old = this.clients;

  var remaining = [];
  var changes = false;
  for (var i = 0; i < old.length; ++i) {
    var client = old[i];
    if (client.receivedFrame(f)) {
      // Client still alive; keep on list.
      remaining.push(client);
    } else {
      changes = true;
      console.log(UTIL_fmt(
          '[' + Gnubby.hexCid(client.cid) + '] left?'));
    }
  }
  if (changes) this.clients = remaining;
};

/**
 * @return {boolean} whether this device is open and ready to use.
 * @private
 */
UsbGnubbyDevice.prototype.readyToUse_ = function() {
  if (this.closing) return false;
  if (!this.dev) return false;

  return true;
};

/**
 * Reads one reply from the low-level device.
 * @private
 */
UsbGnubbyDevice.prototype.readOneReply_ = function() {
  if (!this.readyToUse_()) return;  // No point in continuing.
  if (this.updating) return;  // Do not bother waiting for final update reply.

  var self = this;

  function inTransferComplete(x) {
    self.inTransferPending = false;

    if (!self.readyToUse_()) return;  // No point in continuing.

    if (chrome.runtime.lastError) {
      console.warn(UTIL_fmt('in bulkTransfer got lastError: '));
      console.warn(UTIL_fmt(chrome.runtime.lastError.message));
      window.setTimeout(function() { self.destroy(); }, 0);
      return;
    }

    if (x.data) {
      var u8 = new Uint8Array(x.data);
      console.log(UTIL_fmt('<' + UTIL_BytesToHex(u8)));

      self.publishFrame_(x.data);

      // Write another pending request, if any.
      window.setTimeout(
          function() {
            self.txqueue.shift();  // Drop sent frame from queue.
            self.writeOneRequest_();
          },
          0);
    } else {
      console.log(UTIL_fmt('no x.data!'));
      console.log(x);
      window.setTimeout(function() { self.destroy(); }, 0);
    }
  }

  if (this.inTransferPending == false) {
    this.inTransferPending = true;
    chrome.usb.bulkTransfer(
      /** @type {!chrome.usb.ConnectionHandle} */(this.dev),
      { direction: 'in', endpoint: this.inEndpoint, length: 2048 },
      inTransferComplete);
  } else {
    throw 'inTransferPending!';
  }
};

/**
 * Register a client for this gnubby.
 * @param {*} who The client.
 */
UsbGnubbyDevice.prototype.registerClient = function(who) {
  for (var i = 0; i < this.clients.length; ++i) {
    if (this.clients[i] === who) return;  // Already registered.
  }
  this.clients.push(who);
};

/**
 * De-register a client.
 * @param {*} who The client.
 * @return {number} The number of remaining listeners for this device, or -1
 * Returns number of remaining listeners for this device.
 *     if this had no clients to start with.
 */
UsbGnubbyDevice.prototype.deregisterClient = function(who) {
  var current = this.clients;
  if (current.length == 0) return -1;
  this.clients = [];
  for (var i = 0; i < current.length; ++i) {
    var client = current[i];
    if (client !== who) this.clients.push(client);
  }
  return this.clients.length;
};

/**
 * @param {*} who The client.
 * @return {boolean} Whether this device has who as a client.
 */
UsbGnubbyDevice.prototype.hasClient = function(who) {
  if (this.clients.length == 0) return false;
  for (var i = 0; i < this.clients.length; ++i) {
    if (who === this.clients[i])
      return true;
  }
  return false;
};

/**
 * Stuff queued frames from txqueue[] to device, one by one.
 * @private
 */
UsbGnubbyDevice.prototype.writeOneRequest_ = function() {
  if (!this.readyToUse_()) return;  // No point in continuing.

  if (this.txqueue.length == 0) return;  // Nothing to send.

  var frame = this.txqueue[0];

  var self = this;
  function OutTransferComplete(x) {
    self.outTransferPending = false;

    if (!self.readyToUse_()) return;  // No point in continuing.

    if (chrome.runtime.lastError) {
      console.warn(UTIL_fmt('out bulkTransfer lastError: '));
      console.warn(UTIL_fmt(chrome.runtime.lastError.message));
      window.setTimeout(function() { self.destroy(); }, 0);
      return;
    }

    window.setTimeout(function() { self.readOneReply_(); }, 0);
  };

  var u8 = new Uint8Array(frame);

  // See whether this requires scrubbing before logging.
  var alternateLog = Gnubby.hasOwnProperty('redactRequestLog') &&
                     Gnubby['redactRequestLog'](u8);
  if (alternateLog) {
    console.log(UTIL_fmt('>' + alternateLog));
  } else {
    console.log(UTIL_fmt('>' + UTIL_BytesToHex(u8)));
  }

  if (this.outTransferPending == false) {
    this.outTransferPending = true;
    chrome.usb.bulkTransfer(
        /** @type {!chrome.usb.ConnectionHandle} */(this.dev),
        { direction: 'out', endpoint: this.outEndpoint, data: frame },
        OutTransferComplete);
  } else {
    throw 'outTransferPending!';
  }
};

/**
 * Check whether channel is locked for this request or not.
 * @param {number} cid Channel id
 * @param {number} cmd Command to be sent
 * @return {boolean} true if not locked for this request.
 * @private
 */
UsbGnubbyDevice.prototype.checkLock_ = function(cid, cmd) {
  if (this.lockCID) {
    // We have an active lock.
    if (this.lockCID != cid) {
      // Some other channel has active lock.

      if (cmd != GnubbyDevice.CMD_SYNC &&
          cmd != GnubbyDevice.CMD_INIT) {
        // Anything but SYNC|INIT gets an immediate busy.
        var busy = new Uint8Array(
            [(cid >> 24) & 255,
             (cid >> 16) & 255,
             (cid >> 8) & 255,
             cid & 255,
             GnubbyDevice.CMD_ERROR,
             0, 1,  // length
             GnubbyDevice.BUSY]);
        // Log the synthetic busy too.
        console.log(UTIL_fmt('<' + UTIL_BytesToHex(busy)));
        this.publishFrame_(busy.buffer);
        return false;
      }

      // SYNC|INIT get to go to the device to flush OS tx/rx queues.
      // The usb firmware is to always respond to SYNC|INIT,
      // regardless of lock status.
    }
  }
  return true;
};

/**
 * Update or grab lock.
 * @param {number} cid Channel id
 * @param {number} cmd Command
 * @param {number} arg Command argument
 * @private
 */
UsbGnubbyDevice.prototype.updateLock_ = function(cid, cmd, arg) {
  if (this.lockCID == 0 || this.lockCID == cid) {
    // It is this caller's or nobody's lock.
    if (this.lockTID) {
      window.clearTimeout(this.lockTID);
      this.lockTID = null;
    }

    if (cmd == GnubbyDevice.CMD_LOCK) {
      var nseconds = arg;
      if (nseconds != 0) {
        this.lockCID = cid;
        // Set tracking time to be .1 seconds longer than usb device does.
        this.lockMillis = nseconds * 1000 + 100;
      } else {
        // Releasing lock voluntarily.
        this.lockCID = 0;
      }
    }

    // (re)set the lock timeout if we still hold it.
    if (this.lockCID) {
      var self = this;
      this.lockTID = window.setTimeout(
          function() {
            console.warn(UTIL_fmt(
                'lock for CID ' + Gnubby.hexCid(cid) + ' expired!'));
            self.lockTID = null;
            self.lockCID = 0;
          },
          this.lockMillis);
    }
  }
};

/**
 * Queue command to be sent.
 * If queue was empty, initiate the write.
 * @param {number} cid The client's channel ID.
 * @param {number} cmd The command to send.
 * @param {ArrayBuffer|Uint8Array} data Command argument data
 */
UsbGnubbyDevice.prototype.queueCommand = function(cid, cmd, data) {
  if (!this.dev) return;
  if (!this.checkLock_(cid, cmd)) return;

  var u8 = new Uint8Array(data);
  var frame = new Uint8Array(u8.length + 7);

  frame[0] = cid >>> 24;
  frame[1] = cid >>> 16;
  frame[2] = cid >>> 8;
  frame[3] = cid;
  frame[4] = cmd;
  frame[5] = (u8.length >> 8);
  frame[6] = (u8.length & 255);

  frame.set(u8, 7);

  var lockArg = (u8.length > 0) ? u8[0] : 0;
  this.updateLock_(cid, cmd, lockArg);

  var wasEmpty = (this.txqueue.length == 0);
  this.txqueue.push(frame.buffer);
  if (wasEmpty) this.writeOneRequest_();
};

/**
 * @const
 */
UsbGnubbyDevice.WINUSB_VID_PIDS = [
  {'vendorId': 4176, 'productId': 529}  // Yubico WinUSB
];

/**
 * @param {function(Array)} cb Enumerate callback
 * @param {GnubbyEnumerationTypes=} opt_type Which type of enumeration to do.
 */
UsbGnubbyDevice.enumerate = function(cb, opt_type) {
  // UsbGnubbyDevices are all non-FIDO devices, so return an empty list if
  // FIDO is what's wanted.
  if (opt_type == GnubbyEnumerationTypes.FIDO_U2F) {
    cb([]);
    return;
  }

  var numEnumerated = 0;
  var allDevs = [];

  function enumerated(devs) {
    allDevs = allDevs.concat(devs);
    if (++numEnumerated == UsbGnubbyDevice.WINUSB_VID_PIDS.length) {
      cb(allDevs);
    }
  }

  for (var i = 0; i < UsbGnubbyDevice.WINUSB_VID_PIDS.length; i++) {
    chrome.usb.getDevices(UsbGnubbyDevice.WINUSB_VID_PIDS[i], enumerated);
  }
};

/**
 * @typedef {?{
 *   address: number,
 *   type: string,
 *   direction: string,
 *   maximumPacketSize: number,
 *   synchronization: (string|undefined),
 *   usage: (string|undefined),
 *   pollingInterval: (number|undefined)
 * }}
 * @see http://developer.chrome.com/apps/usb.html#method-listInterfaces
 */
var InterfaceEndpoint;


/**
 * @typedef {?{
 *   interfaceNumber: number,
 *   alternateSetting: number,
 *   interfaceClass: number,
 *   interfaceSubclass: number,
 *   interfaceProtocol: number,
 *   description: (string|undefined),
 *   endpoints: !Array<!InterfaceEndpoint>
 * }}
 * @see http://developer.chrome.com/apps/usb.html#method-listInterfaces
 */
var InterfaceDescriptor;

/**
 * @param {Gnubbies} gnubbies The gnubbies instances this device is enumerated
 *     in.
 * @param {number} which The index of the device to open.
 * @param {!chrome.usb.Device} dev The device to open.
 * @param {function(number, GnubbyDevice=)} cb Called back with the
 *     result of opening the device.
 */
UsbGnubbyDevice.open = function(gnubbies, which, dev, cb) {
  /** @param {chrome.usb.ConnectionHandle=} handle Connection handle */
  function deviceOpened(handle) {
    if (chrome.runtime.lastError) {
      console.warn(UTIL_fmt('openDevice got lastError:'));
      console.warn(UTIL_fmt(chrome.runtime.lastError.message));
      console.warn(UTIL_fmt('failed to open device. permissions issue?'));
      cb(-GnubbyDevice.NODEVICE);
      return;
    }
    var nonNullHandle = /** @type {!chrome.usb.ConnectionHandle} */ (handle);
    chrome.usb.listInterfaces(nonNullHandle, function(descriptors) {
      var inEndpoint, outEndpoint;
      for (var i = 0; i < descriptors.length; i++) {
        var descriptor = /** @type {InterfaceDescriptor} */ (descriptors[i]);
        for (var j = 0; j < descriptor.endpoints.length; j++) {
          var endpoint = descriptor.endpoints[j];
          if (inEndpoint == undefined && endpoint.type == 'bulk' &&
              endpoint.direction == 'in') {
            inEndpoint = endpoint.address;
          }
          if (outEndpoint == undefined && endpoint.type == 'bulk' &&
              endpoint.direction == 'out') {
            outEndpoint = endpoint.address;
          }
        }
      }
      if (inEndpoint == undefined || outEndpoint == undefined) {
        console.warn(UTIL_fmt('device lacking an endpoint (broken?)'));
        chrome.usb.closeDevice(nonNullHandle);
        cb(-GnubbyDevice.NODEVICE);
        return;
      }
      // Try getting it claimed now.
      chrome.usb.claimInterface(nonNullHandle, 0, function() {
        if (chrome.runtime.lastError) {
          console.warn(UTIL_fmt('lastError: ' + chrome.runtime.lastError));
          console.log(chrome.runtime.lastError);
        }
        var claimed = !chrome.runtime.lastError;
        if (!claimed) {
          console.warn(UTIL_fmt('failed to claim interface. busy?'));
          // Claim failed? Let the callers know and bail out.
          chrome.usb.closeDevice(nonNullHandle);
          cb(-GnubbyDevice.BUSY);
          return;
        }
        var gnubby = new UsbGnubbyDevice(gnubbies, nonNullHandle, which,
            inEndpoint, outEndpoint);
        cb(-GnubbyDevice.OK, gnubby);
      });
    });
  }

  if (UsbGnubbyDevice.runningOnCrOS === undefined) {
    UsbGnubbyDevice.runningOnCrOS =
        (window.navigator.appVersion.indexOf('; CrOS ') != -1);
  }
  if (UsbGnubbyDevice.runningOnCrOS) {
    chrome.usb.requestAccess(dev, 0, function(success) {
      // Even though the argument to requestAccess is a chrome.usb.Device, the
      // access request is for access to all devices with the same vid/pid.
      // Curiously, if the first chrome.usb.requestAccess succeeds, a second
      // call with a separate device with the same vid/pid fails. Since
      // chrome.usb.openDevice will fail if a previous access request really
      // failed, just ignore the outcome of the access request and move along.
      chrome.usb.openDevice(dev, deviceOpened);
    });
  } else {
    chrome.usb.openDevice(dev, deviceOpened);
  }
};

/**
 * @param {*} dev Chrome usb device
 * @return {GnubbyDeviceId} A device identifier for the device.
 */
UsbGnubbyDevice.deviceToDeviceId = function(dev) {
  var usbDev = /** @type {!chrome.usb.Device} */ (dev);
  var deviceId = {
    namespace: UsbGnubbyDevice.NAMESPACE,
    device: usbDev.device
  };
  return deviceId;
};

/**
 * Registers this implementation with gnubbies.
 * @param {Gnubbies} gnubbies Gnubbies singleton instance
 */
UsbGnubbyDevice.register = function(gnubbies) {
  var USB_GNUBBY_IMPL = {
    isSharedAccess: false,
    enumerate: UsbGnubbyDevice.enumerate,
    deviceToDeviceId: UsbGnubbyDevice.deviceToDeviceId,
    open: UsbGnubbyDevice.open
  };
  gnubbies.registerNamespace(UsbGnubbyDevice.NAMESPACE, USB_GNUBBY_IMPL);
};
