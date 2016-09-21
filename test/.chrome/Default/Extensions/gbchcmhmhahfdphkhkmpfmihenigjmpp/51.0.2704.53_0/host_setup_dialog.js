// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @param {Array<remoting.HostSetupFlow.State>} sequence Sequence of
 *     steps for the flow.
 * @constructor
 */
remoting.HostSetupFlow = function(sequence) {
  this.sequence_ = sequence;
  this.currentStep_ = 0;
  this.state_ = sequence[0];
  this.pin = '';
  this.consent = false;
};

/** @enum {number} */
remoting.HostSetupFlow.State = {
  NONE: 0,

  // Dialog states.
  ASK_PIN: 1,

  // Prompts the user to install the host package.
  INSTALL_HOST: 2,

  // Processing states.
  STARTING_HOST: 3,
  UPDATING_PIN: 4,
  STOPPING_HOST: 5,

  // Done states.
  HOST_STARTED: 6,
  UPDATED_PIN: 7,
  HOST_STOPPED: 8,

  // Failure states.
  REGISTRATION_FAILED: 9,
  START_HOST_FAILED: 10,
  UPDATE_PIN_FAILED: 11,
  STOP_HOST_FAILED: 12
};

/** @return {remoting.HostSetupFlow.State} Current state of the flow. */
remoting.HostSetupFlow.prototype.getState = function() {
  return this.state_;
};

remoting.HostSetupFlow.prototype.switchToNextStep = function() {
  if (this.state_ == remoting.HostSetupFlow.State.NONE) {
    return;
  }

  if (this.currentStep_ < this.sequence_.length - 1) {
    this.currentStep_ += 1;
    this.state_ = this.sequence_[this.currentStep_];
  } else {
    this.state_ = remoting.HostSetupFlow.State.NONE;
  }
};

/**
 * @param {!remoting.Error} error
 */
remoting.HostSetupFlow.prototype.switchToErrorState = function(error) {
  if (error.hasTag(remoting.Error.Tag.CANCELLED)) {
    // Stop the setup flow if user rejected one of the actions.
    this.state_ = remoting.HostSetupFlow.State.NONE;
  } else {
    // Current step failed, so switch to corresponding error state.
    if (this.state_ == remoting.HostSetupFlow.State.STARTING_HOST) {
      if (error.hasTag(remoting.Error.Tag.REGISTRATION_FAILED)) {
        this.state_ = remoting.HostSetupFlow.State.REGISTRATION_FAILED;
      } else {
        this.state_ = remoting.HostSetupFlow.State.START_HOST_FAILED;
      }
    } else if (this.state_ == remoting.HostSetupFlow.State.UPDATING_PIN) {
      this.state_ = remoting.HostSetupFlow.State.UPDATE_PIN_FAILED;
    } else if (this.state_ == remoting.HostSetupFlow.State.STOPPING_HOST) {
      this.state_ = remoting.HostSetupFlow.State.STOP_HOST_FAILED;
    } else {
      // TODO(sergeyu): Add other error states and use them here.
      this.state_ = remoting.HostSetupFlow.State.START_HOST_FAILED;
    }
  }
};

/**
 * @param {remoting.HostController} hostController The HostController
 *     responsible for the host daemon.
 * @param {function(!remoting.Error)} onError Function to call when an error
 *     occurs.
 * @constructor
 */
remoting.HostSetupDialog = function(hostController, onError) {
  this.hostController_ = hostController;
  this.onError_ = onError;

  this.pinEntry_ = document.getElementById('daemon-pin-entry');
  this.pinConfirm_ = document.getElementById('daemon-pin-confirm');
  this.pinErrorDiv_ = document.getElementById('daemon-pin-error-div');
  this.pinErrorMessage_ = document.getElementById('daemon-pin-error-message');

  /** @type {remoting.HostSetupFlow} */
  this.flow_ = new remoting.HostSetupFlow([remoting.HostSetupFlow.State.NONE]);

  /** @type {remoting.HostSetupDialog} */
  var that = this;
  /** @param {Event} event The event. */
  var onPinSubmit = function(event) {
    event.preventDefault();
    that.onPinSubmit_();
  };
  var onPinConfirmFocus = function() {
    that.validatePin_();
  };

  var form = document.getElementById('ask-pin-form');
  form.addEventListener('submit', onPinSubmit, false);
  /** @param {Event} event The event. */
  var onDaemonPinEntryKeyPress = function(event) {
    if (event.which == 13) {
      document.getElementById('daemon-pin-confirm').focus();
      event.preventDefault();
    }
  };
  /** @param {Event} event A keypress event. */
  var noDigitsInPin = function(event) {
    if (event.which == 13) {
      return;  // Otherwise the "submit" action can't be triggered by Enter.
    }
    if ((event.which >= 48) && (event.which <= 57)) {
      return;
    }
    event.preventDefault();
  };
  this.pinEntry_.addEventListener('keypress', onDaemonPinEntryKeyPress, false);
  this.pinEntry_.addEventListener('keypress', noDigitsInPin, false);
  this.pinConfirm_.addEventListener('focus', onPinConfirmFocus, false);
  this.pinConfirm_.addEventListener('keypress', noDigitsInPin, false);

  this.usageStats_ = document.getElementById('usagestats-consent');
  this.usageStatsCheckbox_ = /** @type {HTMLInputElement} */
      (document.getElementById('usagestats-consent-checkbox'));
};

/**
 * Show the dialog in order to get a PIN prior to starting the daemon. When the
 * user clicks OK, the dialog shows a spinner until the daemon has started.
 *
 * @return {void} Nothing.
 */
remoting.HostSetupDialog.prototype.showForStart = function() {
  /** @type {remoting.HostSetupDialog} */
  var that = this;

  /**
   * @param {remoting.HostController.State} state
   */
  var onState = function(state) {
    // Although we don't need an access token in order to start the host,
    // using callWithToken here ensures consistent error handling in the
    // case where the refresh token is invalid.
    remoting.identity.getToken().then(
        that.showForStartWithToken_.bind(that, state),
        remoting.Error.handler(that.onError_));
  };

  this.hostController_.getLocalHostState(onState);
};

/**
 * @param {remoting.HostController.State} state The current state of the local
 *     host.
 * @param {string} token The OAuth2 token.
 * @private
 */
remoting.HostSetupDialog.prototype.showForStartWithToken_ =
    function(state, token) {
  /** @type {remoting.HostSetupDialog} */
  var that = this;

  /**
   * @param {remoting.UsageStatsConsent} consent
   */
  function onGetConsent(consent) {
    // Hide the usage stats check box if it is not supported or the policy
    // doesn't allow usage stats collection.
    var checkBoxLabel = that.usageStats_.querySelector('.checkbox-label');
    that.usageStats_.hidden = !consent.supported ||
        (consent.setByPolicy && !consent.allowed);
    that.usageStatsCheckbox_.checked = consent.allowed;

    that.usageStatsCheckbox_.disabled = consent.setByPolicy;
    checkBoxLabel.classList.toggle('disabled', consent.setByPolicy);

    if (consent.setByPolicy) {
      that.usageStats_.title = l10n.getTranslationOrError(
          /*i18n-content*/ 'SETTING_MANAGED_BY_POLICY');
    } else {
      that.usageStats_.title = '';
    }
  }

  /** @param {!remoting.Error} error */
  function onError(error) {
    console.error('Error getting consent status: ' + error.toString());
  }

  this.usageStats_.hidden = true;
  this.usageStatsCheckbox_.checked = false;

  // Prevent user from ticking the box until the current consent status is
  // known.
  this.usageStatsCheckbox_.disabled = true;

  this.hostController_.getConsent().then(
      onGetConsent, remoting.Error.handler(onError));

  var flow = [
      remoting.HostSetupFlow.State.INSTALL_HOST,
      remoting.HostSetupFlow.State.ASK_PIN,
      remoting.HostSetupFlow.State.STARTING_HOST,
      remoting.HostSetupFlow.State.HOST_STARTED];

  var installed =
      state != remoting.HostController.State.NOT_INSTALLED &&
      state != remoting.HostController.State.UNKNOWN;

  // Skip the installation step when the host is already installed.
  if (installed) {
    flow.shift();
  }

  this.startNewFlow_(flow);
};

/**
 * Show the dialog in order to change the PIN associated with a running daemon.
 *
 * @return {void} Nothing.
 */
remoting.HostSetupDialog.prototype.showForPin = function() {
  this.usageStats_.hidden = true;
  this.startNewFlow_(
      [remoting.HostSetupFlow.State.ASK_PIN,
       remoting.HostSetupFlow.State.UPDATING_PIN,
       remoting.HostSetupFlow.State.UPDATED_PIN]);
};

/**
 * Show the dialog in order to stop the daemon.
 *
 * @return {void} Nothing.
 */
remoting.HostSetupDialog.prototype.showForStop = function() {
  // TODO(sergeyu): Add another step to unregister the host, crbug.com/121146 .
  this.startNewFlow_(
      [remoting.HostSetupFlow.State.STOPPING_HOST,
       remoting.HostSetupFlow.State.HOST_STOPPED]);
};

/**
 * @return {void} Nothing.
 */
remoting.HostSetupDialog.prototype.hide = function() {
  remoting.setMode(remoting.AppMode.HOME);
};

/**
 * Starts new flow with the specified sequence of steps.
 * @param {Array<remoting.HostSetupFlow.State>} sequence Sequence of steps.
 * @private
 */
remoting.HostSetupDialog.prototype.startNewFlow_ = function(sequence) {
  this.flow_ = new remoting.HostSetupFlow(sequence);
  this.pinEntry_.value = '';
  this.pinConfirm_.value = '';
  this.pinErrorDiv_.hidden = true;
  this.updateState_();
};

/**
 * Updates current UI mode according to the current state of the setup
 * flow and start the action corresponding to the current step (if
 * any).
 * @private
 */
remoting.HostSetupDialog.prototype.updateState_ = function() {
  remoting.updateLocalHostState();

  /** @param {string} tag1
   *  @param {string=} opt_tag2 */
  function showDoneMessage(tag1, opt_tag2) {
    var messageDiv = document.getElementById('host-setup-done-message');
    l10n.localizeElementFromTag(messageDiv, tag1);
    messageDiv = document.getElementById('host-setup-done-message-2');
    if (opt_tag2) {
      l10n.localizeElementFromTag(messageDiv, opt_tag2);
    } else {
      messageDiv.innerText = '';
    }
    remoting.setMode(remoting.AppMode.HOST_SETUP_DONE);
  }
  /** @param {string} tag */
  function showErrorMessage(tag) {
    var errorDiv = document.getElementById('host-setup-error-message');
    l10n.localizeElementFromTag(errorDiv, tag);
    remoting.setMode(remoting.AppMode.HOST_SETUP_ERROR);
  }

  var state = this.flow_.getState();
  if (state == remoting.HostSetupFlow.State.NONE) {
    this.hide();
  } else if (state == remoting.HostSetupFlow.State.ASK_PIN) {
    remoting.setMode(remoting.AppMode.HOST_SETUP_ASK_PIN);
  } else if (state == remoting.HostSetupFlow.State.INSTALL_HOST) {
    this.installHost_();
  } else if (state == remoting.HostSetupFlow.State.STARTING_HOST) {
    remoting.showSetupProcessingMessage(/*i18n-content*/'HOST_SETUP_STARTING');
    this.startHost_();
  } else if (state == remoting.HostSetupFlow.State.UPDATING_PIN) {
    remoting.showSetupProcessingMessage(
        /*i18n-content*/'HOST_SETUP_UPDATING_PIN');
    this.updatePin_();
  } else if (state == remoting.HostSetupFlow.State.STOPPING_HOST) {
    remoting.showSetupProcessingMessage(/*i18n-content*/'HOST_SETUP_STOPPING');
    this.stopHost_();
  } else if (state == remoting.HostSetupFlow.State.HOST_STARTED) {
    // TODO(jamiewalch): Only display the second string if the computer's power
    // management settings indicate that it's necessary.
    showDoneMessage(/*i18n-content*/'HOST_SETUP_STARTED',
                    /*i18n-content*/'HOST_SETUP_STARTED_DISABLE_SLEEP');
  } else if (state == remoting.HostSetupFlow.State.UPDATED_PIN) {
    showDoneMessage(/*i18n-content*/'HOST_SETUP_UPDATED_PIN');
  } else if (state == remoting.HostSetupFlow.State.HOST_STOPPED) {
    showDoneMessage(/*i18n-content*/'HOST_SETUP_STOPPED');
  } else if (state == remoting.HostSetupFlow.State.REGISTRATION_FAILED) {
    showErrorMessage(/*i18n-content*/'ERROR_HOST_REGISTRATION_FAILED');
  } else if (state == remoting.HostSetupFlow.State.START_HOST_FAILED) {
    showErrorMessage(/*i18n-content*/'HOST_SETUP_HOST_FAILED');
  } else if (state == remoting.HostSetupFlow.State.UPDATE_PIN_FAILED) {
    showErrorMessage(/*i18n-content*/'HOST_SETUP_UPDATE_PIN_FAILED');
  } else if (state == remoting.HostSetupFlow.State.STOP_HOST_FAILED) {
    showErrorMessage(/*i18n-content*/'HOST_SETUP_STOP_FAILED');
  }
};

/**
 * Shows the prompt that asks the user to install the host.
 */
remoting.HostSetupDialog.prototype.installHost_ = function() {
  /** @type {remoting.HostSetupDialog} */
  var that = this;
  /** @type {remoting.HostSetupFlow} */
  var flow = this.flow_;

  /** @param {!remoting.Error} error */
  var onError = function(error) {
    flow.switchToErrorState(error);
    that.updateState_();
  };

  var onDone = function() {
    that.hostController_.getLocalHostState(onHostState);
  };

  /** @param {remoting.HostController.State} state */
  var onHostState = function(state) {
    var installed =
        state != remoting.HostController.State.NOT_INSTALLED &&
        state != remoting.HostController.State.UNKNOWN;

    if (installed) {
      that.flow_.switchToNextStep();
      that.updateState_();
    } else {
      // Prompt the user again if the host is not installed.
      hostInstallDialog.tryAgain();
    }
  };

  /** @type {remoting.HostInstallDialog} */
  var hostInstallDialog = new remoting.HostInstallDialog();
  hostInstallDialog.show(onDone, onError);
}

/**
 * Registers and starts the host.
 */
remoting.HostSetupDialog.prototype.startHost_ = function() {
  /** @type {remoting.HostSetupDialog} */
  var that = this;
  /** @type {remoting.HostSetupFlow} */
  var flow = this.flow_;

  /** @return {boolean} */
  function isFlowActive() {
    if (flow !== that.flow_ ||
        flow.getState() != remoting.HostSetupFlow.State.STARTING_HOST) {
      console.error('Host setup was interrupted when starting the host');
      return false;
    }
    return true;
  }

  function onHostStarted() {
    if (isFlowActive()) {
      flow.switchToNextStep();
      that.updateState_();
    }
  }

  /** @param {!remoting.Error} error */
  function onError(error) {
    if (isFlowActive()) {
      flow.switchToErrorState(error);
      that.updateState_();
    }
  }

  this.hostController_.start(this.flow_.pin, this.flow_.consent).then(
      onHostStarted
  ).catch(
      remoting.Error.handler(onError)
  );
};

remoting.HostSetupDialog.prototype.updatePin_ = function() {
  /** @type {remoting.HostSetupDialog} */
  var that = this;
  /** @type {remoting.HostSetupFlow} */
  var flow = this.flow_;

  /** @return {boolean} */
  function isFlowActive() {
    if (flow !== that.flow_ ||
        flow.getState() != remoting.HostSetupFlow.State.UPDATING_PIN) {
      console.error('Host setup was interrupted when updating PIN');
      return false;
    }
    return true;
  }

  function onPinUpdated() {
    if (isFlowActive()) {
      flow.switchToNextStep();
      that.updateState_();
    }
  }

  /** @param {!remoting.Error} error */
  function onError(error) {
    if (isFlowActive()) {
      flow.switchToErrorState(error);
      that.updateState_();
    }
  }

  this.hostController_.updatePin(flow.pin, onPinUpdated, onError);
};

/**
 * Stops the host.
 */
remoting.HostSetupDialog.prototype.stopHost_ = function() {
  /** @type {remoting.HostSetupDialog} */
  var that = this;
  /** @type {remoting.HostSetupFlow} */
  var flow = this.flow_;

  /** @return {boolean} */
  function isFlowActive() {
    if (flow !== that.flow_ ||
        flow.getState() != remoting.HostSetupFlow.State.STOPPING_HOST) {
      console.error('Host setup was interrupted when stopping the host');
      return false;
    }
    return true;
  }

  function onHostStopped() {
    if (isFlowActive()) {
      flow.switchToNextStep();
      that.updateState_();
    }
  }

  /** @param {!remoting.Error} error */
  function onError(error) {
    if (isFlowActive()) {
      flow.switchToErrorState(error);
      that.updateState_();
    }
  }

  this.hostController_.stop(onHostStopped, onError);
};

/**
 * Validates the PIN and shows an error message if it's invalid.
 * @return {boolean} true if the PIN is valid, false otherwise.
 * @private
 */
remoting.HostSetupDialog.prototype.validatePin_ = function() {
  var pin = this.pinEntry_.value;
  var pinIsValid = remoting.HostSetupDialog.validPin_(pin);
  if (!pinIsValid) {
    l10n.localizeElementFromTag(
        this.pinErrorMessage_, /*i18n-content*/'INVALID_PIN');
  }
  this.pinErrorDiv_.hidden = pinIsValid;
  return pinIsValid;
};

/** @private */
remoting.HostSetupDialog.prototype.onPinSubmit_ = function() {
  if (this.flow_.getState() != remoting.HostSetupFlow.State.ASK_PIN) {
    console.error('PIN submitted in an invalid state', this.flow_.getState());
    return;
  }
  var pin1 = this.pinEntry_.value;
  var pin2 = this.pinConfirm_.value;
  if (pin1 != pin2) {
    l10n.localizeElementFromTag(
        this.pinErrorMessage_, /*i18n-content*/'PINS_NOT_EQUAL');
    this.pinErrorDiv_.hidden = false;
    this.prepareForPinEntry_();
    return;
  }
  if (!this.validatePin_()) {
    this.prepareForPinEntry_();
    return;
  }
  this.flow_.pin = pin1;
  this.flow_.consent = !this.usageStats_.hidden &&
      this.usageStatsCheckbox_.checked;
  this.flow_.switchToNextStep();
  this.updateState_();
};

/** @private */
remoting.HostSetupDialog.prototype.prepareForPinEntry_ = function() {
  this.pinEntry_.value = '';
  this.pinConfirm_.value = '';
  this.pinEntry_.focus();
};

/**
 * Returns whether a PIN is valid.
 *
 * @private
 * @param {string} pin A PIN.
 * @return {boolean} Whether the PIN is valid.
 */
remoting.HostSetupDialog.validPin_ = function(pin) {
  if (pin.length < 6) {
    return false;
  }
  for (var i = 0; i < pin.length; i++) {
    var c = pin.charAt(i);
    if ((c < '0') || (c > '9')) {
      return false;
    }
  }
  return true;
};

/** @type {remoting.HostSetupDialog} */
remoting.hostSetupDialog = null;
