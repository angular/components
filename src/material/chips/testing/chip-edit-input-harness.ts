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
import {ChipEditInputHarnessFilters} from './chip-harness-filters';

/** Harness for interacting with an editable chip's input in tests. */
export class MatChipEditInputHarness extends ComponentHarness {
  static hostSelector = '.mat-chip-edit-input';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a chip edit input with specific
   * attributes.
   * @param options Options for filtering which input instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatChipEditInputHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ChipEditInputHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }

  /** Sets the value of the input. */
  async setValue(value: string): Promise<void> {
    const host = await this.host();

    // @breaking-change 16.0.0 Remove this null check once `setContenteditableValue`
    // becomes a required method.
    if (!host.setContenteditableValue) {
      throw new Error(
        'Cannot set chip edit input value, because test ' +
          'element does not implement the `setContenteditableValue` method.',
      );
    }

    return host.setContenteditableValue(value);
  }
}
