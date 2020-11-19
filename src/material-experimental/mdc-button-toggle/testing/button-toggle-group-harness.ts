/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {ButtonToggleHarnessFilters} from './button-toggle-harness-filters';
import {ButtonToggleGroupHarnessFilters} from './button-toggle-group-harness-filters';
import {MatButtonToggleHarness} from './button-toggle-harness';


/** Harness for interacting with a MDC_based mat-button-toggle in tests. */
export class MatButtonToggleGroupHarness extends ComponentHarness {
  /** The selector for the host element of a `MatButtonToggleGroup` instance. */
  static hostSelector = '.mat-mdc-button-toggle-group';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatButtonToggleGroupHarness`
   * that meets certain criteria.
   * @param options Options for filtering which button toggle instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ButtonToggleGroupHarnessFilters = {}):
    HarnessPredicate<MatButtonToggleGroupHarness> {
    return new HarnessPredicate(MatButtonToggleGroupHarness, options);
  }

  /**
   * Gets the button toggles that are inside the group.
   * @param filter Optionally filters which toggles are included.
   */
  async getToggles(filter: ButtonToggleHarnessFilters = {}): Promise<MatButtonToggleHarness[]> {
    return this.locatorForAll(MatButtonToggleHarness.with(filter))();
  }

  /** Gets whether the button toggle group is disabled. */
  async isDisabled(): Promise<boolean> {
    return await (await this.host()).getAttribute('aria-disabled') === 'true';
  }

  /** Gets whether the button toggle group is laid out vertically. */
  async isVertical(): Promise<boolean> {
    return false;
  }
}
