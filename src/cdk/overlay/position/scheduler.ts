/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface Scheduler {
  scheduleStyle(name: string, value: string): void;
  schedule(task: () => void): void;
  flushStyles(): void;
}

export interface Schedulable {
  withStyleScheduler(scheduler: Scheduler): void;
}

export type ScheduleType = Scheduler | undefined;
