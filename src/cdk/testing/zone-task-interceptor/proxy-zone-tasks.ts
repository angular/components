/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="zone.js" />

import {HasTaskState, ProxyZone, ProxyZoneStatic} from './proxy-zone-types';
import {hasInterceptedRootZone, waitForRootZoneToStabilize} from './root-zone-tasks';

/** Type that describes an intercepted proxy zone instance. */
type InterceptedProxyZone = ProxyZone&{
  _taskUpdateSubscriptions: Set<((newTasks: HasTaskState) => void)>;
};

/**
 * Gets a intercepted proxy zone for the given proxy zone. If the proxy zone has
 * been already intercepted before, the zone will not be re-patched.
 */
export function getInterceptedProxyZone(zoneSpec: ProxyZone): InterceptedProxyZone {
  if ((zoneSpec as InterceptedProxyZone)._taskUpdateSubscriptions) {
    return zoneSpec as InterceptedProxyZone;
  }
  const interceptedZone = zoneSpec as InterceptedProxyZone;
  const zoneSpecOnHasTask = interceptedZone.onHasTask.bind(interceptedZone);

  interceptedZone._taskUpdateSubscriptions = new Set();
  interceptedZone.onHasTask = function(...args: [ZoneDelegate, Zone, Zone, HasTaskState]) {
    zoneSpecOnHasTask.apply(interceptedZone, args);
    interceptedZone._taskUpdateSubscriptions.forEach(f => f(args[3]));
  };
  return interceptedZone;
}

/**
 * Gets a promise that resolves when the proxy zone stabilizes. Requires either the root zone to
 * be patched, or a proxy zone to be configured. Prefers the patched root zone if available.
 *
 * Also note that we cannot register the interceptor as a new proxy zone delegate spec because it
 * would mean that other zone delegate specs, such as the `FakeAsyncTestZone` or `AsyncTestZone`,
 * would be overridden accidentally. Since we just intend to monitor the task state of the proxy
 * zone, it is sufficient to intercept the proxy zone directly. This also avoids that we
 * interfere with existing task queue scheduling logic.
 */
export function waitForProxyZoneToStabilize(): Promise<void> {
  if (Zone === undefined) {
    throw Error(
        'Could not find ZoneJS. For test harnesses being able to wait for ' +
        'asynchronous tasks to complete, ZoneJS needs to be set up and globally available.');
  }

  // If the root zone is intercepted, we prefer that over intercepting a `ProxyZone`. The test bed
  // environment by default supports intercepting `ProxyZone` as the proxy zone runs automatically
  // in Jasmine `@angular/core/testing` unit tests. This is allows for easy consumption of test
  // harnesses without having to load the root zone patch. Alternatively, since not every unit
  // tests run necessarily with Jasmine, we also support the root zone patch if loaded.
  if (hasInterceptedRootZone()) {
    return waitForRootZoneToStabilize();
  }

  // tslint:disable-next-line:variable-name
  const ProxyZoneSpec = (Zone as any)['ProxyZoneSpec'] as ProxyZoneStatic | undefined;

  // If there is no "ProxyZoneSpec" installed, we throw an error and recommend
  // setting up the proxy zone by pulling in the ZoneJS testing bundle.
  if (!ProxyZoneSpec) {
    throw Error(
        'ProxyZoneSpec is needed for the test harnesses but could not be found. ' +
        'Please make sure that your environment includes `zone.js/dist/zone-testing.js`.');
  }

  const zoneSpec = ProxyZoneSpec.assertPresent();

  // If the proxy zone is already stable, return a resolved promise immediately.
  if (zoneSpec.lastTaskState === null || isZoneStable(zoneSpec.lastTaskState)) {
    return Promise.resolve();
  }

  const interceptedZone = getInterceptedProxyZone(zoneSpec);
  return new Promise(resolve => {
    interceptedZone._taskUpdateSubscriptions!.add(function waitFn(newCounts) {
      if (isZoneStable(newCounts)) {
        interceptedZone._taskUpdateSubscriptions!.delete(waitFn);
        resolve();
      }
    });
  });
}

/** Whether a Zone with the specified task state is stable. */
function isZoneStable(taskCounts: HasTaskState) {
  return !taskCounts.microTask && !taskCounts.macroTask;
}
