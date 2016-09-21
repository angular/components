// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var remoting = remoting || {};

(function() {

'use strict';

/**
 * @param {HTMLElement} rootElement
 * @param {remoting.LocalHostSection.Controller} controller
 *
 * @constructor
 * @implements {base.Disposable}
 */
remoting.LocalHostSection = function(rootElement, controller) {
  /** @private */
  this.rootElement_ = rootElement;
  /** @private */
  this.controller_ = controller;
  /** @private {remoting.Host} */
  this.host_ = null;
  /** @private {remoting.HostController.State} */
  this.state_ = remoting.HostController.State.UNKNOWN;

  var hostContainer = rootElement.querySelector('.host-entry');
  /** @private */
  this.hostTableEntry_ = new remoting.HostTableEntry(
      parseInt(chrome.runtime.getManifest().version, 10),
      controller.connect.bind(controller),
      this.rename_.bind(this));
  hostContainer.appendChild(this.hostTableEntry_.element());
  this.hostTableEntry_.element().id = 'local-host-connect-button';

  var startButton = rootElement.querySelector('.start-daemon');
  var stopButton = rootElement.querySelector('.stop-daemon');
  var stopLocalDaemonButton = rootElement.querySelector('.stop-local-daemon');
  var changePINButton = rootElement.querySelector('.change-daemon-pin');

  /** @private */
  this.eventHooks_ = new base.Disposables(
      new base.DomEventHook(startButton, 'click',
                            controller.start.bind(controller), false),
      new base.DomEventHook(stopButton, 'click',
                            controller.stop.bind(controller), false),
      new base.DomEventHook(stopLocalDaemonButton, 'click',
                            controller.stop.bind(controller), false),
      new base.DomEventHook(changePINButton, 'click',
                            controller.changePIN.bind(controller), false));
  /** @private */
  this.hasError_ = false;
};

remoting.LocalHostSection.prototype.dispose = function() {
  base.dispose(this.eventHooks_);
  this.eventHooks_ = null;
};

/**
 * @param {remoting.Host} host
 * @param {remoting.HostController.State} state
 * @param {boolean} hasError Whether the host list is in an error state.
 */
remoting.LocalHostSection.prototype.setModel = function(host, state, hasError) {
  this.host_ = host;
  this.state_ = state;
  this.hasError_ = hasError;
  this.updateUI_();
};

/**
 * @return {?string}
 */
remoting.LocalHostSection.prototype.getHostId = function() {
  return this.host_ ? this.host_.hostId : null;
};

/** @return {boolean} */
remoting.LocalHostSection.prototype.isEnabled_ = function() {
  return (this.state_ == remoting.HostController.State.STARTING) ||
      (this.state_ == remoting.HostController.State.STARTED);
};

/** @return {boolean} */
remoting.LocalHostSection.prototype.canChangeState = function() {
  // The local host cannot be stopped or started if the host controller is not
  // implemented for this platform.
  var state = this.state_;
  if (state === remoting.HostController.State.NOT_IMPLEMENTED ||
      state === remoting.HostController.State.UNKNOWN) {
    return false;
  }

  // Return false if the host is uninstallable.  The NOT_INSTALLED check is
  // required to handle the special case for Ubuntu, as we report the host as
  // uninstallable on Linux.
  if (!this.isMe2MeInstallable_() &&
      state === remoting.HostController.State.NOT_INSTALLED) {
    return false;
  }

  // In addition, it cannot be started if there is an error (in many error
  // states, the start operation will fail anyway, but even if it succeeds, the
  // chance of a related but hard-to-diagnose future error is high).
  return this.isEnabled_() || !this.hasError_;
};

/**
 * Returns true if the current platform is fully supported. It's only used when
 * we detect that host native messaging components are not installed. In that
 * case the result of this function determines if the webapp should show the
 * controls that allow to install and enable Me2Me host.
 *
 * @return {boolean}
 * @private
 */
remoting.LocalHostSection.prototype.isMe2MeInstallable_ = function() {
  // The chromoting host is currently not installable on ChromeOS.
  // For Linux, we have a install package for Ubuntu but not other distros.
  // Since we cannot tell from javascript alone the Linux distro the client is
  // on, we don't show the daemon-control UI for Linux unless the host is
  // installed.
  return remoting.platformIsWindows() || remoting.platformIsMac();
}

/** @private */
remoting.LocalHostSection.prototype.updateUI_ = function() {
  this.hostTableEntry_.setHost(this.host_);

  // Disable elements.
  var enabled = this.isEnabled_();
  var canChangeLocalHostState = this.canChangeState();
  var daemonState = '';
  if (!enabled) {
    daemonState = 'disabled';
  } else if (this.host_ !== null) {
    daemonState = 'enabled';
  } else {
    daemonState = 'enabled-other-account';
  }
  remoting.updateModalUi(daemonState, 'data-daemon-state');
  this.rootElement_.hidden = !canChangeLocalHostState;
};

remoting.LocalHostSection.prototype.rename_ = function() {
  return this.controller_.rename(this.hostTableEntry_);
};

/**
 * @constructor
 * @param {remoting.HostList} hostList
 * @param {remoting.HostSetupDialog} setupDialog
 * @param {function(string)} handleConnect  Function to call to connect to the
 *     host with |hostId|.
 */
remoting.LocalHostSection.Controller =
    function(hostList, setupDialog, handleConnect) {
  /** @private */
  this.hostList_ = hostList;
  /** @private */
  this.setupDialog_ = setupDialog;
  /** @private */
  this.handleConnect_ = handleConnect;
};

remoting.LocalHostSection.Controller.prototype.start = function() {
  this.setupDialog_.showForStart();
};

remoting.LocalHostSection.Controller.prototype.stop = function() {
  this.setupDialog_.showForStop();
};

remoting.LocalHostSection.Controller.prototype.changePIN = function() {
  this.setupDialog_.showForPin();
};

/** @param {remoting.HostTableEntry} host */
remoting.LocalHostSection.Controller.prototype.rename = function(host) {
  this.hostList_.renameHost(host);
};

/** @param {string} hostId */
remoting.LocalHostSection.Controller.prototype.connect = function(hostId) {
  this.handleConnect_(hostId);
};

}());

