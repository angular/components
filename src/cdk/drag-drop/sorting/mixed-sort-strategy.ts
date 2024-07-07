/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {_getShadowRoot} from '@angular/cdk/platform';
import {moveItemInArray} from '../drag-utils';
import {DropListSortStrategy, SortPredicate} from './drop-list-sort-strategy';
import {DragDropRegistry} from '../drag-drop-registry';
import type {DragRef} from '../drag-ref';
import {getMutableClientRect} from '../dom/dom-rect';
import {combineTransforms} from '../dom/styling';

/**
 * Strategy that only supports sorting on a list that might wrap.
 * Items are reordered by moving their DOM nodes around.
 * @docs-private
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

  /** Cache of the dimensions of all the items inside the container. */
  private _itemPositions: CachedItemPosition<DragRef>[] = [];

  constructor(
    private _document: Document,
    private _dragDropRegistry: DragDropRegistry<DragRef, unknown>,
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
    const siblings = this._itemPositions.slice();
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
    const siblingAtNewPosition = siblings[newIndex];
    const previousPosition = siblings[previousIndex].clientRect;
    const newPosition = siblingAtNewPosition.clientRect;
    const overlapElement = toSwapWith.getRootElement();

    const delta = this._getDelta(newPosition.top, previousPosition.top, pointerDelta);

    if (delta === 0) return null;
    if (delta === 1 && previousIndex > newIndex) return null;
    if (delta === -1 && previousIndex < newIndex) return null;

    const startIndex = Math.min(previousIndex, newIndex);
    const endIndex = Math.max(previousIndex, newIndex);

    let itemPositions = this._itemPositions.slice();

    if (delta === 1) {
      for (let i = startIndex; i < endIndex; i++) {
        itemPositions = this._updateItemPosition(i, itemPositions, delta);
        moveItemInArray(itemPositions, i, i + 1);
      }
    } else if (delta === -1) {
      for (let i = endIndex; i > startIndex; i--) {
        itemPositions = this._updateItemPosition(i, itemPositions, delta);
        moveItemInArray(itemPositions, i, i - 1);
      }
    }

    const threshold = this._getThreshold();
    let currentTop = itemPositions[0].clientRect.top;

    for (let i = 0; i < itemPositions.length; i++) {
      const sibling = itemPositions[i];
      const isDraggedItem = sibling.drag === item;

      const element = isDraggedItem
        ? sibling.drag.getPlaceholderElement()
        : sibling.drag.getRootElement();

      const marginRight = +getComputedStyle(element).marginRight.split('px')[0];

      if (Math.round(sibling.clientRect.right + marginRight) > Math.round(threshold)) {
        const nextPosition = itemPositions[i + 1];
        if (nextPosition) {
          currentTop = nextPosition.clientRect.top;
        }

        itemPositions = this._updateItemPositionToDown(itemPositions, i);
      } else if (sibling.clientRect.top !== currentTop) {
        currentTop = sibling.clientRect.top;
        itemPositions = this._updateItemPositionToUp(itemPositions, i);
      }
    }

    const oldOrder = this._itemPositions.slice();
    this._itemPositions = itemPositions.slice();
    moveItemInArray(this._activeItems, previousIndex, newIndex);

    itemPositions.forEach((sibling, index) => {
      if (oldOrder[index] === sibling) {
        return;
      }

      const isDraggedItem = sibling.drag === item;
      const elementToOffset = isDraggedItem
        ? item.getPlaceholderElement()
        : sibling.drag.getRootElement();

      elementToOffset.style.transform = combineTransforms(
        `translate3d(${Math.round(sibling.transform.x)}px, ${Math.round(
          sibling.transform.y,
        )}px, 0)`,
      );
    });

    const newOverlapElement = this._getRootNode().elementFromPoint(pointerX, pointerY);
    // // Note: it's tempting to save the entire `pointerDelta` object here, however that'll
    // // break this functionality, because the same object is passed for all `sort` calls.
    previousSwap.deltaX = pointerDelta.x;
    previousSwap.deltaY = pointerDelta.y;
    previousSwap.drag = toSwapWith;
    previousSwap.overlaps =
      overlapElement === newOverlapElement || overlapElement.contains(newOverlapElement);

    return {
      previousIndex: 1,
      currentIndex: 3,
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

    this._cacheItemPosition();
  }

  /** Sets the items that are currently part of the list. */
  withItems(items: readonly DragRef[]): void {
    this._activeItems = items.slice();
    this._cacheItemPosition();
  }

  /** Assigns a sort predicate to the strategy. */
  withSortPredicate(predicate: SortPredicate<DragRef>): void {
    this._sortPredicate = predicate;
  }

  /** Resets the strategy to its initial state before dragging was started. */
  reset(): void {
    const previousSwap = this._previousSwap;
    this._activeItems?.forEach(item => {
      const rootElement = item.getRootElement();
      if (rootElement) {
        // const initialTransform = this._itemPositions.find(p => p.drag === item)
        rootElement.style.transform = '';
      }
    });
    this._itemPositions = [];
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

    const index =
      elementAtPoint && !elementAtPoint?.getAnimations().length
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

  private _cacheItemPosition() {
    this._itemPositions = this._activeItems.map(drag => {
      const elementToMeasure = drag.getVisibleElement();
      return {
        drag,
        clientRect: getMutableClientRect(elementToMeasure),
        transform: {
          x: 0,
          y: 0,
        },
      };
    });
  }

  private _updateItemPosition(
    currentIndex: number,
    siblings: CachedItemPosition<DragRef>[],
    delta: number,
  ) {
    let siblingsUpdated = siblings.slice();
    const offsetVertical = this._getOffset(currentIndex, siblingsUpdated, delta, false);
    const offsetHorizontal = this._getOffset(currentIndex, siblingsUpdated, delta, true);

    const immediateIndex = currentIndex + delta * 1;
    const currentItem = siblingsUpdated[currentIndex];
    const immediateSibling = siblingsUpdated[immediateIndex];

    const currentItemUpdated: CachedItemPosition<DragRef> = {
      ...currentItem,
      clientRect: {
        ...currentItem.clientRect,
        x: currentItem.clientRect.x + offsetHorizontal.itemOffset,
        left: currentItem.clientRect.left + offsetHorizontal.itemOffset,
        right: currentItem.clientRect.right + offsetHorizontal.itemOffset,
        y: currentItem.clientRect.y + offsetVertical.itemOffset,
        top: currentItem.clientRect.top + offsetVertical.itemOffset,
        bottom: currentItem.clientRect.bottom + offsetVertical.itemOffset,
      },
      transform: {
        x: currentItem.transform.x + offsetHorizontal.itemOffset,
        y: currentItem.transform.y + offsetVertical.itemOffset,
      },
    };

    const immediateSiblingUpdated: CachedItemPosition<DragRef> = {
      ...immediateSibling,
      clientRect: {
        ...immediateSibling.clientRect,
        x: immediateSibling.clientRect.x + offsetHorizontal.siblingOffset,
        left: immediateSibling.clientRect.left + offsetHorizontal.siblingOffset,
        right: immediateSibling.clientRect.right + offsetHorizontal.siblingOffset,
        y: immediateSibling.clientRect.y + offsetVertical.siblingOffset,
        top: immediateSibling.clientRect.top + offsetVertical.siblingOffset,
        bottom: immediateSibling.clientRect.bottom + offsetVertical.siblingOffset,
      },
      transform: {
        x: immediateSibling.transform.x + offsetHorizontal.siblingOffset,
        y: immediateSibling.transform.y + offsetVertical.siblingOffset,
      },
    };

    if (offsetVertical.itemOffset !== offsetVertical.siblingOffset) {
      const offset =
        (currentItemUpdated.clientRect.right - immediateSibling.clientRect.right) * delta;
      const top = delta === 1 ? immediateSibling.clientRect.top : currentItem.clientRect.top;

      const ignoreItem = delta === 1 ? immediateSibling.drag : currentItem.drag;

      siblingsUpdated = this._updateItemPositionHorizontalOnRow(
        siblingsUpdated,
        top,
        offset,
        ignoreItem,
      );
    }
    siblingsUpdated[currentIndex] = currentItemUpdated;
    siblingsUpdated[immediateIndex] = immediateSiblingUpdated;

    return siblingsUpdated;
  }

  private _updateItemPositionToUp(siblings: CachedItemPosition<DragRef>[], currentIndex: number) {
    let siblingsUpdated = siblings.slice();
    const immediateSibling = siblingsUpdated[currentIndex - 1];
    const currentItem = siblingsUpdated[currentIndex];

    const nextEmptySlotLeft = immediateSibling.clientRect.right + this._getContainerGapPixel();

    const threshold = this._getThreshold();
    if (
      nextEmptySlotLeft + currentItem.clientRect.right - currentItem.clientRect.left <=
      threshold
    ) {
      const offsetLeft = nextEmptySlotLeft - currentItem.clientRect.left;
      const offsetTop = immediateSibling.clientRect.top - currentItem.clientRect.top;

      const nextSibling = siblingsUpdated[currentIndex + 1];
      if (nextSibling) {
        const offset = currentItem.clientRect.left - nextSibling.clientRect.left;
        siblingsUpdated = this._updateItemPositionHorizontalOnRow(
          siblingsUpdated,
          currentItem.clientRect.top,
          offset,
          currentItem.drag,
        );
      }

      siblingsUpdated[currentIndex] = {
        ...currentItem,
        clientRect: {
          ...currentItem.clientRect,
          x: nextEmptySlotLeft,
          left: nextEmptySlotLeft,
          right: currentItem.clientRect.right - currentItem.clientRect.left + nextEmptySlotLeft,
          y: immediateSibling.clientRect.y,
          top: immediateSibling.clientRect.top,
          bottom:
            currentItem.clientRect.bottom -
            currentItem.clientRect.top +
            immediateSibling.clientRect.top,
        },
        transform: {
          x: currentItem.transform.x + offsetLeft,
          y: currentItem.transform.y + offsetTop,
        },
      };
    }

    return siblingsUpdated;
  }

  private _updateItemPositionToDown(siblings: CachedItemPosition<DragRef>[], currentIndex: number) {
    let siblingsUpdated = siblings.slice();
    const currentItem = siblingsUpdated[currentIndex];
    const immediateSibling = siblingsUpdated[currentIndex + 1];
    let offsetLeft = 0;
    let offsetTop = 0;

    if (immediateSibling) {
      offsetLeft = immediateSibling.clientRect.left - currentItem.clientRect.left;
      offsetTop = immediateSibling.clientRect.top - currentItem.clientRect.top;
    } else {
      const firstSibling = siblings.find(
        item => item.clientRect.top === currentItem.clientRect.top,
      );

      if (firstSibling) {
        offsetLeft = firstSibling.clientRect.left - currentItem.clientRect.left;
      }

      offsetTop =
        currentItem.clientRect.bottom - currentItem.clientRect.top + this._getContainerGapPixel();
    }

    const currentItemUpdated: CachedItemPosition<DragRef> = {
      ...currentItem,
      clientRect: {
        ...currentItem.clientRect,
        x: currentItem.clientRect.x + offsetLeft,
        left: currentItem.clientRect.left + offsetLeft,
        right: currentItem.clientRect.right + offsetLeft,
        y: currentItem.clientRect.y + offsetTop,
        top: currentItem.clientRect.top + offsetTop,
        bottom: currentItem.clientRect.bottom + offsetTop,
      },
      transform: {
        x: currentItem.transform.x + offsetLeft,
        y: currentItem.transform.y + offsetTop,
      },
    };

    if (immediateSibling) {
      const offset =
        currentItemUpdated.clientRect.right -
        immediateSibling.clientRect.left +
        this._getContainerGapPixel();

      siblingsUpdated = this._updateItemPositionHorizontalOnRow(
        siblingsUpdated,
        immediateSibling.clientRect.top,
        offset,
      );
    }

    siblingsUpdated[currentIndex] = currentItemUpdated;
    return siblingsUpdated;
  }

  private _updateItemPositionHorizontalOnRow(
    siblings: CachedItemPosition<DragRef>[],
    top: number,
    offset: number,
    ignoreItem?: DragRef,
  ) {
    const siblingsUpdated = siblings.slice();

    siblingsUpdated
      .filter(item => (!ignoreItem || item.drag !== ignoreItem) && item.clientRect.top === top)
      .forEach(curentItem => {
        const index = siblingsUpdated.findIndex(item => item.drag === curentItem.drag);
        siblingsUpdated[index] = {
          ...siblingsUpdated[index],
          clientRect: {
            ...siblingsUpdated[index].clientRect,
            x: siblingsUpdated[index].clientRect.x + offset,
            left: siblingsUpdated[index].clientRect.left + offset,
            right: siblingsUpdated[index].clientRect.right + offset,
          },
          transform: {
            ...siblingsUpdated[index].transform,
            x: siblingsUpdated[index].transform.x + offset,
          },
        };
      });

    return siblingsUpdated;
  }

  /**
   * Gets the offset horizontal in pixels by which the item that is being dragged should be moved
   * @param currentIndex Current position of the item
   * @param siblings All of the items in the list
   * @param delta Direction in which the user is moving
   * @param isHorizontal Orientation in which the user is moving
   * @returns {Object} The offset horizontal
   * @returns {number} return.itemOffset The offset of item
   * @returns {number} return.siblingOffset The offset of sibling
   */
  private _getOffset(
    currentIndex: number,
    siblings: CachedItemPosition<DragRef>[],
    delta: number,
    isHorizontal: boolean,
  ) {
    const currentPosition = siblings[currentIndex].clientRect;
    const immediateSibling = siblings[currentIndex + delta].clientRect;

    let itemOffset = 0;
    let siblingOffset = 0;

    if (immediateSibling) {
      const start = isHorizontal ? 'left' : 'top';
      const end = isHorizontal ? 'right' : 'bottom';

      if (delta === 1) {
        itemOffset = immediateSibling[end] - currentPosition[end];
        siblingOffset = currentPosition[start] - immediateSibling[start];

        if (isHorizontal && immediateSibling[end] < currentPosition[end]) {
          itemOffset = immediateSibling[start] - currentPosition[start];
        }
      } else {
        itemOffset = immediateSibling[start] - currentPosition[start];
        siblingOffset = currentPosition[end] - immediateSibling[end];

        if (isHorizontal && immediateSibling[end] > currentPosition[end]) {
          siblingOffset = currentPosition[start] - immediateSibling[start];
        }
      }
    }

    return {
      itemOffset,
      siblingOffset,
    };
  }

  private _getContainerGapPixel() {
    const containerStyle = getComputedStyle(this._element);
    const displayStyle = containerStyle.display;

    if (displayStyle.includes('flex') || displayStyle.includes('grid')) {
      return containerStyle.gap ? +containerStyle.gap.split('px')[0] : 0;
    }
    return 0;
  }

  private _getDelta(newTop: number, previousTop: number, pointerDelta: {x: number; y: number}) {
    if (newTop === previousTop) {
      return pointerDelta.x;
    }

    return newTop > previousTop ? 1 : -1;
  }

  private _getThreshold() {
    const containerStyle = getComputedStyle(this._element);
    const paddingRight = +containerStyle.paddingRight.split('px')[0];

    return getMutableClientRect(this._element).right - paddingRight;
  }
}

/**
 * Entry in the position cache for draggable items.
 * @docs-private
 */
interface CachedItemPosition<T> {
  /** Instance of the drag item. */
  drag: T;
  /** Dimensions of the item. */
  clientRect: DOMRect;
  /** Inline transform that the drag item had when dragging started. */
  transform: {
    x: number;
    y: number;
  };
}
