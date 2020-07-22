/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {from, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/**
 * Allows grouping up CSSDom mutations after the current execution context.
 * This can significantly improve performance when separate consecutive functions are
 * reading from the CSSDom and then mutating it.
 *
 * @docs-private
 */
@Injectable()
export class _CoalescedStyleScheduler implements OnDestroy {
  private _currentSchedule: Observable<void>|null = null;
  private _destroyed = new Subject<void>();

  constructor(private readonly _ngZone: NgZone) {}

  /**
   * Schedules the specified task to run after the current microtask.
   */
  schedule(task: () => unknown): void {
    this._createScheduleIfNeeded();

    this._currentSchedule!.subscribe(task);
  }

  /** Cancel and prevent new subscriptions. */
  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();

    this._currentSchedule = this._destroyed;
  }

  private _createScheduleIfNeeded() {
    if (this._currentSchedule) { return; }

    this._ngZone.runOutsideAngular(() => {
      this._currentSchedule = from(new Promise<void>((resolve) => {
        this._currentSchedule = null;
        resolve(undefined);
      })).pipe(takeUntil(this._destroyed));
    });
  }
}
