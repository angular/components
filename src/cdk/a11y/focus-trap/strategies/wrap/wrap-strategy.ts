/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {InjectionToken} from '@angular/core';
import {FocusTrap} from '../../focus-trap';

/** The injection token used to specify the inert strategy. */
export const FOCUS_TRAP_WRAP_STRATEGY =
  new InjectionToken<FocusTrapWrapStrategy>('FOCUS_TRAP_WRAP_STRATEGY');

/**
 * A strategy that dictates how FocusTrap should wrap focus on Tab
 * and Shift-Tab keypresses.
 */
export interface FocusTrapWrapStrategy {
  /** Sets up the FocusTrap to allow Tab wrapping. */
  init(focusTrap: FocusTrap): void;

  /** Wraps Tab from the end of the FocusTrap to the start, and Shift-Tab from start to end. */
  trapTab(focusTrap: FocusTrap): void;

  /** Stops wrapping Tab temporarily. */
  allowTabEscape(focusTrap: FocusTrap): void;
}
