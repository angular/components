/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  EnvironmentInjector,
  Injectable,
  InjectionToken,
  NgZone,
  afterNextRender,
  inject,
} from '@angular/core';

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
  private _injector = inject(EnvironmentInjector);

  constructor(_unusedNgZone?: NgZone) {}

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

    afterNextRender(
      () => {
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
      },
      {injector: this._injector},
    );
  }
}
