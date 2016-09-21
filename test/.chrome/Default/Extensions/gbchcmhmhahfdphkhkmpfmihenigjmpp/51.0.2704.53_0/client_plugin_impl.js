// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview
 * Class that wraps low-level details of interacting with the client plugin.
 *
 * This abstracts a <embed> element and controls the plugin which does
 * the actual remoting work. It also handles differences between
 * client plugins versions when it is necessary.
 */

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

/** @constructor */
remoting.ClientPluginMessage = function() {
  /** @type {string} */
  this.method = '';

  /** @type {Object<*>} */
  this.data = {};
};

/**
 * @param {Element} container The container for the embed element.
 * @param {Array<string>} capabilities The set of capabilties that the
 *     session must support for this application.
 * @constructor
 * @implements {remoting.ClientPlugin}
 */
remoting.ClientPluginImpl = function(container, capabilities) {
  // TODO(kelvinp): Hack to remove all plugin elements as our current code does
  // not handle connection cancellation properly.
  container.innerText = '';
  this.plugin_ = remoting.ClientPluginImpl.createPluginElement_();
  this.plugin_.id = 'session-client-plugin';
  container.appendChild(this.plugin_);

  /** @private {Array<string>} */
  this.capabilities_ = capabilities;

  /** @private {remoting.ClientPlugin.ConnectionEventHandler} */
  this.connectionEventHandler_ = null;

  /** @private {?function(string, number, number)} */
  this.updateMouseCursorImage_ = base.doNothing;
  /** @private {?function(string, string)} */
  this.updateClipboardData_ = base.doNothing;
  /** @private {?function(string)} */
  this.onCastExtensionHandler_ = base.doNothing;
  /** @private {?function({rects:Array<Array<number>>}):void} */
  this.debugRegionHandler_ = null;

  /** @private {number} */
  this.pluginApiVersion_ = -1;
  /** @private {Array<string>} */
  this.pluginApiFeatures_ = [];
  /** @private {number} */
  this.pluginApiMinVersion_ = -1;
  /**
   * Capabilities that are negotiated between the client and the host.
   * @private {Array<remoting.ClientSession.Capability>}
   */
  this.hostCapabilities_ = null;
  /** @private {base.Deferred} */
  this.onInitializedDeferred_ = new base.Deferred();
  /** @private {function(string, string):void} */
  this.onPairingComplete_ = function(clientId, sharedSecret) {};
  /** @private {remoting.ClientSession.PerfStats} */
  this.perfStats_ = new remoting.ClientSession.PerfStats();

  /** @type {remoting.ClientPluginImpl} */
  var that = this;

  this.eventHooks_ = new base.Disposables(
    new base.DomEventHook(
      this.plugin_, 'message', this.handleMessage_.bind(this), false),
    new base.DomEventHook(
      this.plugin_, 'crash', this.onPluginCrashed_.bind(this), false),
    new base.DomEventHook(
      this.plugin_, 'error', this.onPluginLoadError_.bind(this), false));
  /** @private */
  this.hostDesktop_ = new remoting.ClientPlugin.HostDesktopImpl(
      this, this.postMessage_.bind(this));

  /** @private */
  this.extensions_ = new remoting.ProtocolExtensionManager(
      this.sendClientMessage_.bind(this));

  /** @private {remoting.CredentialsProvider} */
  this.credentials_ = null;

  /** @private {!Object} */
  this.keyRemappings_ = {};
};

/**
 * Creates plugin element without adding it to a container.
 *
 * @return {HTMLEmbedElement} Plugin element
 */
remoting.ClientPluginImpl.createPluginElement_ = function() {
  var plugin =
      /** @type {HTMLEmbedElement} */ (document.createElement('embed'));
  plugin.src = 'remoting_client_pnacl.nmf';
  plugin.type = 'application/x-pnacl';
  plugin.width = '0';
  plugin.height = '0';
  plugin.tabIndex = 0;  // Required, otherwise focus() doesn't work.
  return plugin;
};

/**
 * @param {remoting.ClientPlugin.ConnectionEventHandler} handler
 */
remoting.ClientPluginImpl.prototype.setConnectionEventHandler =
    function(handler) {
  this.connectionEventHandler_ = handler;
};

/**
 * @param {function(string, number, number):void} handler
 */
remoting.ClientPluginImpl.prototype.setMouseCursorHandler = function(handler) {
  this.updateMouseCursorImage_ = handler;
};

/**
 * @param {function(string, string):void} handler
 */
remoting.ClientPluginImpl.prototype.setClipboardHandler = function(handler) {
  this.updateClipboardData_ = handler;
};

/**
 * @param {?function({rects:Array<Array<number>>}):void} handler
 */
remoting.ClientPluginImpl.prototype.setDebugDirtyRegionHandler =
    function(handler) {
  this.debugRegionHandler_ = handler;
  this.plugin_.postMessage(JSON.stringify(
      { method: 'enableDebugRegion', data: { enable: handler != null } }));
};

/**
 * @param {Event} event Message from the plugin.
 * @private
 */
remoting.ClientPluginImpl.prototype.handleMessage_ = function(event) {
  var rawMessage =
      /** @type {remoting.ClientPluginMessage|string} */ (event.data);
  var message =
      /** @type {remoting.ClientPluginMessage} */
      ((typeof(rawMessage) == 'string') ? base.jsonParseSafe(rawMessage)
                                        : rawMessage);
  if (!message || !('method' in message) || !('data' in message)) {
    console.error('Received invalid message from the plugin:', rawMessage);
    return;
  }

  try {
    this.handleMessageMethod_(message);
  } catch(/** @type {*} */ e) {
    console.error(e);
  }
};

/** @private */
remoting.ClientPluginImpl.prototype.onPluginCrashed_ = function(event) {
  // If the plugin is initialized, there should be a connection event handler
  // and we should report the crash through it.  Otherwise, we should reject the
  // initialization promise.
  if (this.connectionEventHandler_) {
    this.connectionEventHandler_.onConnectionStatusUpdate(
        remoting.ClientSession.State.FAILED,
        remoting.ClientSession.ConnectionError.NACL_PLUGIN_CRASHED);
  } else {
    this.onInitializedDeferred_.reject(
        new remoting.Error(remoting.Error.Tag.NACL_PLUGIN_CRASHED));
  }
  console.error('NaCl Module crashed. ');
};

/** @private */
remoting.ClientPluginImpl.prototype.onPluginLoadError_ = function() {
  console.error('Failed to load plugin : ' + this.plugin_.lastError);
  this.onInitializedDeferred_.reject(
      new remoting.Error(
          remoting.Error.Tag.MISSING_PLUGIN, this.plugin_.lastError));
};

/**
 * @param {remoting.ClientPluginMessage}
 *    message Parsed message from the plugin.
 * @private
 */
remoting.ClientPluginImpl.prototype.handleMessageMethod_ = function(message) {
  /**
   * Splits a string into a list of words delimited by spaces.
   * @param {string} str String that should be split.
   * @return {!Array<string>} List of words.
   */
  var tokenize = function(str) {
    /** @type {Array<string>} */
    var tokens = str.match(/\S+/g);
    return tokens ? tokens : [];
  };

  if (this.connectionEventHandler_) {
    var handler = this.connectionEventHandler_;

    if (message.method == 'sendOutgoingIq') {
      handler.onOutgoingIq(base.getStringAttr(message.data, 'iq'));

    } else if (message.method == 'onConnectionStatus') {
      var stateString = base.getStringAttr(message.data, 'state');
      var state = remoting.ClientSession.State.fromString(stateString);
      var error = remoting.ClientSession.ConnectionError.fromString(
          base.getStringAttr(message.data, 'error'));

      // Delay firing the CONNECTED event until the capabilities are negotiated,
      // TODO(kelvinp): Fix the client plugin to fire capabilities and the
      // connected event in the same message.
      if (state === remoting.ClientSession.State.CONNECTED) {
        console.assert(this.hostCapabilities_ === null,
            'Capabilities should only be set after the session is connected');
        return;
      }
      handler.onConnectionStatusUpdate(state, error);

    } else if (message.method == 'onRouteChanged') {
      var channel = base.getStringAttr(message.data, 'channel');
      var connectionType = base.getStringAttr(message.data, 'connectionType');
      handler.onRouteChanged(channel, connectionType);

    } else if (message.method == 'onConnectionReady') {
      var ready = base.getBooleanAttr(message.data, 'ready');
      handler.onConnectionReady(ready);

    } else if (message.method == 'setCapabilities') {
      var capabilityString = base.getStringAttr(message.data, 'capabilities');
      console.log('plugin: setCapabilities: [' + capabilityString + ']');

      console.assert(this.hostCapabilities_ === null,
                     'setCapabilities() should only be called once.');
      this.hostCapabilities_ = tokenize(capabilityString);

      handler.onConnectionStatusUpdate(
          remoting.ClientSession.State.CONNECTED,
          remoting.ClientSession.ConnectionError.NONE);
      this.extensions_.start();

    } else if (message.method == 'onFirstFrameReceived') {
      handler.onFirstFrameReceived();

    }
  }

  if (message.method == 'hello') {
    this.onInitializedDeferred_.resolve();
  } else if (message.method == 'onDesktopSize') {
    this.hostDesktop_.onSizeUpdated(message);
  } else if (message.method == 'onPerfStats') {
    // Return value is ignored. These calls will throw an error if the value
    // is not a number.
    base.getNumberAttr(message.data, 'videoBandwidth');
    base.getNumberAttr(message.data, 'videoFrameRate');
    base.getNumberAttr(message.data, 'captureLatency');
    base.getNumberAttr(message.data, 'encodeLatency');
    base.getNumberAttr(message.data, 'decodeLatency');
    base.getNumberAttr(message.data, 'renderLatency');
    base.getNumberAttr(message.data, 'roundtripLatency');
    this.perfStats_ =
        /** @type {remoting.ClientSession.PerfStats} */ (message.data);

  } else if (message.method == 'injectClipboardItem') {
    var mimetype = base.getStringAttr(message.data, 'mimeType');
    var item = base.getStringAttr(message.data, 'item');
    this.updateClipboardData_(mimetype, item);

  } else if (message.method == 'fetchPin') {
    // The pairingSupported value in the dictionary indicates whether both
    // client and host support pairing. If the client doesn't support pairing,
    // then the value won't be there at all, so give it a default of false.
    var pairingSupported = base.getBooleanAttr(message.data, 'pairingSupported',
                                          false);
    this.credentials_.getPIN(pairingSupported).then(
        this.onPinFetched_.bind(this)
    );

  } else if (message.method == 'fetchThirdPartyToken') {
    var tokenUrl = base.getStringAttr(message.data, 'tokenUrl');
    var hostPublicKey = base.getStringAttr(message.data, 'hostPublicKey');
    var scope = base.getStringAttr(message.data, 'scope');
    this.credentials_.getThirdPartyToken(tokenUrl, hostPublicKey, scope).then(
      this.onThirdPartyTokenFetched_.bind(this)
    );
  } else if (message.method == 'pairingResponse') {
    var clientId = base.getStringAttr(message.data, 'clientId');
    var sharedSecret = base.getStringAttr(message.data, 'sharedSecret');
    this.onPairingComplete_(clientId, sharedSecret);

  } else if (message.method == 'unsetCursorShape') {
    this.updateMouseCursorImage_('', 0, 0);

  } else if (message.method == 'setCursorShape') {
    var width = base.getNumberAttr(message.data, 'width');
    var height = base.getNumberAttr(message.data, 'height');
    var hotspotX = base.getNumberAttr(message.data, 'hotspotX');
    var hotspotY = base.getNumberAttr(message.data, 'hotspotY');
    var srcArrayBuffer = base.getObjectAttr(message.data, 'data');

    var canvas =
        /** @type {HTMLCanvasElement} */ (document.createElement('canvas'));
    canvas.width = width;
    canvas.height = height;

    var context =
        /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
    var imageData = context.getImageData(0, 0, width, height);
    console.assert(srcArrayBuffer instanceof ArrayBuffer,
                   '|srcArrayBuffer| is not an ArrayBuffer.');
    var src = new Uint8Array(/** @type {ArrayBuffer} */(srcArrayBuffer));
    var dest = imageData.data;
    for (var i = 0; i < /** @type {number} */(dest.length); i += 4) {
      dest[i] = src[i + 2];
      dest[i + 1] = src[i + 1];
      dest[i + 2] = src[i];
      dest[i + 3] = src[i + 3];
    }

    context.putImageData(imageData, 0, 0);
    this.updateMouseCursorImage_(canvas.toDataURL(), hotspotX, hotspotY);

  } else if (message.method == 'onDebugRegion') {
    if (this.debugRegionHandler_) {
      this.debugRegionHandler_(
          /** @type {{rects: Array<(Array<number>)>}} **/(message.data));
    }
  } else if (message.method == 'extensionMessage') {
    var extMsgType = base.getStringAttr(message.data, 'type');
    var extMsgData = base.getStringAttr(message.data, 'data');
    this.extensions_.onProtocolExtensionMessage(extMsgType, extMsgData);

  }
};

/**
 * Deletes the plugin.
 */
remoting.ClientPluginImpl.prototype.dispose = function() {
  base.dispose(this.eventHooks_);
  this.eventHooks_ = null;

  if (this.plugin_) {
    this.plugin_.parentNode.removeChild(this.plugin_);
    this.plugin_ = null;
  }

  base.dispose(this.extensions_);
  this.extensions_ = null;
  this.connectionEventHandler_ = null;
};

/**
 * @return {HTMLEmbedElement} HTML element that corresponds to the plugin.
 */
remoting.ClientPluginImpl.prototype.element = function() {
  return this.plugin_;
};

/**
 * @override {remoting.ClientPlugin}
 */
remoting.ClientPluginImpl.prototype.initialize = function() {
  // If Nacl is disabled, we won't receive any error events, rejecting the
  // promise immediately.
  if (!base.isNaclEnabled()) {
    return Promise.reject(new remoting.Error(remoting.Error.Tag.NACL_DISABLED));
  }
  return this.onInitializedDeferred_.promise();
};

/**
 * @param {remoting.ClientSession.Capability} capability The capability to test
 *     for.
 * @return {boolean} True if the capability has been negotiated between
 *     the client and host.
 */
remoting.ClientPluginImpl.prototype.hasCapability = function(capability) {
  return this.hostCapabilities_ !== null &&
         this.hostCapabilities_.indexOf(capability) > -1;
};

/**
 * @param {string} iq Incoming IQ stanza.
 */
remoting.ClientPluginImpl.prototype.onIncomingIq = function(iq) {
  if (this.plugin_ && this.plugin_.postMessage) {
    this.plugin_.postMessage(JSON.stringify(
        { method: 'incomingIq', data: { iq: iq } }));
  } else {
    // plugin.onIq may not be set after the plugin has been shut
    // down. Particularly this happens when we receive response to
    // session-terminate stanza.
    console.warn('plugin.onIq is not set so dropping incoming message.');
  }
};

/**
 * @param {remoting.Host} host The host to connect to.
 * @param {string} localJid Local jid.
 * @param {remoting.CredentialsProvider} credentialsProvider
 */
remoting.ClientPluginImpl.prototype.connect = function(host, localJid,
                                                       credentialsProvider) {
  remoting.experiments.get().then(this.connectWithExperiments_.bind(
      this, host, localJid, credentialsProvider));
};

/**
 * @param {remoting.Host} host The host to connect to.
 * @param {string} localJid Local jid.
 * @param {remoting.CredentialsProvider} credentialsProvider
 * @param {Array.<string>} experiments List of enabled experiments.
 * @private
 */
remoting.ClientPluginImpl.prototype.connectWithExperiments_ = function(
    host, localJid, credentialsProvider, experiments) {
  var keyFilter = '';
  if (remoting.platformIsMac()) {
    keyFilter = 'mac';
  } else if (remoting.platformIsChromeOS()) {
    keyFilter = 'cros';
  } else if (remoting.platformIsWindows()) {
    keyFilter = 'windows';
  }

  this.plugin_.postMessage(JSON.stringify(
      { method: 'delegateLargeCursors', data: {} }));
  this.credentials_ = credentialsProvider;
  this.useAsyncPinDialog_();
  this.plugin_.postMessage(JSON.stringify({
    method: 'connect',
    data: {
      hostId: host.hostId,
      hostJid: host.jabberId,
      hostPublicKey: host.publicKey,
      localJid: localJid,
      sharedSecret: '',
      capabilities: this.capabilities_.join(" "),
      clientPairingId: credentialsProvider.getPairingInfo().clientId,
      clientPairedSecret: credentialsProvider.getPairingInfo().sharedSecret,
      keyFilter: keyFilter,
      experiments: experiments.join(" ")
    }
  }));
};

/**
 * Release all currently pressed keys.
 */
remoting.ClientPluginImpl.prototype.releaseAllKeys = function() {
  this.plugin_.postMessage(JSON.stringify(
      { method: 'releaseAllKeys', data: {} }));
};

/**
 * Sets and stores the key remapping setting for the current host.
 *
 * @param {!Object} remappings
 */
remoting.ClientPluginImpl.prototype.setRemapKeys =
    function(remappings) {
  // Cancel any existing remappings and apply the new ones.
  this.applyRemapKeys_(this.keyRemappings_, false);
  this.applyRemapKeys_(remappings, true);
  this.keyRemappings_ = /** @type {!Object} */ (base.deepCopy(remappings));
};

/**
 * Applies the configured key remappings to the session, or resets them.
 *
 * @param {!Object} remappings
 * @param {boolean} apply True to apply remappings, false to cancel them.
 * @private
 */
remoting.ClientPluginImpl.prototype.applyRemapKeys_ =
    function(remappings, apply) {
  for (var i in remappings) {
    var from = parseInt(i, 10);
    var to = parseInt(remappings[i], 10);
    if (apply) {
      console.log('remapKey 0x' + from.toString(16) + '>0x' + to.toString(16));
      this.remapKey(from, to);
    } else {
      console.log('cancel remapKey 0x' + from.toString(16));
      this.remapKey(from, from);
    }
  }
};

/**
 * Sends a key combination to the remoting host, by sending down events for
 * the given keys, followed by up events in reverse order.
 *
 * @param {Array<number>} keys Key codes to be sent.
 * @return {void} Nothing.
 */
remoting.ClientPluginImpl.prototype.injectKeyCombination =
    function(keys) {
  for (var i = 0; i < keys.length; i++) {
    this.injectKeyEvent(keys[i], true);
  }
  for (var i = 0; i < keys.length; i++) {
    this.injectKeyEvent(keys[i], false);
  }
};

/**
 * Send a key event to the host.
 *
 * @param {number} usbKeycode The USB-style code of the key to inject.
 * @param {boolean} pressed True to inject a key press, False for a release.
 */
remoting.ClientPluginImpl.prototype.injectKeyEvent =
    function(usbKeycode, pressed) {
  this.plugin_.postMessage(JSON.stringify(
      { method: 'injectKeyEvent', data: {
          'usbKeycode': usbKeycode,
          'pressed': pressed}
      }));
};

/**
 * Remap one USB keycode to another in all subsequent key events.
 *
 * @param {number} fromKeycode The USB-style code of the key to remap.
 * @param {number} toKeycode The USB-style code to remap the key to.
 */
remoting.ClientPluginImpl.prototype.remapKey =
    function(fromKeycode, toKeycode) {
  this.plugin_.postMessage(JSON.stringify(
      { method: 'remapKey', data: {
          'fromKeycode': fromKeycode,
          'toKeycode': toKeycode}
      }));
};

/**
 * Enable/disable redirection of the specified key to the web-app.
 *
 * @param {number} keycode The USB-style code of the key.
 * @param {Boolean} trap True to enable trapping, False to disable.
 */
remoting.ClientPluginImpl.prototype.trapKey = function(keycode, trap) {
  this.plugin_.postMessage(JSON.stringify(
      { method: 'trapKey', data: {
          'keycode': keycode,
          'trap': trap}
      }));
};

/**
 * Returns an associative array with a set of stats for this connecton.
 *
 * @return {remoting.ClientSession.PerfStats} The connection statistics.
 */
remoting.ClientPluginImpl.prototype.getPerfStats = function() {
  return this.perfStats_;
};

/**
 * Sends a clipboard item to the host.
 *
 * @param {string} mimeType The MIME type of the clipboard item.
 * @param {string} item The clipboard item.
 */
remoting.ClientPluginImpl.prototype.sendClipboardItem =
    function(mimeType, item) {
  this.plugin_.postMessage(JSON.stringify(
      { method: 'sendClipboardItem',
        data: { mimeType: mimeType, item: item }}));
};

/**
 * Notifies the plugin whether to send touch events to the host.
 *
 * @param {boolean} enable True if touch events should be sent.
 */
remoting.ClientPluginImpl.prototype.enableTouchEvents = function(enable) {
  this.plugin_.postMessage(
      JSON.stringify({method: 'enableTouchEvents', data: {'enable': enable}}));
};

/**
 * Notifies the host that the client has the specified size and pixel density.
 *
 * @param {number} width The available client width in DIPs.
 * @param {number} height The available client height in DIPs.
 * @param {number} device_scale The number of device pixels per DIP.
 */
remoting.ClientPluginImpl.prototype.notifyClientResolution =
    function(width, height, device_scale) {
  this.hostDesktop_.resize(width, height, device_scale);
};

/**
 * Requests that the host pause or resume sending video updates.
 *
 * @param {boolean} pause True to suspend video updates, false otherwise.
 */
remoting.ClientPluginImpl.prototype.pauseVideo =
    function(pause) {
  this.plugin_.postMessage(JSON.stringify(
      { method: 'videoControl', data: { pause: pause }}));
};

/**
 * Requests that the host pause or resume sending audio updates.
 *
 * @param {boolean} pause True to suspend audio updates, false otherwise.
 */
remoting.ClientPluginImpl.prototype.pauseAudio =
    function(pause) {
  this.plugin_.postMessage(JSON.stringify(
      { method: 'pauseAudio', data: { pause: pause }}));
};

/**
 * Requests that the host configure the video codec for lossless encode.
 *
 * @param {boolean} wantLossless True to request lossless encoding.
 */
remoting.ClientPluginImpl.prototype.setLosslessEncode =
    function(wantLossless) {
  this.plugin_.postMessage(JSON.stringify(
      { method: 'videoControl', data: { losslessEncode: wantLossless }}));
};

/**
 * Requests that the host configure the video codec for lossless color.
 *
 * @param {boolean} wantLossless True to request lossless color.
 */
remoting.ClientPluginImpl.prototype.setLosslessColor =
    function(wantLossless) {
  this.plugin_.postMessage(JSON.stringify(
      { method: 'videoControl', data: { losslessColor: wantLossless }}));
};

/**
 * Called when a PIN is obtained from the user.
 *
 * @param {string} pin The PIN.
 * @private
 */
remoting.ClientPluginImpl.prototype.onPinFetched_ =
    function(pin) {
  this.plugin_.postMessage(JSON.stringify(
      { method: 'onPinFetched', data: { pin: pin }}));
};

/**
 * Tells the plugin to ask for the PIN asynchronously.
 * @private
 */
remoting.ClientPluginImpl.prototype.useAsyncPinDialog_ =
    function() {
  this.plugin_.postMessage(JSON.stringify(
      { method: 'useAsyncPinDialog', data: {} }));
};

/**
 * Allows automatic mouse-lock.
 */
remoting.ClientPluginImpl.prototype.allowMouseLock = function() {
  this.plugin_.postMessage(JSON.stringify(
      { method: 'allowMouseLock', data: {} }));
};

/**
 * Sets the third party authentication token and shared secret.
 *
 * @param {remoting.ThirdPartyToken} token
 * @private
 */
remoting.ClientPluginImpl.prototype.onThirdPartyTokenFetched_ = function(
    token) {
  this.plugin_.postMessage(JSON.stringify(
    { method: 'onThirdPartyTokenFetched',
      data: { token: token.token, sharedSecret: token.secret}}));
};

/**
 * Request pairing with the host for PIN-less authentication.
 *
 * @param {string} clientName The human-readable name of the client.
 * @param {function(string, string):void} onDone, Callback to receive the
 *     client id and shared secret when they are available.
 */
remoting.ClientPluginImpl.prototype.requestPairing =
    function(clientName, onDone) {
  this.onPairingComplete_ = onDone;
  this.plugin_.postMessage(JSON.stringify(
      { method: 'requestPairing', data: { clientName: clientName } }));
};

/**
 * Send an extension message to the host.
 *
 * @param {string} type The message type.
 * @param {string} message The message payload.
 * @private
 */
remoting.ClientPluginImpl.prototype.sendClientMessage_ =
    function(type, message) {
  this.plugin_.postMessage(JSON.stringify(
      { method: 'extensionMessage',
        data: { type: type, data: message } }));

};

remoting.ClientPluginImpl.prototype.hostDesktop = function() {
  return this.hostDesktop_;
};

remoting.ClientPluginImpl.prototype.extensions = function() {
  return this.extensions_;
};

/**
 * Callback passed to submodules to post a message to the plugin.
 *
 * @param {Object} message
 * @private
 */
remoting.ClientPluginImpl.prototype.postMessage_ = function(message) {
  if (this.plugin_ && this.plugin_.postMessage) {
    this.plugin_.postMessage(JSON.stringify(message));
  }
};

/**
 * @constructor
 * @implements {remoting.ClientPluginFactory}
 */
remoting.DefaultClientPluginFactory = function() {};

/**
 * @param {Element} container
 * @param {Array<string>} capabilities
 * @return {remoting.ClientPlugin}
 */
remoting.DefaultClientPluginFactory.prototype.createPlugin =
    function(container, capabilities) {
  return new remoting.ClientPluginImpl(container,
                                       capabilities);
};

remoting.DefaultClientPluginFactory.prototype.preloadPlugin = function() {
  var plugin = remoting.ClientPluginImpl.createPluginElement_();
  plugin.addEventListener(
      'loadend', function() { document.body.removeChild(plugin); }, false);
  document.body.appendChild(plugin);
};
