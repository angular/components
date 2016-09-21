// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/**
 * A helper class for implementing dialogs with an input field using
 * remoting.setMode().
 *
 * @param {remoting.AppMode} mode
 * @param {HTMLElement} formElement
 * @param {HTMLElement} inputField
 * @param {HTMLElement} cancelButton
 *
 * @constructor
 */
remoting.InputDialog = function(mode, formElement, inputField, cancelButton) {
  /** @private */
  this.appMode_ = mode;
  /** @private */
  this.formElement_ = formElement;
  /** @private */
  this.cancelButton_ = cancelButton;
  /** @private */
  this.inputField_ = inputField;
  /** @private {base.Deferred} */
  this.deferred_ = null;
  /** @private {base.Disposables} */
  this.eventHooks_ = null;
};

/**
 * @return {Promise<string>}  Promise that resolves with the value of the
 *    inputField or rejects with |remoting.Error.CANCELLED| if the user clicks
 *    on the cancel button.
 */
remoting.InputDialog.prototype.show = function() {
  var onCancel = this.createFormEventHandler_(this.onCancel_.bind(this));
  var onOk = this.createFormEventHandler_(this.onSubmit_.bind(this));

  this.eventHooks_ = new base.Disposables(
      new base.DomEventHook(this.formElement_, 'submit', onOk, false),
      new base.DomEventHook(this.cancelButton_, 'click', onCancel, false));
  console.assert(this.deferred_ === null, 'No deferred Promise found.');
  this.deferred_ = new base.Deferred();
  remoting.setMode(this.appMode_);
  return this.deferred_.promise();
};

/** @return {HTMLElement} */
remoting.InputDialog.prototype.inputField = function() {
  return this.inputField_;
};

/** @private */
remoting.InputDialog.prototype.onSubmit_ = function() {
  this.deferred_.resolve(this.inputField_.value);
};

/** @private */
remoting.InputDialog.prototype.onCancel_ = function() {
  this.deferred_.reject(new remoting.Error(remoting.Error.Tag.CANCELLED));
};

/**
 * @param {function():void} handler
 * @return {Function}
 * @private
 */
remoting.InputDialog.prototype.createFormEventHandler_ = function(handler) {
  var that = this;
  return function (/** Event */ e) {
    // Prevents form submission from reloading the v1 app.
    e.preventDefault();

    // Set the focus away from the password field. This has to be done
    // before the password field gets hidden, to work around a Blink
    // clipboard-handling bug - http://crbug.com/281523.
    that.cancelButton_.focus();
    handler();
    base.dispose(that.eventHooks_);
    that.eventHooks_ = null;
    that.deferred_ = null;
  };
};

/**
 * A helper class for implementing MessageDialog with a primary and
 * and secondary button using remoting.setMode().
 *
 * @param {remoting.AppMode} mode
 * @param {HTMLElement} primaryButton
 * @param {HTMLElement=} opt_secondaryButton
 *
 * @constructor
 * @implements {base.Disposable}
 */
remoting.MessageDialog = function(mode, primaryButton, opt_secondaryButton) {
  /** @private @const */
  this.mode_ = mode;
  /** @private @const */
  this.primaryButton_ = primaryButton;
  /** @private @const */
  this.secondaryButton_ = opt_secondaryButton;
  /** @private {base.Deferred} */
  this.deferred_ = null;
  /** @private {base.Disposables} */
  this.eventHooks_ = null;
};

/**
 * @return {Promise<remoting.MessageDialog.Result>}  Promise that resolves with
 * the button clicked.
 */
remoting.MessageDialog.prototype.show = function() {
  console.assert(this.eventHooks_ === null, 'Duplicate show() invocation.');
  this.eventHooks_ = new base.Disposables(new base.DomEventHook(
      this.primaryButton_, 'click',
      this.onClicked_.bind(this, remoting.MessageDialog.Result.PRIMARY),
      false));

  if (this.secondaryButton_) {
    this.eventHooks_.add(new base.DomEventHook(
        this.secondaryButton_, 'click',
        this.onClicked_.bind(this, remoting.MessageDialog.Result.SECONDARY),
        false));
  }

  console.assert(this.deferred_ === null, 'No deferred Promise found.');
  this.deferred_ = new base.Deferred();
  remoting.setMode(this.mode_);
  return this.deferred_.promise();
};

remoting.MessageDialog.prototype.dispose = function() {
  base.dispose(this.eventHooks_);
  this.eventHooks_ = null;
  if (this.deferred_) {
    this.deferred_.reject(new remoting.Error(remoting.Error.Tag.CANCELLED));
  }
  this.deferred_ = null;
};

/**
 * @param {remoting.MessageDialog.Result} result
 * @private
 */
remoting.MessageDialog.prototype.onClicked_ = function(result) {
  this.deferred_.resolve(result);
  this.deferred_ = null;
  this.dispose();
};



/**
 * A promise-based dialog implementation using the <dialog> element.
 *
 * @param {remoting.Html5ModalDialog.Params} params
 * @constructor
 *
 * @implements {remoting.WindowShape.ClientUI}
 * @implements {base.Disposable}
 */
remoting.Html5ModalDialog = function(params) {
  /** @private */
  this.dialog_ = params.dialog;

  /** @private {base.Disposables} */
  this.eventHooks_ = new base.Disposables(
      new base.DomEventHook(
          this.dialog_, 'cancel', this.onCancel_.bind(this), false),
      new base.DomEventHook(
          params.primaryButton, 'click',
          this.close.bind(this, remoting.MessageDialog.Result.PRIMARY), false)
  );

  if (params.secondaryButton) {
    this.eventHooks_.add(new base.DomEventHook(
        params.secondaryButton, 'click',
        this.close.bind(this, remoting.MessageDialog.Result.SECONDARY), false));
  }

  /** @private */
  this.closeOnEscape_ = Boolean(params.closeOnEscape);

  /** @private */
  this.windowShape_ = params.windowShape;

  /** @private {base.Deferred} */
  this.deferred_ = null;
};

remoting.Html5ModalDialog.prototype.dispose = function() {
  if (this.dialog_.open) {
    this.close(remoting.MessageDialog.Result.CANCEL);
  }
  base.dispose(this.eventHooks_);
  this.eventHookes_ = null;
};

/**
 * @return {Promise<remoting.MessageDialog.Result>}  Promise that resolves with
 * the button clicked.
 */
remoting.Html5ModalDialog.prototype.show = function() {
  console.assert(this.deferred_ === null, 'No deferred Promise found.');
  this.deferred_ = new base.Deferred();
  this.dialog_.showModal();
  if (this.windowShape_) {
    this.windowShape_.registerClientUI(this);
    this.windowShape_.centerToDesktop(this.dialog_);
  }
  return this.deferred_.promise();
};

/** @param {Event} e */
remoting.Html5ModalDialog.prototype.onCancel_ = function(e) {
  e.preventDefault();
  if (this.closeOnEscape_) {
    this.close(remoting.MessageDialog.Result.CANCEL);
  }
};

/**
 * @param {remoting.MessageDialog.Result} result
 */
remoting.Html5ModalDialog.prototype.close = function(result) {
  if (!this.dialog_.open) {
    return;
  }
  this.dialog_.close();
  this.deferred_.resolve(result);
  this.deferred_ = null;
  if (this.windowShape_) {
    this.windowShape_.unregisterClientUI(this);
  }
};

remoting.Html5ModalDialog.prototype.addToRegion = function(rects) {
  var rect = /** @type {ClientRect} */(this.dialog_.getBoundingClientRect());

  // If the dialog is repositioned by setting the left and top, it takes a while
  // for getBoundingClientRect() to update the rectangle.
  var left = this.dialog_.style.left;
  var top = this.dialog_.style.top;

  rects.push({
    left: (left === '') ? rect.left : parseInt(left, 10),
    top: (top === '') ? rect.top : parseInt(top, 10),
    width: rect.width,
    height: rect.height
  });
};


/**
 * @param {Function} cancelCallback The callback to invoke when the user clicks
 *     on the cancel button.
 * @constructor
 */
remoting.ConnectingDialog = function(cancelCallback) {
  /** @private */
  this.dialog_ = new remoting.MessageDialog(
      remoting.AppMode.CLIENT_CONNECTING,
      base.getHtmlElement('cancel-connect-button'));
  /** @private */
  this.onCancel_ = cancelCallback;
};

remoting.ConnectingDialog.prototype.show = function() {
  var that = this;
  this.dialog_.show().then(function() {
    remoting.setMode(remoting.AppMode.HOME);
    that.onCancel_();
  // The promise rejects when the dialog is hidden.  Don't report that as error.
  }).catch(remoting.Error.handler(base.doNothing));
};

remoting.ConnectingDialog.prototype.hide = function() {
  this.dialog_.dispose();
};

/**
 * A factory object for the modal dialogs.  The factory will be stubbed out in
 * unit test to avoid UI dependencies on remoting.setMode().
 *
 * @constructor
 */
remoting.ModalDialogFactory = function() {};

/**
 * @param {Function} cancelCallback
 * @return {remoting.ConnectingDialog}
 */
remoting.ModalDialogFactory.prototype.createConnectingDialog =
    function(cancelCallback) {
  return new remoting.ConnectingDialog(cancelCallback);
};

/**
 * @param {remoting.Html5ModalDialog.Params} params
 * @return {remoting.Html5ModalDialog}
 */
remoting.ModalDialogFactory.prototype.createHtml5ModalDialog =
    function(params) {
  return new remoting.Html5ModalDialog(params);
};

/**
 * @param {remoting.AppMode} mode
 * @param {HTMLElement} primaryButton
 * @param {HTMLElement=} opt_secondaryButton
 * @return {remoting.MessageDialog}
 */
remoting.ModalDialogFactory.prototype.createMessageDialog =
    function(mode, primaryButton, opt_secondaryButton) {
  return new remoting.MessageDialog(mode, primaryButton, opt_secondaryButton);
};

/**
 * @param {remoting.AppMode} mode
 * @param {HTMLElement} formElement
 * @param {HTMLElement} inputField
 * @param {HTMLElement} cancelButton
 * @return {remoting.InputDialog}
 */
remoting.ModalDialogFactory.prototype.createInputDialog =
    function(mode, formElement, inputField, cancelButton) {
  return new remoting.InputDialog(mode, formElement, inputField, cancelButton);
};

/** @type {remoting.ModalDialogFactory} */
remoting.modalDialogFactory = new remoting.ModalDialogFactory();

})();

/**
 * Define the enum at the end of file as JSCompile doesn't understand enums that
 * are defined within an IIFE (Immediately Invoked Function Expression).
 * @enum {number}
 */
remoting.MessageDialog.Result = {
  PRIMARY: 0,
  SECONDARY: 1,
  CANCEL: 2 // User presses the escape button.
};

/**
 * Parameters for the remoting.Html5ModalDialog constructor.  Unless otherwise
 * noted, all parameters are optional.
 *
 * dialog: (required) The HTML dialog element.
 *
 * primaryButton: (required) The HTML element of the primary button.
 *
 * secondaryButton: The HTML element of the secondary button.
 *
 * closeOnEscape: Whether the user can dismiss the dialog by pressing the escape
 *     key. Default to false.
 *
 * @typedef {{
 *   dialog: HTMLDialogElement,
 *   primaryButton:HTMLElement,
 *   secondaryButton:(HTMLElement|undefined),
 *   closeOnEscape:(boolean|undefined),
 *   windowShape:(remoting.WindowShape|undefined)
 * }}
 */
remoting.Html5ModalDialog.Params;
