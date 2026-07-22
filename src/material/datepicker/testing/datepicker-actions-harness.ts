/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ContentContainerComponentHarness,
  HarnessPredicate,
  TestElement,
} from '@angular/cdk/testing';
import {DatepickerActionsHarnessFilters} from './datepicker-harness-filters';

/** Harness for interacting with a standard Material datepicker actions in tests. */
export class MatDatepickerActionsHarness extends ContentContainerComponentHarness<string> {
  static hostSelector = '.mat-datepicker-actions';

  private _applyLocator = this.locatorForOptional(
    '[matDatepickerApply], [matDateRangePickerApply]',
  );
  private _cancelLocator = this.locatorForOptional(
    '[matDatepickerCancel], [matDateRangePickerCancel]',
  );

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatDatepickerActionsHarness` that
   * meets certain criteria.
   * @param options Options for filtering which datepicker actions instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: DatepickerActionsHarnessFilters = {},
  ): HarnessPredicate<MatDatepickerActionsHarness> {
    return new HarnessPredicate(MatDatepickerActionsHarness, options);
  }

  /** Applies the current selection. */
  apply(): Promise<void> {
    return this._clickAction('apply', this._applyLocator);
  }

  /** Cancels the current selection. */
  cancel(): Promise<void> {
    return this._clickAction('cancel', this._cancelLocator);
  }

  private async _clickAction(name: string, locator: () => Promise<TestElement | null>) {
    const button = await locator();

    if (!button) {
      throw new Error(`MatDatepickerActions does not have ${name} button`);
    }

    await button.click();
  }
}
