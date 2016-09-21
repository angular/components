/**
 * @fileoverview Interface for representing a low-level gnubby device.
 */
'use strict';

/**
 * Low level gnubby 'driver'. One per physical USB device.
 * @interface
 */
function GnubbyDevice() {}

// Commands of the USB interface.
// GOOGLE-INTERNAL //depot/google3/security/tools/gnubby/gnubbyd/gnubby_if.h
/** Echo data through local processor only */
GnubbyDevice.CMD_PING = 0x81;
/** Perform reset action and read ATR string */
GnubbyDevice.CMD_ATR = 0x82;
/** Send raw APDU */
GnubbyDevice.CMD_APDU = 0x83;
/** Send lock channel command */
GnubbyDevice.CMD_LOCK = 0x84;
/** Obtain system information record */
GnubbyDevice.CMD_SYSINFO = 0x85;
/** Obtain an unused channel ID */
GnubbyDevice.CMD_INIT = 0x86;
/** Control prompt flashing */
GnubbyDevice.CMD_PROMPT = 0x87;
/** Send device identification wink */
GnubbyDevice.CMD_WINK = 0x88;
/** USB test */
GnubbyDevice.CMD_USB_TEST = 0xb9;
/** Device Firmware Upgrade */
GnubbyDevice.CMD_DFU = 0xba;
/** Protocol resync command */
GnubbyDevice.CMD_SYNC = 0xbc;
/** Error response */
GnubbyDevice.CMD_ERROR = 0xbf;

// Low-level error codes.
// BEGIN GOOGLE-INTERNAL
// //depot/google3/security/tools/gnubby/gnubbyd/gnubby_if.h
// //depot/google3/security/tools/gnubby/ssh/gnubby_error_codes.h
// END GOOGLE-INTERNAL
/** No error */
GnubbyDevice.OK = 0;
/** Invalid command */
GnubbyDevice.INVALID_CMD = 1;
/** Invalid parameter */
GnubbyDevice.INVALID_PAR = 2;
/** Invalid message length */
GnubbyDevice.INVALID_LEN = 3;
/** Invalid message sequencing */
GnubbyDevice.INVALID_SEQ = 4;
/** Message has timed out */
GnubbyDevice.TIMEOUT = 5;
/** Channel is busy */
GnubbyDevice.BUSY = 6;
/** Access denied */
GnubbyDevice.ACCESS_DENIED = 7;
/** Device is gone */
GnubbyDevice.GONE = 8;
/** Verification error */
GnubbyDevice.VERIFY_ERROR = 9;
/** Command requires channel lock */
GnubbyDevice.LOCK_REQUIRED = 10;
/** Sync error */
GnubbyDevice.SYNC_FAIL = 11;
/** Other unspecified error */
GnubbyDevice.OTHER = 127;

// Remote helper errors.
/** Not a remote helper */
GnubbyDevice.NOTREMOTE = 263;
/** Could not reach remote endpoint */
GnubbyDevice.COULDNOTDIAL = 264;

// chrome.usb-related errors.
/** No device */
GnubbyDevice.NODEVICE = 512;
/** More than one device */
GnubbyDevice.TOOMANY = 513;
/** Permission denied */
GnubbyDevice.NOPERMISSION = 666;

/** Destroys this low-level device instance. */
GnubbyDevice.prototype.destroy = function() {};

/**
 * Sets a callback that will get called when this device instance is destroyed.
 * @param {function() : (Promise|null)} cb Called back when closed. Callback may
 *     yield a promise that resolves when the close hook completes.
 */
GnubbyDevice.prototype.setDestroyHook = function(cb) {};

/**
 * Register a client for this gnubby.
 * @param {*} who The client.
 */
GnubbyDevice.prototype.registerClient = function(who) {};

/**
 * De-register a client.
 * @param {*} who The client.
 * @return {number} The number of remaining listeners for this device, or -1
 *     if this had no clients to start with.
 */
GnubbyDevice.prototype.deregisterClient = function(who) {};

/**
 * @param {*} who The client.
 * @return {boolean} Whether this device has who as a client.
 */
GnubbyDevice.prototype.hasClient = function(who) {};

/**
 * Queue command to be sent.
 * If queue was empty, initiate the write.
 * @param {number} cid The client's channel ID.
 * @param {number} cmd The command to send.
 * @param {ArrayBuffer|Uint8Array} data Command data
 */
GnubbyDevice.prototype.queueCommand = function(cid, cmd, data) {};

/**
 * @typedef {{
 *   vendorId: number,
 *   productId: number
 * }}
 */
var UsbDeviceSpec;
