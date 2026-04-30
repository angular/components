/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {ListboxHarnessFilters, ListboxOptionHarnessFilters} from './listbox-harness-filters';

/** Harness for interacting with a standard ngOption in tests. */
export class ListboxOptionHarness extends ComponentHarness {
  static hostSelector = '[ngOption]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for an option
   * with specific attributes.
   * @param options Options for filtering which option instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ListboxOptionHarnessFilters = {}): HarnessPredicate<ListboxOptionHarness> {
    return new HarnessPredicate(ListboxOptionHarness, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text),
      )
      .addOption(
        'selected',
        options.selected,
        async (harness, selected) => (await harness.isSelected()) === selected,
      )
      .addOption(
        'disabled',
        options.disabled,
        async (harness, disabled) => (await harness.isDisabled()) === disabled,
      );
  }

  /** Whether the option is selected. */
  async isSelected(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-selected')) === 'true';
  }

  /** Whether the option is disabled. */
  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return (
      (await host.getAttribute('aria-disabled')) === 'true' ||
      (await host.getProperty('disabled')) === true
    );
  }

  /** Gets the option's text. */
  async getText(): Promise<string> {
    const host = await this.host();
    return host.text();
  }

  /** Clicks the option to toggle its selected state. */
  async click(): Promise<void> {
    const host = await this.host();
    return host.click();
  }
}

/** Harness for interacting with a standard ngListbox in tests. */
export class ListboxHarness extends ComponentHarness {
  static hostSelector = '[ngListbox]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a listbox
   * with specific attributes.
   * @param options Options for filtering which listbox instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ListboxHarnessFilters = {}): HarnessPredicate<ListboxHarness> {
    return new HarnessPredicate(ListboxHarness, options).addOption(
      'disabled',
      options.disabled,
      async (harness, disabled) => (await harness.isDisabled()) === disabled,
    );
  }

  /** Gets the orientation of the listbox. */
  async getOrientation(): Promise<'vertical' | 'horizontal'> {
    const host = await this.host();
    const orientation = await host.getAttribute('aria-orientation');
    return orientation === 'horizontal' ? 'horizontal' : 'vertical';
  }

  /** Whether the listbox is multiselectable. */
  async isMulti(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-multiselectable')) === 'true';
  }

  /** Whether the listbox is disabled. */
  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-disabled')) === 'true';
  }

  /** Gets the options inside the listbox. */
  async getOptions(filters: ListboxOptionHarnessFilters = {}): Promise<ListboxOptionHarness[]> {
    return this.locatorForAll(ListboxOptionHarness.with(filters))();
  }

  /** Focuses the listbox container. */
  async focus(): Promise<void> {
    await (await this.host()).focus();
  }

  /** Blurs the listbox container. */
  async blur(): Promise<void> {
    await (await this.host()).blur();
  }

  /** Gets the ID of the active option. */
  async getActiveDescendantId(): Promise<string | null> {
    const host = await this.host();
    return host.getAttribute('aria-activedescendant');
  }
}
