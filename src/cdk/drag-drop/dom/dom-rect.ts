/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Gets a mutable version of an element's bounding `DOMRect`. */
export function getMutableClientRect(element: Element): DOMRect {
  const rect = element.getBoundingClientRect();

  // We need to clone the `clientRect` here, because all the values on it are readonly
  // and we need to be able to update them. Also we can't use a spread here, because
  // the values on a `DOMRect` aren't own properties. See:
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect#Notes
  return {
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    x: rect.x,
    y: rect.y,
  } as DOMRect;
}

/**
 * Checks whether some coordinates are within a `DOMRect`.
 * @param clientRect DOMRect that is being checked.
 * @param x Coordinates along the X axis.
 * @param y Coordinates along the Y axis.
 */
export function isInsideClientRect(clientRect: DOMRect, x: number, y: number) {
  const {top, bottom, left, right} = clientRect;
  return y >= top && y <= bottom && x >= left && x <= right;
}

/**
 * Checks if the child element is overflowing from its parent.
 * @param parentRect - The bounding rect of the parent element.
 * @param childRect - The bounding rect of the child element.
 */
export function isOverflowingParent(parentRect: DOMRect, childRect: DOMRect): boolean {
  // check for horizontal overflow (left and right)
  const isLeftOverflowing = childRect.left < parentRect.left;
  const isRightOverflowing = childRect.left + childRect.width > parentRect.right;

  // check for vertical overflow (top and bottom)
  const isTopOverflowing = childRect.top < parentRect.top;
  const isBottomOverflowing = childRect.top + childRect.height > parentRect.bottom;

  return isLeftOverflowing || isRightOverflowing || isTopOverflowing || isBottomOverflowing;
}

/**
 * Updates the top/left positions of a `DOMRect`, as well as their bottom/right counterparts.
 * @param domRect `DOMRect` that should be updated.
 * @param top Amount to add to the `top` position.
 * @param left Amount to add to the `left` position.
 */
export function adjustDomRect(
  domRect: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
  },
  top: number,
  left: number,
) {
  domRect.top += top;
  domRect.bottom = domRect.top + domRect.height;

  domRect.left += left;
  domRect.right = domRect.left + domRect.width;
}

/**
 * Checks whether the pointer coordinates are close to a DOMRect.
 * @param rect DOMRect to check against.
 * @param threshold Threshold around the DOMRect.
 * @param pointerX Coordinates along the X axis.
 * @param pointerY Coordinates along the Y axis.
 */
export function isPointerNearDomRect(
  rect: DOMRect,
  threshold: number,
  pointerX: number,
  pointerY: number,
): boolean {
  const {top, right, bottom, left, width, height} = rect;
  const xThreshold = width * threshold;
  const yThreshold = height * threshold;

  return (
    pointerY > top - yThreshold &&
    pointerY < bottom + yThreshold &&
    pointerX > left - xThreshold &&
    pointerX < right + xThreshold
  );
}
