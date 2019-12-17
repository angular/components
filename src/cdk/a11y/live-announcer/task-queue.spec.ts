import {fakeAsync, inject, TestBed, tick} from '@angular/core/testing';

import {TaskQueue} from './task-queue';

import {A11yModule} from '../index';

describe('TaskQueue', () => {
  let taskQueue: TaskQueue;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [A11yModule],
  }));

  beforeEach(fakeAsync(inject([TaskQueue], (tq: TaskQueue) => {
    taskQueue = tq;
  })));

  it('runs a task', fakeAsync(() => {
    let ran = false;

    taskQueue.enqueue(() => {
      ran = true;
    }, 'polite', 5);

    // Task is scheduled but not executed yet.
    expect(ran).toBe(false);
    // Wait for execution.
    tick(5);
    // Task is executed.
    expect(ran).toBe(true);
  }));

  it('runs tasks in order', fakeAsync(() => {
    const ran: number[] = [];

    taskQueue.enqueue(() => {
      ran.push(1);
    }, 'polite', 5);
    taskQueue.enqueue(() => {
      expect(ran).toEqual([1]);
      ran.push(2);
    }, 'polite', 5);
    taskQueue.enqueue(() => {
      expect(ran).toEqual([1, 2]);
      ran.push(3);
    }, 'polite', 5);

    // Tasks are scheduled but not executed yet.
    expect(ran).toEqual([]);
    // Wait for task 1 execution.
    tick(5);
    // Task 1 executed, tasks 2 and 3 are pending.
    expect(ran).toEqual([1]);
    // Wait for all tasks.
    tick(10);
    // All tasks are executed.
    expect(ran).toEqual([1, 2, 3]);
  }));

  it('inserts assertive tasks above polite ones in the queue', fakeAsync(() => {
    const ran: number[] = [];

    taskQueue.enqueue(() => {
      ran.push(1);
    }, 'assertive', 5);
    taskQueue.enqueue(() => {
      expect(ran).toEqual([1, 3]);
      ran.push(2);
    }, 'polite', 5);
    taskQueue.enqueue(() => {
      expect(ran).toEqual([1]);
      ran.push(3);
    }, 'assertive', 5);

    // Tasks are scheduled but not executed yet.
    expect(ran).toEqual([]);
    // Wait for the first assertive task execution.
    tick(5);
    // Task 1 executed, tasks 2 and 3 are pending.
    expect(ran).toEqual([1]);
    // Wait for the second assertive task execution.
    tick(5);
    expect(ran).toEqual([1, 3]);
    // Wait for the remaining task.
    tick(5);
    expect(ran).toEqual([1, 3, 2]);
  }));
});

