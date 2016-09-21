// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Class representing the client tool-bar.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @param {HTMLElement} toolbar The HTML element representing the tool-bar.
 * @param {function()} disconnectCallback Callback for disconnecting the
 *    session.
 * @constructor
 */
remoting.Toolbar = function(toolbar, disconnectCallback) {
  /** @private {HTMLElement} */
  this.toolbar_ = toolbar;
  /** @private {HTMLElement} */
  this.stub_ =
      /** @type {HTMLElement} */(toolbar.querySelector('.toolbar-stub'));
  /** @private {number?} The id of the preview timer, if any. */
  this.timerId_ = null;
  /** @private {number} Left edge of the toolbar stub, updated on resize. */
  this.stubLeft_ = 0;
  /** @private {number} Right edge of the toolbar stub, updated on resize. */
  this.stubRight_ = 0;

  /** @private {remoting.MenuButton} */
  this.screenOptionsMenu_ = new remoting.MenuButton(
      document.getElementById('screen-options-menu'),
      this.onShowOptionsMenu_.bind(this));
  /** @private {remoting.MenuButton} */
  this.sendKeysMenu_ = new remoting.MenuButton(
      document.getElementById('send-keys-menu')
  );


  window.addEventListener('mousemove', remoting.Toolbar.onMouseMove, false);
  window.addEventListener('resize', this.center.bind(this), false);

  registerEventListener('toolbar-disconnect', 'click', disconnectCallback);
  registerEventListener('toolbar-stub',
                        'click', function() { remoting.toolbar.toggle(); });

  // Prevent the preview canceling if the user is interacting with the tool-bar.
  /** @type {remoting.Toolbar} */
  var that = this;
  var stopTimer = function() {
    if (that.timerId_) {
      window.clearTimeout(that.timerId_);
      that.timerId_ = null;
    }
  }
  this.toolbar_.addEventListener('mousemove', stopTimer, false);
};


/**
 * @return {remoting.OptionsMenu}
 */
remoting.Toolbar.prototype.createOptionsMenu = function() {
  return new remoting.OptionsMenu(
      document.getElementById('send-ctrl-alt-del'),
      document.getElementById('send-print-screen'),
      document.getElementById('map-right-ctrl-to-meta'),
      document.getElementById('screen-resize-to-client'),
      document.getElementById('screen-shrink-to-fit'),
      document.getElementById('new-window'),
      document.getElementById('toggle-full-screen'),
      null);
};

/**
 * Preview the tool-bar functionality by showing it for 3s.
 * @return {void} Nothing.
 */
remoting.Toolbar.prototype.preview = function() {
  this.toolbar_.classList.add(remoting.Toolbar.VISIBLE_CLASS_);
  if (this.timerId_) {
    window.clearTimeout(this.timerId_);
    this.timerId_ = null;
  }
  var classList = this.toolbar_.classList;
  this.timerId_ = window.setTimeout(
      classList.remove.bind(classList, remoting.Toolbar.VISIBLE_CLASS_),
      3000);
};

/**
 * Center the tool-bar horizonally.
 */
remoting.Toolbar.prototype.center = function() {
  var toolbarX = (window.innerWidth - this.toolbar_.clientWidth) / 2;
  this.toolbar_.style['left'] = toolbarX + 'px';
  var r = this.stub_.getBoundingClientRect();
  this.stubLeft_ = r.left;
  this.stubRight_ = r.right;
};

/**
 * Toggle the tool-bar visibility.
 */
remoting.Toolbar.prototype.toggle = function() {
  this.toolbar_.classList.toggle(remoting.Toolbar.VISIBLE_CLASS_);
};

/**
 * @param {remoting.DesktopConnectedView} desktopConnectedView The view for
 *     the active session, or null if there is no connection.
 */
remoting.Toolbar.prototype.setDesktopConnectedView = function(
    desktopConnectedView) {
  var connectedTo = document.getElementById('connected-to');
  connectedTo.innerText =
      desktopConnectedView ? desktopConnectedView.getHostDisplayName() : "";
};

/**
 * Test the specified co-ordinate to see if it is close enough to the stub
 * to activate it.
 *
 * @param {number} x The x co-ordinate.
 * @param {number} y The y co-ordinate.
 * @return {boolean} True if the position should activate the tool-bar stub, or
 *     false otherwise.
 * @private
 */
remoting.Toolbar.prototype.hitTest_ = function(x, y) {
  var threshold = 50;
  return (x >= this.stubLeft_ - threshold &&
          x <= this.stubRight_ + threshold &&
          y < threshold);
};

/**
 * Called whenever the mouse moves in the document. This is used to make the
 * active area of the tool-bar stub larger without making a corresponding area
 * of the host screen inactive.
 *
 * @param {Event} event The mouse move event.
 * @return {void} Nothing.
 */
remoting.Toolbar.onMouseMove = function(event) {
  if (remoting.toolbar) {
    var toolbarStub = remoting.toolbar.stub_;
    if (remoting.toolbar.hitTest_(event.x, event.y)) {
      toolbarStub.classList.add(remoting.Toolbar.STUB_EXTENDED_CLASS_);
    } else {
      toolbarStub.classList.remove(remoting.Toolbar.STUB_EXTENDED_CLASS_);
    }
  } else {
    document.removeEventListener('mousemove',
                                 remoting.Toolbar.onMouseMove, false);
  }
};

/**
 * Updates the options menu to reflect the current scale-to-fit and full-screen
 * settings.
 * @return {void} Nothing.
 * @private
 */
remoting.Toolbar.prototype.onShowOptionsMenu_ = function() {
  remoting.optionsMenu.onShow();
};

/** @type {remoting.Toolbar} */
remoting.toolbar = null;

/** @private */
remoting.Toolbar.STUB_EXTENDED_CLASS_ = 'toolbar-stub-extended';
/** @private */
remoting.Toolbar.VISIBLE_CLASS_ = 'toolbar-visible';
