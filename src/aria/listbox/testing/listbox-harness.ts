/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {ListboxHarnessFilters, ListboxOptionHarnessFilters} from './listbox-harness-filters';

export class ListboxOptionHarness extends ComponentHarness {
  static hostSelector = '[ngOption]';

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

  async isSelected(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-selected')) === 'true';
  }

  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return (
      (await host.getAttribute('aria-disabled')) === 'true' ||
      (await host.getProperty('disabled')) === true
    );
  }

  async getText(): Promise<string> {
    const host = await this.host();
    return host.text();
  }

  async click(): Promise<void> {
    const host = await this.host();
    return host.click();
  }
}

export class ListboxHarness extends ComponentHarness {
  static hostSelector = '[ngListbox]';

  static with(options: ListboxHarnessFilters = {}): HarnessPredicate<ListboxHarness> {
    return new HarnessPredicate(ListboxHarness, options).addOption(
      'disabled',
      options.disabled,
      async (harness, disabled) => (await harness.isDisabled()) === disabled,
    );
  }

  async getOrientation(): Promise<'vertical' | 'horizontal'> {
    const host = await this.host();
    const orientation = await host.getAttribute('aria-orientation');
    return orientation === 'horizontal' ? 'horizontal' : 'vertical';
  }

  async isMulti(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-multiselectable')) === 'true';
  }

  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-disabled')) === 'true';
  }

  async getOptions(filters: ListboxOptionHarnessFilters = {}): Promise<ListboxOptionHarness[]> {
    return this.locatorForAll(ListboxOptionHarness.with(filters))();
  }

  async focus(): Promise<void> {
    await (await this.host()).focus();
  }

  /** Blurs the listbox container. */
  async blur(): Promise<void> {
    await (await this.host()).blur();
  }
}
