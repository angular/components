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
import {ChipEditHarnessFilters} from './chip-harness-filters';

/** Harness for interacting with a standard Material chip edit button in tests. */
export class MatChipEditHarness extends ComponentHarness {
  static hostSelector = '.mat-mdc-chip-edit';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip edit with specific
   * attributes.
   * @param options Options for filtering which input instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatChipEditHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ChipEditHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }

  /** Clicks the edit button. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }
}
