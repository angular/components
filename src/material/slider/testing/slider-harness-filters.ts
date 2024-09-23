/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {BaseHarnessFilters} from '@angular/cdk/testing';

/** Possible positions of a slider thumb. */
export enum ThumbPosition {
  START,
  END,
}

/** A set of criteria that can be used to filter a list of `MatSliderHarness` instances. */
export interface SliderHarnessFilters extends BaseHarnessFilters {
  /** Filters out only range/non-range sliders. */
  isRange?: boolean;

  /** Only find instances which match the given disabled state. */
  disabled?: boolean;
}

/** A set of criteria that can be used to filter a list of `MatSliderThumbHarness` instances. */
export interface SliderThumbHarnessFilters extends BaseHarnessFilters {
  /** Filters out slider thumbs with a particular position. */
  position?: ThumbPosition;
}
