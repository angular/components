// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Interface abstracting the protocol extension functionality.
 * Instances of this class can be registered with the ProtocolExtensionManager
 * to enhance the communication protocol between the host and client.
 * Note that corresponding support on the host side is required.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/**
 * @interface
 */
remoting.ProtocolExtension = function() {};

/**
 * Return a list of the extension message types that this class can handle.
 * All extension messages that match these types will be sent to the extension.
 *
 * @return {Array<string>}
 */
remoting.ProtocolExtension.prototype.getExtensionTypes = function() {};

/**
 * Called when the connection has been established to start the extension.
 *
 * @param {function(string,string)} sendMessageToHost Callback to send a message
 *     to the host.
 */
remoting.ProtocolExtension.prototype.startExtension =
    function(sendMessageToHost) {};

/**
 * Called when an extension message of a matching type is received.
 *
 * @param {string} type The message type.
 * @param {Object} message The parsed extension message data.
 * @return {boolean} True if the extension message was handled.
 */
remoting.ProtocolExtension.prototype.onExtensionMessage =
    function(type, message) {};
