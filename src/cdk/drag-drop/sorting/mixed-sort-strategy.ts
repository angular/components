/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {_getShadowRoot} from '../../platform';
import {DragDropRegistry} from '../drag-drop-registry';
import type {DragRef} from '../drag-ref';
import {moveItemInArray} from '../drag-utils';
import {DropListSortStrategy, SortPredicate} from './drop-list-sort-strategy';

/**
 * Strategy that only supports sorting on a list that might wrap.
 * Items are reordered by moving their DOM nodes around.
 * @nodoc
 */
export class MixedSortStrategy implements DropListSortStrategy {
  /** Root element container of the drop list. */
  private _element: HTMLElement;

  /** Function used to determine if an item can be sorted into a specific index. */
  private _sortPredicate: SortPredicate<DragRef>;

  /** Lazily-resolved root node containing the list. Use `_getRootNode` to read this. */
  private _rootNode: DocumentOrShadowRoot | undefined;

  /**
   * Draggable items that are currently active inside the container. Includes the items
   * that were there at the start of the sequence, as well as any items that have been dragged
   * in, but haven't been dropped yet.
   */
  private _activeItems: DragRef[];

  /**
   * Keeps track of the item that was last swapped with the dragged item, as well as what direction
   * the pointer was moving in when the swap occurred and whether the user's pointer continued to
   * overlap with the swapped item after the swapping occurred.
   */
  private _previousSwap = {
    drag: null as DragRef | null,
    deltaX: 0,
    deltaY: 0,
    overlaps: false,
  };

  /**
   * Keeps track of the relationship between a node and its next sibling. This information
   * is used to restore the DOM to the order it was in before dragging started.
   */
  private _relatedNodes: [node: Node, nextSibling: Node | null][] = [];

  constructor(
    private _document: Document,
    private _dragDropRegistry: DragDropRegistry,
  ) {}

  /**
   * To be called when the drag sequence starts.
   * @param items Items that are currently in the list.
   */
  start(items: readonly DragRef[]): void {
    const childNodes = this._element.childNodes;
    this._relatedNodes = [];

    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];
      this._relatedNodes.push([node, node.nextSibling]);
    }

    this.withItems(items);
  }

  /**
   * To be called when an item is being sorted.
   * @param item Item to be sorted.
   * @param pointerX Position of the item along the X axis.
   * @param pointerY Position of the item along the Y axis.
   * @param pointerDelta Direction in which the pointer is moving along each axis.
   */
  sort(
    item: DragRef,
    pointerX: number,
    pointerY: number,
    pointerDelta: {x: number; y: number},
  ): {previousIndex: number; currentIndex: number} | null {
    const newIndex = this._getItemIndexFromPointerPosition(item, pointerX, pointerY);
    const previousSwap = this._previousSwap;

    if (newIndex === -1 || this._activeItems[newIndex] === item) {
      return null;
    }

    const toSwapWith = this._activeItems[newIndex];

    // Prevent too many swaps over the same item.
    if (
      previousSwap.drag === toSwapWith &&
      previousSwap.overlaps &&
      previousSwap.deltaX === pointerDelta.x &&
      previousSwap.deltaY === pointerDelta.y
    ) {
      return null;
    }

    const previousIndex = this.getItemIndex(item);
    const current = item.getPlaceholderElement();
    const overlapElement = toSwapWith.getRootElement();

    if (newIndex > previousIndex) {
      overlapElement.after(current);
    } else {
      overlapElement.before(current);
    }

    moveItemInArray(this._activeItems, previousIndex, newIndex);

    const newOverlapElement = this._getRootNode().elementFromPoint(pointerX, pointerY);
    // Note: it's tempting to save the entire `pointerDelta` object here, however that'll
    // break this functionality, because the same object is passed for all `sort` calls.
    previousSwap.deltaX = pointerDelta.x;
    previousSwap.deltaY = pointerDelta.y;
    previousSwap.drag = toSwapWith;
    previousSwap.overlaps =
      overlapElement === newOverlapElement || overlapElement.contains(newOverlapElement);

    return {
      previousIndex,
      currentIndex: newIndex,
    };
  }

  /**
   * Called when an item is being moved into the container.
   * @param item Item that was moved into the container.
   * @param pointerX Position of the item along the X axis.
   * @param pointerY Position of the item along the Y axis.
   * @param index Index at which the item entered. If omitted, the container will try to figure it
   *   out automatically.
   */
  enter(item: DragRef, pointerX: number, pointerY: number, index?: number): void {
    let enterIndex =
      index == null || index < 0
        ? this._getItemIndexFromPointerPosition(item, pointerX, pointerY)
        : index;

    // In some cases (e.g. when the container has padding) we might not be able to figure
    // out which item to insert the dragged item next to, because the pointer didn't overlap
    // with anything. In that case we find the item that's closest to the pointer.
    if (enterIndex === -1) {
      enterIndex = this._getClosestItemIndexToPointer(item, pointerX, pointerY);
    }

    const targetItem = this._activeItems[enterIndex] as DragRef | undefined;
    const currentIndex = this._activeItems.indexOf(item);

    if (currentIndex > -1) {
      this._activeItems.splice(currentIndex, 1);
    }

    if (targetItem && !this._dragDropRegistry.isDragging(targetItem)) {
      this._activeItems.splice(enterIndex, 0, item);
      targetItem.getRootElement().before(item.getPlaceholderElement());
    } else {
      this._activeItems.push(item);
      this._element.appendChild(item.getPlaceholderElement());
    }
  }

  /** Sets the items that are currently part of the list. */
  withItems(items: readonly DragRef[]): void {
    this._activeItems = items.slice();
  }

  /** Assigns a sort predicate to the strategy. */
  withSortPredicate(predicate: SortPredicate<DragRef>): void {
    this._sortPredicate = predicate;
  }

  /** Resets the strategy to its initial state before dragging was started. */
  reset(): void {
    const root = this._element;
    const previousSwap = this._previousSwap;

    // Moving elements around in the DOM can break things like the `@for` loop, because it
    // uses comment nodes to know where to insert elements. To avoid such issues, we restore
    // the DOM nodes in the list to their original order when the list is reset.
    // Note that this could be simpler if we just saved all the nodes, cleared the root
    // and then appended them in the original order. We don't do it, because it can break
    // down depending on when the snapshot was taken. E.g. we may end up snapshotting the
    // placeholder element which is removed after dragging.
    for (let i = this._relatedNodes.length - 1; i > -1; i--) {
      const [node, nextSibling] = this._relatedNodes[i];
      if (node.parentNode === root && node.nextSibling !== nextSibling) {
        if (nextSibling === null) {
          root.appendChild(node);
        } else if (nextSibling.parentNode === root) {
          root.insertBefore(node, nextSibling);
        }
      }
    }

    this._relatedNodes = [];
    this._activeItems = [];
    previousSwap.drag = null;
    previousSwap.deltaX = previousSwap.deltaY = 0;
    previousSwap.overlaps = false;
  }

  /**
   * Gets a snapshot of items currently in the list.
   * Can include items that we dragged in from another list.
   */
  getActiveItemsSnapshot(): readonly DragRef[] {
    return this._activeItems;
  }

  /** Gets the index of a specific item. */
  getItemIndex(item: DragRef): number {
    return this._activeItems.indexOf(item);
  }

  /** Used to notify the strategy that the scroll position has changed. */
  updateOnScroll(): void {
    this._activeItems.forEach(item => {
      if (this._dragDropRegistry.isDragging(item)) {
        // We need to re-sort the item manually, because the pointer move
        // events won't be dispatched while the user is scrolling.
        item._sortFromLastPointerPosition();
      }
    });
  }

  withElementContainer(container: HTMLElement): void {
    if (container !== this._element) {
      this._element = container;
      this._rootNode = undefined;
    }
  }

  /**
   * Gets the index of an item in the drop container, based on the position of the user's pointer.
   * @param item Item that is being sorted.
   * @param pointerX Position of the user's pointer along the X axis.
   * @param pointerY Position of the user's pointer along the Y axis.
   * @param delta Direction in which the user is moving their pointer.
   */
  private _getItemIndexFromPointerPosition(
    item: DragRef,
    pointerX: number,
    pointerY: number,
  ): number {
    const elementAtPoint = this._getRootNode().elementFromPoint(
      Math.floor(pointerX),
      Math.floor(pointerY),
    );
    const index = elementAtPoint
      ? this._activeItems.findIndex(item => {
          const root = item.getRootElement();
          return elementAtPoint === root || root.contains(elementAtPoint);
        })
      : -1;
    return index === -1 || !this._sortPredicate(index, item) ? -1 : index;
  }

  /** Lazily resolves the list's root node. */
  private _getRootNode(): DocumentOrShadowRoot {
    // Resolve the root node lazily to ensure that the drop list is in its final place in the DOM.
    if (!this._rootNode) {
      this._rootNode = _getShadowRoot(this._element) || this._document;
    }
    return this._rootNode;
  }

  /**
   * Finds the index of the item that's closest to the item being dragged.
   * @param item Item being dragged.
   * @param pointerX Position of the user's pointer along the X axis.
   * @param pointerY Position of the user's pointer along the Y axis.
   */
  private _getClosestItemIndexToPointer(item: DragRef, pointerX: number, pointerY: number): number {
    if (this._activeItems.length === 0) {
      return -1;
    }

    if (this._activeItems.length === 1) {
      return 0;
    }

    let minDistance = Infinity;
    let minIndex = -1;

    // Find the Euclidean distance (https://en.wikipedia.org/wiki/Euclidean_distance) between each
    // item and the pointer, and return the smallest one. Note that this is a bit flawed in that DOM
    // nodes are rectangles, not points, so we use the top/left coordinates. It should be enough
    // for our purposes.
    for (let i = 0; i < this._activeItems.length; i++) {
      const current = this._activeItems[i];
      if (current !== item) {
        const {x, y} = current.getRootElement().getBoundingClientRect();
        const distance = Math.hypot(pointerX - x, pointerY - y);

        if (distance < minDistance) {
          minDistance = distance;
          minIndex = i;
        }
      }
    }

    return minIndex;
  }
}
