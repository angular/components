/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export interface HasElement {
  element: HTMLElement;
}

/**
 * Sort directives by their document order.
 */
export function sortDirectives(a: HasElement, b: HasElement) {
  return (a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_PRECEDING) > 0
    ? 1
    : -1;
}
