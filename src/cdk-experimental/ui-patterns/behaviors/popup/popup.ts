/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SignalLike, WritableSignalLike} from '../signal-like/signal-like';

/** Valid popup types for aria-haspopup. */
export enum PopupTypes {
  MENU = 'menu',
  TREE = 'tree',
  GRID = 'grid',
  DIALOG = 'dialog',
  LISTBOX = 'listbox',
}

/** Represents the inputs for the PopupControl behavior. */
export interface PopupControlInputs {
  /* Refers to the element that serves as the popup. */
  controls: SignalLike<string>;

  /* Whether the popup is open or closed. */
  expanded: WritableSignalLike<boolean>;

  /* Corresponds to the popup type. */
  hasPopup: SignalLike<PopupTypes>;
}

/** A behavior that manages the open/close state of a component. */
export class PopupControl {
  /** The inputs for the popup behavior, containing the `expanded` state signal. */
  constructor(readonly inputs: PopupControlInputs) {}

  /** Opens the popup by setting the expanded state to true. */
  open(): void {
    this.inputs.expanded.set(true);
  }

  /** Closes the popup by setting the expanded state to false. */
  close(): void {
    this.inputs.expanded.set(false);
  }

  /** Toggles the popup's expanded state. */
  toggle(): void {
    this.inputs.expanded.set(!this.inputs.expanded());
  }
}
