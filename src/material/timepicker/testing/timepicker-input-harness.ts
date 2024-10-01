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
  TestKey,
} from '@angular/cdk/testing';
import {MatTimepickerHarness} from './timepicker-harness';
import {
  TimepickerHarnessFilters,
  TimepickerInputHarnessFilters,
} from './timepicker-harness-filters';

/** Harness for interacting with a standard Material timepicker inputs in tests. */
export class MatTimepickerInputHarness extends ComponentHarness {
  private _documentRootLocator = this.documentRootLocatorFactory();
  static hostSelector = '.mat-timepicker-input';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatTimepickerInputHarness`
   * that meets certain criteria.
   * @param options Options for filtering which input instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatTimepickerInputHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TimepickerInputHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
      .addOption('value', options.value, (harness, value) => {
        return HarnessPredicate.stringMatches(harness.getValue(), value);
      })
      .addOption('placeholder', options.placeholder, (harness, placeholder) => {
        return HarnessPredicate.stringMatches(harness.getPlaceholder(), placeholder);
      });
  }

  /** Gets whether the timepicker associated with the input is open. */
  async isTimepickerOpen(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-expanded')) === 'true';
  }

  /** Opens the timepicker associated with the input and returns the timepicker instance. */
  async openTimepicker(): Promise<MatTimepickerHarness> {
    if (!(await this.isDisabled())) {
      const host = await this.host();
      await host.sendKeys(TestKey.DOWN_ARROW);
    }

    return this.getTimepicker();
  }

  /** Closes the timepicker associated with the input. */
  async closeTimepicker(): Promise<void> {
    await this._documentRootLocator.rootElement.click();

    // This is necessary so that we wait for the closing animation.
    await this.forceStabilize();
  }

  /**
   * Gets the `MatTimepickerHarness` that is associated with the input.
   * @param filter Optionally filters which timepicker is included.
   */
  async getTimepicker(filter: TimepickerHarnessFilters = {}): Promise<MatTimepickerHarness> {
    const host = await this.host();
    const timepickerId = await host.getAttribute('mat-timepicker-id');

    if (!timepickerId) {
      throw Error('Element is not associated with a timepicker');
    }

    return this._documentRootLocator.locatorFor(
      MatTimepickerHarness.with({
        ...filter,
        selector: `[mat-timepicker-panel-id="${timepickerId}"]`,
      }),
    )();
  }

  /** Whether the input is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).getProperty<boolean>('disabled');
  }

  /** Whether the input is required. */
  async isRequired(): Promise<boolean> {
    return (await this.host()).getProperty<boolean>('required');
  }

  /** Gets the value of the input. */
  async getValue(): Promise<string> {
    // The "value" property of the native input is always defined.
    return await (await this.host()).getProperty<string>('value');
  }

  /**
   * Sets the value of the input. The value will be set by simulating
   * keypresses that correspond to the given value.
   */
  async setValue(newValue: string): Promise<void> {
    const inputEl = await this.host();
    await inputEl.clear();

    // We don't want to send keys for the value if the value is an empty
    // string in order to clear the value. Sending keys with an empty string
    // still results in unnecessary focus events.
    if (newValue) {
      await inputEl.sendKeys(newValue);
    }
  }

  /** Gets the placeholder of the input. */
  async getPlaceholder(): Promise<string> {
    return await (await this.host()).getProperty<string>('placeholder');
  }

  /**
   * Focuses the input and returns a promise that indicates when the
   * action is complete.
   */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /**
   * Blurs the input and returns a promise that indicates when the
   * action is complete.
   */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the input is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }
}
