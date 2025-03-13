/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

/** Possible button variants. */
export type ButtonVariant = 'basic' | 'icon' | 'fab' | 'mini-fab';

/** Possible button appearances. */
export type ButtonAppearance = 'text' | 'filled' | 'elevated' | 'outlined';

/** A set of criteria that can be used to filter a list of button harness instances. */
export interface ButtonHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;

  /** Only find instances with a variant. */
  variant?: ButtonVariant;

  /** Only find instances with a specific appearance. */
  appearance?: ButtonAppearance;

  /** Only find instances which match the given disabled state. */
  disabled?: boolean;
}
