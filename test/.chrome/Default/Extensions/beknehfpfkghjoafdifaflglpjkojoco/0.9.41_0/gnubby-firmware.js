/**
 * @fileoverview Gnubby methods related to firmware updating.
 */
'use strict';

// USB firmware update section.
// GOOGLE-INTENRAL //depot/google3/security/tools/gnubby/gnubbyd/gnubby_if.h

Gnubby.DFU_IMG_SIZE = 0x4000;  // 16K max
Gnubby.DFU_SIG_SIZE = 0x100;
Gnubby.DFU_LOAD_BEGIN = 0xfe;
Gnubby.DFU_LOAD_COMMIT = 0xff;
Gnubby.DFU_BLOCK_SIZE = 0x100;
Gnubby.DFU_CMD_SIZE = (Gnubby.DFU_BLOCK_SIZE + 4);

/**
 * Update fob firmware.
 * @param {Uint8Array} fw firmware image.
 * @param {Function=} cb callback.
 */
Gnubby.prototype.firmwareUpdate = function(fw, cb) {
  if (!cb) cb = Gnubby.defaultCallback;

  var u8 = new Uint8Array(Gnubby.DFU_CMD_SIZE);
  var firmware = new Uint8Array(Gnubby.DFU_IMG_SIZE);
  var size = fw.length - Gnubby.DFU_SIG_SIZE;

  // Signature is last DFU_SIG_SIZE bytes.
  var signature = fw.subarray(size, fw.length);

  // Pad firmware image with 0xff
  var i = 0;
  for (; i < fw.length; ++i) firmware[i] = fw[i];
  for (; i < firmware.length; ++i) firmware[i] = 0xff;

  var self = this;

  var blockno = 0;

  /**
   * @param {number} rc
   * @param {ArrayBuffer=} data
   */
  function sent(rc, data) {

    console.log(UTIL_fmt('sent: ' + rc));
    if (rc == 0) {
      if (blockno < firmware.length / Gnubby.DFU_BLOCK_SIZE) {
        u8[0] = blockno;
        // Copy block into command buffer.
        for (var i = 0; i < Gnubby.DFU_BLOCK_SIZE; ++i) {
          u8[4 + i] = firmware[blockno * Gnubby.DFU_BLOCK_SIZE + i];
        }
        self.exchange_(GnubbyDevice.CMD_DFU, u8.buffer,
            Gnubby.NORMAL_TIMEOUT, sent);
        ++blockno;
      } else {
        u8[0] = Gnubby.DFU_LOAD_COMMIT;
        u8[2] = size & 255;
        u8[3] = (size >> 8) & 255;
        // Copy signature into command buffer.
        for (var i = 0; i < signature.length; ++i) {
          u8[4 + i] = signature[i];
        }
        self.wink(
            function() {
                self.dev.updating = true;
                self.exchange_(GnubbyDevice.CMD_DFU, u8.buffer,
                    Gnubby.SHORT_TIMEOUT,
                    function(rc) {
                      // We expect timeout or gone here.
                      // Note if signature was wrong we still see timeout :-/
                      // By not having a read pending we cannot get error
                      // responses regarding the signature anymore.
                      if (rc == -GnubbyDevice.TIMEOUT ||
                          rc == -GnubbyDevice.GONE) rc = 0;
                      window.setTimeout(function() { cb(rc); }, 500);
                    });
            }
        );
      }
    } else {
      cb(rc);
    }
  };

  // Start firmware update.
  this.exchange_(GnubbyDevice.CMD_DFU, new Uint8Array([Gnubby.DFU_LOAD_BEGIN]),
      Gnubby.NORMAL_TIMEOUT, sent);
};
