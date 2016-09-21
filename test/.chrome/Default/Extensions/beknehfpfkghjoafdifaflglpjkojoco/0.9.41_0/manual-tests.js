/**
 * @fileoverview Manual tests for testing with a real, live gnubby.
 */
'use strict';

function _defaultCallback(reply) {
  console.log(UTIL_fmt('reply:'));
  console.log(reply);
}

function _testMessage(request, opt_callback) {
  var callback = opt_callback || _defaultCallback;
  messageHandler(
      request,
      {
        'id': chrome.runtime.id
      },
      callback);
}

function _testWebMessage(request, opt_callback) {
  var callback = opt_callback || _defaultCallback;
  messageHandler(
      request,
      {
        'url': 'https://security.google.com/'
      },
      callback);
}

function testPkRead(which, alternate) {
  which = which | 0;
  alternate = alternate || false;
  var request = {
    'type': 'SSH_PUBKEY',
    'challenge': UTIL_BytesToHex(UTIL_getRandom(16)),
    'which': which,
    'alternate': alternate
  };
  _testMessage(request);
}

function testCertWrite(which, promote) {
  which = which | 0;
  promote = promote || false;
  var request = {
    'type': 'SSH_CERT_WRITE',
    'cert' : UTIL_BytesToHex([0, 0, 0, 1, which]),
    'which': which,
    'promote': promote
  };
  _testMessage(request);
}

function testCertRead(which) {
  which = which | 0;
  var request = {
    'type': 'SSH_CERT_READ',
    'which': which
  };
  _testMessage(request);
}

function testEnroll(nonGoogle, opt_callback) {
  var request = {
    'type': MessageTypes.U2F_REGISTER_REQUEST,
    'registerRequests': [
      {
      'version': 'U2F_V1',
      'challenge': 'BDzzo5lwTLFLT4jksVvGqk89l_qDiqVygweYOFS1HfJ3Pu-V-Vh4PKApkSbv_Z9EtP4YXF1dqJBaIGJravt4MrQ',
      'appId': GoogleCorpIndividualAttestation.GOOGLE_CORP_APP_ID +
                   (nonGoogle ? '?testingNonCorpAppId' : '')
      },
      {
      'version': 'U2F_V2',
      'challenge': 'BDzzo5lwTLFLT4jksVvGqk89l_qDiqVygweYOFS1HfJ3Pu-V-Vh4PKApkSbv_Z9EtP4YXF1dqJBaIGJravt4MrQ',
      'appId': GoogleCorpIndividualAttestation.GOOGLE_CORP_APP_ID +
                   (nonGoogle ? '?testingNonCorpAppId' : '')
      }
    ],
    'signRequests': [],
    'logMsgUrl': 'http://localhost:8080/'
  };
  _testWebMessage(request, opt_callback);
}

function testSshAgent() {
  var data = [SSH2_AGENTC_REQUEST_IDENTITIES];
  var request = {
    'type': 'auth-agent@openssh.com',
    'data': data
  };
  _testMessage(request);
}

function testGetVersion() {
  var data = [SSH2_AGENTC_GNUBBY_GET_VERSION];
  var request = {
    'type': 'auth-agent@openssh.com',
    'data': data
  };
  _testMessage(request);
}

function testSingleSigner(opt_instances, opt_timeoutSeconds) {
  var DEFAULT_GNUBBY_INSTANCES = 10;
  var gnubbyInstances = opt_instances || DEFAULT_GNUBBY_INSTANCES;
  var DEFAULT_TIMEOUT_SECONDS = 1;
  var seconds = opt_timeoutSeconds || DEFAULT_TIMEOUT_SECONDS;
  var g = new Gnubby();
  var emptyHash = sha256HashOfString('');
  var gnubbyId;
  var DELAY_INCREMENT = 100;
  var delay = 0;

  function makeSingleSigner(challenge, seconds) {
    return function() {
      var s = new SingleGnubbySigner(
          gnubbyId,
          false,
          function(result) {
            console.log(UTIL_fmt('SingleSignerResult:'));
            console.log(result);
            if (result.gnubby) {
              result.gnubby.close();
            }
          },
          FACTORY_REGISTRY.getCountdownFactory().createTimer(seconds * 1000)
          );
      window.setTimeout(function() {
        s.doSign([challenge]);
      }, delay);
      delay += DELAY_INCREMENT;
    }
  }

  function testLoop(keyHandle) {
    var challenge = {
      challengeHash: emptyHash,
      appIdHash: emptyHash,
      keyHandle: keyHandle,
      version: 'U2F_V2'
    };
    console.log(challenge);
    for (var i = 0; i < gnubbyInstances; i++) {
      makeSingleSigner(challenge, seconds)();
    }
  }

  function enrolled(rc, opt_info) {
    if (rc == 0x6985) {
      window.setTimeout(function() {
        g.enroll(emptyHash, emptyHash, enrolled);
      }, 200);
      return;
    }

    g.close();
    g = null;

    console.log(UTIL_fmt(rc));
    if (rc) {
      return;
    }
    var u8 = new Uint8Array(opt_info);
    console.log(UTIL_fmt('enroll response: ' + UTIL_BytesToHex(u8)));
    var parsedEnrollResponse = parseEnrollResponse(u8);
    console.log(UTIL_fmt('key handle: ' +
        UTIL_BytesToHex(parsedEnrollResponse.keyHandle)));
    testLoop(parsedEnrollResponse.keyHandle);
  }

  function opened(rc) {
    if (rc) {
      console.warn(UTIL_fmt('open failed: ' + rc));
      return;
    }
    g.enroll(emptyHash, emptyHash, enrolled);
  }

  function enumerated(rc, gnubbyIds) {
    if (rc) {
      console.warn(UTIL_fmt('enumerate failed: ' + rc));
      return;
    }
    if (!gnubbyIds.length) {
      console.warn(UTIL_fmt('no gnubbies'));
      return;
    }
    gnubbyId = gnubbyIds[0];

    // Open a gnubby to get a key handle out of it.
    g.open(gnubbyId, opened);

  }

  gnubbies.enumerate(enumerated);
}

function getAttestationCertificate(nonGoogle, opt_cb) {
  function printAttestationCert(msg) {
    if (msg.rc) {
      console.warn(UTIL_fmt(msg.msg));
      return;
    }
    console.log(UTIL_fmt('attestation certificate: ' + B64_encode(msg.cert)));
  }

  var callback = opt_cb || printAttestationCert;
  var msg;
  function enrolled(reply) {
    if (!reply) {
      callback({ rc: -1, msg: 'Reply missing' });
      return;
    }
    if (reply.type != 'u2f_register_response') {
      msg = 'Got unexpected enroll response ' + reply.type;
      callback({ rc: -1, msg: msg });
      return;
    }
    if (reply.code) {
      msg = 'Enroll failed: ' + reply.code;
      callback({ rc: -1, msg: msg });
      return;
    }
    if (!reply.responseData) {
      msg = 'Enroll had missing responseData';
      callback({ rc: -1, msg: msg });
      return;
    }
    if (!reply.responseData.registrationData) {
      msg = 'Enroll had missing registrationData';
      callback({ rc: -1, msg: msg });
      return;
    }
    var u8 = new Uint8Array(B64_decode(reply.responseData.registrationData));
    var parsedEnrollResponse = parseEnrollResponse(u8);
    if (!parsedEnrollResponse) {
      msg = 'Failed to parse enroll response';
      callback({ rc: -1, msg: msg });
      return;
    }
    callback({ rc: 0, cert: parsedEnrollResponse.cert });
  }

  testEnroll(nonGoogle, enrolled);
}

function getCplc(opt_cb) {
  function fail(rc) {
    console.warn(UTIL_fmt('rc: ' + rc));
    releaseGnubby(g, cb.bind(null, rc));
  }

  // Parses the raw CPLC data, as defined in section 4.5 of the JCOP V 2.4.2
  // R1 admin manual.
  function parseCplc(u8) {
    var parsedCplc = {};
    parsedCplc.fab = (u8[3] << 8) | u8[4];
    parsedCplc.type = (u8[5] << 8) | u8[6];
    parsedCplc.osId = (u8[7] << 8) | u8[8];
    parsedCplc.osReleaseDate = (u8[9] << 8) | u8[10];
    parsedCplc.osReleaseLevel = (u8[11] << 8) | u8[12];
    parsedCplc.icFabDate = (u8[13] << 8) | u8[14];
    parsedCplc.icSerialNumber =
        (u8[15] << 24) | (u8[16] << 16) | (u8[17] << 8) | u8[18];
    parsedCplc.icBatchId = (u8[19] << 8) | u8[20];
    parsedCplc.icModuleFabricator = (u8[21] << 8) | u8[22];
    parsedCplc.isModulePkgDate = (u8[23] << 8) | u8[24];
    parsedCplc.iccManufacturer = (u8[25] << 8) | u8[26];
    parsedCplc.icEmbeddingDate = (u8[27] << 8) | u8[28];
    parsedCplc.icPrePersonalizer = (u8[29] << 8) | u8[30];
    parsedCplc.icPrePersonalizerEquipmentDate = (u8[31] << 8) < u8[32];
    parsedCplc.icPrePersonalizerEquipmentId =
        (u8[33] << 24) | (u8[34] << 16) | (u8[35] << 8) | u8[36];
    parsedCplc.icPersonalizer = (u8[37] << 8) | u8[38];
    parsedCplc.icPersonalizerEquipmentDate = (u8[39] << 8) < u8[40];
    parsedCplc.icPersonalizerEquipmentId =
        (u8[41] << 24) | (u8[42] << 16) | (u8[43] << 8) | u8[44];
    return parsedCplc;
  }

  function shortToHex(s) {
    return UTIL_BytesToHex([(s >> 8) & 0xff, s & 0xff]);
  }

  function longToHex(l) {
    return UTIL_BytesToHex(
        [(l >> 24) & 0xff, (l >> 16) & 0xff, (l >> 8) & 0xff, l & 0xff]);
  }

  function printCplc(rc, data) {
    if (rc) {
      console.warn(UTIL_fmt('rc: ' + rc));
      return;
    }
    var parsedCplc = parseCplc(new Uint8Array(data));
    var cplcString =
        shortToHex(parsedCplc.icFabDate)
        + longToHex(parsedCplc.icSerialNumber)
        + shortToHex(parsedCplc.icBatchId);
    console.log(UTIL_fmt('CPLC: ' + cplcString));
  }

  var g = new Gnubby();
  var cb;
  if (opt_cb) {
    cb = opt_cb;
  } else {
    cb = printCplc;
  }

  var defaultLockTime = 5;

  g.open(null, GnubbyEnumerationTypes.ANY, function(rc) {
    g.sync(function(rc) {
      if (rc != 0) {
        fail(rc);
        return;
      }
      var lockTime = new Uint8Array([defaultLockTime]);
      g.lock(lockTime.buffer, function(rc) {
        if (rc != 0) {
          fail(rc);
          return;
        }
        g.cplc(function(rc, data) {
          if (rc != 0) {
            fail(rc);
            return;
          }
          cb(rc, data);
          releaseGnubby(g);
        });
      });
    });
  }, 'manual-tests.js:getCplc');
}
