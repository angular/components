/**
 * @fileoverview Contains a factory for creating and opening Gnubby
 * instances, and verifying the applet version each is running.
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * @typedef {{
 *   cb: FactoryOpenCallback,
 *   caller: (string|undefined)
 * }}
 */
var PendingOpenClient;

/**
 * @param {Gnubbies} gnubbies
 * @constructor
 * @implements {GnubbyFactory}
 */
function AppletVerifyingGnubbyFactory(gnubbies) {
  /** @private {Gnubbies} */
  this.gnubbies_ = gnubbies;
  /** @private {GnubbyDeviceIdCache} */
  this.knownGoodGnubbiesForEnrollOrSign_ = new GnubbyDeviceIdCache();
  /** @private {GnubbyDeviceIdCache} */
  this.knownGoodGnubbiesForSign_ = new GnubbyDeviceIdCache();
  /** @private {Object<string, Array<PendingOpenClient>>} */
  this.pendingOpenClients_ = {};  // All the clients awaiting opening a gnubby.
  /** @private {Object<string, Object<string, string>>} */
  this.logMsgUrls_ = {};  // A "set" of logMsgUrls for this gnubby.
  /** @private {Object<string, boolean>} */
  this.pendingOpenForEnroll_ = {};  // Whether any pending open is for enroll.
  /** @private {number} */
  this.appletUpdateWindowRef_ = 0;

  Gnubby.setGnubbies(gnubbies);
}

/**
 * Creates a new gnubby object, and opens the gnubby with the given index.
 * Upon successful open, the gnubby's applet version is verified, and updated
 * if necessary.
 * @param {GnubbyDeviceId} which The device to open.
 * @param {boolean} forEnroll Whether this gnubby is being opened for enrolling.
 * @param {FactoryOpenCallback} cb Called with result of opening the gnubby.
 * @param {string=} opt_appIdHash The base64-encoded hash of the app id for
 *     which the gnubby being opened.
 * @param {string=} opt_logMsgUrl The url to post log messages to.
 * @param {string=} opt_caller Identifier for the caller.
 * @return {undefined} no open canceller needed for this type of gnubby
 * @override
 */
AppletVerifyingGnubbyFactory.prototype.openGnubby =
    function(which, forEnroll, cb, opt_appIdHash, opt_logMsgUrl, opt_caller) {
  var self = this;

  function directlyOpenGnubby() {
    var gnubby = new Gnubby();

    var properties = self.getKnownDeviceProperties_(which, forEnroll);
    if (properties) {
      if (properties.readAppletVersion) {
        gnubby.readAppletVersion = properties.readAppletVersion;
      }
      if (properties.readFirmwareVersion) {
        gnubby.readFirmwareVersion = properties.readFirmwareVersion;
      }
    }

    self.setCloseHook_(which, gnubby);
    gnubby.open(which, GnubbyEnumerationTypes.ANY, function(rc) {
      if (rc) {
        cb(rc, gnubby);
        return;
      }
      gnubby.sync(function(rc) {
        cb(rc, gnubby);
      });
    }, opt_caller);
  }

  if (!opt_appIdHash ||
      opt_appIdHash !=
      GoogleCorpIndividualAttestation.GOOGLE_CORP_APP_ID_HASH) {
    console.log(UTIL_fmt('opening gnubby for non-corp use directly'));
    directlyOpenGnubby();
    return;
  }
  if (this.isDeviceKnownGood_(which, forEnroll)) {
    console.log(UTIL_fmt('opening known-good gnubby directly'));
    directlyOpenGnubby();
    return;
  }

  console.log(
      UTIL_fmt('opening gnubby with unknown status via the slow path'));
  var index = JSON.stringify(which);
  var pendingOpenClient = { cb: cb, caller: opt_caller };
  if (!this.pendingOpenClients_.hasOwnProperty(index)) {
    this.pendingOpenClients_[index] = [pendingOpenClient];
    this.pendingOpenForEnroll_[index] = forEnroll;
    if (opt_logMsgUrl) {
      this.logMsgUrls_[index] = {};
      this.logMsgUrls_[index][opt_logMsgUrl] = opt_logMsgUrl;
    }
    var gnubby = new Gnubby();
    this.setCloseHook_(which, gnubby);
    gnubby.open(which, GnubbyEnumerationTypes.VID_PID,
        this.opened_.bind(this, index, gnubby), opt_caller);
  } else {
    this.pendingOpenClients_[index].push(pendingOpenClient);
    this.pendingOpenForEnroll_[index] |= forEnroll;
    if (opt_logMsgUrl) {
      if (!this.logMsgUrls_.hasOwnProperty(index)) {
        this.logMsgUrls_[index] = {};
      }
      this.logMsgUrls_[index][opt_logMsgUrl] = opt_logMsgUrl;
    }
  }
};

/**
 * Sets the close hook on the given device.
 * @param {GnubbyDeviceId} which The device id.
 * @param {Gnubby} gnubby Gnubby device.
 * @private
 */
AppletVerifyingGnubbyFactory.prototype.setCloseHook_ = function(which, gnubby) {
  gnubby.setCloseHook(this.gnubbyCloseHook_.bind(this, which, gnubby));
};

/**
 * Removes any memory of the device from the local cache.
 * @param {GnubbyDeviceId} which The device id.
 */
AppletVerifyingGnubbyFactory.prototype.removeDeviceFromCache = function(which) {
  this.knownGoodGnubbiesForEnrollOrSign_.remove(which);
  this.knownGoodGnubbiesForSign_.remove(which);
};

/**
 * Minimum applet version we can work with.
 * @const
 */
AppletVerifyingGnubbyFactory.MINIMUM_APPLET_VERSION = UTIL_HexToBytes('000402');

/**
 * Minimum applet version we want to work with. (Earlier versions are
 * sub-optimal but functional.)
 * @const
 */
AppletVerifyingGnubbyFactory.MINIMUM_DESIRED_APPLET_VERSION =
    UTIL_HexToBytes('010002');

/**
 * @param {GnubbyDeviceId} which The device id.
 * @param {boolean} forEnroll Whether the device is requested for enrolling.
 * @return {boolean} Whether the given device id is known to be ready for the
 *     requested operation (enroll or sign).
 * @private
 */
AppletVerifyingGnubbyFactory.prototype.isDeviceKnownGood_ =
    function(which, forEnroll) {
  if (this.knownGoodGnubbiesForEnrollOrSign_.update(which)) {
    return true;
  }
  if (!forEnroll && this.knownGoodGnubbiesForSign_.update(which)) {
    return true;
  }
  return false;
};

/**
 * Returns the stored properties, if any, for the known device.
 * @param {GnubbyDeviceId} which The device id.
 * @param {boolean} forEnroll Whether the device is requested for enrolling.
 * @return {Object|undefined} The device properties.
 * @private
 */
AppletVerifyingGnubbyFactory.prototype.getKnownDeviceProperties_ =
    function(which, forEnroll) {
  if (this.knownGoodGnubbiesForEnrollOrSign_.hasId(which)) {
    return this.knownGoodGnubbiesForEnrollOrSign_.getProperties(which);
  }
  if (this.knownGoodGnubbiesForSign_.hasId(which)) {
    return this.knownGoodGnubbiesForSign_.getProperties(which);
  }
  return undefined;
};

/**
 * Notifies all pending clients of the result of an open.
 * @param {string} index The index of the opened gnubby.
 * @param {number} code Status of gnubby open operation.
 * @param {Gnubby=} opt_gnubby The opened gnubby, if any.
 * @private
 */
AppletVerifyingGnubbyFactory.prototype.notifyOpenResult_ =
    function(index, code, opt_gnubby) {
  function cloneGnubby(gnubby, cb, opt_caller) {
    var g = new Gnubby();
    g.open(gnubby.which, GnubbyEnumerationTypes.ANY, function(rc) {
      if (gnubby.readAppletVersion) {
        g.readAppletVersion = gnubby.readAppletVersion;
      }
      if (gnubby.readFirmwareVersion) {
        g.readFirmwareVersion = gnubby.readFirmwareVersion;
      }
      cb(rc, g);
    }, opt_caller);
  }

  if (!code) {
    // Success: cache the gnubby.
    var properties = undefined;
    if (opt_gnubby.readAppletVersion || opt_gnubby.readFirmwareVersion) {
      properties = {
        readAppletVersion: opt_gnubby.readAppletVersion,
        readFirmwareVersion: opt_gnubby.readFirmwareVersion
      };
    }
    if (this.pendingOpenForEnroll_[index]) {
      this.knownGoodGnubbiesForEnrollOrSign_.add(opt_gnubby.which, properties);
    } else {
      this.knownGoodGnubbiesForSign_.add(opt_gnubby.which, properties);
    }
  }

  var firstGnubby = true;
  while (this.pendingOpenClients_[index].length != 0) {
    var pendingOpenClient = this.pendingOpenClients_[index].shift();
    if (code) {
      // If there was an error, simply return it.
      pendingOpenClient.cb(code, opt_gnubby);
    } else if (firstGnubby) {
      // If this was the first client awaiting this gnubby, also simply return
      // it: an unique instance was created for it.
      firstGnubby = false;
      pendingOpenClient.cb(code, opt_gnubby);
    } else {
      // This was not the first client awaiting the gnubby instance, and opening
      // it succeeded. Create a new gnubby and open it, but don't bother with
      // all the version checking: the first successful open already guaranteed
      // it's ok.
      cloneGnubby(opt_gnubby, pendingOpenClient.cb, pendingOpenClient.caller);
    }
  }
  delete this.pendingOpenClients_[index];
  delete this.pendingOpenForEnroll_[index];
};

/**
 * Called back once gnubby has been opened.
 * @param {string} index The index of the opened gnubby.
 * @param {Gnubby} gnubby at hand.
 * @param {number} code status of gnubby open operation.
 * @private
 */
AppletVerifyingGnubbyFactory.prototype.opened_ =
    function(index, gnubby, code) {
  if (code == -GnubbyDevice.OK) {
    console.log(UTIL_fmt('calling sync'));
    console.log(gnubby);
    gnubby.sync(this.synced_.bind(this, index, gnubby));
  } else {
    this.notifyOpenResult_(index, code, gnubby);
  }
};

/**
 * Called back once gnubby has been synced.
 * @param {string} index The index of the synced gnubby.
 * @param {Gnubby} gnubby at hand.
 * @param {number} code status of gnubby sync operation.
 * @private
 */
AppletVerifyingGnubbyFactory.prototype.synced_ = function(index, gnubby, code) {
  if (code == -GnubbyDevice.OK) {
    console.log(UTIL_fmt('Gnubby in sync!'));
    this.sysinfo_(gnubby,
        this.notifyOpenResult_.bind(this, index),
        this.logMessage_.bind(this, index),
        this.openVersionCheck_.bind(this, index));
  } else {
    console.log(UTIL_fmt('Failed to sync gnubby: ' + code));
    gnubby.close();
    this.notifyOpenResult_(index, code);
  }
};

/**
 * Checks whether this gnubby should have its applet updated immediately upon
 * opening it.
 * @param {string} index The index of the opened gnubby.
 * @param {Uint8Array} appletVersion The version info of the gnubby.
 * @return {VersionDisposition} Whether this gnubby should be updated.
 * @private
 */
AppletVerifyingGnubbyFactory.prototype.openVersionCheck_ =
    function(index, appletVersion) {
  if (UTIL_ltArrays(appletVersion,
                    AppletVerifyingGnubbyFactory.MINIMUM_APPLET_VERSION)) {
    console.log(UTIL_fmt('Gnubby applet stale!'));
    // Only update prior to enroll attempts.
    if (this.pendingOpenForEnroll_[index]) {
      return { needsUpdate: true, updateFailureAllowed: false };
    }
  }
  return { needsUpdate: false, updateFailureAllowed: false };
};

/**
 * @typedef {{
 *   needsUpdate: boolean,
 *   updateFailureAllowed: boolean
 * }}
 */
var VersionDisposition;

/** @typedef {function(Uint8Array): VersionDisposition} */
var VersionUpdateCheck;

/**
 * Calls sysinfo in a gnubby, as the first step in a process toward applet
 * version checking.
 * @param {Gnubby} gnubby at hand.
 * @param {FactoryOpenCallback} resultCb Called back with the result of the
 *     version check.
 * @param {Function} logMessage Called to log messages about the version check.
 * @param {VersionUpdateCheck} versionUpdateCheck A function called with the
 *     applet version to determine whether it requires updating.
 * @private
 */
AppletVerifyingGnubbyFactory.prototype.sysinfo_ =
    function(gnubby, resultCb, logMessage, versionUpdateCheck) {
  gnubby.sysinfo(
      this.sysinfoed_.bind(this, gnubby, resultCb, logMessage,
          versionUpdateCheck));
};

/**
 * Called back once gnubby sysinfo information is returned.
 * @param {Gnubby} gnubby at hand.
 * @param {FactoryOpenCallback} resultCb Called back with the result of the
 *     version check.
 * @param {Function} logMessage Called to log messages about the version check.
 * @param {VersionUpdateCheck} versionUpdateCheck A function called with the
 *     applet version to determine whether it requires updating.
 * @param {number} code the status of calling sysinfo on gnubby.
 * @param {Array} info_ab the gnubby sysinfo data.
 * @private
 */
AppletVerifyingGnubbyFactory.prototype.sysinfoed_ =
    function(gnubby, resultCb, logMessage, versionUpdateCheck, code,
             info_ab) {
  if (code == -GnubbyDevice.INVALID_CMD) {
    // Likely not corp fob; Let it continue as far as it can.
    resultCb(-GnubbyDevice.OK, gnubby);
    return;
  }
  if (code != -GnubbyDevice.OK) {
    console.log(UTIL_fmt('Failed to sysinfo gnubby: ' + code));
    gnubby.close();
    resultCb(code);
    return;
  }
  var info = new Uint8Array(info_ab);
  gnubby.appletVersion(
      this.versioned_.bind(this, gnubby, resultCb, logMessage,
          versionUpdateCheck, info));
};

/**
 * Logs a message to each distinct log message url for the gnubby index.
 * @param {string} index The index of the opened gnubby.
 * @param {string} logMsg The message to log.
 * @private
 */
AppletVerifyingGnubbyFactory.prototype.logMessage_ = function(index, logMsg) {
  if (this.logMsgUrls_[index]) {
    for (var logMsgUrl in this.logMsgUrls_[index]) {
      logMessage(logMsg, logMsgUrl);
    }
  }
};

/**
 * Called back once gnubby applet version information is returned.
 * @param {Gnubby} gnubby at hand.
 * @param {FactoryOpenCallback} resultCb Called back with the result of the
 *     version check.
 * @param {Function} logMessage Called to log messages about the version check.
 * @param {VersionUpdateCheck} versionUpdateCheck A function called with the
 *     applet version to determine whether it requires updating.
 * @param {Uint8Array} sysInfo
 * @param {number} code the status of calling appletVersion on gnubby.
 * @param {Array} info the gnubby applet version data.
 * @private
 */
AppletVerifyingGnubbyFactory.prototype.versioned_ =
    function(gnubby, resultCb, logMessage, versionUpdateCheck, sysInfo,
             code, info) {
  var self = this;
  var versionDisposition;  // Set after the version data are parsed.

  function appletUpdated(rc, text) {
    self.hideAppletUpdateWindow_(rc,
        versionDisposition && versionDisposition.updateFailureAllowed);
    if (rc == 0) {
      // All should be well now. Move along.
      resultCb(rc, gnubby);
    } else if (versionDisposition && versionDisposition.updateFailureAllowed) {
      console.log(UTIL_fmt(
          'Update server failure ignored for this optional update'));
      resultCb(0, gnubby);
    } else {
      console.log(UTIL_fmt('Gnubby applet update failed'));
      gnubby.close();
      resultCb(rc);
    }
  }

  function appletUpdate() {
    self.showAppletUpdateWindow_();
    var force = true;
    gnubby.appletUpdate('v2', force, appletUpdated);
  }

  var infoArray = new Uint8Array(info);
  var logMsg;
  if (code != -GnubbyDevice.OK) {
    console.log(UTIL_fmt('failed to info gnubby: ' + code));
    logMsg = 'log=failedtoinfognubby&rc=' + code;
    if (logMessage) logMessage(logMsg);
    if (code == 0x6d00) {
      console.log(UTIL_fmt('Gnubby applet missing!?'));
      // Applet missing, botched update? Try update it right now.
      // There is no point in trying anything with this gnubby unless
      // it gets its applet first.
      appletUpdate();
      return;
    }
  } else {
    var appletVersion = infoArray.subarray(0, 3);
    logMsg = 'appletver=' + UTIL_BytesToHex(appletVersion);
    var fwVersion = sysInfoToFirmwareVersionBytes(sysInfo);
    logMsg += '&fwver=' + UTIL_BytesToHex(fwVersion);
    if (logMessage) logMessage(logMsg);

    versionDisposition = versionUpdateCheck(appletVersion);
    if (versionDisposition.needsUpdate) {
      appletUpdate();
      return;
    } else {
      gnubby.readAppletVersion = appletVersion;
      gnubby.readFirmwareVersion = fwVersion;
      resultCb(-GnubbyDevice.OK, gnubby);
      return;
    }
  }
  gnubby.close();
  resultCb(code);
};

/**
 * The close hook that's called when a gnubby is closed. Logs the outcome of
 * the last gnubby read operation, along with the gnubby's applet and firmware
 * versions, if known.
 *
 * @param {GnubbyDeviceId} which The device id.
 * @param {Gnubby} gnubby Gnubby device.
 * @return (Promise|null) A Promise that will be resolved when the work is done,
 *     or null if nothing needs to be done.
 * @private
 */
AppletVerifyingGnubbyFactory.prototype.gnubbyCloseHook_ =
    function(which, gnubby) {
  if (!which || !gnubby) {
    return null;
  }
  var lastError = gnubby.getLastReadError();
  if (lastError === undefined) {
    return null;
  }
  var logMsg = 'log=closeoutcome&rc=' + lastError;
  if (gnubby.readAppletVersion) {
    var appletVersionString = UTIL_BytesToHex(gnubby.readAppletVersion);
    logMsg += 'appletver=' + appletVersionString;
  }
  if (gnubby.readFirmwareVersion) {
    var fwVersionString = UTIL_BytesToHex(gnubby.readFirmwareVersion);
    logMsg += '&fwver=' + fwVersionString;
  }
  var index = JSON.stringify(which);
  this.logMessage_(index, logMsg);
  delete this.logMsgUrls_[index];
  return null;
};

/**
 * Shows the applet update window.
 * @private
 */
AppletVerifyingGnubbyFactory.prototype.showAppletUpdateWindow_ = function() {
  // Ref count the window, in case multiple applet updates end up in flight
  // simultaneously.
  this.appletUpdateWindowRef_++;
  var height = 240;
  var width = 640;
  var createWindowOptions = {
    'id': 'appletupdate',
    'minHeight': height,
    'minWidth': width,
    'maxHeight': height,
    'maxWidth': width,
    'frame': 'none'
  };
  chrome.app.window.create('appletupdate.html', createWindowOptions);
};

/**
 * Hides the applet update window, if appropriate.
 * @param {number} rc The applet update return code.
 * @param {boolean} updateFailureAllowed Whether applet update failures are
 *     allowed for this gnubby.
 * @private
 */
AppletVerifyingGnubbyFactory.prototype.hideAppletUpdateWindow_ =
    function(rc, updateFailureAllowed) {
  var lastWindow = (--this.appletUpdateWindowRef_ == 0);
  var appWindow = chrome.app.window.get('appletupdate');
  if (appWindow) {
    if (rc && !updateFailureAllowed) {
      // Let the user know the update failed.
      var data = {
        'type': 'update-failed',
        'rc': rc
      };
      appWindow.contentWindow.postMessage(data, '*');
      // Re-show the window, in case it lost focus.
      appWindow.show(true);
      if (lastWindow) {
        window.setTimeout(function() { appWindow.close(); }, 3000);
      }
    } else if (lastWindow) {
      appWindow.close();
    }
  }
};

/**
 * Enumerates gnubbies.
 * @param {function(number, Array<GnubbyDeviceId>)} cb
 */
AppletVerifyingGnubbyFactory.prototype.enumerate = function(cb) {
  this.gnubbies_.enumerate(cb);
};

/**
 * Checks whether this gnubby should have its applet updated when it's known
 * not to be enrolled.
 * @param {Uint8Array} appletVersion The version info of the gnubby.
 * @return {VersionDisposition} Whether this gnubby should be updated.
 * @private
 */
AppletVerifyingGnubbyFactory.prototype.notEnrolledVersionCheck_ =
    function(appletVersion) {
  if (UTIL_ltArrays(appletVersion,
                    AppletVerifyingGnubbyFactory.
                        MINIMUM_DESIRED_APPLET_VERSION)) {
    console.log(UTIL_fmt('Gnubby applet stale!'));
    return { needsUpdate: true, updateFailureAllowed: true };
  }
  return { needsUpdate: false, updateFailureAllowed: false };
};

/**
 * Called during enrollment to check whether a gnubby known not to be enrolled
 * is allowed to enroll in its present state. Upon completion of the check, the
 * callback is called.
 * @param {Gnubby} gnubby The not-enrolled gnubby.
 * @param {string} appIdHash The base64-encoded hash of the app id for which
 *     the gnubby being enrolled.
 * @param {FactoryOpenCallback} cb Called with the result of the prerequisite
 *     check. (A non-zero status indicates failure.)
 */
AppletVerifyingGnubbyFactory.prototype.notEnrolledPrerequisiteCheck =
    function(gnubby, appIdHash, cb) {
  if (appIdHash == GoogleCorpIndividualAttestation.GOOGLE_CORP_APP_ID_HASH) {
    this.sysinfo_(gnubby, cb, null, this.notEnrolledVersionCheck_.bind(this));
    return;
  }
  cb(DeviceStatusCodes.OK_STATUS, gnubby);
};
