/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Injectable,
  NgZone,
  OnDestroy,
  InjectionToken,
  afterRender,
  AfterRenderPhase,
} from '@angular/core';
import {from, Subject} from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';

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
export class _CoalescedStyleScheduler implements OnDestroy {
  private _currentSchedule: _Schedule | null = null;
  private readonly _destroyed = new Subject<void>();

  private readonly _earlyReadTasks: (() => unknown)[] = [];
  private readonly _writeTasks: (() => unknown)[] = [];
  private readonly _readTasks: (() => unknown)[] = [];

  constructor(private readonly _ngZone: NgZone) {
    afterRender(() => flushTasks(this._earlyReadTasks), {phase: AfterRenderPhase.EarlyRead});
    afterRender(() => flushTasks(this._writeTasks), {phase: AfterRenderPhase.Write});
    afterRender(() => flushTasks(this._readTasks), {phase: AfterRenderPhase.Read});
  }

  /**
   * Like afterNextRender(fn, AfterRenderPhase.EarlyRead), but can be called
   * outside of injection context. Runs after current/next CD.
   */
  scheduleEarlyRead(task: () => unknown): void {
    this._earlyReadTasks.push(task);
  }

  /**
   * Like afterNextRender(fn, AfterRenderPhase.Write), but can be called
   * outside of injection context. Runs after current/next CD.
   */
  scheduleWrite(task: () => unknown): void {
    this._writeTasks.push(task);
  }

  /**
   * Like afterNextRender(fn, AfterRenderPhase.Read), but can be called
   * outside of injection context. Runs after current/next CD.
   */
  scheduleRead(task: () => unknown): void {
    this._readTasks.push(task);
  }

  /** Greedily triggers pending EarlyRead, Write, and Read tasks, in that order. */
  flushAfterRender() {
    flushTasks(this._earlyReadTasks);
    flushTasks(this._writeTasks);
    flushTasks(this._readTasks);
  }

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

  /** Prevent any further tasks from running. */
  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  private _createScheduleIfNeeded() {
    if (this._currentSchedule) {
      return;
    }

    this._currentSchedule = new _Schedule();

    this._getScheduleObservable()
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => {
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
      });
  }

  private _getScheduleObservable() {
    // Use onStable when in the context of an ongoing change detection cycle so that we
    // do not accidentally trigger additional cycles.
    return this._ngZone.isStable
      ? from(Promise.resolve(undefined))
      : this._ngZone.onStable.pipe(take(1));
  }
}

/**
 * Runs and removes tasks from the passed array in order.
 * Tasks appended mid-flight will also be flushed.
 */
function flushTasks(tasks: (() => unknown)[]) {
  let task: (() => unknown) | undefined;
  while ((task = tasks.shift())) {
    task();
  }
}
