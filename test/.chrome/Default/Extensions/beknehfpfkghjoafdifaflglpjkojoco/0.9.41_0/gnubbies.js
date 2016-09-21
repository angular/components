/**
 * @fileoverview A class for managing all enumerated gnubby devices.
 */
'use strict';

/**
 * @typedef {{
 *   namespace: string,
 *   device: number
 * }}
 */
var GnubbyDeviceId;

/**
 * Ways in which gnubby devices are enumerated.
 * @const
 * @enum {number}
 */
var GnubbyEnumerationTypes = {
  ANY: 0,
  VID_PID: 1,
  FIDO_U2F: 2
};

/**
 * @typedef {{
 *   isSharedAccess: boolean,
 *   enumerate: function(function(Array), GnubbyEnumerationTypes=),
 *   deviceToDeviceId: function(*): GnubbyDeviceId,
 *   open: function(Gnubbies, number, *, function(number, GnubbyDevice=)),
 *   cancelOpen: (undefined|function(Gnubbies, number, *))
 * }}
 */
var GnubbyNamespaceImpl;

/**
 * Manager of opened devices.
 * @constructor
 */
function Gnubbies() {
  /** @private {Object<string, Array>} */
  this.devs_ = {};
  this.pendingEnumerate = [];  // clients awaiting an enumerate
  /**
   * The distinct namespaces registered in this Gnubbies instance, in order of
   * registration.
   * @private {Array<string>}
   */
  this.namespaces_ = [];
  /** @private {Object<string, GnubbyNamespaceImpl>} */
  this.impl_ = {};
  /** @private {Object<string, Object<number|string, !GnubbyDevice>>} */
  this.openDevs_ = {};
  /** @private {Object<string, Object<number, *>>} */
  this.pendingOpens_ = {};  // clients awaiting an open
}

/**
 * Registers a new gnubby namespace, i.e. an implementation of the
 * enumerate/open functions for all devices within a namespace.
 * @param {string} namespace The namespace of the numerator, e.g. 'usb'.
 * @param {GnubbyNamespaceImpl} impl The implementation.
 */
Gnubbies.prototype.registerNamespace = function(namespace, impl) {
  if (!this.impl_.hasOwnProperty(namespace)) {
    this.namespaces_.push(namespace);
  }
  this.impl_[namespace] = impl;
};

/**
 * @param {GnubbyDeviceId} id The device id.
 * @return {boolean} Whether the device is a shared access device.
 */
Gnubbies.prototype.isSharedAccess = function(id) {
  if (!this.impl_.hasOwnProperty(id.namespace)) return false;
  return this.impl_[id.namespace].isSharedAccess;
};

/**
 * @param {GnubbyDeviceId} which The device to remove.
 */
Gnubbies.prototype.removeOpenDevice = function(which) {
  if (this.openDevs_[which.namespace] &&
      this.openDevs_[which.namespace].hasOwnProperty(which.device)) {
    delete this.openDevs_[which.namespace][which.device];
  }
};

/** Close all enumerated devices. */
Gnubbies.prototype.closeAll = function() {
  if (this.inactivityTimer) {
    this.inactivityTimer.clearTimeout();
    this.inactivityTimer = undefined;
  }
  // Close and stop talking to any gnubbies we have enumerated.
  for (var namespace in this.openDevs_) {
    for (var dev in this.openDevs_[namespace]) {
      var deviceId = Number(dev);
      this.openDevs_[namespace][deviceId].destroy();
    }
  }
  this.devs_ = {};
  this.openDevs_ = {};
};

/**
 * @param {string} namespace
 * @return {function(*)} deviceToDeviceId method associated with given namespace
 * @private
 */
Gnubbies.prototype.getDeviceToDeviceId_ = function(namespace) {
  return this.impl_[namespace].deviceToDeviceId;
};

/**
 * @param {function(number, Array<GnubbyDeviceId>)} cb Called back with the
 *     result of enumerating.
 * @param {GnubbyEnumerationTypes=} opt_type Which type of enumeration to do.
 */
Gnubbies.prototype.enumerate = function(cb, opt_type) {
  if (!cb) {
    cb = function(rc, indexes) {
      var msg = 'defaultEnumerateCallback(' + rc;
      if (indexes) {
        msg += ', [';
        for (var i = 0; i < indexes.length; i++) {
          msg += JSON.stringify(indexes[i]);
        }
        msg += ']';
      }
      msg += ')';
      console.log(UTIL_fmt(msg));
    };
  }

  if (!this.namespaces_.length) {
    cb(-GnubbyDevice.OK, []);
    return;
  }

  var namespacesEnumerated = 0;
  var self = this;

  /**
   * @param {string} namespace The namespace that was enumerated.
   * @param {Array<GnubbyDeviceId>} existingDeviceIds Previously enumerated
   *     device IDs (from other namespaces), if any.
   * @param {Array} devs The devices in the namespace.
   */
  function enumerated(namespace, existingDeviceIds, devs) {
    namespacesEnumerated++;
    var lastNamespace = (namespacesEnumerated == self.namespaces_.length);

    if (chrome.runtime.lastError) {
      console.warn(UTIL_fmt('lastError: ' + chrome.runtime.lastError));
      console.log(chrome.runtime.lastError);
      devs = [];
    }

    console.log(UTIL_fmt('Enumerated ' + devs.length + ' gnubbies'));
    console.log(devs);

    var presentDevs = {};
    var deviceIds = [];
    var deviceToDeviceId = self.getDeviceToDeviceId_(namespace);
    for (var i = 0; i < devs.length; ++i) {
      var deviceId = deviceToDeviceId(devs[i]);
      deviceIds.push(deviceId);
      presentDevs[deviceId.device] = devs[i];
    }

    var toRemove = [];
    for (var dev in self.openDevs_[namespace]) {
      if (!presentDevs.hasOwnProperty(dev)) {
        toRemove.push(dev);
      }
    }

    for (var i = 0; i < toRemove.length; i++) {
      dev = toRemove[i];
      if (self.openDevs_[namespace][dev]) {
        self.openDevs_[namespace][dev].destroy();
        delete self.openDevs_[namespace][dev];
      }
    }

    self.devs_[namespace] = devs;
    existingDeviceIds.push.apply(existingDeviceIds, deviceIds);
    if (lastNamespace) {
      while (self.pendingEnumerate.length != 0) {
        var cb = self.pendingEnumerate.shift();
        cb(-GnubbyDevice.OK, existingDeviceIds);
      }
    }
  }

  var deviceIds = [];
  function makeEnumerateCb(namespace) {
    return function(devs) {
      enumerated(namespace, deviceIds, devs);
    }
  }

  this.pendingEnumerate.push(cb);
  if (this.pendingEnumerate.length == 1) {
    for (var i = 0; i < this.namespaces_.length; i++) {
      var namespace = this.namespaces_[i];
      var enumerator = this.impl_[namespace].enumerate;
      enumerator(makeEnumerateCb(namespace), opt_type);
    }
  }
};

/**
 * Amount of time past last activity to set the inactivity timer to, in millis.
 * @const
 */
Gnubbies.INACTIVITY_TIMEOUT_MARGIN_MILLIS = 30000;

/**
 * Private instance of timers based on window's timer functions.
 * @const
 * @private
 */
Gnubbies.SYS_TIMER_ = new WindowTimer();

/**
 * @param {number|undefined} opt_timeoutMillis Timeout in milliseconds
 */
Gnubbies.prototype.resetInactivityTimer = function(opt_timeoutMillis) {
  var millis = opt_timeoutMillis ?
      opt_timeoutMillis + Gnubbies.INACTIVITY_TIMEOUT_MARGIN_MILLIS :
      Gnubbies.INACTIVITY_TIMEOUT_MARGIN_MILLIS;
  if (!this.inactivityTimer) {
    this.inactivityTimer =
        new CountdownTimer(
            Gnubbies.SYS_TIMER_, millis, this.inactivityTimeout_.bind(this));
  } else if (millis > this.inactivityTimer.millisecondsUntilExpired()) {
    this.inactivityTimer.clearTimeout();
    this.inactivityTimer.setTimeout(millis, this.inactivityTimeout_.bind(this));
  }
};

/**
 * Called when the inactivity timeout expires.
 * @private
 */
Gnubbies.prototype.inactivityTimeout_ = function() {
  this.inactivityTimer = undefined;
  for (var namespace in this.openDevs_) {
    for (var dev in this.openDevs_[namespace]) {
      var deviceId = Number(dev);
      console.warn(namespace + ' device ' + deviceId +
          ' still open after inactivity, closing');
      this.openDevs_[namespace][deviceId].destroy();
    }
  }
};

/**
 * Opens and adds a new client of the specified device.
 * @param {GnubbyDeviceId} which Which device to open.
 * @param {*} who Client of the device.
 * @param {function(number, GnubbyDevice=)} cb Called back with the result of
 *     opening the device.
 */
Gnubbies.prototype.addClient = function(which, who, cb) {
  this.resetInactivityTimer();

  var self = this;

  function opened(gnubby, who, cb) {
    if (gnubby.closing) {
      // Device is closing or already closed.
      self.removeClient(gnubby, who);
      if (cb) { cb(-GnubbyDevice.NODEVICE); }
    } else {
      gnubby.registerClient(who);
      if (cb) { cb(-GnubbyDevice.OK, gnubby); }
    }
  }

  function notifyOpenResult(rc) {
    if (self.pendingOpens_[which.namespace]) {
      while (self.pendingOpens_[which.namespace][which.device].length != 0) {
        var client = self.pendingOpens_[which.namespace][which.device].shift();
        client.cb(rc);
      }
      delete self.pendingOpens_[which.namespace][which.device];
    }
  }

  var dev = null;
  var deviceToDeviceId = this.getDeviceToDeviceId_(which.namespace);
  if (this.devs_[which.namespace]) {
    for (var i = 0; i < this.devs_[which.namespace].length; i++) {
      var device = this.devs_[which.namespace][i];
      if (deviceToDeviceId(device).device == which.device) {
        dev = device;
        break;
      }
    }
  }
  if (!dev) {
    // Index out of bounds. Device does not exist in current enumeration.
    this.removeClient(null, who);
    if (cb) { cb(-GnubbyDevice.NODEVICE); }
    return;
  }

  function openCb(rc, opt_gnubby) {
    if (rc) {
      notifyOpenResult(rc);
      return;
    }
    if (!opt_gnubby) {
      notifyOpenResult(-GnubbyDevice.NODEVICE);
      return;
    }
    var gnubby = /** @type {!GnubbyDevice} */ (opt_gnubby);
    if (!self.openDevs_[which.namespace]) {
      self.openDevs_[which.namespace] = {};
    }
    self.openDevs_[which.namespace][which.device] = gnubby;
    while (self.pendingOpens_[which.namespace][which.device].length != 0) {
      var client = self.pendingOpens_[which.namespace][which.device].shift();
      opened(gnubby, client.who, client.cb);
    }
    delete self.pendingOpens_[which.namespace][which.device];
  }

  if (this.openDevs_[which.namespace] &&
      this.openDevs_[which.namespace].hasOwnProperty(which.device)) {
    var gnubby = this.openDevs_[which.namespace][which.device];
    opened(gnubby, who, cb);
  } else {
    var opener = {who: who, cb: cb};
    if (!this.pendingOpens_.hasOwnProperty(which.namespace)) {
      this.pendingOpens_[which.namespace] = {};
    }
    if (this.pendingOpens_[which.namespace].hasOwnProperty(which.device)) {
      this.pendingOpens_[which.namespace][which.device].push(opener);
    } else {
      this.pendingOpens_[which.namespace][which.device] = [opener];
      var openImpl = this.impl_[which.namespace].open;
      openImpl(this, which.device, dev, openCb);
    }
  }
};

/**
 * Called to cancel add client operation
 * @param {GnubbyDeviceId} which Which device to cancel open.
 */
Gnubbies.prototype.cancelAddClient = function(which) {
  var dev = null;
  var deviceToDeviceId = this.getDeviceToDeviceId_(which.namespace);
  if (this.devs_[which.namespace]) {
    for (var i = 0; i < this.devs_[which.namespace].length; i++) {
      var device = this.devs_[which.namespace][i];
      if (deviceToDeviceId(device).device == which.device) {
        dev = device;
        break;
      }
    }
  }

  if (!dev) {
    return;
  }

  if (this.pendingOpens_[which.namespace] &&
      this.pendingOpens_[which.namespace][which.device]) {
    var cancelOpenImpl = this.impl_[which.namespace].cancelOpen;
    if (cancelOpenImpl)
      cancelOpenImpl(this, which.device, dev);
  }
};

/**
 * Removes a client from a low-level gnubby.
 * @param {GnubbyDevice} whichDev The gnubby.
 * @param {*} who The client.
 */
Gnubbies.prototype.removeClient = function(whichDev, who) {
  console.log(UTIL_fmt('Gnubbies.removeClient()'));

  this.resetInactivityTimer();

  // De-register client from all known devices.
  for (var namespace in this.openDevs_) {
    for (var devId in this.openDevs_[namespace]) {
      var deviceId = Number(devId);
      if (isNaN(deviceId))
        deviceId = devId;
      var dev = this.openDevs_[namespace][deviceId];
      if (dev.hasClient(who)) {
        if (whichDev && dev != whichDev) {
          console.warn('Gnubby attached to more than one device!?');
        }
        if (!dev.deregisterClient(who)) {
          dev.destroy();
        }
      }
    }
  }
};
