// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * Initialize the host list.
 *
 * @param {function(string)} handleConnect Function to call to connect to the
 *     host with |hostId|.
 */
remoting.initHostlist_ = function(handleConnect) {
  remoting.hostController = new remoting.HostController();
  remoting.hostList = new remoting.HostList(
      base.getHtmlElement('host-list'),
      base.getHtmlElement('host-list-empty'),
      base.getHtmlElement('host-list-error-message'),
      base.getHtmlElement('host-list-refresh-failed-button'),
      base.getHtmlElement('host-list-loading-indicator'),
      remoting.showErrorMessage,
      handleConnect);

  isHostModeSupported_().then(function(/** boolean */ supported) {
    if (supported) {
      var noShare = document.getElementById('unsupported-platform-message');
      noShare.parentNode.removeChild(noShare);
    } else {
      var button = document.getElementById('share-button');
      button.disabled = true;
    }
  });

  var onLoad = function() {
    // Parse URL parameters.
    var urlParams = base.getUrlParameters();
    if ('mode' in urlParams) {
      if (urlParams['mode'] === 'me2me') {
        var hostId = urlParams['hostId'];
        handleConnect(hostId);
        return;
      }
    }
    // No valid URL parameters, start up normally.
    remoting.initHomeScreenUi();
  }
  remoting.hostList.load(onLoad);
}

/**
 * Returns whether Host mode is supported on this platform for It2Me.
 *
 * @return {Promise} Resolves to true if Host mode is supported.
 */
function isHostModeSupported_() {
  if (remoting.HostInstaller.canInstall()) {
    return Promise.resolve(true);
  }
  return remoting.HostInstaller.isInstalled();
}

/**
 * initHomeScreenUi is called if the app is not starting up in session mode,
 * and also if the user cancels pin entry or the connection in session mode.
 */
remoting.initHomeScreenUi = function() {
  remoting.setMode(remoting.AppMode.HOME);
  var dialog = base.getHtmlElement('paired-clients-list');
  var message = base.getHtmlElement('paired-client-manager-message');
  var deleteAll = base.getHtmlElement('delete-all-paired-clients');
  var close = base.getHtmlElement('close-paired-client-manager-dialog');
  var working = base.getHtmlElement('paired-client-manager-dialog-working');
  var error = base.getHtmlElement('paired-client-manager-dialog-error');
  var noPairedClients = base.getHtmlElement('no-paired-clients');
  remoting.pairedClientManager =
      new remoting.PairedClientManager(remoting.hostController, dialog, message,
                                       deleteAll, close, noPairedClients,
                                       working, error);
  // Display the cached host list, then asynchronously update and re-display it.
  remoting.updateLocalHostState();
  remoting.hostList.refresh().then(remoting.updateLocalHostState);
  remoting.butterBar = new remoting.ButterBar();
};

/**
 * Fetches local host state and updates the DOM accordingly.
 */
remoting.updateLocalHostState = function() {
  /**
   * @param {remoting.HostController.State} state Host state.
   */
  var onHostState = function(state) {
    if (state == remoting.HostController.State.STARTED) {
      remoting.hostController.getLocalHostId(onHostId.bind(null, state));
    } else {
      onHostId(state, null);
    }
  };

  /**
   * @param {remoting.HostController.State} state Host state.
   * @param {string?} hostId Host id.
   */
  var onHostId = function(state, hostId) {
    remoting.hostList.setLocalHostStateAndId(state, hostId);
    remoting.hostList.display();
  };

  /**
   * @param {boolean} response True if the feature is present.
   */
  var onHasFeatureResponse = function(response) {
    /**
     * @param {!remoting.Error} error
     */
    var onError = function(error) {
      console.error('Failed to get pairing status: ' + error.toString());
      remoting.pairedClientManager.setPairedClients([]);
    };

    if (response) {
      remoting.hostController.getPairedClients(
          remoting.pairedClientManager.setPairedClients.bind(
              remoting.pairedClientManager),
          onError);
    } else {
      console.log('Pairing registry not supported by host.');
      remoting.pairedClientManager.setPairedClients([]);
    }
  };

  remoting.hostController.hasFeature(
      remoting.HostController.Feature.PAIRING_REGISTRY).
      then(onHasFeatureResponse);
  remoting.hostController.getLocalHostState(onHostState);
};

/**
 * Entry point for test code. In order to make test and production
 * code as similar as possible, the same entry point is used for
 * production code, but since production code should never have
 * 'source' set to 'test', it continue with initialization
 * immediately. As a fail-safe, the mechanism by which initialization
 * completes when under test is controlled by a simple UI, making it
 * possible to use the app even if the previous assumption fails to
 * hold in some corner cases.
 */
remoting.startDesktopRemotingForTesting = function() {
  var urlParams = base.getUrlParameters();
  if (urlParams['source'] === 'test') {
    document.getElementById('browser-test-continue-init').addEventListener(
        'click', remoting.startDesktopRemoting, false);
    document.getElementById('browser-test-deferred-init').hidden = false;
  } else {
    remoting.startDesktopRemoting();
  }
}

/**
 * @param {!remoting.Error} error The failure reason.
 */
remoting.showErrorMessage = function(error) {
  l10n.localizeElementFromTag(
      document.getElementById('token-refresh-error-message'),
      error.getTag());
  var auth_failed = (error.hasTag(remoting.Error.Tag.AUTHENTICATION_FAILED));
  if (auth_failed && base.isAppsV2()) {
    remoting.handleAuthFailureAndRelaunch();
  } else {
    document.getElementById('token-refresh-auth-failed').hidden = !auth_failed;
    document.getElementById('token-refresh-other-error').hidden = auth_failed;
    remoting.setMode(remoting.AppMode.TOKEN_REFRESH_FAILED);
  }
};


remoting.startDesktopRemoting = function() {
  remoting.app = new remoting.DesktopRemoting();
  remoting.app.start();
};

window.addEventListener('load', remoting.startDesktopRemotingForTesting, false);
