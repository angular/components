/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {TimepickerToggleHarnessFilters} from './timepicker-harness-filters';

/** Harness for interacting with a standard Material timepicker toggle in tests. */
export class MatTimepickerToggleHarness extends ComponentHarness {
  static hostSelector = '.mat-timepicker-toggle';

  /** The clickable button inside the toggle. */
  private _button = this.locatorFor('button');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatTimepickerToggleHarness` that
   * meets certain criteria.
   * @param options Options for filtering which timepicker toggle instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: TimepickerToggleHarnessFilters = {},
  ): HarnessPredicate<MatTimepickerToggleHarness> {
    return new HarnessPredicate(MatTimepickerToggleHarness, options);
  }

  /** Opens the timepicker associated with the toggle. */
  async openTimepicker(): Promise<void> {
    const isOpen = await this.isTimepickerOpen();

    if (!isOpen) {
      const button = await this._button();
      await button.click();
    }
  }

  /** Gets whether the timepicker associated with the toggle is open. */
  async isTimepickerOpen(): Promise<boolean> {
    const button = await this._button();
    const ariaExpanded = await button.getAttribute('aria-expanded');
    return ariaExpanded === 'true';
  }

  /** Whether the toggle is disabled. */
  async isDisabled(): Promise<boolean> {
    const button = await this._button();
    return coerceBooleanProperty(await button.getAttribute('disabled'));
  }
}
