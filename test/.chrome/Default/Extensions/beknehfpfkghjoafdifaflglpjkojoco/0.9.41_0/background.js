/**
 * @fileoverview gnubbyd in javascript
 */

'use strict';

/** @const */
var BROWSER_SUPPORTS_TLS_CHANNEL_ID = true;

/** @const */
var HTTP_ORIGINS_ALLOWED = false;

// Show gnubbyd options window.
// If window already is open, reload it.
function gnubbyd_options() {
  function open_options() {
    chrome.app.window.create(
      'options.html',
      { 'id': 'options', 'frame': 'none' },
      function(w) {
        if (w) {
          w.show();
          w.focus();
        }
      });
  }

  var w = chrome.app.window.get('options');
  if (w) {
    w.onClosed.addListener(open_options);
    w.close();
  } else {
    open_options();
  }
}

chrome.app.runtime.onLaunched.addListener(function() {
  gnubbyd_options();
});

// Pay attention to pending updates.
chrome.runtime.onUpdateAvailable.addListener(function(details) {
  chrome.runtime.reload();
});

// Singleton tracking available devices.
var gnubbies = new Gnubbies();
// Only include HID support if it's available in this browser. Register it
// first, though, because it's more likely to succeed on HID devices than
// chrome.usb is, on platforms where chrome.usb can see HID devices as well as
// non-HID ones (Linux in particular.)
if (chrome.hid) {
  HidGnubbyDevice.register(gnubbies);
}
UsbGnubbyDevice.register(gnubbies);

// Try to release all our usb handles at suspend time.
chrome.runtime.onSuspend.addListener(function() {
  console.log(UTIL_fmt('onSuspend'));
  gnubbies.closeAll();
});


// SSH / ECredz applet session table.
// Some requests take multiple round-trips between gnubbyd (this)
// and a client. To preserve lock and applet select state across calls,
// clients can specify a time along with SSH_UNLOCK.
// Upon successful unlock, gnubbyd will keep a session on that gnubby for
// that duration.
var ssh_sessions = {};

var USB_HELPER = new UsbHelper();
initSshAgent(USB_HELPER);

var requestHelper = new RegisteringHelper();
var FACTORY_REGISTRY = (function() {
  var windowTimer = new WindowTimer();
  var xhrTextFetcher = new XhrTextFetcher();
  return new FactoryRegistry(
      new GoogleAppIdCheckerFactory(xhrTextFetcher),
      new GoogleApprovedOrigins(),
      new CountdownTimerFactory(windowTimer),
      new GstaticOriginChecker(),
      requestHelper,
      windowTimer,
      xhrTextFetcher);
})();

var readyToServe = false;

// Note we must register message handlers right here in order to properly
// resume from inactivity.
registerExternalMessageHandlers();

/**
 * Initializes request helpers.
 * @return {Promise} A promise that resolves when initialization is complete.
 */
function initRequestHelpers() {
  requestHelper.addHelper(USB_HELPER);

  var nativeFwd = lookForSshForwardHelper();

  var nfcReaderAppId = lookForNfcReader();

  return Promise.all([nativeFwd, nfcReaderAppId]);
}

initRequestHelpers().then(function() {
  readyToServe = true;
});

var DEVICE_FACTORY_REGISTRY = new DeviceFactoryRegistry(
    new AppletVerifyingGnubbyFactory(gnubbies),
    FACTORY_REGISTRY.getCountdownFactory(),
    new GoogleCorpIndividualAttestation());

function setNfcReaderAppId(app_id) {
  chrome.storage.local.set({nfc_reader_app_id: app_id});
}

/**
 * Looks for the SSH forward helper.
 * @return {Promise} Promise with the result of the check.
 */
function lookForSshForwardHelper() {
  return new Promise(function(resolve) {
    // Look for the SSH forward helper.
    chrome.storage.local.get('disable_forward_to_native', function(stored) {
      if (chrome.runtime.lastError || !stored['disable_forward_to_native']) {
        resolve(SshForwardHelper.lookForSshForwardHelper(requestHelper));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Looks for the NFC reader helper.
 * @return {Promise} Promise with the result of the check.
 */
function lookForNfcReader() {
  return new Promise(function(resolve) {
    // Look for the NFC helper.
    chrome.storage.local.get('nfc_reader_app_id', function(stored) {
      if (!chrome.runtime.lastError && stored && stored.nfc_reader_app_id) {
        registerExternalHelper(stored.nfc_reader_app_id);
        setNfcReaderAppId(stored.nfc_reader_app_id);
      }
      resolve();
    });
  });
}

var CORPLOG_URL = 'https://login.corp.google.com/gnubbylog?';

/**
 * Web url of CA front-end.
 * @const
 */
var CA_FRONT_END_PREFIX = 'https://ca-service.corp.google.com/';
var CA_EXTENDED_FRONT_END_PREFIX = 'https://ca-service-extended.corp.google.com/';

/**
 * Web urls of login.corp
 * @const
 */
var CORP_LOGIN_PREFIX = 'https://login.corp.google.com/';
var CORP_LOGIN_DEV_PREFIX = 'https://login-dev.corp.google.com/';
var CORP_LOGIN_TEST_PREFIX = 'https://login-test.corp.google.com/';

function isCorpLoginServer(url) {
    return (url.indexOf(CORP_LOGIN_PREFIX) == 0 ||
            url.indexOf(CORP_LOGIN_DEV_PREFIX) == 0 ||
            url.indexOf(CORP_LOGIN_TEST_PREFIX) == 0);
}

function isCAServer(url) {
    return (url.indexOf(CA_FRONT_END_PREFIX) == 0 ||
            url.indexOf(CA_EXTENDED_FRONT_END_PREFIX) == 0);
}

function isWebAction(request) {
  if (!request || !request.type)
    return false;
  switch (request.type) {
    case MessageTypes.U2F_REGISTER_REQUEST:
    case MessageTypes.U2F_SIGN_REQUEST:
      return true;

    default:
      return false;
  }
}

/**
 * B64-encoded SHA256 hash of the NFC reader helper app's ID.
 * @const
 */
var NFC_READER_APP_ID_HASH = 'waX0Zzc7EWrFxv4mf7JH1E1qDXv8nb6kRWVd1CZfO20';

/**
 * Whitelist of allowed external request helpers.
 */
var HELPER_WHITELIST = new RequestHelperWhitelist();
HELPER_WHITELIST.addAllowedBlindedExtension(NFC_READER_APP_ID_HASH, 'NFC');

/**
 * @param {string} senderId of app that sent a message
 * @return {boolean} Whether sender app is the remote helper app.
 */
function isNfcReaderApp(senderId) {
  return NFC_READER_APP_ID_HASH == B64_encode(sha256HashOfString(senderId));
}

/**
 * Registers the given extension as an external helper.
 * @param {string} id Extension id.
 */
function registerExternalHelper(id) {
  var helperAppConfig = {
    appId: id,
    sendMessage: chrome.runtime.sendMessage,
    defaultError: DeviceStatusCodes.TIMEOUT_STATUS
  };
  var source = HELPER_WHITELIST.getExtensionMnemonic(id);
  if (source) {
    helperAppConfig.source = source;
  }
  var externalHelper = new ExternalHelper(helperAppConfig);
  requestHelper.addHelper(externalHelper);
}

/**
 * "Public" methods.
 * @param {string?} method Method being called.
 * @return {boolean} Whether that method is considered "public".
 */
function publicSshMethod(method) {
  if (method) switch (method) {
    case 'SSH_CERT_READ':
    case 'SSH_PUBKEY':
      return true;
  }
  return false;
}

/**
 * "Public" method access control.
 * @param {string} id ID of caller.
 * @return {boolean} Whether access to "public" methods is allowed.
 */
function allowedToAccessPublicMethods(id) {
  return ((',mohffmbglhghdkfeipidgcneaebcfpim' +  // corp ssh monitor
           ','
        ).indexOf(',' + id + ',') != -1);
}

/**
 * SshAgent access control.
 * @param {string} id     ID of caller.
 * @param {string?} method Method being called.
 * @return {boolean} Whether access to ssh-agent is allowed.
 */
function allowedToAccessSshAgent(id, method) {
  if (publicSshMethod(method) && allowedToAccessPublicMethods(id)) {
    return true;
  }

  return ((',npcpnahjfihkilahpohiieimoffneflm' +  // sshinawin
           ',kkpmmflhpippiifdmlopcgacojnmniei' +  // sshinawin dev
           ',eooeadjobbbigamjlmofdhdjofjhahkd' +  // sshinatab
           ',omhfcecceikimagjkahpkicpegpcegdi' +  // sshinatab dev
           ',pnhechapfaindjhompbnflcldabbghjo' +  // Secure Shell
           ',okddffdblfhhnmhodogpojmfkjmhinfp' +  // Secure Shell dev
           ',gbchcmhmhahfdphkhkmpfmihenigjmpp' +  // Chrome Remote Desktop (rel)
           ',ljacajndfccfgnfohlgkdphmbnpkjflk' +  // chromoting-dev
           ',odkaodonbgfohohmklejpjiejmcipmib' +  // Chrome Remote Desktop (qa)
           ',dokpleeekgeeiehdhmdkeimnkmoifgdd' +  // Chrome Remote Desktop (qa2)
           ',ajoainacpilcemgiakehflpbkbfipojk' +  // Chromoting v2 (internal)
           ',ooiklbnjmhbcgemelgfhaeaocllobloj' +  // Mosh
           ',hmgggebkhjjkiimkjlknpdgapncghehh' +  // Mosh (dev)
           ',cbmogpclfjjiiabiglhcaapnanpaocfd' +  // GCSA dev
           ',glbijnegiodlbbhiekfdahpopmibbjgl' +  // GCSA stable
           ',' + chrome.runtime.id + ','          // self
        ).indexOf(',' + id + ',') != -1);
}

/**
 * Pattern for sender.url matching SSH relay servers.
 * @const
 */
var SSH_RELAY_HOSTNAME_REGEXP =
    /^https:\/\/[a-z][a-z][a-z]\.r\.ext\.google\.com:8022\/.*/;

/**
 * Ssh relay message access control.
 * @param {string} id of destination.
 * @return {boolean} Whether message forwarding is allowed.
 */
function allowedToReceiveRelayMessage(id) {
  return ((',npcpnahjfihkilahpohiieimoffneflm' +  // sshinawin
           ',kkpmmflhpippiifdmlopcgacojnmniei' +  // sshinawin dev
           ',eooeadjobbbigamjlmofdhdjofjhahkd' +  // sshinatab
           ',omhfcecceikimagjkahpkicpegpcegdi' +  // sshinatab dev
           ',pnhechapfaindjhompbnflcldabbghjo' +  // Secure Shell
           ',okddffdblfhhnmhodogpojmfkjmhinfp' +  // Secure Shell dev
           ',').indexOf(',' + id + ',') != -1);
}

/**
 * Check destination and forward request on if allowed.
 * @param {Object} request to relay.
 * @param {Object} sender of request.
 * @param {function(*)} sendResponse callback.
 */
function handleSshRelayMessage(request, sender, sendResponse) {
  if (!allowedToReceiveRelayMessage(request.id)) {
    console.warn('refusing to relay request to ' + request.id);
    return;
  }

  chrome.runtime.sendMessage(request.id, request, undefined, sendResponse);
}

/**
 * @typedef {{
 *   type: string,
 *   sessionId: string,
 *   block: number,
 *   token: (Uint8Array|Array|Object),
 *   data: (Uint8Array|Array|Object|undefined)
 * }}
 */
var EcrMessage;

/**
 * @typedef {{
 *   type: string,
 *   sessionId: string,
 *   which: number,
 *   token: (Uint8Array|Array|Object),
 *   fp: (Uint8Array|Array|Object),
 *   input: (Uint8Array|Array|Object|undefined)
 * }}
 */
var E2eMessage;

/**
 * Message handler for request coming from 2sv broker or sshinatab and friends.
 * This should return true if unsafeSendResponse will be called asynchronously,
 * or Chrome will destroy it as soon as this event handler returns.
 * @return {boolean}
 */
function messageHandler(request, sender, unsafeSendResponse) {
  // Make sure sendResponse as called below does not throw up.
  // Typically 'Attempting to use a disconnected port object' occurs.
  function sendResponse(r) {
    try {
      unsafeSendResponse(r);
    } catch (e) {
      console.warn(UTIL_fmt('caught: ' + e.message));
    }
  }

  console.log(UTIL_fmt('onMessageExternal listener: ' + request.type));
  console.log(UTIL_fmt('request'));
  // Try not log PIN on console.
  var savedPIN = request.pin;
  if (savedPIN) {
    request.pin = '(redacted security key password)';
  }
  console.log(request);
  if (savedPIN) {
    request.pin = savedPIN;
  }
  console.log(UTIL_fmt('sender'));
  console.log(sender);

  // Verify sender is whitelisted for requested action(s).
  if (sender.id) {
    // Helper registration? Check whether the extension is whitelisted.
    if (request === sender.id &&
        HELPER_WHITELIST.isExtensionAllowed(sender.id)) {
      registerExternalHelper(sender.id);
      if (isNfcReaderApp(sender.id)) {
        setNfcReaderAppId(sender.id);
        sendResponse(/** @type {ExternalHelperAck} */ ({rc: 0}));
      }
      return false;
    }

    // Other app / extension is calling.
    // Check against whitelists.
    if (!allowedToAccessSshAgent(sender.id, request.type)) {
      sendResponse({'rc': 666});
      return false;
    }
  } else {
    // Caller is web page.
    if (isCAServer(sender.url)) {
      handleSshAgentCommand(request, sender, sendResponse);
    } else if (SSH_RELAY_HOSTNAME_REGEXP.test(sender.url)) {
      handleSshRelayMessage(request, sender, sendResponse);
    } else if (isCorpLoginServer(sender.url) && request &&
        !isWebAction(request)) {
      var g = new Gnubby();
      check_Gnubby(g, request, function(rc, text) {
        sendResponse({
          'rc': rc,
          'message': text});
        g.close();
      });
    } else {
      handleWebPageRequest(request, sender, sendResponse);
    }
    return true;
  }

  var g = new Gnubby();

  var defaultLockTime = 5;
  var isSession = false;

  // If caller claims to have a session, try find it.
  if (request.sessionId) {
    if (ssh_sessions[request.sessionId]) {
      g = ssh_sessions[request.sessionId];
      isSession = true;
    }
  }

  function releaseAndSendResponse(response) {
    if (!isSession) {
      g.unlock(function(rc) {
        g.close();
        if (response) sendResponse(response);
      });
    } else {
      // In a session; keep lock alive.
      if (response) sendResponse(response);
    }
  };

  function fail(rc) {
    if (rc == -GnubbyDevice.OTHER) {
      // Badness. Likely SSH applet in a hissy and might recover with a reset.
      // Alternatively, this condition tends to get fixed by re-insert.
      logMessage('gnubby.reset', CORPLOG_URL);
      g.reset(function() {
        releaseAndSendResponse({'rc': rc});
      });
    } else {
      releaseAndSendResponse({'rc': rc});
    }
  };

  // Call gnubby f() with SSH applet locked and selected.
  function call_on_SSH_applet(f) {
    if (isSession) {
      // We have a gnubby session, ready to go.
      f();
      return;
    }

    g.open(null, GnubbyEnumerationTypes.VID_PID, function(rc, gnubbies) {
      if (rc != 0) { fail(rc); return; }
      g.sync(function(rc) {
        if (rc != 0) { fail(rc); return; }
        var lockTime = new Uint8Array([defaultLockTime]);
        g.lock(lockTime.buffer, function(rc) {
          if (rc != 0) { fail(rc); return; }
          g.selectSSH(function(rc, data) {
            if (rc != 0) { fail(rc); return; }
            f();
          });
        });
      });
    });
  };

  /**
   * Parse a public key from a binary array into JSON object.
   * @param {Uint8Array} bytes to parse from.
   * @param {Object} resp response to fill in.
   * @return {number} of bytes consumed.
   */
  function parsePublicKey(bytes, resp) {
    var off = 0;

    // Check whether the key at hand also certifies its flags and slot.
    // If so, pass on that meta data in resp.
    if (bytes[off] & SSH2_KF_META_ATTEST) {
      resp.meta = UTIL_BytesToHex(bytes.subarray(off, 3 + off));
      off += 3;
    }

    var isRSA = (bytes[off] == 0x01) || (bytes[off] == 0x03);
    var isECDSA = (bytes[off] == 0x04);

    if (isRSA) {
      var el = (bytes[off] == 0x03) ? 1 : 3;
      resp.exponent = UTIL_BytesToHex(bytes.subarray(off, el + off));
      off += el;
      var apk = UTIL_BytesToHex(bytes.subarray(off, 256 + off));
      if (bytes[off] >= 0x80) { apk = '00' + apk; }
      resp.publickey = apk;
      off += 256;
    } else if (isECDSA) {
      resp.publickey = UTIL_BytesToHex(bytes.subarray(off, 65 + off));
      off += 65;
    }

    return off;
  };

  var handlers = {
    'SSH_KEYGEN':
      function() { call_on_SSH_applet(
        function() {
          g.generateProtectedKey(UTIL_HexToBytes(request.pin),
            function(rc) {
              releaseAndSendResponse({'rc': rc});
            });
        });
      },

    'SSH_VERSION':
      function() { call_on_SSH_applet(
          function() {
            var res = {};
            g.appletVersion(function(rc, data) {
              res.rc = rc;
              if (rc) {
                releaseAndSendResponse(res);
                return;
              }
              var u8 = new Uint8Array(data);
              res.sshVersion = [u8[0], u8[1], u8[2]];
              g.unlock(function(rc) {
                res.rc = rc;
                if (rc) {
                  releaseAndSendResponse(res);
                  return;
                }
                g.appletVersion(function(rc, data) {
                  res.rc = rc;
                  if (rc) {
                    releaseAndSendResponse(res);
                    return;
                  }
                  var u8 = new Uint8Array(data);
                  res.u2fVersion = [u8[0], u8[1], u8[2]];
                  releaseAndSendResponse(res);
                });
              });
            });
          });
      },

    'SSH_UNLOCK':
      function() {
        if (request.ecdh) {
          var ecdh = request.ecdh;
          var wants_session = false;
          var flags = 0;

          if (typeof request.duration === 'number') {
            // Client requests a multi-message session.
            defaultLockTime = request.duration;
            wants_session = true;
          }

          if (typeof request.which === 'number') {
            flags = request.which;
          } else {
            // Client failed to specify its key preference.
            // Currently we have two cases:
            // - regular SSH, which does not require a session.
            // - ecredz, which requires a session.
            if (wants_session) {
              flags = Gnubby.UNLOCK_ECREDZ;
            } else {
              flags = Gnubby.UNLOCK_SSH;
            }
          }

          call_on_SSH_applet(
            function() {
              g.unlockProtectedKey(
                  ecdh, request.pin, flags, function(rc, data) {
                var resp = {'rc': rc};
                if (data) {
                  resp.token = UTIL_BytesToHex(new Uint8Array(data));

                  if (wants_session) {
                    // Sessionize this gnubby.
                    isSession = true;

                    // Encrypted token works nicely as sessionId.
                    var sessionId = resp.token;
                    ssh_sessions[sessionId] = g;
                    resp.sessionId = sessionId;

                    // Start fail-safe release timer.
                    // Well-behaved client will have cleaned this up earlier.
                    window.setTimeout(function() {
                        var gnubby = ssh_sessions[sessionId];
                        if (gnubby) {
                          console.log(
                              UTIL_fmt('session ' + sessionId + ' expired'));
                          gnubby.unlock(function() { gnubby.close(); });
                          delete ssh_sessions[sessionId];
                        }
                      }, defaultLockTime * 1000 + 500);
                  }
                }
                releaseAndSendResponse(resp);
              });
            });
        }
      },

    'SSH_CERT_WRITE':
      function() {
        call_on_SSH_applet(function() {
          var which = request.which | 0;
          var cert = UTIL_HexToBytes(request.cert);
          var promote_alternate = request.promote || false;
          g.certWrite(which, cert, promote_alternate, function(rc) {
            releaseAndSendResponse({'rc': rc});
          });
        });
      },

    'SSH_CERT_READ':
      function() {
        call_on_SSH_applet(function() {
          var which = request.which | 0;
          g.certRead(which, function(rc, data) {
            var resp = {'rc': rc};
            if (rc == 0) {
              resp.cert = UTIL_BytesToHex(new Uint8Array(data));
            }
            releaseAndSendResponse(resp);
          });
        });
      },

    'ECR_READ':
      function() {
        if (!isSession) {
          fail(410);
          return;
        }
        var ecrRequest = /** @type {EcrMessage} */ (request);
        g.ecredsRead(ecrRequest.block,
                     UTIL_HexToBytes(ecrRequest.token),
          function(rc, data) {
            var resp = {'rc': rc};
            if (data) {
              resp.data = UTIL_BytesToHex(new Uint8Array(data));
            }
            releaseAndSendResponse(resp);
          });
      },

    'ECR_WRITE':
      function() {
        if (!isSession) {
          fail(410);
          return;
        }
        var ecrRequest = /** @type {EcrMessage} */ (request);
        g.ecredsWrite(ecrRequest.block,
                      UTIL_HexToBytes(ecrRequest.token),
                      UTIL_HexToBytes(ecrRequest.data),
          function(rc, data) {
            var resp = {'rc': rc};
            if (data) {
              resp.data = UTIL_BytesToHex(new Uint8Array(data));
            }
            releaseAndSendResponse(resp);
          });
      },

    'SSH_RELEASE':
      function() {
        delete ssh_sessions[request.sessionId];
        if (request.reset) {
          if (isSession) {
            isSession = false;
            logMessage('gnubby.reset', CORPLOG_URL);
            g.reset(function() {
              releaseAndSendResponse({'rc': 0});
            });
            return;
          }
        }
        isSession = false;
        releaseAndSendResponse({'rc': 0});
      },

    'SSH_SIGN':
      function() { call_on_SSH_applet(
        function() {
          var which = request.which | 0;
          g.signProtectedKey(UTIL_HexToBytes(request.token),
                             which,
                             request.input,
                             function(rc, data) {
            if (data) {
              var bytes = new Uint8Array(data);
              var resp = { 'rc': rc };

              var off = parsePublicKey(bytes, resp);

              // Signature.
              resp.signature = UTIL_BytesToHex(bytes.subarray(off));

              releaseAndSendResponse(resp);
            } else {
              releaseAndSendResponse({'rc': rc});
            }
          });
        });
      },

    'SSH_PUBKEY':
      function() { call_on_SSH_applet(
        function() {
          var which = request.which | 0;
          var alternate = request.alternate || false;
          g.getProtectedPublicKey(UTIL_HexToBytes(request.challenge),
                                  which, alternate, function(rc, data) {
            if (data) {
              var bytes = new Uint8Array(data);
              var resp = { 'rc': rc };

              var off = parsePublicKey(bytes, resp);

              // Secure channel data.
              resp.ecdh = UTIL_BytesToHex(bytes.subarray(off, off + 65));
              off += 65;

              // Attestation data.
              resp.devicekey = UTIL_BytesToHex(bytes.subarray(off, off + 65));
              off += 65;
              resp.fingerprint = UTIL_BytesToHex(bytes.subarray(off, off + 32));
              off += 32;
              resp.signature = UTIL_BytesToHex(bytes.subarray(off));

              releaseAndSendResponse(resp);
            } else {
              releaseAndSendResponse({'rc': rc});
            }
          });
        });
      },

    'E2E_DECRYPT':
      function() {
        var e2eRequest = /** @type {E2eMessage} */ (request);

        if (!isSession) {
          call_on_SSH_applet(function() {
            g.e2eDecrypt(e2eRequest.which | 0,
                UTIL_HexToBytes(e2eRequest.token),
                UTIL_HexToBytes(e2eRequest.fp),
                UTIL_HexToBytes(e2eRequest.input),
                function(rc, data) {
                  var resp = {'rc': rc};
                  if (data) {
                    resp.encrypted_key = UTIL_BytesToHex(new Uint8Array(data));
                  }
                  releaseAndSendResponse(resp);
                });
          });
        } else {
          g.e2eDecrypt(e2eRequest.which | 0,
              UTIL_HexToBytes(e2eRequest.token),
              UTIL_HexToBytes(e2eRequest.fp),
              UTIL_HexToBytes(e2eRequest.input),
              function(rc, data) {
                var resp = {'rc': rc};
                if (data) {
                  resp.encrypted_key = UTIL_BytesToHex(new Uint8Array(data));
                }
                releaseAndSendResponse(resp);
              });
        }
      },

    'APPLET_INSTALL':
      function() {
        check_Gnubby(g, request, function(rc, text) {
          releaseAndSendResponse({
            'rc': rc,
            'message': text});
        });
      },

    'STATUS':
      function() {
        check_Gnubby(g, {}, function(rc, text) {
          releaseAndSendResponse({
            'rc': rc,
            'message': text});
        });
      },

    'HELLO':
      function() {
        sendResponse({'rc': 0, 'message': 'success'});
      },

    'GET_LOG':
      function() {
        sendResponse({'rc': 0, 'logs': UTIL_events});
      },

    'OPTIONS':
      function() {
        gnubbyd_options();
      },

    'auth-agent@openssh.com':
      function() {
        handleSshAgentCommand(request, sender, sendResponse);
      }
  };

  var f = handlers[request.type];
  if (f) {
    f.call(null);
  } else {
    var handler = USB_HELPER.getHandler(request);
    if (handler && (request.type == 'sign_helper_request')) {
      handler.run(sendResponse);
    } else {
      sendResponse({'rc': 99,
                    'message': 'Unknown request "' + request.type + '"'});
      return false;
    }
  }

  return true;
}

// Defer to messageHandler, but busy-wait first until readyToServe.
function waitingMessageHandler(request, sender, sendResponse) {
  if (readyToServe) {
    return messageHandler(request, sender, sendResponse);
  } else {
    console.log(UTIL_fmt('not ready to serve yet..'));
    window.setTimeout(
        waitingMessageHandler.bind(null, request, sender, sendResponse),
        100);
    return true;
  }
}

// Listen to self for options page asking for stuff.
chrome.runtime.onMessage.addListener(waitingMessageHandler);

function registerExternalMessageHandlers() {
  // Listen to others (sshinatab, ..)
  chrome.runtime.onMessageExternal.addListener(waitingMessageHandler);

  // Listen to connection events, and wire up a message handler on the port.
  chrome.runtime.onConnectExternal.addListener(function(port) {
    var onInitialMessage = function(request) {
      console.log(UTIL_fmt('request'));
      console.log(request);
      port.onMessage.removeListener(onInitialMessage);
      switch (request.type) {
        case 'auth-agent@openssh.com':
          if (port.sender.id && allowedToAccessSshAgent(port.sender.id, null)) {
            handleSshAgentConnect(port, request);
          } else {
            port.disconnect();
          }
          break;
        default:
          // TODO(mschilder): acl check?
          handleWebPageConnect(port, request);
        break;
      }
    };
    port.onMessage.addListener(onInitialMessage);
  });
}

/**
 * Set-up listeners for webpage connect.
 * @param {Object} port connection is on.
 * @param {Object} request that got received on port.
 */
function handleWebPageConnect(port, request) {
  var closeable;

  var onMessage = function(request) {
    console.log(UTIL_fmt('request'));
    console.log(request);
    closeable = handleWebPageRequest(request, port.sender,
        function(response) {
          response['requestId'] = request['requestId'];
          port.postMessage(response);
        });
  };

  var onDisconnect = function() {
    port.onMessage.removeListener(onMessage);
    port.onDisconnect.removeListener(onDisconnect);
    if (closeable) closeable.close();
  };

  port.onMessage.addListener(onMessage);
  port.onDisconnect.addListener(onDisconnect);

  // Start work on initial message.
  onMessage(request);
}
