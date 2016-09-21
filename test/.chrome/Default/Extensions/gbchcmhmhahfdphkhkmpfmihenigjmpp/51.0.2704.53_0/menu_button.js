// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Class representing a menu button and its associated menu items.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @constructor
 * @param {Element} container The element containing the <button> and <ul>
 *     elements comprising the menu. It should have the "menu-button" class.
 * @param {function():void=} opt_onShow Optional callback invoked before the
 *     menu is shown.
 * @param {function():void=} opt_onHide Optional callback after before the
 *     menu is hidden.
 */
remoting.MenuButton = function(container, opt_onShow, opt_onHide) {
  /** @private {HTMLElement} */
  this.button_ = /** @type {HTMLElement} */
      (container.querySelector('button,.menu-button-activator'));

  /** @private {HTMLElement} */
  this.menu_ = /** @type {HTMLElement} */ (container.querySelector('ul'));

  /** @private {undefined|function():void} */
  this.onShow_ = opt_onShow;

  /** @private {undefined|function():void} */
  this.onHide_ = opt_onHide;

  /**
   * Create a "click-trap" div covering the entire document, but below the
   * menu in the z-order. This ensures the the menu can be closed by clicking
   * anywhere. Note that adding this event handler to <body> is not enough,
   * because elements can prevent event propagation; specifically, the client
   * plugin element does this.
   *
   * @private {HTMLElement}
   */
  this.clickTrap_ = /** @type {HTMLElement} */ (document.createElement('div'));
  this.clickTrap_.classList.add('menu-button-click-trap');

  /** @type {remoting.MenuButton} */
  var that = this;

  var closeHandler = function() {
    that.button_.classList.remove(remoting.MenuButton.BUTTON_ACTIVE_CLASS_);
    container.removeChild(that.clickTrap_);
    if (that.onHide_) {
      that.onHide_();
    }
  };

  var onClick = function() {
    if (that.onShow_) {
      that.onShow_();
    }
    that.button_.classList.add(remoting.MenuButton.BUTTON_ACTIVE_CLASS_);
    container.appendChild(that.clickTrap_);
  };

  this.button_.addEventListener('click', onClick, false);
  this.clickTrap_.addEventListener('click', closeHandler, false);
  this.menu_.addEventListener('click', closeHandler, false);
};

/**
 * @return {HTMLElement} The button that activates the menu.
 */
remoting.MenuButton.prototype.button = function() {
  return this.button_;
};

/**
 * @return {HTMLElement} The menu.
 */
remoting.MenuButton.prototype.menu = function() {
  return this.menu_;
};

/**
 * Set or unset the selected state of an <li> menu item.
 * @param {Element} item The menu item to update.
 * @param {boolean} selected True to select the item, false to deselect it.
 * @return {void} Nothing.
 */
remoting.MenuButton.select = function(item, selected) {
  if (selected) {
    item.classList.add('selected');
  } else {
    item.classList.remove('selected');
  }
};

/** @const @private */
remoting.MenuButton.BUTTON_ACTIVE_CLASS_ = 'active';
