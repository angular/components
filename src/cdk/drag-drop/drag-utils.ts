/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FormArray } from '@angular/forms';

/**
 * Moves an item one index in an array to another.
 * @param array Array in which to move the item.
 * @param fromIndex Starting index of the item.
 * @param toIndex Index to which the item should be moved.
 */
export function moveItemInArray<T = any>(array: T[], fromIndex: number, toIndex: number): void {
  const from = clamp(fromIndex, array.length - 1);
  const to = clamp(toIndex, array.length - 1);

  if (from === to) {
    return;
  }

  const target = array[from];
  const delta = to < from ? -1 : 1;

  for (let i = from; i !== to; i += delta) {
    array[i] = array[i + delta];
  }

  array[to] = target;
}


/**
 * Moves an item in a FormArray to another position.
 * @param formArray FormArray instance in which to move the item.
 * @param fromIndex Starting index of the item.
 * @param toIndex Index to which he item should be moved.
 */
export function moveItemInFormArray(formArray: FormArray, fromIndex: number, toIndex: number): void {
  const from = clamp(fromIndex, formArray.length - 1);
  const to = clamp(toIndex, formArray.length - 1);

  if (from === to) {
    return;
  }

  const delta = from > to ? 1 : -1;
  for (let i = from; i * delta < to * delta; i += delta) {
    const previous = formArray.at(i);
    const current = formArray.at(i + delta);
    formArray.setControl(i, current);
    formArray.setControl(i + delta, previous);
  }
}


/**
 * Moves an item from one array to another.
 * @param currentArray Array from which to transfer the item.
 * @param targetArray Array into which to put the item.
 * @param currentIndex Index of the item in its current array.
 * @param targetIndex Index at which to insert the item.
 */
export function transferArrayItem<T = any>(currentArray: T[],
                                           targetArray: T[],
                                           currentIndex: number,
                                           targetIndex: number): void {
  const from = clamp(currentIndex, currentArray.length - 1);
  const to = clamp(targetIndex, targetArray.length);

  if (currentArray.length) {
    targetArray.splice(to, 0, currentArray.splice(from, 1)[0]);
  }
}

/**
 * Copies an item from one array to another, leaving it in its
 * original position in current array.
 * @param currentArray Array from which to copy the item.
 * @param targetArray Array into which is copy the item.
 * @param currentIndex Index of the item in its current array.
 * @param targetIndex Index at which to insert the item.
 *
 */
export function copyArrayItem<T = any>(currentArray: T[],
                                       targetArray: T[],
                                       currentIndex: number,
                                       targetIndex: number): void {
  const to = clamp(targetIndex, targetArray.length);

  if (currentArray.length) {
    targetArray.splice(to, 0, currentArray[currentIndex]);
  }
}

/** Clamps a number between zero and a maximum. */
function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}
