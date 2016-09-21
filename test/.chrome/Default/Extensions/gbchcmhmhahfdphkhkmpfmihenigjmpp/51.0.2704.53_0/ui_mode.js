// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Functions related to controlling the modal UI state of the app. UI states
 * are expressed as HTML attributes with a dotted hierarchy. For example, the
 * string 'host.shared' will match any elements with an associated attribute
 * of 'host' or 'host.shared', showing those elements and hiding all others.
 * Elements with no associated attribute are ignored.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/** @enum {string} */
// TODO(jamiewalch): Move 'in-session' to a separate web-page so that the
// 'home' state applies to all elements and can be removed.
remoting.AppMode = {
  HOME: 'home',
    TOKEN_REFRESH_FAILED: 'home.token-refresh-failed',
    HOST_INSTALL: 'home.host-install',
      HOST_INSTALL_TOS: 'home.host-install.tos',
      HOST_INSTALL_PROMPT: 'home.host-install.prompt',
      HOST_INSTALL_PENDING: 'home.host-install.pending',
    HOST: 'home.host',
      HOST_WAITING_FOR_CODE: 'home.host.waiting-for-code',
      HOST_WAITING_FOR_CONNECTION: 'home.host.waiting-for-connection',
      HOST_SHARED: 'home.host.shared',
      HOST_SHARE_FAILED: 'home.host.share-failed',
      HOST_SHARE_FINISHED: 'home.host.share-finished',
    CLIENT: 'home.client',
      CLIENT_UNCONNECTED: 'home.client.unconnected',
      CLIENT_PIN_PROMPT: 'home.client.pin-prompt',
      CLIENT_THIRD_PARTY_AUTH: 'home.client.third-party-auth',
      CLIENT_CONNECTING: 'home.client.connecting',
      CLIENT_CONNECT_FAILED_IT2ME: 'home.client.connect-failed.it2me',
      CLIENT_CONNECT_FAILED_ME2ME: 'home.client.connect-failed.me2me',
      CLIENT_SESSION_FINISHED_IT2ME: 'home.client.session-finished.it2me',
      CLIENT_SESSION_FINISHED_ME2ME: 'home.client.session-finished.me2me',
      CLIENT_HOST_NEEDS_UPGRADE: 'home.client.host-needs-upgrade',
    HISTORY: 'home.history',
    CONFIRM_HOST_DELETE: 'home.confirm-host-delete',
    HOST_SETUP: 'home.host-setup',
      HOST_SETUP_ASK_PIN: 'home.host-setup.ask-pin',
      HOST_SETUP_PROCESSING: 'home.host-setup.processing',
      HOST_SETUP_DONE: 'home.host-setup.done',
      HOST_SETUP_ERROR: 'home.host-setup.error',
    HOME_MANAGE_PAIRINGS: 'home.manage-pairings',
  IN_SESSION: 'in-session'
};

/** @const */
remoting.kIT2MeVisitedStorageKey = 'it2me-visited';
/** @const */
remoting.kMe2MeVisitedStorageKey = 'me2me-visited';

/**
 * @param {Element} element The element to check.
 * @param {string} attrName The attribute on the element to check.
 * @param {Array<string>} modes The modes to check for.
 * @return {boolean} True if any mode in |modes| is found within the attribute.
 */
remoting.hasModeAttribute = function(element, attrName, modes) {
  var attr = element.getAttribute(attrName);
  for (var i = 0; i < modes.length; ++i) {
    if (attr.match(new RegExp('(\\s|^)' + modes[i] + '(\\s|$)')) != null) {
      return true;
    }
  }
  return false;
};

/**
 * Update the DOM by showing or hiding elements based on whether or not they
 * have an attribute matching the specified name.
 * @param {string} mode The value against which to match the attribute.
 * @param {string} attr The attribute name to match.
 * @return {void} Nothing.
 */
remoting.updateModalUi = function(mode, attr) {
  var modes = mode.split('.');
  for (var i = 1; i < modes.length; ++i)
    modes[i] = modes[i - 1] + '.' + modes[i];
  var elements = document.querySelectorAll('[' + attr + ']');
  // Hide elements first so that we don't end up trying to show two modal
  // dialogs at once (which would break keyboard-navigation confinement).
  for (var i = 0; i < elements.length; ++i) {
    var element = /** @type {Element} */ (elements[i]);
    if (!remoting.hasModeAttribute(element, attr, modes)) {
      element.hidden = true;
    }
  }
  for (var i = 0; i < elements.length; ++i) {
    var element = /** @type {Element} */ (elements[i]);
    if (remoting.hasModeAttribute(element, attr, modes)) {
      element.hidden = false;
      var autofocusNode = element.querySelector('[autofocus]');
      if (autofocusNode) {
        autofocusNode.focus();
      }
    }
  }
};

/**
 * @type {remoting.AppMode} The current app mode
 */
remoting.currentMode = remoting.AppMode.HOME;

/**
 * Change the app's modal state to |mode|, determined by the data-ui-mode
 * attribute.
 *
 * @param {remoting.AppMode} mode The new modal state.
 */
remoting.setMode = function(mode) {
  remoting.updateModalUi(mode, 'data-ui-mode');
  console.log('App mode: ' + mode);
  remoting.currentMode = mode;
  if (mode !== remoting.AppMode.IN_SESSION) {
    // TODO(jamiewalch): crbug.com/252796: Remove this once crbug.com/240772
    // is fixed.
    var scroller = document.getElementById('scroller');
    if (scroller) {
      scroller.classList.remove('no-horizontal-scroll');
      scroller.classList.remove('no-vertical-scroll');
    }
  }

  remoting.testEvents.raiseEvent(remoting.testEvents.Names.uiModeChanged, mode);
};

/**
 * Get the major mode that the app is running in.
 * @return {string} The app's current major mode.
 */
remoting.getMajorMode = function() {
  return remoting.currentMode.split('.')[0];
};

/**
 * Helper function for showing or hiding the infographic UI based on
 * whether or not the user has already dismissed it.
 *
 * @param {string} mode
 * @param {Object<?,string>} items
 */
remoting.showOrHideCallback = function(mode, items) {
  // Get the first element of a dictionary or array, without needing to know
  // the key.
  var obj = /** @type {!Object} */(items);
  /** @type {string} */
  var key = Object.keys(obj)[0];
  var visited = !!items[key];
  document.getElementById(mode + '-first-run').hidden = visited;
  document.getElementById(mode + '-content').hidden = !visited;
};

/**
 * @param {Object<?,string>} items
 */
remoting.showOrHideCallbackIT2Me = function(items) {
  remoting.showOrHideCallback('it2me', items);
}

/**
 * @param {Object<?,string>} items
 */
remoting.showOrHideCallbackMe2Me = function(items) {
  remoting.showOrHideCallback('me2me', items);
}

remoting.showOrHideIT2MeUi = function() {
  chrome.storage.local.get(remoting.kIT2MeVisitedStorageKey,
                           remoting.showOrHideCallbackIT2Me);
};

remoting.showOrHideMe2MeUi = function() {
  chrome.storage.local.get(remoting.kMe2MeVisitedStorageKey,
                           remoting.showOrHideCallbackMe2Me);
};

remoting.showIT2MeUiAndSave = function() {
  var items = {};
  items[remoting.kIT2MeVisitedStorageKey] = true;
  chrome.storage.local.set(items);
  remoting.showOrHideCallback('it2me', [true]);
};

remoting.showMe2MeUiAndSave = function() {
  var items = {};
  items[remoting.kMe2MeVisitedStorageKey] = true;
  chrome.storage.local.set(items);
  remoting.showOrHideCallback('me2me', [true]);
};

remoting.resetInfographics = function() {
  chrome.storage.local.remove(remoting.kIT2MeVisitedStorageKey);
  chrome.storage.local.remove(remoting.kMe2MeVisitedStorageKey);
  remoting.showOrHideCallback('it2me', [false]);
  remoting.showOrHideCallback('me2me', [false]);
}


/**
 * Initialize all modal dialogs (class kd-modaldialog), adding event handlers
 * to confine keyboard navigation to child controls of the dialog when it is
 * shown and restore keyboard navigation when it is hidden.
 */
remoting.initModalDialogs = function() {
  var dialogs = document.querySelectorAll('.kd-modaldialog');
  var observer = new MutationObserver(confineOrRestoreFocus_);
  var options = /** @type {MutationObserverInit} */({
    subtree: false,
    attributes: true
  });
  for (var i = 0; i < dialogs.length; ++i) {
    observer.observe(dialogs[i], options);
  }
};

/**
 * @param {Array<MutationRecord>} mutations The set of mutations affecting
 *     an observed node.
 */
function confineOrRestoreFocus_(mutations) {
  // The list of mutations can include duplicates, so reduce it to a canonical
  // show/hide list.
  /** @type {Array<Node>} */
  var shown = [];
  /** @type {Array<Node>} */
  var hidden = [];
  for (var i = 0; i < mutations.length; ++i) {
    var mutation = mutations[i];
    if (mutation.type == 'attributes' &&
        mutation.attributeName == 'hidden') {
      var node = mutation.target;
      if (node.hidden && hidden.indexOf(node) == -1) {
        hidden.push(node);
      } else if (!node.hidden && shown.indexOf(node) == -1) {
        shown.push(node);
      }
    }
  }
  var kSavedAttributeName = 'data-saved-tab-index';
  // If any dialogs have been dismissed, restore all the tabIndex attributes.
  if (hidden.length != 0) {
    var elements = document.querySelectorAll('[' + kSavedAttributeName + ']');
    for (var i = 0 ; i < elements.length; ++i) {
      var element = /** @type {Element} */ (elements[i]);
      element.tabIndex = element.getAttribute(kSavedAttributeName);
      element.removeAttribute(kSavedAttributeName);
    }
  }
  // If any dialogs have been shown, confine keyboard navigation to the first
  // one. We don't have nested modal dialogs, so this will suffice for now.
  if (shown.length != 0) {
    var selector = '[tabIndex],a,area,button,input,select,textarea';
    var disable = document.querySelectorAll(selector);
    var except = shown[0].querySelectorAll(selector);
    for (var i = 0; i < disable.length; ++i) {
      var element = /** @type {Element} */ (disable[i]);
      var removeFromKeyboardNavigation = true;
      for (var j = 0; j < except.length; ++j) {  // No indexOf on NodeList
        if (element == except[j]) {
          removeFromKeyboardNavigation = false;
          break;
        }
      }
      if (removeFromKeyboardNavigation) {
        element.setAttribute(kSavedAttributeName, element.tabIndex);
        element.tabIndex = -1;
      }
    }
  }
}

/**
 * @param {string} tag
 */
remoting.showSetupProcessingMessage = function(tag) {
  var messageDiv = document.getElementById('host-setup-processing-message');
  l10n.localizeElementFromTag(messageDiv, tag);
  remoting.setMode(remoting.AppMode.HOST_SETUP_PROCESSING);
}

remoting.testEvents = new base.EventSourceImpl();

/** @enum {string} */
remoting.testEvents.Names = {
  uiModeChanged: 'uiModeChanged'
};

remoting.testEvents.defineEvents(base.values(remoting.testEvents.Names));