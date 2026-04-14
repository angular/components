/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ComponentHarness,
  ContentContainerComponentHarness,
  HarnessLoader,
  HarnessPredicate,
} from '@angular/cdk/testing';
import {TabsHarnessFilters, TabHarnessFilters} from './tabs-harness-filters';

/** Harness for interacting with an Aria tab in tests. */
export class TabHarness extends ContentContainerComponentHarness {
  static hostSelector = '[ngTab]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `TabHarness`
   * that meets certain criteria.
   * @param options Options for filtering which tab instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: TabHarnessFilters = {}): HarnessPredicate<TabHarness> {
    return new HarnessPredicate(TabHarness, options)
      .addOption('title', options.title, (harness, title) =>
        HarnessPredicate.stringMatches(harness.getTitle(), title),
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

  /** Gets the tab's title text. */
  async getTitle(): Promise<string> {
    return (await this.host()).text();
  }

  /** Clicks the tab to select it. */
  async select(): Promise<void> {
    return (await this.host()).click();
  }

  /** Gets whether the tab is selected. */
  async isSelected(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-selected')) === 'true';
  }

  /** Gets whether the tab is disabled. */
  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-disabled')) === 'true';
  }

  /** Gets whether the tab is active. */
  async isActive(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('data-active')) === 'true';
  }

  protected override async getRootHarnessLoader(): Promise<HarnessLoader> {
    const host = await this.host();
    const controlsId = await host.getAttribute('aria-controls');
    const documentRoot = await this.documentRootLocatorFactory().rootHarnessLoader();
    return await documentRoot.getChildLoader(`[ngTabPanel][id="${controlsId}"]`);
  }
}

/** Harness for interacting with an Aria tabs container in tests. */
export class TabsHarness extends ComponentHarness {
  static hostSelector = '[ngTabs]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `TabsHarness`
   * that meets certain criteria.
   * @param options Options for filtering which tabs instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: TabsHarnessFilters = {}): HarnessPredicate<TabsHarness> {
    return new HarnessPredicate(TabsHarness, options);
  }

  /** Gets all tabs inside the tabs container. */
  async getTabs(filters: TabHarnessFilters = {}): Promise<TabHarness[]> {
    return await this.locatorForAll(TabHarness.with(filters))();
  }

  /** Gets the currently selected tab. */
  async getSelectedTab(): Promise<TabHarness | null> {
    const tabs = await this.getTabs({selected: true});
    return tabs.length > 0 ? tabs[0] : null;
  }

  /** Selects a tab matching the given filters. */
  async selectTab(filters: TabHarnessFilters = {}): Promise<void> {
    const tabs = await this.getTabs(filters);
    if (tabs.length === 0) {
      throw new Error(`Could not find tab matching filters: ${JSON.stringify(filters)}`);
    }
    await tabs[0].select();
  }
}
