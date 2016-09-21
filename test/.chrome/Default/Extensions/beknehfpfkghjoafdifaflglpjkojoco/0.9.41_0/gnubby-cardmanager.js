/**
 * @fileoverview Gnubby methods relating to applet updating.
 */
'use strict';

var FORCE_appletReinstall = false;

var Gnubbyd = {};

// Commands as the update server understands them.
Gnubbyd.CMD_RESET = 3;
Gnubbyd.CMD_APDU = 5;

// Response codes update server replies with.
Gnubbyd.RSP_OK = 0;
Gnubbyd.RSP_BUSY = 4;

Gnubby.prototype.appletVersion = function(cb) {
  if (!cb) cb = Gnubby.defaultCallback;
  var apdu = new Uint8Array([0x00, Gnubby.APPLET_VERSION, 0x00, 0x00]);
  this.apduReply(apdu.buffer, function(rc, data) {
      if (FORCE_appletReinstall) {
        // Lie with version 0.0.1, which should bypass upstream logic.
        cb(rc, new Uint8Array([0, 0, 1, 255]).buffer);
      } else {
        cb(rc, data);
      }
  });
};

// Applet updating.
// which = 'ssh', 'gnubby' or 'v2'.
// boolean force.
Gnubby.prototype.appletUpdate = function(which, force, cb) {
  if (!cb) cb = Gnubby.defaultCallback;

  if (which == 'gnubby') which = null;

  // Reset the version if any applet gets updated so it can get re-read after
  // update.
  this.version_ = undefined;

  force = force || FORCE_appletReinstall;

  // Force only once.
  FORCE_appletReinstall = false;

  var servers;

  if (chrome.runtime.id == 'dlfcjilkjfhdnfiecknlnddkmmiofjbg') {
    // Gnubbyd-dev uses bleeding edge servers.
    servers = [
        'https://gnubby-update-dev.corp.google.com',   // -dev
        'https://gnubby-update-test.corp.google.com',  // Staging
        'https://gnubby-update.corp.google.com',       // Realz!
    ];

    // Gnubbyd-dev also asks for more bleeding edge applets.
    if (which) {
      which = which.replace(/v2/, 'v3');
    }
  } else {
    servers = [
        'https://gnubby-update.corp.google.com'  // Realz!
    ];
  }

  var currentServerIndex = 0;
  var server = servers[currentServerIndex];

  var url = server + '/ga-update' +
      (which ? '?' + which : '') +
      (force ? (which ? '&force' : '?force') : '');

  var XHR;
  var seq = 0;
  var data = [];
  var sid;

  var lockTriesLeft = 10;

  var self = this;
  var gotLock = false;

  function callback(code, text) {
    if (gotLock) {
      self.sync(function() {
        // Reset first to get applet selected back to normal etc.
        self.reset(function() {
          // Release lock.
          self.unlock(function() {
            cb(code, text);
          });
        });
      });
    } else {
      cb(code, text);
    }
  }

  function xhr_pump(code, rsp_ab) {
    if (code == Gnubbyd.RSP_OK) {
      var rsp = new Uint8Array(rsp_ab);
      console.log(UTIL_fmt('] 00:' + UTIL_BytesToHex(rsp)));
      var u8 = new Uint8Array(rsp.length + 1);
      u8[0] = Gnubbyd.RSP_OK;
      u8.set(rsp, 1);
      data = UTIL_BytesToHex(u8);
    } else {
      var u8 = new Uint8Array(1);
      u8[0] = code;
      data = UTIL_BytesToHex(u8);
    }
    XHR.open('GET',
             server + '/ga-update?sid=' + sid +
             '&data=' + data +
             '&seq=' + seq, true);
    XHR.withCredentials = true;
    XHR.send();
  }

  function xhr_onloadend() {
    if (this.status == 200) {
      var body = this.responseText;
      if (body.indexOf('done') == 0) {
        callback(0, 'updated');
        return;
      } else if (body.indexOf('uptodate') == 0) {
        callback(0, 'uptodate');
        return;
      }
      var cmd = UTIL_HexToBytes(body);
      if (cmd.length == 0) {
        // Got no reply data: retry / poll with same seq.
        XHR.open('GET',
                 server + '/ga-update?sid=' + sid +
                 '&data=' + data +
                 '&seq=' + seq, true);
        XHR.withCredentials = true;
        XHR.send();
        return;
      }
      ++seq;  // increment cmd sequence number.
      switch (cmd[0]) {
        case Gnubbyd.CMD_RESET:
          console.log(UTIL_fmt('[ 03:'));
          self.reset(xhr_pump);
          break;
        case Gnubbyd.CMD_APDU:
          var u8 = cmd.subarray(1);
          console.log(UTIL_fmt('[ 05:' + UTIL_BytesToHex(u8)));
          // Wink to get some sign of activity.
          self.wink(function() {
            self.apdu(u8, xhr_pump);
          });
          break;
        default:
          console.log(UTIL_fmt('[ ??:' + UTIL_BytesToHex(cmd)));
          callback(1, 'unknown server request: ' + UTIL_BytesToHex(cmd));
          return;
      }
    } else {
      console.log(UTIL_fmt(this));
      console.log(UTIL_fmt('xhr status: ' + this.status));
      // TODO: retry w/ backoff for everything except 410 (GONE), 406 (CORS).
      // Reopen and restart?

      var status = this.status;
      if (status == 0) {
        // Maps 0 to something that does not equate success for caller.
        status = 200;
      }
      callback(status, 'Update server HTTP error');
      return;
    }
  }

  function locked(code) {
    if (code == Gnubbyd.RSP_OK) {
      console.log(UTIL_fmt('Gnubby locked!'));
      gotLock = true;

      // Applet update requires cardmanager keys.
      // Hence a secure server in the sky. Start talking to it.
      seq = 0;
      data = [];

      XHR.open('GET', server + '/ga-update?sid=' + sid, true);
      XHR.withCredentials = true;
      XHR.onloadend = xhr_onloadend;
      // TODO: add onabort and onerror to retry w/ backoff?
      XHR.send();

    } else if (code == Gnubbyd.RSP_BUSY) {
      if (--lockTriesLeft > 0) {
        window.setTimeout(function() {
            console.log(UTIL_fmt('Trying to obtain lock on gnubby..'));
            self.lock(Gnubby.MAX_TIMEOUT, locked);
          }, 200);
      } else {
        callback(code, 'Failed to lock after some tries');
        return;
      }
    } else {
      console.log(UTIL_fmt('Failed to lock gnubby: ' + code));
      callback(code, 'Failed to lock due to error');
      return;
    }
  }

  function tryGetNextServer() {
    if (currentServerIndex >= servers.length) {
      return null;
    }

    return servers[++currentServerIndex];
  }

  function loadedXHR() {
    if (this.status == 200) {
      sid = this.responseText;
      console.log(UTIL_fmt('sid: ' + sid));
      // Make sure we have a sufficient lock.
      self.lock(Gnubby.MAX_TIMEOUT, locked);
    } else {
      if (this.status == 0 || this.status == 500 || this.status == 502) {
        // If server failed, retry with next, if any.
        var prevServer = server;
        server = tryGetNextServer();
        if (server) {
          url = url.replace(prevServer, server);

          startXHR();
          return;
        }
      }
      xhr_onloadend.call(this);
    }
  }

  function startXHR() {
    console.log(UTIL_fmt('Update url: ' + url));
    XHR = new XMLHttpRequest();
    XHR.open('GET', url, true);
    XHR.withCredentials = true;
    XHR.onloadend = loadedXHR;
    XHR.send();
  }

  startXHR();
};

/**
 * APDU to select the Global Platforms applet.
 * @const
 */
Gnubby.GLOBAL_PLATFORMS_SELECT_APDU = [0x00, 0xA4, 0x04, 0x00, 0x08, 0xA0,
    0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00];

/**
 * APDU to get the CPLC (Card Production Life Cycle) from the device.
 * @const
 */
Gnubby.GET_CPLC_APDU = [0x80, 0xCA, 0x9F, 0x7F];

/**
 * Gets the CPLC (Card Production Life Cycle) from the device.
 */
Gnubby.prototype.cplc = function(cb) {
  if (!cb) cb = Gnubby.defaultCallback;
  var apdu = new Uint8Array(Gnubby.GLOBAL_PLATFORMS_SELECT_APDU);
  var self = this;
  this.apduReply(apdu.buffer, function(rc, data) {
    if (rc) {
      cb(rc, data);
      return;
    }
    apdu = new Uint8Array(Gnubby.GET_CPLC_APDU);
    self.apduReply(apdu.buffer, function(rc, data) {
      if (rc) {
        cb(rc, data);
        return;
      }
      var u8 = new Uint8Array(data);
      if (u8[0] != 0x9f || u8[1] != 0x7f) {
        // Not a CPLC response?
        console.warn(UTIL_fmt('Got invalid response to CPLC command: ' +
              UTIL_BytesToHex(u8)));
        cb(-GnubbyDevice.OTHER);
        return;
      }
      cb(rc, data);
    });
  });
};
