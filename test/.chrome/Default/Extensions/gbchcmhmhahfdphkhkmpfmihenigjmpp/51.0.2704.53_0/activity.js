// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/**
 * An Activity is a responsible for
 * 1. Showing the appropriate UX to establish a connection with the host and
 *    create a remoting.ClientSession.
 * 2. Handling connection failures and retrying if necessary.
 * 3. Responding to session state changes and showing UX if necessary.
 *
 * @interface
 * @extends {base.Disposable}
 * @extends {remoting.ClientSession.EventHandler}
 */
remoting.Activity = function() {};

/**
 * Starts a new connection.
 *
 * @return {void}
 */
remoting.Activity.prototype.start = function() {};

/**
 * Cancels or disconnects a remote connection.
 * @return {void}
 */
remoting.Activity.prototype.stop = function() {};

})();