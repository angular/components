/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="zone.js" />

export interface ZoneTasksCounts {
  microTask: number;
  macroTask: number;
  eventTask: number;
}

/** Type that describes an intercepted root zone. */
export type InterceptedRootZone = Zone&{
  _tasksCount: ZoneTasksCounts;
  _taskUpdateSubscriptions: Set<((newTasks: ZoneTasksCounts) => void)>;
  _updateTaskCount: (task: Task, change: number) => void;
};

// ################################################################################
// Note: All runtime code needed to wait for the root zone to stabilize is wrapped
// in functions so that the code can be extracted from the function and executed
// in Protractor harness environments. There should not be any runtime imports as
// that break the code portability. e.g. no use of RxJS is possible.
// ################################################################################

/** Whether the ZoneJS root zone is intercepted. */
export function hasInterceptedRootZone(): InterceptedRootZone|null {
  if (Zone === undefined) {
    return null;
  }
  const rootZone = Zone.root as InterceptedRootZone;
  if (!rootZone._tasksCount || !rootZone._taskUpdateSubscriptions) {
    return null;
  }
  return rootZone;
}

/**
 * Gets a promise that resolves when the root zone stabilizes. Requires the root zone to be
 * patched so that the previous task state can be determined. Without the patched root zone,
 * we would have incorrect task state counts as we don't know whether there are tasks already
 * in progress, and how many.
 */
export function waitForRootZoneToStabilize(): Promise<void> {
  if (Zone === undefined) {
    throw Error(
        'Could not find ZoneJS. For test harnesses being able to wait for ' +
        'asynchronous tasks to complete, ZoneJS needs to be set up and globally available.');
  }

  const rootZone = hasInterceptedRootZone();
  if (rootZone === null) {
    // TODO: Integrate the patch into ZoneJS itself, or link to a bundle that users can include.
    throw Error(
        'Root Zone is not patched. For test harnesses being able to wait for synchronous tasks' +
        'outside of the Angular Zone to complete, the Angular CDK zone-patch needs to be loaded.');
  }

  if (isZoneStable(rootZone._tasksCount)) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    rootZone._taskUpdateSubscriptions!.add(function waitFn(newCounts) {
      if (isZoneStable(newCounts)) {
        rootZone._taskUpdateSubscriptions!.delete(waitFn);
        resolve();
      }
    });
  });

  /** Whether a Zone with the specified task count is stable. */
  function isZoneStable(taskCounts: ZoneTasksCounts) {
    return taskCounts.microTask === 0 && taskCounts.macroTask === 0;
  }
}
