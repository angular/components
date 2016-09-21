// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/**
 * A Dialog that is shown to the user when the connection is dropped.
 *
 * @constructor
 * @param {HTMLElement} rootElement
 * @param {remoting.WindowShape=} opt_windowShape
 * @implements {base.Disposable}
 */
remoting.ConnectionDroppedDialog = function(rootElement, opt_windowShape) {
  /** @private */
  this.dialog_ = new remoting.Html5ModalDialog({
    dialog: /** @type {HTMLDialogElement} */ (rootElement),
    primaryButton: rootElement.querySelector('.restart-button'),
    secondaryButton: rootElement.querySelector('.close-button'),
    closeOnEscape: false,
    windowShape: opt_windowShape
  });

  /** @private */
  this.disposables_ = new base.Disposables(this.dialog_);
};

remoting.ConnectionDroppedDialog.prototype.dispose = function() {
  base.dispose(this.disposables_);
  this.disposables_ = null;
};

/**
 * @return {Promise}  Promise that resolves if
 *     the user chooses to reconnect, or rejects if the user chooses to cancel.
 *     This class doesn't re-establish the connection.  The caller must
 *     implement the reconnect logic.
 */
remoting.ConnectionDroppedDialog.prototype.show = function() {
  var promise = this.dialog_.show();
  this.waitForOnline_().then(
    this.dialog_.close.bind(this.dialog_, remoting.MessageDialog.Result.PRIMARY)
  );
  return promise.then(function(/** remoting.MessageDialog.Result */ result) {
    if (result === remoting.MessageDialog.Result.PRIMARY) {
      return Promise.resolve();
    } else {
      return Promise.reject(new remoting.Error(remoting.Error.Tag.CANCELLED));
    }
  });
};

/**
 * @private
 * @return {Promise}
 */
remoting.ConnectionDroppedDialog.prototype.waitForOnline_ = function() {
  if (base.isOnline()) {
    return Promise.resolve();
  }

  var deferred = new base.Deferred();
  this.disposables_.add(new base.DomEventHook(
      window, 'online', deferred.resolve.bind(deferred), false));
  return deferred.promise();
};

})();
