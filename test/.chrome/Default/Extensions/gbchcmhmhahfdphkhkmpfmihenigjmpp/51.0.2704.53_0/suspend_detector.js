// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/** @suppress {duplicate} */
var remoting = remoting || {};

(function () {

'use strict';

var INTERVAL_IN_MS = 500;

var TIMER_INACCURACY_IN_MS = 10;

/**
 * @constructor
 * @param {number=} opt_maxSuspendInMs  The maximum permitted suspend duration
 *     to raise the resume event.
 * @extends {base.EventSourceImpl}
 * @implements {base.Disposable}
 */
remoting.SuspendDetector = function(opt_maxSuspendInMs) {
  base.inherits(this, base.EventSourceImpl);
  this.defineEvents(base.values(remoting.SuspendDetector.Events));

  if (opt_maxSuspendInMs == undefined ||
      !Number.isInteger(opt_maxSuspendInMs)) {
    opt_maxSuspendInMs = TIMER_INACCURACY_IN_MS;
  }

  /** @private */
  this.maxSuspendInMs_ = Math.max(opt_maxSuspendInMs, TIMER_INACCURACY_IN_MS);

  /**
   * JavaScript timer is paused while the computer is suspended, we need to use
   * a higher resolution timer instead of |this.maxSuspendInMs_| to ensure the
   * resume event fires promptly after the system wakes up from sleep.
   * @private
   */
  this.timer_ =
      new base.RepeatingTimer(this.onTick_.bind(this), INTERVAL_IN_MS);

  /** @private */
  this.lastTick_ = new Date();
};

remoting.SuspendDetector.prototype.dispose = function() {
  base.dispose(this.timer_);
  this.timer = null;
};

/** @private */
remoting.SuspendDetector.prototype.onTick_ = function() {
  var now = new Date();
  // If the computer has just resumed from sleep, the sleep duration will
  // roughly equal the |delta| between the ticks.
  var delta = now - this.lastTick_;
  this.lastTick_ = now;
  if (delta > this.maxSuspendInMs_) {
    this.raiseEvent(remoting.SuspendDetector.Events.resume, delta);
  }
};

})();

/** @enum {string} */
remoting.SuspendDetector.Events = {
  // Fired when the computer resumes up from sleep with the approximate sleep
  // duration in milliseconds.  The sleep duration is only an approximation with
  // and an uncertainty of |INTERVAL_IN_MS|.
  //  {number} sleepDuration
  resume: 'resume'
};
