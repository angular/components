/**
 * @fileoverview Implements a whitelist of external request helpers.
 * @author juanlang@google.com (Juan Lang)
 */
'use strict';

/**
 * Implements a whitelist of external request helpers.
 * @constructor
 */
function RequestHelperWhitelist() {
  /**
   * Maps extension id -> mnemonic
   * @private {Object<string, string>}
   */
  this.allowedExtensionIds_ = {};
  /**
   * Maps b64(sha256(extension id)) -> mnemonic
   * @private {Object<string, string>}
   */
  this.allowedBlindedExtensionIds_ = {};
}

/**
 * @param {string} id Extension id.
 * @return {boolean} Whether this extension is allowed by this whitelist.
 */
RequestHelperWhitelist.prototype.isExtensionAllowed = function(id) {
  return this.getExtensionMnemonicOrEmptyString_(id) != null;
};

/**
 * @param {string} id Extension id.
 * @return {?string} The mnemonic for this extension id, or null if none was
 *     set or this extension is not allowed.
 */
RequestHelperWhitelist.prototype.getExtensionMnemonic = function(id) {
  var mnemonic = this.getExtensionMnemonicOrEmptyString_(id);
  if (mnemonic == '') {
    return null;
  }
  return mnemonic;
};

/**
 * @param {string} id Extension id.
 * @return {?string} The mnemonic for this extension id, which may be the empty
 *     string if none was set, or null if this extension id is not allowed.
 * @private
 */
RequestHelperWhitelist.prototype.getExtensionMnemonicOrEmptyString_ =
    function(id) {
  if (this.allowedExtensionIds_.hasOwnProperty(id)) {
    return this.allowedExtensionIds_[id];
  }
  var blindedId = B64_encode(sha256HashOfString(id));
  if (this.allowedBlindedExtensionIds_.hasOwnProperty(blindedId)) {
    return this.allowedBlindedExtensionIds_[blindedId];
  }
  return null;
};

/**
 * Adds the extension id to the whitelist.
 * @param {string} id Extension id.
 * @param {string=} opt_mnemonic Name by which to refer to this extension.
 */
RequestHelperWhitelist.prototype.addAllowedExtension =
    function(id, opt_mnemonic) {
  this.allowedExtensionIds_[id] = opt_mnemonic || '';
};

/**
 * Adds the blinded extension id to the whitelist.
 * @param {string} blindedId Blinded extension id, i.e. Base64-encoded SHA256
 *     hash of the extension id.
 * @param {string=} opt_mnemonic Name by which to refer to this extension.
 */
RequestHelperWhitelist.prototype.addAllowedBlindedExtension =
    function(blindedId, opt_mnemonic) {
  this.allowedBlindedExtensionIds_[blindedId] = opt_mnemonic || '';
};
