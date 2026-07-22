/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentHarness, HarnessPredicate, TestElement} from '@angular/cdk/testing';
import {MenuHarnessFilters, MenuItemHarnessFilters} from './menu-harness-filters';

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

  /** Gets the text content of the menu item. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Whether the menu item is disabled. */
  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-disabled')) === 'true';
  }

  /** Whether the menu item is expanded (contains an open submenu). */
  async isExpanded(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-expanded')) === 'true';
  }

  /** Clicks the menu item to trigger its action or toggle its submenu. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }

  /** Resolves the nested submenu panel associated with this menu item, if any exists. */
  async getSubmenu(): Promise<MenuHarness | null> {
    const controlsId = await (await this.host()).getAttribute('aria-controls');
    if (controlsId) {
      return this.documentRootLocatorFactory().locatorFor(
        MenuHarness.with({selector: `#${controlsId}`}),
      )();
    }
    return null;
  }

  /** Whether the menu item has focus. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }

  /** Whether the menu item acts as a submenu trigger. */
  async hasSubmenu(): Promise<boolean> {
    const host = await this.host();
    return (
      (await host.getAttribute('aria-haspopup')) === 'true' ||
      !!(await host.getAttribute('aria-controls'))
    );
  }
}

/** Harness for interacting with a standard ngMenu or ngMenuBar in tests. */
export class MenuHarness extends ComponentHarness {
  static hostSelector = '[ngMenu], [ngMenuBar]';

  static with(options: MenuHarnessFilters = {}): HarnessPredicate<MenuHarness> {
    return new HarnessPredicate(MenuHarness, options).addOption(
      'triggerText',
      options.triggerText,
      async (harness, text) => {
        const trigger = await harness._getTrigger();
        if (!trigger) return false;
        return HarnessPredicate.stringMatches(await trigger.text(), text);
      },
    );
  }

  /** Resolves the trigger associated with this menu container via aria-controls inversion. */
  async _getTrigger(): Promise<TestElement | null> {
    const id = await (await this.host()).getAttribute('id');
    if (!id) return null;
    return this.documentRootLocatorFactory().locatorForOptional(`[aria-controls="${id}"]`)();
  }

  /** Checks whether the menu container is visible. */
  async isOpen(): Promise<boolean> {
    const host = await this.host();
    // Menu bars are always visible persistently.
    if (await host.matchesSelector('[ngMenuBar]')) {
      return true;
    }
    return (await host.getAttribute('data-visible')) === 'true';
  }

  /** Whether the menu is a menu bar. */
  async isMenuBar(): Promise<boolean> {
    const host = await this.host();
    return host.matchesSelector('[ngMenuBar]');
  }

  /** Opens the menu if it is currently closed. */
  async open(): Promise<void> {
    if (!(await this.isOpen())) {
      const trigger = await this._getTrigger();
      if (trigger) {
        await trigger.click();
      }
    }
  }

  /** Closes the menu if it is currently open. */
  async close(): Promise<void> {
    if (await this.isOpen()) {
      const trigger = await this._getTrigger();
      if (trigger) {
        await trigger.click();
      }
    }
  }

  /** Queries all menu items inside this menu container. */
  async getItems(filters: MenuItemHarnessFilters = {}): Promise<MenuItemHarness[]> {
    return this.locatorForAll(MenuItemHarness.with(filters))();
  }
}
