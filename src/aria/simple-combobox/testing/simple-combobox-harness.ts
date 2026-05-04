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
  ContentContainerComponentHarness,
  HarnessLoader,
  HarnessPredicate,
  TestKey,
} from '@angular/cdk/testing';
import {SimpleComboboxHarnessFilters} from './simple-combobox-harness-filters';

/** Harness for interacting with a standard `ngCombobox` input element in tests. */
export class SimpleComboboxHarness extends ContentContainerComponentHarness {
  static hostSelector = '[ngCombobox]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a combobox with specific attributes.
   * @param options Options for filtering which combobox instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: SimpleComboboxHarnessFilters = {}): HarnessPredicate<SimpleComboboxHarness> {
    return new HarnessPredicate(SimpleComboboxHarness, options)
      .addOption('placeholder', options.placeholder, async (harness, placeholder) =>
        HarnessPredicate.stringMatches(await harness.getPlaceholder(), placeholder),
      )
      .addOption('value', options.value, async (harness, value) =>
        HarnessPredicate.stringMatches(await harness.getValue(), value),
      )
      .addOption(
        'disabled',
        options.disabled,
        async (harness, disabled) => (await harness.isDisabled()) === disabled,
      );
  }

  /**
   * Gets the component harness for the active widget contained inside the popup.
   * Use this when you need to access the harness of the widget itself (e.g., `ListboxHarness`),
   * rather than querying items within it.
   * @param type The harness type to locate. Must implement standard static `.with()` method.
   */
  async getPopupWidget<T extends ComponentHarness>(
    type: ComponentHarnessConstructor<T> & {
      with: (options?: {selector?: string}) => HarnessPredicate<T>;
    },
  ): Promise<T> {
    const host = await this.host();
    const controlsId = await host.getAttribute('aria-controls');
    if (!controlsId) {
      throw new Error(
        'Cannot retrieve popup content because the combobox is closed or not associated with a popup controls ID.',
      );
    }
    return this.documentRootLocatorFactory().locatorFor(type.with({selector: `#${controlsId}`}))();
  }

  /**
   * Gets a harness loader scoped to the content inside the popup container.
   * Note that lookups performed by this loader will only find descendants of the popup container.
   */
  async getPopupLoader(): Promise<HarnessLoader> {
    return this.getRootHarnessLoader();
  }

  /** Overrides root loader to automatically resolve queries nested inside the associated popup. */
  protected override async getRootHarnessLoader(): Promise<HarnessLoader> {
    const host = await this.host();
    const controlsId = await host.getAttribute('aria-controls');
    if (!controlsId) {
      throw new Error(
        'Cannot retrieve popup content because the combobox is closed or not associated with a popup controls ID.',
      );
    }
    const documentRoot = await this.documentRootLocatorFactory().rootHarnessLoader();
    // Locate the widget by ID, which was assigned by ngComboboxWidget and linked via aria-controls.
    return documentRoot.getChildLoader(`#${controlsId}`);
  }

  /** Whether the combobox is expanded (popup is open). */
  async isOpen(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-expanded')) === 'true';
  }

  /** Whether the combobox is disabled. */
  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-disabled')) === 'true';
  }

  /** Gets the current value string of the combobox input. */
  async getValue(): Promise<string> {
    const host = await this.host();
    return host.getProperty<string>('value');
  }

  /** Sets the value of the combobox input. */
  async setValue(value: string): Promise<void> {
    const host = await this.host();
    await host.clear();
    if (value) {
      await host.sendKeys(value);
    }
    // Trigger simulated standard input pipeline.
    await host.dispatchEvent('input');
  }

  /** Gets the placeholder text of the combobox. */
  async getPlaceholder(): Promise<string | null> {
    const host = await this.host();
    return host.getAttribute('placeholder');
  }

  /** Opens the combobox popup if it is currently closed. */
  async open(): Promise<void> {
    if (!(await this.isOpen())) {
      const host = await this.host();
      await host.focus();
      await host.sendKeys(TestKey.DOWN_ARROW);
    }
  }

  /** Closes the combobox popup if it is currently open. */
  async close(): Promise<void> {
    if (await this.isOpen()) {
      const host = await this.host();
      await host.focus();
      await host.sendKeys(TestKey.ESCAPE);
    }
  }

  /** Focuses the combobox. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the combobox. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the combobox has focus. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }
}
