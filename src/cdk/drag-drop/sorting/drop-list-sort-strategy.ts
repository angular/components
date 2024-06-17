/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {DragRef} from '../drag-ref';

/**
 * Function that is used to determine whether an item can be sorted into a particular index.
 * @docs-private
 */
export type SortPredicate<T> = (index: number, item: T) => boolean;

/**
 * Strategy used to sort and position items within a drop list.
 * @docs-private
 */
export interface DropListSortStrategy {
  start(items: readonly DragRef[]): void;
  sort(
    item: DragRef,
    pointerX: number,
    pointerY: number,
    pointerDelta: {x: number; y: number},
  ): {previousIndex: number; currentIndex: number} | null;
  enter(item: DragRef, pointerX: number, pointerY: number, index?: number): void;
  withItems(items: readonly DragRef[]): void;
  withSortPredicate(predicate: SortPredicate<DragRef>): void;
  reset(): void;
  getActiveItemsSnapshot(): readonly DragRef[];
  getItemIndex(item: DragRef): number;
  updateOnScroll(topDifference: number, leftDifference: number): void;
}
