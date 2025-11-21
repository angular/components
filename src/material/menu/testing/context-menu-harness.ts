/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ComponentHarnessConstructor,
  ContentContainerComponentHarness,
  HarnessLoader,
  HarnessPredicate,
  TestElement,
} from '@angular/cdk/testing';
import {ContextMenuHarnessFilters, MenuItemHarnessFilters} from './menu-harness-filters';
import {clickItemImplementation, MatMenuItemHarness} from './menu-harness';

/** Harness for interacting with context menus in tests. */
export class MatContextMenuHarness extends ContentContainerComponentHarness<string> {
  private _documentRootLocator = this.documentRootLocatorFactory();

  /** The selector for the host element of a `MatContextMenu` instance. */
  static hostSelector = '.mat-context-menu-trigger';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a context menu with specific
   * attributes.
   * @param options Options for filtering which menu instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatContextMenuHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ContextMenuHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }

  /** Whether the menu is open. */
  async isOpen(): Promise<boolean> {
    return !!(await this._getMenuPanel());
  }

  /**
   * Opens the menu.
   * @param relativeX X coordinate, relative to the element, to dispatch the opening click at.
   * @param relativeY Y coordinate, relative to the element, to dispatch the opening click at.
   */
  async open(relativeX = 0, relativeY = 0): Promise<void> {
    if (!(await this.isOpen())) {
      return (await this.host()).rightClick(relativeX, relativeY);
    }
  }

  /** Closes the menu. */
  async close(): Promise<void> {
    const panel = await this._getMenuPanel();
    if (panel) {
      return panel.click();
    }
  }

  /** Gets whether the context menu trigger is disabled. */
  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return host.hasClass('mat-context-menu-trigger-disabled');
  }

  /**
   * Gets a list of `MatMenuItemHarness` representing the items in the menu.
   * @param filters Optionally filters which menu items are included.
   */
  async getItems(
    filters?: Omit<MenuItemHarnessFilters, 'ancestor'>,
  ): Promise<MatMenuItemHarness[]> {
    const panelId = await this._getPanelId();
    if (panelId) {
      return this._documentRootLocator.locatorForAll(
        MatMenuItemHarness.with({
          ...(filters || {}),
          ancestor: `#${panelId}`,
        } as MenuItemHarnessFilters),
      )();
    }
    return [];
  }

  /**
   * Clicks an item in the menu, and optionally continues clicking items in subsequent sub-menus.
   * @param itemFilter A filter used to represent which item in the menu should be clicked. The
   *     first matching menu item will be clicked.
   * @param subItemFilters A list of filters representing the items to click in any subsequent
   *     sub-menus. The first item in the sub-menu matching the corresponding filter in
   *     `subItemFilters` will be clicked.
   */
  async clickItem(
    itemFilter: Omit<MenuItemHarnessFilters, 'ancestor'>,
    ...subItemFilters: Omit<MenuItemHarnessFilters, 'ancestor'>[]
  ): Promise<void> {
    await this.open();
    return clickItemImplementation(await this.getItems(itemFilter), itemFilter, subItemFilters);
  }

  protected override async getRootHarnessLoader(): Promise<HarnessLoader> {
    const panelId = await this._getPanelId();
    return this.documentRootLocatorFactory().harnessLoaderFor(`#${panelId}`);
  }

  /** Gets the menu panel associated with this menu. */
  private async _getMenuPanel(): Promise<TestElement | null> {
    const panelId = await this._getPanelId();
    return panelId ? this._documentRootLocator.locatorForOptional(`#${panelId}`)() : null;
  }

  /** Gets the id of the menu panel associated with this menu. */
  private async _getPanelId(): Promise<string | null> {
    const panelId = await (await this.host()).getAttribute('aria-controls');
    return panelId || null;
  }
}
