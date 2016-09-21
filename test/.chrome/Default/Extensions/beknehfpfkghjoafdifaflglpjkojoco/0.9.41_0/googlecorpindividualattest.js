/**
 * @fileoverview Provides a Google corp implementation of IndividualAttestation.
 */
'use strict';

/**
 * Google corp implementation of IndividualAttestation that requests
 * individual certificates for corp accounts.
 * @constructor
 * @implements IndividualAttestation
 */
function GoogleCorpIndividualAttestation() {}

/**
 * @param {string} appIdHash The app id hash.
 * @return {boolean} Whether to request the individual attestation certificate
 *     for this app id.
 */
GoogleCorpIndividualAttestation.prototype.requestIndividualAttestation =
    function(appIdHash) {
  return appIdHash == GoogleCorpIndividualAttestation.GOOGLE_CORP_APP_ID_HASH;
};

/**
 * App ID used by Google employee accounts.
 * @const
 */
GoogleCorpIndividualAttestation.GOOGLE_CORP_APP_ID =
    'https://www.gstatic.com/securitykey/a/google.com/origins.json';

/**
 * Hash of the app ID used by Google employee accounts.
 * @const
 */
GoogleCorpIndividualAttestation.GOOGLE_CORP_APP_ID_HASH =
    B64_encode(sha256HashOfString(
        GoogleCorpIndividualAttestation.GOOGLE_CORP_APP_ID));
