/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentHarnessConstructor, HarnessPredicate, parallel} from '@angular/cdk/testing';
import {
  MatOptionHarness,
  MatOptgroupHarness,
  OptionHarnessFilters,
  OptgroupHarnessFilters,
} from '@angular/material/core/testing';
import {MatFormFieldControlHarness} from '@angular/material/form-field/testing/control';
import {SelectHarnessFilters} from './select-harness-filters';

/** Harness for interacting with a mat-select in tests. */
export class MatSelectHarness extends MatFormFieldControlHarness {
  static hostSelector = '.mat-mdc-select';
  private _prefix = 'mat-mdc';
  private _optionClass = MatOptionHarness;
  private _optionGroupClass = MatOptgroupHarness;
  private _documentRootLocator = this.documentRootLocatorFactory();
  private _backdrop = this._documentRootLocator.locatorFor('.cdk-overlay-backdrop');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a select with specific attributes.
   * @param options Options for filtering which select instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatSelectHarness>(
    this: ComponentHarnessConstructor<T>,
    options: SelectHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options).addOption(
      'disabled',
      options.disabled,
      async (harness, disabled) => {
        return (await harness.isDisabled()) === disabled;
      },
    );
  }

  /** Gets a boolean promise indicating if the select is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).hasClass(`${this._prefix}-select-disabled`);
  }

  /** Gets a boolean promise indicating if the select is valid. */
  async isValid(): Promise<boolean> {
    return !(await (await this.host()).hasClass('ng-invalid'));
  }

  /** Gets a boolean promise indicating if the select is required. */
  async isRequired(): Promise<boolean> {
    return (await this.host()).hasClass(`${this._prefix}-select-required`);
  }

  /** Gets a boolean promise indicating if the select is empty (no value is selected). */
  async isEmpty(): Promise<boolean> {
    return (await this.host()).hasClass(`${this._prefix}-select-empty`);
  }

  /** Gets a boolean promise indicating if the select is in multi-selection mode. */
  async isMultiple(): Promise<boolean> {
    return (await this.host()).hasClass(`${this._prefix}-select-multiple`);
  }

  /** Gets a promise for the select's value text. */
  async getValueText(): Promise<string> {
    const value = await this.locatorFor(`.${this._prefix}-select-value`)();
    return value.text();
  }

  /** Focuses the select and returns a void promise that indicates when the action is complete. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the select and returns a void promise that indicates when the action is complete. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the select is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }

  /** Gets the options inside the select panel. */
  async getOptions(filter?: Omit<OptionHarnessFilters, 'ancestor'>): Promise<MatOptionHarness[]> {
    return this._documentRootLocator.locatorForAll(
      this._optionClass.with({
        ...(filter || {}),
        ancestor: await this._getPanelSelector(),
      } as OptionHarnessFilters),
    )();
  }

  /** Gets the groups of options inside the panel. */
  async getOptionGroups(
    filter?: Omit<OptgroupHarnessFilters, 'ancestor'>,
  ): Promise<MatOptgroupHarness[]> {
    return this._documentRootLocator.locatorForAll(
      this._optionGroupClass.with({
        ...(filter || {}),
        ancestor: await this._getPanelSelector(),
      } as OptgroupHarnessFilters),
    )() as Promise<MatOptgroupHarness[]>;
  }

  /** Gets whether the select is open. */
  async isOpen(): Promise<boolean> {
    return !!(await this._documentRootLocator.locatorForOptional(await this._getPanelSelector())());
  }

  /** Opens the select's panel. */
  async open(): Promise<void> {
    if (!(await this.isOpen())) {
      const trigger = await this.locatorFor(`.${this._prefix}-select-trigger`)();
      return trigger.click();
    }
  }

  /**
   * Clicks the options that match the passed-in filter. If the select is in multi-selection
   * mode all options will be clicked, otherwise the harness will pick the first matching option.
   */
  async clickOptions(filter?: OptionHarnessFilters): Promise<void> {
    await this.open();

    const [isMultiple, options] = await parallel(() => [
      this.isMultiple(),
      this.getOptions(filter),
    ]);

    if (options.length === 0) {
      throw Error('Select does not have options matching the specified filter');
    }

    if (isMultiple) {
      await parallel(() => options.map(option => option.click()));
    } else {
      await options[0].click();
    }
  }

  /** Closes the select's panel. */
  async close(): Promise<void> {
    if (await this.isOpen()) {
      // This is the most consistent way that works both in both single and multi-select modes,
      // but it assumes that only one overlay is open at a time. We should be able to make it
      // a bit more precise after #16645 where we can dispatch an ESCAPE press to the host instead.
      return (await this._backdrop()).click();
    }
  }

  /** Gets the selector that should be used to find this select's panel. */
  private async _getPanelSelector(): Promise<string> {
    const id = await (await this.host()).getAttribute('id');
    return `#${id}-panel`;
  }
}
