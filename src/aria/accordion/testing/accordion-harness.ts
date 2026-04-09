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
  HarnessPredicate,
  BaseHarnessFilters,
} from '@angular/cdk/testing';

/** Selectors for the sections that may contain user content. */
export enum AccordionSection {
  TRIGGER = '[ngAccordionTrigger]',
  PANEL = '[ngAccordionPanel]',
}

/** Filters for locating an `AccordionHarness`. */
export interface AccordionHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose title text matches the given value. */
  title?: string | RegExp;
  /** Only find instances whose expanded state matches the given value. */
  expanded?: boolean;
  /** Only find instances whose disabled state matches the given value. */
  disabled?: boolean;
}

/** Filters for locating an `AccordionGroupHarness`. */
export interface AccordionGroupHarnessFilters extends BaseHarnessFilters {}

/** Harness for interacting with a standard ngAccordion item in tests. */
export class AccordionHarness extends ContentContainerComponentHarness<AccordionSection> {
  static hostSelector = '[ngAccordionTrigger]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for an accordion
   * with specific attributes.
   */
  static with(options: AccordionHarnessFilters = {}): HarnessPredicate<AccordionHarness> {
    return new HarnessPredicate(AccordionHarness, options)
      .addOption('title', options.title, (harness, title) =>
        HarnessPredicate.stringMatches(harness.getTitle(), title),
      )
      .addOption(
        'expanded',
        options.expanded,
        async (harness, expanded) => (await harness.isExpanded()) === expanded,
      )
      .addOption(
        'disabled',
        options.disabled,
        async (harness, disabled) => (await harness.isDisabled()) === disabled,
      );
  }

  /** Overrides the internal loader to automatically resolve queries inside the associated panel. */
  protected override async getRootHarnessLoader() {
    const panelId = await (await this.host()).getAttribute('aria-controls');
    const documentRoot = await this.documentRootLocatorFactory().rootHarnessLoader();
    return documentRoot.getChildLoader(`[ngAccordionPanel][id="${panelId}"]`);
  }

  /** Whether the accordion is expanded. */
  async isExpanded(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-expanded')) === 'true';
  }

  /** Whether the accordion is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }

  /** Gets the title text of the accordion. */
  async getTitle(): Promise<string> {
    return (await this.host()).text();
  }

  /** Toggles the expanded state of the accordion by clicking on the trigger. */
  async toggle(): Promise<void> {
    await (await this.host()).click();
  }

  /** Expands the accordion if collapsed. */
  async expand(): Promise<void> {
    if (!(await this.isExpanded())) {
      await this.toggle();
    }
  }

  /** Collapses the accordion if expanded. */
  async collapse(): Promise<void> {
    if (await this.isExpanded()) {
      await this.toggle();
    }
  }

  /** Focuses the accordion trigger. */
  async focus(): Promise<void> {
    await (await this.host()).focus();
  }

  /** Blurs the accordion trigger. */
  async blur(): Promise<void> {
    await (await this.host()).blur();
  }

  /** Whether the accordion trigger is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }
}

/** Harness for interacting with an `ngAccordionGroup` in tests. */
export class AccordionGroupHarness extends ComponentHarness {
  static hostSelector = '[ngAccordionGroup]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for an accordion group with specific attributes.
   */
  static with(options: AccordionGroupHarnessFilters = {}): HarnessPredicate<AccordionGroupHarness> {
    return new HarnessPredicate(AccordionGroupHarness, options);
  }

  /** Gets all accordions within this group. */
  async getAccordions(filters: AccordionHarnessFilters = {}): Promise<AccordionHarness[]> {
    return this.locatorForAll(AccordionHarness.with(filters))();
  }
}
