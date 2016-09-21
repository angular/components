/**
 * @fileoverview Background page handlers for front-end options.html
 */
'use strict';

/**
 * Clears any cached device info for the given gnubby.
 * @param {Gnubby} g The gnubby.
 */
function clearDeviceCache(g) {
  var appletGnubbyFactory =
      /** @type {AppletVerifyingGnubbyFactory} */
      (DEVICE_FACTORY_REGISTRY.getGnubbyFactory());
  appletGnubbyFactory.removeDeviceFromCache(g.which);
}

/**
 * Check state of gnubby firmware and applet(s).
 *
 * @param {Gnubby} g
 * @param {Object} request Applet update action to take.
 * @param {function(number, (Object|string))} callback to call.
 * @param {(number|undefined)} opt_id optional gnubby index to use.
 */
function check_Gnubby(g, request, callback, opt_id) {
  var gnubbyIndex;

  var action = request.action;
  var firmwareVersion;
  var gnubbyVersion;
  var sshVersion;
  var sshHasPin;
  var errorLog;

  function unlockFail(rc) {
    g.unlock(function() { fail(rc); });
  }

  function fail(rc) {
    if (rc == 0) {
      // Since so far things appear to be working,
      // check and update a couple of things, if needed,
      // before returning to the caller.

      if (action) {
        // Take this action once.
        var thisAction = action;
        action = null;

        // Feeling lucky?
        if (thisAction == 'sudoResetEverything') {
          // Reply with full logs on error.
          errorLog = UTIL_events;

          // Delete all applets; install all applets; set PIN.
          // 1st delete ssh applet.
          g.appletUpdate('ssh&v2&delete', true, function(rc) {
            if (rc != 0) { fail(rc); return; }
            // 2nd delete u2f applet.
            clearDeviceCache(g);
            g.appletUpdate('v2&delete', true, function(rc) {
              if (rc != 0) { fail(rc); return; }
              // 3rd install u2f applet.
              g.appletUpdate('v2', true, function(rc) {
                if (rc != 0) { fail(rc); return; }
                // 4th install ssh applet.
                g.appletUpdate('ssh&v2', true, function(rc) {
                  if (rc != 0) { fail(rc); return; }
                  setSshPin(request.pin, function(rc) {
                    if (rc != 0) { fail(rc); return; }
                    // Fetch updated version data.
                    // Reset traits to undefined since we
                    // want to re-read them post-action.
                    firmwareVersion = undefined;
                    gnubbyVersion = undefined;
                    sshVersion = undefined;
                    sshHasPin = undefined;
                    errorLog = undefined;
                    getFirmwareVersion();
                  });
                });
              });
            });
          });
          return;
        }

        // Check for firmware update requests.
        if (thisAction == 'fwSelect') {
          var version = request.version;
          var firmware = firmware_getImage(version);

          if (firmware) {
            g.lock(10, function(rc) {
              if (rc != 0) {
                fail(rc);
              } else {
                g.firmwareUpdate(UTIL_HexToBytes(firmware),
                    function(rc) {
                      if (rc == 0) firmwareVersion = version;
                      fail(rc);
                    });
              }
            });
            return;
          }
        }

        // Handle set/clear emergency.
        if (thisAction == 'setEmergency' || thisAction == 'clearEmergency') {
          var v = (thisAction == 'setEmergency');
          if (sshAgent) sshAgent.setEmergency(v);
          getFirmwareVersion();
          return;
        }

        // Deletes are always forced.
        // Others have to specify '&force' themselves.
        var force = (thisAction.indexOf('&delete') != -1);
        clearDeviceCache(g);
        g.appletUpdate(thisAction,
                       force,
                       function(rc) {
          if (rc != 0) {
            // Make a couple of update server application level errors
            // more legible.
            switch (rc) {
              case 509:  // RC_BANDWIDTH_EXCEEDED; overload
                callback(rc,
                  'Update server overloaded. Try again later?');
                break;
              case 403: {
                var msg = 'Cannot reach update server.';
                msg += ' Make sure you have a valid machine certificate.';
                callback(rc, msg);
              } break;
              case 412: { // RC_PRECOND_FAILED; Unknown cplc
                var msg;
                if (gnubby_isPilotVersion(gnubbyVersion)) {
                   msg = 'Old pilot gnubby cannot be updated.';
                   msg += ' Replace and mail this one to mschilder@';
                } else {
                   msg = 'Device not known to update server (yet).';
                   msg += ' Try again later?';
                }
                callback(rc, msg);
              } break;
              case 418: {  // RC_IM_A_TEAPOT; portunus down
                var msg;
                msg = 'Update server crypto backend unavailable.';
                msg += ' Try again later?';
                callback(rc, msg);
              } break;
              case 410:  // RC_GONE; lost session
                callback(rc,
                  'Lost session with update server. Reload to retry?');
                break;
              default:
                fail(rc);  // report this fresh error.
                break;
            }
          } else {
            // Fetch updated version data.
            // Reset traits to undefined since we
            // want to re-read them post-action.
            firmwareVersion = undefined;
            gnubbyVersion = undefined;
            sshVersion = undefined;
            sshHasPin = undefined;
            getFirmwareVersion();
          }
        });
        return;
      }

      // Now that no action is pending, make sure firmware is up to date.
      if (firmware_needsUpdate(firmwareVersion)) {
        g.lock(10, function(rc) {
          if (rc != 0) {
            fail(rc);  // report this fresh error.
          } else {
            // Note we cannot try get updated version data,
            // since the gnubby g died on us due to firmware update.
            // Only thing left to do after firmware update is to
            // return to caller.
            g.firmwareUpdate(UTIL_HexToBytes(firmware_currentVersion),
                function(rc) {
                  if (rc == 0) firmwareVersion = firmware_currentVersionString;
                  fail(rc);
                });
          }
        });
        return;
      }
    }

    callback(rc,
        {
          'rc': rc,
          'firmwareVersion': firmwareVersion,
          'gnubbyVersion': gnubbyVersion,
          'sshVersion': sshVersion,
          'sshHasPin': sshHasPin,
          'errorLog': errorLog,
          'emergencyMode': sshAgent && sshAgent.getEmergency()
        });
  }

  function setSshPin(pin, callback) {
    g.lock(3, function(rc) {
      if (rc != 0) { callback(rc); return; }
      g.selectSSH(function(rc) {
        if (rc != 0) { g.unlock(callback.bind(null, rc)); return; }
        g.generateProtectedKey(UTIL_HexToBytes(request.pin), function(rc) {
          g.unlock(callback.bind(null, rc));
        });
      });
    });
  }

  function getFirmwareVersion() {
    g.sysinfo(function(rc, data) {
      if (rc != 0) { fail(rc); return; }
      var u8 = new Uint8Array(data);
      firmwareVersion = sysInfoToFirmwareVersionString(u8);
      // Applet version will be '0.0.0' if absent.
      gnubbyVersion = sysInfoToU2fAppletVersionString(u8);
      if (gnubbyVersion == '0.0.0') {
        // No gnubby applet installed, skip getting its version.
        getSshVersion();
      } else {
        getGnubbyVersion();
      }
    });
  }

  function getGnubbyVersion() {
    g.appletVersion(function(rc, data) {
      if (rc != 0 && rc != 0x6d00) { fail(rc); return; }
      if (rc == 0x6d00) {
        gnubbyVersion = '0.0.0';
      } else {
        var u8 = new Uint8Array(data);
        gnubbyVersion = '' + u8[0] + '.' + u8[1] + '.' + u8[2];
      }
      if (gnubby_isPilotVersion(gnubbyVersion)) {
        // Old pilot gnubbies cannot handle SSH.
        // A compliant client page would not have sent this request,
        // but we make sure to not handle it here.
        if (!action || action.indexOf('&ssh') == -1) {
          fail(0);  // Done
        } else {
          callback(-1, 'Your gnubby is still too old to get SSH.');
        }
      } else {
        getSshVersion();
      }
    });
  }

  function getSshVersion() {
    g.lock(5, function(rc) {
      if (rc != 0) { fail(rc); return; }
      g.selectSSH(function(rc, data) {
        if (rc != 0) {
          if (rc > 0) {
            // Applet not installed? Check for expected error(s).

            // Set version to 0.0.0 to signal to client page to
            // suggest install.
            sshVersion = '0.0.0';
            sshHasPin = undefined;

            // 0x6a82 is healthy fail (applet not installed),
            // 0x6999 is un-healthy (causes sticky 0x6881 from then on,
            //    hence reset is needed first).
            if (rc == 0x6999) {
              // Try fix the fob by deleting the SSH applet;
              // no questions asked since it's wedged anyways.
              g.reset(function(rc) {
                if (rc) {
                  unlockFail(rc);
                  return;
                }
                g.appletUpdate('v2&ssh&delete', true, function(rc) {
                  // Let user know we nuked their SSH.
                  g.unlock(function() {
                    callback(0x6999,
                        'Removed broken SSH applet and wiped its keys.');
                  });
                });
              });
              return;
            }

            rc = 0;
          }
          unlockFail(rc);
          return;
        }
        g.appletVersion(function(rc, data) {
          if (rc != 0) { unlockFail(rc); return; }
          var u8 = new Uint8Array(data);
          sshVersion = '' + u8[0] + '.' + u8[1] + '.' + u8[2];

          // Check whether SSH applet has functioning PIN.
          var challenge = UTIL_getRandom(16);
          g.getProtectedPublicKey(challenge, 0, false,
              function(rc, data) {
                switch (rc) {
                  case 0: // TODO: verify attestation && cache ecdh, pk?
                          sshHasPin = true;
                          break;
                  case 0x63c0:  // PIN TRY COUNT == 0, e.g. locked out
                  case 0x6982:  // SW_SECURITY_STATUS_NOT_SATISFIED
                  case 0x6a82:  // SW_FILE_NOT_FOUND
                          sshHasPin = false;
                          rc = 0;  // Map expected rc to 0.
                          break;
                }
                unlockFail(rc);  // Done, unlock to switch back to main applet.
              });
        });
      });
    });
  }

  // If the NDEF file contains the play store URI, then update it to the
  // Android Application Record.
  function maybeUpdateNDEF_AAR(cb) {
    // http://apps4android.org/nfc-specifications/NFCForum-TS-Type-4-Tag_2.0.pdf
    var TNF_WELL_KNOWN = 1;
    var TNF_MIME_MEDIA = 2;
    var TNF_EXTERNAL_TYPE = 4;
    var MESSAGE_BEGINS = 0x80;
    var MESSAGE_ENDS = 0x40;
    var SHORT_RECORD = 0x10;
    var fileId = [0xE1, 0x04];
    var nonDefaultCls = 0x80;
    var selectIns = 0xA4;
    var selectByFileId = 0;
    var selectFirstOccurrence = 0x0C;
    var selectBuf = new Uint8Array([
        nonDefaultCls, selectIns, selectByFileId, selectFirstOccurrence,
        fileId.length].concat(fileId)).buffer;
    var readIns = 0xB0;
    var readOffs = 2;
    var readBuf = new Uint8Array([0, readIns, 0, readOffs]).buffer;
    var expectedURI = UTIL_StringToBytes(
        'https://play.google.com/store/apps/details?id=' +
        'com.google.android.apps.authenticator2');
    // The null byte at the beginning of the payload indicates that there is no
    // language code.
    var expected = [
        (MESSAGE_BEGINS | MESSAGE_ENDS | SHORT_RECORD | TNF_WELL_KNOWN),
        1, expectedURI.length + 1, 'URI'.charCodeAt(0), 0].concat(expectedURI);
    var mime = UTIL_StringToBytes('application/sk');
    var magic = [0xE6, 0x4F, 0x57, 0xCA];
    var androidPkg = UTIL_StringToBytes('android.com:pkg');
    var writeIns = 0xD6;
    var appId = UTIL_StringToBytes('com.google.android.apps.authenticator2');
    var aarNdef = [(MESSAGE_BEGINS | SHORT_RECORD | TNF_MIME_MEDIA),
        mime.length, magic.length].concat(mime, magic, [
        (MESSAGE_ENDS | SHORT_RECORD | TNF_EXTERNAL_TYPE), androidPkg.length,
        appId.length], androidPkg, appId);
    var writeBuf = new Uint8Array([0, writeIns, 0, 0, aarNdef.length + 2,
      0, aarNdef.length].concat(aarNdef)).buffer;
    g.apdu(selectBuf, function(rc, data) {
      data = new Uint8Array(data);
      if ((rc !== 0) ||
          (data[data.length - 2] !== 0x90) ||
          (data[data.length - 1] !== 0x00)) {
        console.log('failed to select NDEF', rc, UTIL_BytesToHex(data));
        cb();
        return;
      }
      g.apdu(readBuf, function(rc, data) {
        data = new Uint8Array(data);
        if ((rc !== 0) || (data.length !== (expected.length + 2)) ||
            (data[data.length - 2] !== 0x90) ||
            (data[data.length - 1] !== 0x00)) {
          console.log('failed to read NDEF', rc, UTIL_BytesToHex(data));
          cb();
          return;
        }
        for (var i = 0; i < expected.length; ++i) {
          if (data[i] !== expected[i]) {
            console.log('NDEF does not need updating', i,
                        UTIL_BytesToHex(data));
            cb();
            return;
          }
        }
        g.apdu(writeBuf, function(rc, data) {
          data = new Uint8Array(data);
          if ((rc !== 0) ||
              (data[data.length - 2] !== 0x90) ||
              (data[data.length - 1] !== 0x00)) {
            console.log('failed to write NDEF');
            cb();
            return;
          }
          console.log('overwrote play store url with AAR');
          cb();
        });
      });
    });
  }

  function getVersionData() {
    g.open(gnubbyIndex, GnubbyEnumerationTypes.VID_PID, function(rc) {
      if (rc) {
        callback(rc, 'Failed to open gnubby. Reload to retry?');
        return;
      }
      g.sync(function(rc) {
        g.wink(function(rc) {
          maybeUpdateNDEF_AAR(function() {
            getFirmwareVersion();
          });
        });
      });
    }, 'options-handlers.js:check_Gnubby');
  }

  if (!opt_id) {
    gnubbies.enumerate(function(rc, gnubbyIndexes) {
      if (rc || !gnubbyIndexes.length) {
        if (!gnubbyIndexes.length) rc = -GnubbyDevice.GONE;
        callback(rc, 'Insert a corp gnubby and reload?');
        return;
      }
      if (gnubbyIndexes.length != 1) {
        rc = -GnubbyDevice.TOOMANY;
        callback(rc, 'Multiple devices detected; remove all but one.');
        return;
      }
      gnubbyIndex = gnubbyIndexes[0];
      getVersionData();
    }, GnubbyEnumerationTypes.VID_PID);
    return;
  } else {
    gnubbyIndex = opt_id;
    getVersionData();
  }
}
