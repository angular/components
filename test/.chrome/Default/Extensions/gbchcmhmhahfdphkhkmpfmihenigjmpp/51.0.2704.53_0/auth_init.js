// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * Initialize the identity and authentication components.
 *
 * @return {void} Nothing.
 */
remoting.initIdentity = function() {
  if (base.isAppsV2()) {
    // TODO(jamiewalch): Add a getAuthDialog method to Application.Delegate
    // to allow this behaviour to be customized.
    remoting.identity =
        new remoting.Identity(remoting.AuthDialog.getInstance());
  } else {
    // TODO(garykac) Remove this and replace with identity.
    remoting.oauth2 = new remoting.OAuth2();
    var oauth2 = /** @type {*} */ (remoting.oauth2);
    remoting.identity = /** @type {remoting.Identity} */ (oauth2);
    if (!remoting.identity.isAuthenticated()) {
      remoting.AuthDialog.getInstance().show().then(function() {
        remoting.oauth2.doAuthRedirect(function(){
          window.location.reload();
        });
      });
    }
  }
};

/**
 * Removes the cached token and restarts the app.
 *
 * @return {void}  Nothing.
 */
remoting.handleAuthFailureAndRelaunch = function() {
  remoting.identity.removeCachedAuthToken().then(function(){
    if (base.isAppsV2()) {
      base.Ipc.invoke('remoting.ActivationHandler.restart',
                      chrome.app.window.current().id);
    } else {
      window.location.reload();
    }
  });
};
