/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgZone} from '@angular/core';

import {AriaLivePoliteness} from './live-announcer-tokens';

interface TaskInfo {
  delay: number;
  politeness: AriaLivePoliteness;
  task: () => void;
}

/**
 * Queue which executes given tasks with a provided delay between them. It makes sure that screen
 * readers are able to detect DOM changes. E.g. calling enqueue(foo, 1000), enqueu(bar, 1000)
 * will execute foo with a 1s delay and bar with a 2s delay.
 */
@Injectable({providedIn: 'root'})
export class TaskQueue {
  private readonly _queue: TaskInfo[] = [];
  private _executing = false;

  constructor(private _ngZone: NgZone) {}

  /**
   * Schedules the `task` for execution in `delay` milliseconds after the last task in the queue
   * is executed.
   */
  enqueue(task: () => void, politeness: AriaLivePoliteness, delay = 0): void {
    const taskInfo = {delay, politeness, task};
    this._queue.splice(this._findInsertionIndex(taskInfo), 0, taskInfo);
    this._run();
  }

  /**
   * Assertive tasks should be inserted at the top of the queue right after existing assertive
   * tasks. Polite tasks should be inserted at the end of the queue.
   */
  private _findInsertionIndex(task: TaskInfo) {
    if (task.politeness === 'assertive') {
      for (let i = 0; i < this._queue.length; i++) {
        if (this._queue[i].politeness === 'polite') {
          return i;
        }
      }
    }
    return this._queue.length;
  }

  /**
   * Does nothing if the queue is empty or some task is already executed. Otherwise dequeues
   * the next task and runs it with a previously provided delay.
   */
  private _run(): void {
    if (this._queue.length === 0) {
      // Nothing left to run.
      return;
    }
    if (this._executing) {
      // Already doing something.
      return;
    }

    const {delay, task} = this._queue.shift()!;
    this._executing = true;
    this._ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        task();
        this._executing = false;
        this._run();
      }, delay);
    });
  }
}

