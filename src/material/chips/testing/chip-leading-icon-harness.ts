/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
} from '@angular/cdk/testing';
import {ChipLeadingIconHarnessFilters} from './chip-harness-filters';

/** Harness for interacting with a standard Material chip leading icon in tests. */
export class MatChipLeadingIconHarness extends ComponentHarness {
  static hostSelector = '.mat-mdc-chip-leading-icon';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip leading icon with specific
   * attributes.
   * @param options Options for filtering which input instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatChipLeadingIconHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ChipLeadingIconHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }
}
