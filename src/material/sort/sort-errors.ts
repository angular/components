/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** @nodoc */
export function getSortDuplicateSortableIdError(id: string): Error {
  return Error(`Cannot have two MatSortables with the same id (${id}).`);
}

/** @nodoc */
export function getSortHeaderNotContainedWithinSortError(): Error {
  return Error(`MatSortHeader must be placed within a parent element with the MatSort directive.`);
}

/** @nodoc */
export function getSortHeaderMissingIdError(): Error {
  return Error(`MatSortHeader must be provided with a unique id.`);
}

/** @nodoc */
export function getSortInvalidDirectionError(direction: string): Error {
  return Error(`${direction} is not a valid sort direction ('asc' or 'desc').`);
}
