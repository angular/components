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

  /**
   * Creates the structure of the overlay. If not provided,
   * structure will be created inside the overlay container.
   */
  createStructure?(): {pane: HTMLElement; host: HTMLElement} | null;

  /** Attaches the host element to the DOM. */
  attachHost?(host: HTMLElement): boolean;

  /** Attaches the backdrop element to the host. */
  attachBackdrop?(backdrop: HTMLElement, host: HTMLElement): boolean;

  /** Updates the stacking order of the overlay. */
  updateStackingOrder?(host: HTMLElement): boolean;
}
