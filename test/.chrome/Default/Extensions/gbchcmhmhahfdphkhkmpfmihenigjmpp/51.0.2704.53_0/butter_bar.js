// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * ButterBar class that is used to show the butter bar with various
 * notifications.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @constructor
 */
remoting.ButterBar = function() {
  this.storageKey_ = '';

  chrome.storage.sync.get(
      [remoting.ButterBar.kSurveyStorageKey_],
      this.onStateLoaded_.bind(this));
}

/**
 * Shows butter bar with the specified |message| and updates |storageKey| after
 * the bar is dismissed.
 *
 * @param {string} messageId
 * @param {string|Array} substitutions
 * @param {string} storageKey
 * @private
 */
remoting.ButterBar.prototype.show_ =
    function(messageId, substitutions, storageKey) {
  this.storageKey_ = storageKey;

  var messageElement = document.getElementById(remoting.ButterBar.kMessageId_);
  l10n.localizeElementFromTag(messageElement, messageId, substitutions, true);
  var acceptLink =
      /** @type{Element} */ (messageElement.getElementsByTagName('a')[0]);
  acceptLink.addEventListener(
      'click', this.dismiss.bind(this, true), false);

  document.getElementById(remoting.ButterBar.kDismissId_).addEventListener(
      'click', this.dismiss.bind(this, false), false);

  document.getElementById(remoting.ButterBar.kId_).hidden = false;
}

/**
  * @param {Object} syncValues
  * @private
  */
remoting.ButterBar.prototype.onStateLoaded_ = function(syncValues) {
  /** @type {boolean} */
  var surveyDismissed = !!syncValues[remoting.ButterBar.kSurveyStorageKey_];

  if (!surveyDismissed) {
    this.show_(/*i18n-content*/'SURVEY_INVITATION',
               ['<a href="http://goo.gl/njH2q" target="_blank">', '</a>'],
               remoting.ButterBar.kSurveyStorageKey_);
  }
};

/** @const @private */
remoting.ButterBar.kId_ = 'butter-bar';

/** @const @private */
remoting.ButterBar.kMessageId_ = 'butter-bar-message';
/** @const @private */
remoting.ButterBar.kDismissId_ = 'butter-bar-dismiss';

/** @const @private */
remoting.ButterBar.kSurveyStorageKey_ = 'feedback-survey-dismissed';

/**
 * Hide the butter bar request and record some basic information about the
 * current state of the world in synced storage. This may be useful in the
 * future if we want to show the request again. At the moment, the data itself
 * is ignored; only its presence or absence is important.
 *
 * @param {boolean} accepted True if the user clicked the "accept" link;
 *     false if they clicked the close icon.
 */
remoting.ButterBar.prototype.dismiss = function(accepted) {
  var value = {};
  value[this.storageKey_] = {
    optIn: accepted,
    date: new Date(),
    version: chrome.runtime.getManifest().version
  };
  chrome.storage.sync.set(value);

  document.getElementById(remoting.ButterBar.kId_).hidden = true;
};
