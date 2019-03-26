import {ElementRef} from '@angular/core';

/** A simple (x, y) coordinate. */
export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  top: number,
  bottom: number,
  left: number,
  right: number,
  height: number,
  width: number,
}

export type FlexibleConnectedPositionStrategyOrigin = ElementRef | HTMLElement | Point;

export function cloneRect(rect: Readonly<Rect>) {
  return {
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
    height: rect.height,
    width: rect.width,
  };
}

export function getOriginRect(origin: FlexibleConnectedPositionStrategyOrigin): Rect {
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

export function clearStyles(dest: CSSStyleDeclaration) {
  return extendStyles(dest, {
    top: '',
    left: '',
    right: '',
    bottom: '',
    height: '',
    width: '',
    alignItems: '',
    justifyContent: '',
  } as CSSStyleDeclaration);
}
