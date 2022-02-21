/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Whether an element occupies space in the browser.
 */
export function isVisible(e: Element): boolean {
  const el = e as HTMLElement;
  return Boolean(el.offsetWidth || el.offsetHeight || e.getClientRects().length);
}
