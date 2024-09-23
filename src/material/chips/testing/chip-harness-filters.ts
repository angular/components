/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BaseHarnessFilters} from '@angular/cdk/testing';

export interface ChipHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
  /** Only find instances which match the given disabled state. */
  disabled?: boolean;
}

export interface ChipInputHarnessFilters extends BaseHarnessFilters {
  /** Filters based on the value of the input. */
  value?: string | RegExp;
  /** Filters based on the placeholder text of the input. */
  placeholder?: string | RegExp;
  /** Only find instances which match the given disabled state. */
  disabled?: boolean;
}

export interface ChipListboxHarnessFilters extends BaseHarnessFilters {
  /** Only find instances which match the given disabled state. */
  disabled?: boolean;
}

export interface ChipOptionHarnessFilters extends ChipHarnessFilters {
  /** Only find chip instances whose selected state matches the given value. */
  selected?: boolean;
}

export interface ChipGridHarnessFilters extends BaseHarnessFilters {
  /** Only find instances which match the given disabled state. */
  disabled?: boolean;
}

export interface ChipRowHarnessFilters extends ChipHarnessFilters {}

export interface ChipSetHarnessFilters extends BaseHarnessFilters {}

export interface ChipRemoveHarnessFilters extends BaseHarnessFilters {}

export interface ChipAvatarHarnessFilters extends BaseHarnessFilters {}

export interface ChipEditInputHarnessFilters extends BaseHarnessFilters {}
