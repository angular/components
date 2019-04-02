/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef} from '@angular/core';

/** Class added to overlay bounding boxes. */
export const boundingBoxClass = 'cdk-overlay-connected-position-bounding-box';

/** A simple (x, y) coordinate. */
export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface BoundingBoxRect extends BoundingBox {
  height: number;
  width: number;
}

export type FlexibleConnectedPositionStrategyOrigin = ElementRef | HTMLElement | Point;

export function cloneRect(rect: Readonly<BoundingBoxRect>): BoundingBoxRect {
  return {
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
    height: rect.height,
    width: rect.width,
  };
}

export function getOriginRect(origin: FlexibleConnectedPositionStrategyOrigin): BoundingBoxRect {
  if (origin instanceof ElementRef) {
    return cloneRect(origin.nativeElement.getBoundingClientRect());
  }

  if (origin instanceof HTMLElement) {
    return cloneRect(origin.getBoundingClientRect());
  }

  // If the origin is a point, return a client rect as if it was a 0x0 element at the point.
  return {
    top: origin.y,
    bottom: origin.y,
    left: origin.x,
    right: origin.x,
    height: 0,
    width: 0
  };
}

/** Shallow-extends a stylesheet object with another stylesheet object. */
export function extendStyles(dest: CSSStyleDeclaration, source: CSSStyleDeclaration): CSSStyleDeclaration {
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      dest[key] = source[key];
    }
  }

  return dest;
}

const CLEARED_POSITIONS: Readonly<Partial<CSSStyleDeclaration>> = {
  top: '',
  left: '',
  right: '',
  bottom: '',
};

const CLEARED_BOUNDING_BOX_PROPERTIES: Readonly<Partial<CSSStyleDeclaration>> = {
  height: '',
  width: '',
  alignItems: '',
  justifyContent: '',
};

export function clearBoundingBoxStyles(dest: CSSStyleDeclaration): CSSStyleDeclaration {
  return extendStyles(dest, {
    ...CLEARED_POSITIONS,
    ...CLEARED_BOUNDING_BOX_PROPERTIES,
  } as CSSStyleDeclaration);
}

export function resetBoundingBoxStyles(dest: CSSStyleDeclaration): CSSStyleDeclaration {
  return extendStyles(dest, {
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    ...CLEARED_BOUNDING_BOX_PROPERTIES,
  } as CSSStyleDeclaration);
}

export function resetOverlayElementStyles(dest: CSSStyleDeclaration): CSSStyleDeclaration {
  return extendStyles(dest, {
    ...CLEARED_POSITIONS,
    position: '',
    transform: '',
  } as CSSStyleDeclaration);
}
