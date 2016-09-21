// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Dialog for showing the list of clients that are paired with this host.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * Extract the appropriate fields from the input parameter, if present. Use the
 * isValid() method to determine whether or not a valid paired client instance
 * was provided.
 *
 * @param {Object} pairedClient The paired client, as returned by the native
 *     host instance.
 * @constructor
 */
remoting.PairedClient = function(pairedClient) {
  if (!pairedClient || typeof(pairedClient) != 'object') {
    return;
  }

  this.clientId = /** @type {string} */ (pairedClient['clientId']);
  this.clientName = /** @type {string} */ (pairedClient['clientName']);
  this.createdTime = /** @type {number} */ (pairedClient['createdTime']);

  /** @type {Element} */
  this.tableRow = null;
  /** @type {Element} */
  this.deleteButton = null;
};

/**
 * Create the DOM elements representing this client in the paired client
 * manager dialog.
 *
 * @param {remoting.PairedClientManager} parent The paired client manager
 *     dialog containing this row.
 * @param {Element} tbody The <tbody> element to which to append the row.
 */
remoting.PairedClient.prototype.createDom = function(parent, tbody) {
  this.tableRow = document.createElement('tr');
  var td = document.createElement('td');
  td.innerText = new Date(this.createdTime).toLocaleDateString();
  this.tableRow.appendChild(td);
  td = document.createElement('td');
  td.innerText = this.clientName;
  this.tableRow.appendChild(td);
  td = document.createElement('td');
  this.deleteButton = document.createElement('a');
  this.deleteButton.href = '#';
  this.deleteButton.innerText = chrome.i18n.getMessage(
      /*i18n-content*/'DELETE_PAIRED_CLIENT');
  this.deleteButton.id = 'delete-client-' + this.clientId;
  this.deleteButton.addEventListener(
      'click',
      parent.deletePairedClient.bind(parent, this),
      false);
  td.appendChild(this.deleteButton);
  this.tableRow.appendChild(td);
  tbody.appendChild(this.tableRow);
};

/**
 * Show or hide the "Delete" button for this row.
 *
 * @param {boolean} show True to show the button; false to hide it.
 */
remoting.PairedClient.prototype.showButton = function(show) {
  this.deleteButton.hidden = !show;
};

/**
 * @return {boolean} True if the constructor parameter was a well-formed
 *     paired client instance.
 */
remoting.PairedClient.prototype.isValid = function() {
  return typeof(this.clientId) == 'string' &&
         typeof(this.clientName) == 'string' &&
         typeof(this.createdTime) == 'number';
};

/**
 * Converts a raw object to an array of PairedClient instances. Returns null if
 * the input object is incorrectly formatted.
 *
 * @param {*} pairedClients The object to convert.
 * @return {Array<remoting.PairedClient>} The converted result.
 */
remoting.PairedClient.convertToPairedClientArray = function(pairedClients) {
  if (!(pairedClients instanceof Array)) {
    console.error('pairedClients is not an Array:', pairedClients);
    return null;
  }

  var result = [];
  for (var i = 0; i < pairedClients.length; i++) {
    var pairedClient = new remoting.PairedClient(pairedClients[i]);
    if (!pairedClient.isValid()) {
      console.error('pairedClient[' + i + '] has incorrect format:',
                    /** @type {*} */(pairedClients[i]));
      return null;
    }
    result.push(pairedClient);
  }
  return result;
}

/**
 * @param {remoting.HostController} hostController
 * @param {HTMLElement} listContainer HTML <div> to contain the list of paired
 *     clients.
 * @param {HTMLElement} message HTML <div> containing the message notifying
 *     the user that clients are paired and containing the link to open the
 *     dialog.
 * @param {HTMLElement} deleteAllButton HTML <button> inititating the "delete
 *     all" action.
 * @param {HTMLElement} closeButton HTML <button> to close the dialog.
 * @param {HTMLElement} noPairedClients HTML <div> containing a message shown
 *     when all clients have been deleted.
 * @param {HTMLElement} workingSpinner HTML element containing a spinner
 *     graphic shown while a deletion is in progress.
 * @param {HTMLElement} errorDiv HTML <div> containing an error message shown
 *     if a delete operation fails.
 * @constructor
 */
remoting.PairedClientManager = function(hostController, listContainer, message,
                                        deleteAllButton, closeButton,
                                        noPairedClients, workingSpinner,
                                        errorDiv) {
  /**
   * @private
   */
  this.hostController_ = hostController;
  /**
   * @private
   */
  this.message_ = message;
  /**
   * @private
   */
  this.deleteAllButton_ = deleteAllButton;
  /**
   * @private
   */
  this.closeButton_ = closeButton;
  /**
   * @private
   */
  this.noPairedClients_ = noPairedClients;
  /**
   * @private
   */
  this.workingSpinner_ = workingSpinner;
  /**
   * @private
   */
  this.errorDiv_ = errorDiv;
  /**
   * @type {Element}
   * @private
   */
  this.clientRows_ = listContainer.querySelector('tbody');
  /**
   * @type {Array<remoting.PairedClient>}
   */
  this.pairedClients_ = [];

  this.deleteAllButton_.addEventListener('click',
                                         this.deleteAll_.bind(this),
                                         false);
};

/**
 * Populate the dialog with the list of paired clients and show or hide the
 * message as appropriate.
 *
 * @param {*} pairedClients The list of paired clients as returned by the
 *     native host component.
 * @return {void} Nothing.
 */
remoting.PairedClientManager.prototype.setPairedClients =
    function(pairedClients) {
  // Reset table.
  while (this.clientRows_.lastChild) {
    this.clientRows_.removeChild(this.clientRows_.lastChild);
  }

  this.pairedClients_ =
    remoting.PairedClient.convertToPairedClientArray(pairedClients);
  for (var i = 0; i < this.pairedClients_.length; ++i) {
    var client = this.pairedClients_[i];
    client.createDom(this, this.clientRows_);
  }

  // Show or hide the "this computer has paired clients" message.
  this.setWorking_(false)
};

/**
 * Enter or leave "working" mode. This indicates to the user that a delete
 * operation is in progress. All dialog UI is disabled until it completes.
 *
 * @param {boolean} working True to enter "working" mode; false to leave it.
 * @private
 */
remoting.PairedClientManager.prototype.setWorking_ = function(working) {
  var hasPairedClients = (this.pairedClients_.length != 0);
  for (var i = 0; i < this.pairedClients_.length; ++i) {
    this.pairedClients_[i].showButton(!working);
  }
  this.closeButton_.disabled = working;
  this.workingSpinner_.hidden = !working;
  this.errorDiv_.hidden = true;
  this.message_.hidden = !hasPairedClients;
  this.deleteAllButton_.disabled = working || !hasPairedClients;
  this.noPairedClients_.hidden = hasPairedClients;
};

/**
 * Error callback for delete operations.
 *
 * @param {!remoting.Error} error The error message.
 * @private
 */
remoting.PairedClientManager.prototype.onError_ = function(error) {
  this.setWorking_(false);
  l10n.localizeElementFromTag(this.errorDiv_, error.getTag());
  this.errorDiv_.hidden = false;
};

/**
 * Delete a single paired client.
 *
 * @param {remoting.PairedClient} client The pairing to delete.
 */
remoting.PairedClientManager.prototype.deletePairedClient = function(client) {
  this.setWorking_(true);
  this.hostController_.deletePairedClient(client.clientId,
      this.setWorking_.bind(this, false),
      this.onError_.bind(this));
  this.clientRows_.removeChild(client.tableRow);
  for (var i = 0; i < this.pairedClients_.length; ++i) {
    if (this.pairedClients_[i] == client) {
      this.pairedClients_.splice(i, 1);
      break;
    }
  }
};

/**
 * Delete all paired clients.
 *
 * @private
 */
remoting.PairedClientManager.prototype.deleteAll_ = function() {
  this.setWorking_(true);
  this.hostController_.clearPairedClients(
      this.setWorking_.bind(this, false),
      this.onError_.bind(this));

  while (this.clientRows_.lastChild) {
    this.clientRows_.removeChild(this.clientRows_.lastChild);
  }
  this.pairedClients_ = [];
};

/**
 * Get the id of the first paired client for testing.
 *
 * @private
 * @return {string} The client id of the first paired client in the list.
 */
remoting.PairedClientManager.prototype.getFirstClientIdForTesting_ =
    function() {
  return this.pairedClients_.length > 0 ? this.pairedClients_[0].clientId : '';
};


/** @type {remoting.PairedClientManager} */
remoting.pairedClientManager = null;
