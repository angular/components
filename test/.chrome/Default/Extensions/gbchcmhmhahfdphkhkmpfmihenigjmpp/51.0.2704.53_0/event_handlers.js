// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/**
 * @param {Array<{event: string, id: string,
 *     fn: function(Event):void}>} actions Array of actions to register.
 */
function registerEventListeners(actions) {
  for (var i = 0; i < actions.length; ++i) {
    var action = actions[i];
    registerEventListener(action.id, action.event, action.fn);
  }
}

/**
 * Add an event listener to the specified element.
 * @param {string} id Id of element.
 * @param {string} eventname Event name.
 * @param {function(Event):void} fn Event handler.
 */
function registerEventListener(id, eventname, fn) {
  var element = document.getElementById(id);
  if (element) {
    element.addEventListener(eventname, fn, false);
  } else {
    console.error('Could not set ' + eventname +
        ' event handler on element ' + id +
        ': element not found.');
  }
}
