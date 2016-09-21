// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
* @fileoverview
* The current v1 web-app allows users to sign in as any user. Some users may
* be signed in using a different account than their chrome profile.  When these
* users upgrade to the v2 app, their host list will be empty and it is not
* obvious why.  remoting.AppsV2Migration shows a migration tip to the user to
* sign in to their previous accounts if necessary.
*/

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

// Storage key used for the migration settings.
var MIGRATION_KEY_ = 'remoting-v2-migration';

/**
 * @param {string} email
 * @param {string} fullName
 * @constructor
 */
remoting.MigrationSettings = function(email, fullName) {
  this.email = email;
  this.fullName = fullName;
};

remoting.AppsV2Migration = function() {};

/**
 * @return {Promise} A Promise object that would resolve to
 *   {remoting.MigrationSettings} if the user has previously signed-in to
 *   the v1 app with a different account that has hosts registered to it.
 *   Otherwise, the promise will be rejected.
 */
remoting.AppsV2Migration.hasHostsInV1App = function() {
  if (!base.isAppsV2()) {
    return Promise.reject(false);
  }

  var getV1UserInfo = base.Promise.as(chrome.storage.local.get,
                                       [MIGRATION_KEY_],
                                       chrome.storage.local);
  var getEmail = remoting.identity.getEmail();

  return Promise.all([getV1UserInfo, getEmail]).then(
    /** @param {Object} results */
    function(results){
      var v1User =
          /**@type {remoting.MigrationSettings} */ (results[0][MIGRATION_KEY_]);
      var currentEmail = /** @type {string}*/ (results[1]);

      if (v1User && v1User.email && v1User.email !== currentEmail) {
        return Promise.resolve(v1User);
      }
      return Promise.reject(false);
    }
  );
};

/**
 * @param {string} email
 * @param {string} fullName
 * @return {string}
 */
remoting.AppsV2Migration.buildMigrationTips = function(email, fullName) {
  var params = [
      fullName,
      email,
      '<a href="https://support.google.com/chrome/answer/2364824?hl=en" ' +
         'target="_blank">',
      '</a>'];
  return l10n.getTranslationOrError(
      /*i18n-content*/'HOST_LIST_EMPTY_V2_MIGRATION', params);
};

/**
 * Saves the email and full name of the current user as the migration settings
 * in the v1 app.  Clears the migration settings in the v2 app.
 */
remoting.AppsV2Migration.saveUserInfo = function() {
  if (base.isAppsV2()) {
    chrome.storage.local.remove(MIGRATION_KEY_);
  } else {
    remoting.identity.getUserInfo().then(
        /** @param {{email:string, name:string}} userInfo */
        function(userInfo) {
          var preference = {};
          preference[MIGRATION_KEY_] =
              new remoting.MigrationSettings(userInfo.email, userInfo.name);
          chrome.storage.local.set(preference);
        }).catch(base.doNothing);
  }
};

}());
