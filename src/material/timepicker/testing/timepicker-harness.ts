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
import {MatOptionHarness, OptionHarnessFilters} from '../../core/testing';
import {TimepickerHarnessFilters} from './timepicker-harness-filters';

export class MatTimepickerHarness extends ComponentHarness {
  private _documentRootLocator = this.documentRootLocatorFactory();
  static hostSelector = 'mat-timepicker';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a timepicker with specific
   * attributes.
   * @param options Options for filtering which timepicker instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatTimepickerHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TimepickerHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }

  /** Whether the timepicker is open. */
  async isOpen(): Promise<boolean> {
    const selector = await this._getPanelSelector();
    const panel = await this._documentRootLocator.locatorForOptional(selector)();
    return panel !== null;
  }

  /** Gets the options inside the timepicker panel. */
  async getOptions(filters?: Omit<OptionHarnessFilters, 'ancestor'>): Promise<MatOptionHarness[]> {
    if (!(await this.isOpen())) {
      throw new Error('Unable to retrieve options for timepicker. Timepicker panel is closed.');
    }

    return this._documentRootLocator.locatorForAll(
      MatOptionHarness.with({
        ...(filters || {}),
        ancestor: await this._getPanelSelector(),
      } as OptionHarnessFilters),
    )();
  }

  /** Selects the first option matching the given filters. */
  async selectOption(filters: OptionHarnessFilters): Promise<void> {
    const options = await this.getOptions(filters);
    if (!options.length) {
      throw Error(`Could not find a mat-option matching ${JSON.stringify(filters)}`);
    }
    await options[0].click();
  }

  /** Gets the selector that can be used to find the timepicker's panel. */
  protected async _getPanelSelector(): Promise<string> {
    return `#${await (await this.host()).getAttribute('mat-timepicker-panel-id')}`;
  }
}
