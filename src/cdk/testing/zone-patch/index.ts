/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="zone.js" />

import type {ɵInterceptedRootZone} from '@angular/cdk/testing';

if (typeof Zone !== 'undefined') {
  throw Error('Please load the Angular CDK testing root zone patch before loading ZoneJS.');
}

const _globalThis = typeof global !== 'undefined' ? global : window;
let _zoneValue: Zone|undefined = undefined;

// Whenever ZoneJS is loaded, immediately patch the root zone afterwards. This ensures
// that no previously launched tasks can throw off the root zone task counts.
Object.defineProperty(_globalThis, 'Zone', {
  configurable: true,
  get: () => _zoneValue,
  set: (value) => {
    _zoneValue = value;
    patchZoneToInterceptRootZone();
  },
});

/**
 * Patches the active root zone to keep track of scheduled micro, macro and event
 * tasks. Also adds an API for being notified on zone task changes. This information
 * can then be used in the test harnesses to wait for the page to stabilize.
 */
function patchZoneToInterceptRootZone() {
  if (Zone === undefined) {
    return;
  }

  const rootZone = Zone.root as ɵInterceptedRootZone;
  const _originalUpdateTaskCount = rootZone._updateTaskCount.bind(rootZone);

  rootZone._tasksCount = {microTask: 0, macroTask: 0, eventTask: 0};
  rootZone._taskUpdateSubscriptions = new Set();
  rootZone._updateTaskCount = function(task, change) {
    _originalUpdateTaskCount.call(this, task, change);
    this._tasksCount[task.type] = this._tasksCount[task.type] + change;
    this._taskUpdateSubscriptions.forEach(s => s(this._tasksCount));
  };
}

