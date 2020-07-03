/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Track the open menu HTML elements in order to handle click events outside the menu tree when the
 * menus aren't logically nested.
 */
export class OpenMenuTracker {
  /** Array of the HTMLElements in the open menu tree starting from the root Menu Bar. */
  readonly openMenus: HTMLElement[] = [];

  /** Add a menus native element to the tracker. */
  push(menuElement: HTMLElement) {
    this.openMenus.push(menuElement);
  }

  /** Add the given given trackers open menu elements to this tracker. */
  extend(tracker: OpenMenuTracker) {
    this.openMenus.push(...tracker.openMenus);
  }
}
