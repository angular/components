// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/** @suppress {duplicate} */
var remoting = remoting || {};

(function() {

'use strict';

/** @constructor */
remoting.PublicSession = function() {
  // Initialize global dependencies.
  l10n.localize();
  remoting.identity = new remoting.Identity();
  remoting.settings = new remoting.Settings();

  // override remoting.setMode() so that the content will always fit.
  var setMode = remoting.setMode;
  remoting.setMode = function(/** string */ mode) {
    setMode(mode);
    base.resizeWindowToContent();
  };

  /** @private */
  this.eventHooks_ = new base.Disposables(
      new base.DomEventHook(document.getElementById('host-finished-button'),
                            'click', this.exit_.bind(this), false),
      new base.DomEventHook(document.getElementById('cancel-share-button'),
                            'click', this.exit_.bind(this), false),
      new base.DomEventHook(document.getElementById('stop-sharing-button'),
                            'click', this.exit_.bind(this), false));
};

remoting.PublicSession.prototype.start = function() {
  remoting.tryShare();
};

/** @private */
remoting.PublicSession.prototype.exit_ = function() {
  base.dispose(this.eventHooks_);
  this.eventHooks_ = null;
  chrome.app.window.current().close();
};

window.addEventListener('load', function () {
  remoting.publicSession = new remoting.PublicSession();
  remoting.publicSession.start();
}, false);

})();

