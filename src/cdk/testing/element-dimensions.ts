/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Dimensions for element size and its position relative to the viewport.
 */
export interface ElementDimensions {
  /** The distance from the top of the viewport in pixels */
  top: number;
  /** The distance from the left of the viewport in pixels */
  left: number;
  /** The width of the element in pixels */
  width: number;
  /** The height of the element in pixels */
  height: number;
}
