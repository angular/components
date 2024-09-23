/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {OverlayRef} from '../overlay-ref';

/** Strategy for setting the position on an overlay. */
export interface PositionStrategy {
  /** Attaches this position strategy to an overlay. */
  attach(overlayRef: OverlayRef): void;

  /** Updates the position of the overlay element. */
  apply(): void;

  /** Called when the overlay is detached. */
  detach?(): void;

  /** Cleans up any DOM modifications made by the position strategy, if necessary. */
  dispose(): void;
}
