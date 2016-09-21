// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Class representing an entry in the host-list portion of the home screen.
 */

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/**
 * An entry in the host table.
 *
 * @param {number} webappMajorVersion The major version nmber of the web-app,
 *     used to identify out-of-date hosts.
 * @param {function(string):void} onConnect Callback for
 *     connect operations.
 * @param {function(remoting.HostTableEntry):void} onRename Callback for
 *     rename operations.
 * @param {function(remoting.HostTableEntry):void=} opt_onDelete Callback for
 *     delete operations.
 *
 * @constructor
 * @implements {base.Disposable}
 */
remoting.HostTableEntry = function(
    webappMajorVersion, onConnect, onRename, opt_onDelete) {
  /** @type {remoting.Host} */
  this.host = null;
  /** @private {number} */
  this.webappMajorVersion_ = webappMajorVersion;
  /** @private {function(remoting.HostTableEntry):void} */
  this.onRename_ = onRename;
  /** @private {undefined|function(remoting.HostTableEntry):void} */
  this.onDelete_ = opt_onDelete;
  /** @private {function(string):void} */
  this.onConnect_ = onConnect;

  /** @private {HTMLElement} */
  this.rootElement_ = null;
  /** @private {HTMLElement} */
  this.hostNameLabel_ = null;
  /** @private {HTMLInputElement} */
  this.renameInputField_ = null;
  /** @private {HTMLElement} */
  this.warningOverlay_ = null;

  /** @private {base.Disposables} */
  this.renameInputEventHooks_ = null;
  /** @private {base.Disposables} */
  this.disposables_ = new base.Disposables();

  // References to event handlers so that they can be removed.
  /** @private {function():void} */
  this.onConfirmDeleteReference_ = function() {};
  /** @private {function():void} */
  this.onCancelDeleteReference_ = function() {};

  this.createDom_();
};

/** @param {remoting.Host} host */
remoting.HostTableEntry.prototype.setHost = function(host) {
  this.host = host;
  this.updateUI_();
};

/** @return {HTMLElement} */
remoting.HostTableEntry.prototype.element = function() {
  return this.rootElement_;
};

remoting.HostTableEntry.prototype.dispose = function() {
  base.dispose(this.disposables_);
  this.disposables_ = null;
  base.dispose(this.renameInputEventHooks_);
  this.renameInputEventHooks_ = null;
};

/** @return {string} */
remoting.HostTableEntry.prototype.getHTML_ = function() {
  var html =
    '<div class="host-list-main-icon">' +
      '<span class="warning-overlay"></span>' +
      '<img src="icon_host.webp">' +
    '</div>' +
    '<div class="box-spacer host-list-clip">' +
      '<a class="host-name-label" href="#""></a>' +
      '<input class="host-rename-input" type="text" hidden/>' +
    '</div>' +
    '<span tabindex="0" class="clickable host-list-edit rename-button">' +
      '<img src="icon_pencil.webp" class="host-list-rename-icon">' +
    '</span>';
  if (this.onDelete_) {
    html +=
    '<span tabindex="0" class="clickable host-list-edit delete-button">' +
       '<img src="icon_cross.webp" class="host-list-remove-icon">' +
    '</span>';
  }
  return '<div class="section-row host-offline">' + html + '</div>';
};

/**
 * Create the HTML elements for this entry and set up event handlers.
 * @return {void} Nothing.
 */
remoting.HostTableEntry.prototype.createDom_ = function() {
  var container = /** @type {HTMLElement} */ (document.createElement('div'));
  container.innerHTML = this.getHTML_();

  // Setup DOM references.
  this.rootElement_ = /** @type {HTMLElement} */ (container.firstElementChild);
  this.warningOverlay_ = container.querySelector('.warning-overlay');
  this.hostNameLabel_ = container.querySelector('.host-name-label');
  this.renameInputField_ = /** @type {HTMLInputElement} */ (
      container.querySelector('.host-rename-input'));

  // Register event handlers and set tooltips.
  var editButton = container.querySelector('.rename-button');
  var deleteButton = container.querySelector('.delete-button');
  editButton.title = chrome.i18n.getMessage(/*i18n-content*/'TOOLTIP_RENAME');
  this.registerButton_(editButton, this.beginRename_.bind(this));
  this.registerButton_(this.rootElement_, this.onConnectButton_.bind(this));
  if (deleteButton) {
    this.registerButton_(deleteButton, this.showDeleteConfirmation_.bind(this));
    deleteButton.title =
        chrome.i18n.getMessage(/*i18n-content*/'TOOLTIP_DELETE');
  }
};

/** @private */
remoting.HostTableEntry.prototype.registerButton_ = function(
    /** HTMLElement */ button, /** Function */ callback) {
  var onKeyDown = function(/** Event */ e) {
    if (e.which === KeyCodes.ENTER || e.which === KeyCodes.SPACEBAR) {
      callback();
      e.stopPropagation();
    }
  };
  var onClick = function(/** Event */ e) {
    callback();
    e.stopPropagation();
  };
  var onFocusChanged = this.onFocusChange_.bind(this);
  this.disposables_.add(
      new base.DomEventHook(button, 'click', onClick, false),
      new base.DomEventHook(button, 'keydown', onKeyDown, false),
      // Register focus and blur handlers to cause the parent node to be
      // highlighted whenever a child link has keyboard focus. Note that this is
      // only necessary because Chrome does not yet support the draft CSS
      // Selectors 4 specification (http://www.w3.org/TR/selectors4/#subject),
      // which provides a more elegant solution to this problem.
      new base.DomEventHook(button, 'focus', onFocusChanged, false),
      new base.DomEventHook(button, 'blur', onFocusChanged, false));
};


/** @return {void} @private */
remoting.HostTableEntry.prototype.onConnectButton_ = function() {
  // Don't connect during renaming as this event fires if the user hits Enter
  // after typing a new name.
  if (!this.isRenaming_() && this.isOnline_()) {
    var encodedHostId = encodeURIComponent(this.host.hostId);
    this.onConnect_(encodedHostId);
  }
};

/** @return {boolean} @private */
remoting.HostTableEntry.prototype.isOnline_ = function() {
  return Boolean(this.host) && this.host.status === 'ONLINE';
};

/** @return {string} @private */
remoting.HostTableEntry.prototype.getHostDisplayName_ = function() {
  if (this.isOnline_()) {
    if (remoting.Host.needsUpdate(this.host, this.webappMajorVersion_)) {
      return  chrome.i18n.getMessage(
          /*i18n-content*/'UPDATE_REQUIRED', this.host.hostName);
    }
    return this.host.hostName;
  } else {
    if (this.host.updatedTime) {
      var formattedTime = formatUpdateTime(this.host.updatedTime);
      return chrome.i18n.getMessage(/*i18n-content*/ 'LAST_ONLINE',
                                    [this.host.hostName, formattedTime]);
    }
    return chrome.i18n.getMessage(/*i18n-content*/ 'OFFLINE',
                                  this.host.hostName);
  }
};

/**
 * Update the UI to reflect the current status of the host
 *
 * @return {void} Nothing.
 * @private
 */
remoting.HostTableEntry.prototype.updateUI_ = function() {
  if (!this.host) {
    return;
  }
  var clickToConnect = this.isOnline_() && !this.isRenaming_();
  var showOffline = !this.isOnline_();
  this.rootElement_.querySelector('.box-spacer').id =
      'host_' + this.host.hostId;
  var connectLabel = chrome.i18n.getMessage(/*i18n-content*/'TOOLTIP_CONNECT',
                                            this.host.hostName);
  this.rootElement_.classList.toggle('clickable', clickToConnect);
  this.rootElement_.title = (clickToConnect) ? connectLabel : '';
  this.rootElement_.classList.toggle('host-online', !showOffline);
  this.rootElement_.classList.toggle('host-offline', showOffline);

  var hostReportedError = this.host.hostOfflineReason !== '';
  var hostNeedsUpdate = remoting.Host.needsUpdate(
      this.host, this.webappMajorVersion_);
  this.warningOverlay_.hidden = !hostNeedsUpdate && !hostReportedError;
  this.hostNameLabel_.innerText = this.getHostDisplayName_();
  this.hostNameLabel_.title =
      formatHostOfflineReason(this.host.hostOfflineReason);
  this.renameInputField_.hidden = !this.isRenaming_();
  this.hostNameLabel_.hidden = this.isRenaming_();
};

/**
 * Prepares the host for renaming by showing an edit box.
 * @return {void} Nothing.
 * @private
 */
remoting.HostTableEntry.prototype.beginRename_ = function() {
  this.renameInputField_.value = this.host.hostName;
  console.assert(this.renameInputEventHooks_ === null,
                 '|renameInputEventHooks_| already exists.');
  base.dispose(this.renameInputEventHooks_);
  this.renameInputEventHooks_ = new base.Disposables(
      new base.DomEventHook(this.renameInputField_, 'blur',
                            this.commitRename_.bind(this), false),
      new base.DomEventHook(this.renameInputField_, 'keydown',
                            this.onKeydown_.bind(this), false));
  this.updateUI_();
  this.renameInputField_.focus();
};

/** @return {boolean} @private */
remoting.HostTableEntry.prototype.isRenaming_ = function() {
  return Boolean(this.renameInputEventHooks_);
};

/** @return {void} @private */
remoting.HostTableEntry.prototype.commitRename_ = function() {
  if (this.host.hostName != this.renameInputField_.value) {
    this.host.hostName = this.renameInputField_.value;
    this.onRename_(this);
  }
  this.hideEditBox_();
};

/** @return {void} @private */
remoting.HostTableEntry.prototype.hideEditBox_ = function() {
  // onblur will fire when the edit box is removed, so remove the hook.
  base.dispose(this.renameInputEventHooks_);
  this.renameInputEventHooks_ = null;
  // Update the tool-tip and event handler.
  this.updateUI_();
};

/**
 * Handle a key event while the user is typing a host name
 * @param {Event} event The keyboard event.
 * @return {void} Nothing.
 * @private
 */
remoting.HostTableEntry.prototype.onKeydown_ = function(event) {
  if (event.which == KeyCodes.ESCAPE) {
    this.hideEditBox_();
  } else if (event.which == KeyCodes.ENTER) {
    this.commitRename_();
    event.stopPropagation();
  }
};

/**
 * Prompt the user to confirm or cancel deletion of a host.
 * @return {void} Nothing.
 * @private
 */
remoting.HostTableEntry.prototype.showDeleteConfirmation_ = function() {
  var message = document.getElementById('confirm-host-delete-message');
  l10n.localizeElement(message, this.host.hostName);
  var confirm = document.getElementById('confirm-host-delete');
  var cancel = document.getElementById('cancel-host-delete');
  this.onConfirmDeleteReference_ = this.confirmDelete_.bind(this);
  this.onCancelDeleteReference_ = this.cancelDelete_.bind(this);
  confirm.addEventListener('click', this.onConfirmDeleteReference_, false);
  cancel.addEventListener('click', this.onCancelDeleteReference_, false);
  remoting.setMode(remoting.AppMode.CONFIRM_HOST_DELETE);
};

/**
 * Confirm deletion of a host.
 * @return {void} Nothing.
 * @private
 */
remoting.HostTableEntry.prototype.confirmDelete_ = function() {
  this.onDelete_(this);
  this.cleanUpConfirmationEventListeners_();
  remoting.setMode(remoting.AppMode.HOME);
};

/**
 * Cancel deletion of a host.
 * @return {void} Nothing.
 * @private
 */
remoting.HostTableEntry.prototype.cancelDelete_ = function() {
  this.cleanUpConfirmationEventListeners_();
  remoting.setMode(remoting.AppMode.HOME);
};

/**
 * Remove the confirm and cancel event handlers, which refer to this object.
 * @return {void} Nothing.
 * @private
 */
remoting.HostTableEntry.prototype.cleanUpConfirmationEventListeners_ =
    function() {
  var confirm = document.getElementById('confirm-host-delete');
  var cancel = document.getElementById('cancel-host-delete');
  confirm.removeEventListener('click', this.onConfirmDeleteReference_, false);
  cancel.removeEventListener('click', this.onCancelDeleteReference_, false);
  this.onCancelDeleteReference_ = function() {};
  this.onConfirmDeleteReference_ = function() {};
};

/**
 * Handle a focus change event within this table row.
 * @return {void} Nothing.
 * @private
 */
remoting.HostTableEntry.prototype.onFocusChange_ = function() {
  var element = document.activeElement;
  while (element) {
    if (element == this.rootElement_) {
      this.rootElement_.classList.add('child-focused');
      return;
    }
    element = element.parentNode;
  }
  this.rootElement_.classList.remove('child-focused');
};

/**
 * Formats host's updateTime value relative to current time (i.e. only
 * displaying hours and minutes if updateTime is less than a day in the past).
 * @param {string} updateTime RFC 3339 formatted date-time value.
 * @return {string} Formatted value (i.e. 11/11/2014)
 */
function formatUpdateTime(updateTime) {
  var lastOnline = new Date(updateTime);
  var now = new Date();
  var displayString = '';
  if (now.getFullYear() == lastOnline.getFullYear() &&
      now.getMonth() == lastOnline.getMonth() &&
      now.getDate() == lastOnline.getDate()) {
    return lastOnline.toLocaleTimeString();
  } else {
    return lastOnline.toLocaleDateString();
  }
}

/**
 * Formats host's host-offline-reason value (i.e. 'INVALID_HOST_CONFIGURATION')
 * to a human-readable description of the error.
 * @param {string} hostOfflineReason
 * @return {string}
 */
function formatHostOfflineReason(hostOfflineReason) {
  if (!hostOfflineReason) {
    return '';
  }
  var knownReasonTags = [
    /*i18n-content*/'OFFLINE_REASON_INITIALIZATION_FAILED',
    /*i18n-content*/'OFFLINE_REASON_INVALID_HOST_CONFIGURATION',
    /*i18n-content*/'OFFLINE_REASON_INVALID_HOST_DOMAIN',
    /*i18n-content*/'OFFLINE_REASON_INVALID_HOST_ID',
    /*i18n-content*/'OFFLINE_REASON_INVALID_OAUTH_CREDENTIALS',
    /*i18n-content*/'OFFLINE_REASON_LOGIN_SCREEN_NOT_SUPPORTED',
    /*i18n-content*/'OFFLINE_REASON_POLICY_CHANGE_REQUIRES_RESTART',
    /*i18n-content*/'OFFLINE_REASON_POLICY_READ_ERROR',
    /*i18n-content*/'OFFLINE_REASON_SUCCESS_EXIT',
    /*i18n-content*/'OFFLINE_REASON_USERNAME_MISMATCH'
  ];
  var offlineReasonTag = 'OFFLINE_REASON_' + hostOfflineReason;
  if (knownReasonTags.indexOf(offlineReasonTag) != (-1)) {
    return chrome.i18n.getMessage(offlineReasonTag);
  } else {
    return chrome.i18n.getMessage(
        /*i18n-content*/'OFFLINE_REASON_UNKNOWN', hostOfflineReason);
  }
}

/** @enum {number} */
var KeyCodes = {
  ENTER: 13,
  ESCAPE: 27,
  SPACEBAR: 32
};

})();
