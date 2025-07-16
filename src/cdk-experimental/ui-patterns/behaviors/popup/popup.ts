/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SignalLike, WritableSignalLike} from '../signal-like/signal-like';

/**
 * Represents the inputs required for a popup behavior.
 * It includes a signal for the expanded state and a reference to the popup element.
 */
export enum ComboboxPopupTypes {
  TREE = 'tree',
  GRID = 'grid',
  DIALOG = 'dialog',
  LISTBOX = 'listbox',
}

/** The element that serves as the popup. */
export interface Popup {
  /** Whether the popup is interactive or not. */
  inert: WritableSignalLike<boolean>;
}

/** Represents the inputs for the PopupControl behavior. */
export interface PopupControlInputs {
  /** The element that serves as the popup. */
  popup: SignalLike<Popup>;

  /* Refers to the element that serves as the popup. */
  controls: SignalLike<string>;

  /* Whether the popup is open or closed. */
  expanded: WritableSignalLike<boolean>;

  /* Corresponds to the popup type. */
  hasPopup: SignalLike<ComboboxPopupTypes>;
}

/**
 * A behavior that manages the open/close state of a component.
 * It provides methods to open, close, and toggle the state,
 * which is controlled via a writable signal.
 */
export class PopupControl {
  /** The inputs for the popup behavior, containing the `expanded` state signal. */
  constructor(readonly inputs: PopupControlInputs) {}

  /** Opens the popup by setting the expanded state to true. */
  open(): void {
    this.inputs.expanded.set(true);
    this.inputs.popup().inert.set(false);
  }

  /** Closes the popup by setting the expanded state to false. */
  close(): void {
    this.inputs.expanded.set(false);
    this.inputs.popup().inert.set(true);
  }

  /** Toggles the popup's expanded state. */
  toggle(): void {
    const expanded = !this.inputs.expanded();
    this.inputs.expanded.set(expanded);
    this.inputs.popup().inert.set(!expanded);
  }
}
