/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementRef} from '@angular/core';

/** A type that allows lazy resolution of a DOM Element. */
export type ElementResolver<T = HTMLElement> =
  | ElementRef<T>
  | T
  | undefined
  | null
  | ((context: HTMLElement) => T | null | undefined);

/** Evaluates an ElementResolver to return the underlying DOM element, or undefined. */
export function resolveElement<T = HTMLElement>(
  resolver: ElementResolver<T>,
  context: HTMLElement,
): T | undefined {
  if (typeof resolver === 'function') {
    return (resolver as Function)(context) ?? undefined;
  }
  return (resolver instanceof ElementRef ? resolver.nativeElement : resolver) ?? undefined;
}
