/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {
  MenuHarnessFilters,
  MenuItemHarnessFilters,
  MenuTriggerHarnessFilters,
} from './menu-harness-filters';

/** Harness for interacting with a standard ngMenuItem in tests. */
export class MenuItemHarness extends ComponentHarness {
  static hostSelector = '[ngMenuItem]';

  static with(options: MenuItemHarnessFilters = {}): HarnessPredicate<MenuItemHarness> {
    return new HarnessPredicate(MenuItemHarness, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text),
      )
      .addOption(
        'disabled',
        options.disabled,
        async (harness, disabled) => (await harness.isDisabled()) === disabled,
      )
      .addOption(
        'expanded',
        options.expanded,
        async (harness, expanded) => (await harness.isExpanded()) === expanded,
      );
  }

  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-disabled')) === 'true';
  }

  async isExpanded(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-expanded')) === 'true';
  }

  async click(): Promise<void> {
    return (await this.host()).click();
  }

  async hasSubmenu(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-haspopup')) !== null;
  }

  async getSubmenu(): Promise<MenuHarness | null> {
    if (await this.hasSubmenu()) {
      const controlsId = await (await this.host()).getAttribute('aria-controls');
      return this.documentRootLocatorFactory().locatorFor(
        MenuHarness.with({selector: controlsId ? `#${controlsId}` : undefined}),
      )();
    }
    return null;
  }
}

/** Harness for interacting with a standard ngMenu in tests. */
export class MenuHarness extends ComponentHarness {
  static hostSelector = '[ngMenu]';

  static with(options: MenuHarnessFilters = {}): HarnessPredicate<MenuHarness> {
    return new HarnessPredicate(MenuHarness, options);
  }

  async getItems(filters: MenuItemHarnessFilters = {}): Promise<MenuItemHarness[]> {
    return this.locatorForAll(MenuItemHarness.with(filters))();
  }
}

/** Harness for interacting with a standard ngMenuTrigger in tests. */
export class MenuTriggerHarness extends ComponentHarness {
  static hostSelector = '[ngMenuTrigger]';

  static with(options: MenuTriggerHarnessFilters = {}): HarnessPredicate<MenuTriggerHarness> {
    return new HarnessPredicate(MenuTriggerHarness, options).addOption(
      'text',
      options.text,
      (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text),
    );
  }

  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  async click(): Promise<void> {
    return (await this.host()).click();
  }

  async getMenu(filters: MenuHarnessFilters = {}): Promise<MenuHarness> {
    return this.documentRootLocatorFactory().locatorFor(MenuHarness.with(filters))();
  }
}
