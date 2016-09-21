// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

/** @type {Object<number, remoting.TcpSocket>} */
var sockets = {};
var receiveListenersAdded = false;

function addReceiveListeners() {
  if (receiveListenersAdded) {
    return;
  }

  receiveListenersAdded = true;

  chrome.sockets.tcp.onReceive.addListener(function(
      /** chrome.sockets.tcp.ReceiveEventData */ info) {
    var socket = sockets[info.socketId];
    if (socket === undefined) {
      console.warn("Received data for unknown socket " + info.socketId);
      return;
    }
    if (socket.receiveCallback_ === null) {
      console.warn("Received data when socket was paused.");
      return;
    }
    socket.receiveCallback_(info.data);
  });

  chrome.sockets.tcp.onReceiveError.addListener(function(
      /** chrome.sockets.tcp.ReceiveErrorEventData */ info) {
    var socket = sockets[info.socketId];
    if (socket === undefined) {
      console.warn("Received error for unknown socket " + info.socketId);
      return;
    }
    if (socket.receiveErrorCallback_ === null) {
      console.warn("Recv() failed when socket was paused: " + info.resultCode);
      return;
    }
    socket.receiveErrorCallback_(info.resultCode);
  });
}

/**
 * Wrapper for chrome.sockets.tcp API.
 *
 * @constructor
 * @implements {base.Disposable}
 */
remoting.TcpSocket = function() {
  /** @private */
  this.destroyed_ = false;
  /** @private */
  this.socketId_ = -1;
  /** @private {?function(ArrayBuffer):void} */
  this.receiveCallback_ = null;
  /** @private {?function(number):void} */
  this.receiveErrorCallback_ = null;

  addReceiveListeners();
};

/**
 * Connects the socket to the specified host and port.
 *
 * @returns {Promise} Promise that's resolved when the socket is connected.
 */
remoting.TcpSocket.prototype.connect = function(/** string */ host,
                                                /** number */ port) {
  var that = this;

  return new Promise(function(resolve, reject) {
    chrome.sockets.tcp.create({}, /** @type {function(Object)} */ (onCreated));


    function onCreated(/** chrome.socket.CreateInfo */ createInfo) {
      // Check if the socket was destroyed.
      if (that.destroyed_) {
        chrome.sockets.tcp.close(createInfo.socketId);
        return;
      }

      that.socketId_ = createInfo.socketId;
      sockets[that.socketId_] = that;

      // Pause the socket so that we start receiving only after startReceiving()
      // is called.
      chrome.sockets.tcp.setPaused(that.socketId_, true);

      chrome.sockets.tcp.connect(that.socketId_, host, port, onConnected);
    }

    function onConnected(/** number */ result) {
      if (that.destroyed_) {
        return;
      }

      if (result < 0) {
        reject(result);
      } else {
        resolve(0);
      }
    }
  });
};

remoting.TcpSocket.prototype.dispose = function() {
  if (this.socketId_ != -1) {
    chrome.sockets.tcp.close(this.socketId_);
    delete sockets[this.socketId_];
    this.socketId_ = -1;
  }
  this.destroyed_ = true;
  this.receiveCallback_ = null;
};

/**
 * Starts receiving data on the socket. Calls receiveCallback when new data is
 * received or receiveErrorCallback when recv() returns an error.
 */
remoting.TcpSocket.prototype.startReceiving = function(
    /** ?function(ArrayBuffer):void */ receiveCallback,
    /** ?function(number):void */ receiveErrorCallback) {
  console.assert(this.receiveCallback_ == null,
                 'Duplicate startReceiving() invocation.');
  this.receiveCallback_ = receiveCallback;
  this.receiveErrorCallback_ = receiveErrorCallback;
  chrome.sockets.tcp.setPaused(this.socketId_, false);
};

/**
 * Sends |data|.
 *
 * @returns {Promise}
 */
remoting.TcpSocket.prototype.send = function(/** !ArrayBuffer */ data) {
  var that = this;

  return new Promise(function(resolve, reject) {
    chrome.sockets.tcp.send(that.socketId_, data,
        function(/** chrome.socket.SendInfo */ sendInfo) {
      if (sendInfo.resultCode < 0) {
        reject(sendInfo.resultCode);
      } else {
        resolve(sendInfo.bytesSent);
      }
    });
  });
};

/**
 * Starts TLS on the socket. Once TLS is negotiated the caller will need to call
 * startReceiving() to start receiving data, even if startReceiving() was called
 * before.
 *
 * @returns {Promise}
 */
remoting.TcpSocket.prototype.startTls = function() {
  var that = this;

  return new Promise(function(resolve, reject) {
    function doStartTls() {
      chrome.sockets.tcp.secure(that.socketId_, {}, function(result) {
        if (result < 0) {
          reject(result);
        } else {
          resolve(0);
        }
      });
    }

    if (!that.receiveCallback_) {
      // Socket is already paused.
      doStartTls();
    } else {
      // Socket must be paused before staring TLS. This won't work correctly
      // until crbug.com/403076 is fixed. Log a warning and try anyway.
      console.warn(
          "remoting.TcpSocket.secure() was called after some data was " +
          "received on the socket. This won't work properly until " +
          "crbug.com/403076 is fixed.");
      chrome.sockets.tcp.setPaused(that.socketId_, true, function() {
        if (that.destroyed_) {
          return;
        }
        that.receiveCallback_ = null;
        that.receiveErrorCallback_ = null;
        doStartTls();
      });
    }
  });
};

})();
