/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, InjectionToken, NgZone, inject} from '@angular/core';

/**
 * @docs-private
 */
export class _Schedule {
  tasks: (() => unknown)[] = [];
  endTasks: (() => unknown)[] = [];
}

/** Injection token used to provide a coalesced style scheduler. */
export const _COALESCED_STYLE_SCHEDULER = new InjectionToken<_CoalescedStyleScheduler>(
  '_COALESCED_STYLE_SCHEDULER',
);

/**
 * Allows grouping up CSSDom mutations after the current execution context.
 * This can significantly improve performance when separate consecutive functions are
 * reading from the CSSDom and then mutating it.
 *
 * @docs-private
 */
@Injectable()
export class _CoalescedStyleScheduler {
  private _currentSchedule: _Schedule | null = null;
  private _ngZone = inject(NgZone);

  constructor(...args: unknown[]);
  constructor() {}

  /**
   * Schedules the specified task to run at the end of the current VM turn.
   */
  schedule(task: () => unknown): void {
    this._createScheduleIfNeeded();

    this._currentSchedule!.tasks.push(task);
  }

  /**
   * Schedules the specified task to run after other scheduled tasks at the end of the current
   * VM turn.
   */
  scheduleEnd(task: () => unknown): void {
    this._createScheduleIfNeeded();

    this._currentSchedule!.endTasks.push(task);
  }

  private _createScheduleIfNeeded() {
    if (this._currentSchedule) {
      return;
    }

    this._currentSchedule = new _Schedule();

    this._ngZone.runOutsideAngular(() =>
      // TODO(mmalerba): Scheduling this using something that runs less frequently
      //  (e.g. requestAnimationFrame, setTimeout, etc.) causes noticeable jank with the column
      //  resizer. We should audit the usages of schedule / scheduleEnd in that component and see
      //  if we can refactor it so that we don't need to flush the tasks quite so frequently.
      queueMicrotask(() => {
        while (this._currentSchedule!.tasks.length || this._currentSchedule!.endTasks.length) {
          const schedule = this._currentSchedule!;

          // Capture new tasks scheduled by the current set of tasks.
          this._currentSchedule = new _Schedule();

          for (const task of schedule.tasks) {
            task();
          }

          for (const task of schedule.endTasks) {
            task();
          }
        }

        this._currentSchedule = null;
      }),
    );
  }
}
