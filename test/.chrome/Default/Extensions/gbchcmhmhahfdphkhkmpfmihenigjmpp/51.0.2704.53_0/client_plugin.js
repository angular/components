// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Interface abstracting the ClientPlugin functionality.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @interface
 * @extends {base.Disposable}
 */
remoting.ClientPlugin = function() {};

/**
 * @return {remoting.HostDesktop}
 */
remoting.ClientPlugin.prototype.hostDesktop = function() {};

/**
 * @return {remoting.ProtocolExtensionManager}
 */
remoting.ClientPlugin.prototype.extensions = function() {};

/**
 * @return {HTMLElement} The DOM element representing the remote session.
 */
remoting.ClientPlugin.prototype.element = function() {};

/**
 * @return {Promise<void>}  A promise that will resolve when the plugin is
 *     initialized or reject if it fails.
 */
remoting.ClientPlugin.prototype.initialize = function() {};

/**
 * @param {remoting.Host} host The host to connect to.
 * @param {string} localJid Local jid.
 * @param {remoting.CredentialsProvider} credentialsProvider
 */
remoting.ClientPlugin.prototype.connect =
    function(host, localJid, credentialsProvider) {};

/**
 * @param {number} key The keycode to inject.
 * @param {boolean} down True for press; false for a release.
 */
remoting.ClientPlugin.prototype.injectKeyEvent =
    function(key, down) {};

/**
 * Sends a key combination to the host, by sending down events for
 * the given keys, followed by up events in reverse order.
 *
 * @param {Array<number>} keys Key codes to be sent.
 * @return {void} Nothing.
 */
remoting.ClientPlugin.prototype.injectKeyCombination = function(keys) {};

/**
 * Sets and stores the key remapping setting for the current host.
 *
 * @param {!Object} remappings Key mappings, specified as {from: to}, where
 *     |from| and |to| are both USB keycodes, |from| is a decimal representation
 *     (because object keys must be strings) and |to| is a number.
 */
remoting.ClientPlugin.prototype.setRemapKeys = function(remappings) {};

/**
 * @param {number} from
 * @param {number} to
 */
remoting.ClientPlugin.prototype.remapKey = function(from, to) {};

/**
 * Release all keys currently being pressed.
 */
remoting.ClientPlugin.prototype.releaseAllKeys = function() {};

/**
 * @param {string} iq
 */
remoting.ClientPlugin.prototype.onIncomingIq = function(iq) {};

/**
 * @param {remoting.ClientSession.Capability} capability
 * @return {boolean} True if the capability has been negotiated between
 *     the client and host.
 */
remoting.ClientPlugin.prototype.hasCapability = function(capability) {};

/**
 * Sends a clipboard item to the host.
 *
 * @param {string} mimeType The MIME type of the clipboard item.
 * @param {string} item The clipboard item.
 */
remoting.ClientPlugin.prototype.sendClipboardItem =
    function(mimeType, item) {};

/**
 * Notifies the plugin whether to send touch events to the host.
 *
 * @param {boolean} enable True if touch events should be sent.
 */
remoting.ClientPlugin.prototype.enableTouchEvents = function(enable) {};

/**
 * Request that this client be paired with the current host.
 *
 * @param {string} clientName The human-readable name of the client.
 * @param {function(string, string):void} onDone Callback to receive the
 *     client id and shared secret when they are available.
 */
remoting.ClientPlugin.prototype.requestPairing =
    function(clientName, onDone) {};

/**
 * Allows automatic mouse-lock.
 */
remoting.ClientPlugin.prototype.allowMouseLock = function() {};

/**
 * @param {boolean} pause True to pause the audio stream; false to resume it.
 */
remoting.ClientPlugin.prototype.pauseAudio = function(pause) {};

/**
 * @param {boolean} pause True to pause the video stream; false to resume it.
 */
remoting.ClientPlugin.prototype.pauseVideo = function(pause) {};

/**
 * @return {remoting.ClientSession.PerfStats} A summary of the connection
 *     performance.
 */
remoting.ClientPlugin.prototype.getPerfStats = function() {};

/**
 * @param {remoting.ClientPlugin.ConnectionEventHandler} handler
 */
remoting.ClientPlugin.prototype.setConnectionEventHandler =
    function(handler) {};

/**
 * @param {function(string, number, number):void} handler Callback for
 *     processing large mouse cursor images. The first parameter is a data:
 *     URL encoding the mouse cursor; the second and third parameters are
 *     the cursor hotspot's x- and y-coordinates, respectively.
 */
remoting.ClientPlugin.prototype.setMouseCursorHandler = function(handler) {};

/**
 * @param {function(string, string):void} handler Callback for processing
 *    clipboard data injected from the host. The first parameter is the mime
 *    type and the second parameter is the actual data.
 */
remoting.ClientPlugin.prototype.setClipboardHandler = function(handler) {};

/**
 * @param {function({rects:Array<Array<number>>}):void|null} handler Callback
 *     to receive dirty region information for each video frame, for debugging.
 */
remoting.ClientPlugin.prototype.setDebugDirtyRegionHandler =
    function(handler) {};

/**
 * @interface
 */
remoting.ClientPlugin.ConnectionEventHandler = function() {};

/**
 * @param {string} iq
 */
remoting.ClientPlugin.ConnectionEventHandler.prototype.onOutgoingIq =
    function(iq) {};

/**
 * @param {string} msg
 */
remoting.ClientPlugin.ConnectionEventHandler.prototype.onDebugMessage =
    function(msg) {};

/**
 * @param {remoting.ClientSession.State} status The plugin's status.
 * @param {remoting.ClientSession.ConnectionError} error The plugin's error
 *        state, if any.
 */
remoting.ClientPlugin.ConnectionEventHandler.prototype.
    onConnectionStatusUpdate = function(status, error) {};

/**
 * @param {string} channel The channel name.
 * @param {string} connectionType The new connection type.
 */
remoting.ClientPlugin.ConnectionEventHandler.prototype.onRouteChanged =
    function(channel, connectionType) {};

/**
 * @param {boolean} ready True if the connection is ready.
 */
remoting.ClientPlugin.ConnectionEventHandler.prototype.onConnectionReady =
    function(ready) {};

/** Called when the first video frame is received */
remoting.ClientPlugin.ConnectionEventHandler.prototype.onFirstFrameReceived =
    function() {};

/**
 * @interface
 */
remoting.ClientPluginFactory = function() {};

/**
 * @param {Element} container The container for the embed element.
 * @param {Array<string>} requiredCapabilities
 * @return {remoting.ClientPlugin} A new client plugin instance.
 */
remoting.ClientPluginFactory.prototype.createPlugin =
    function(container, requiredCapabilities) {};

/**
 * Preload the plugin to make instantiation faster when the user tries
 * to connect.
 */
remoting.ClientPluginFactory.prototype.preloadPlugin = function() {};

/**
 * @type {remoting.ClientPluginFactory}
 */
remoting.ClientPlugin.factory = null;
