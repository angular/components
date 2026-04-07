/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentHarness, HarnessPredicate, BaseHarnessFilters} from '@angular/cdk/testing';

/** Filters for locating an `AccordionTriggerHarness`. */
export interface AccordionTriggerHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
  /** Only find instances whose expanded state matches the given value. */
  expanded?: boolean;
  /** Only find instances whose disabled state matches the given value. */
  disabled?: boolean;
}

/** Filters for locating an `AccordionPanelHarness`. */
export interface AccordionPanelHarnessFilters extends BaseHarnessFilters {
  /** Find the panel associated with the given trigger harness. */
  trigger?: AccordionTriggerHarness;
}

/** Filters for locating an `AccordionGroupHarness`. */
export interface AccordionGroupHarnessFilters extends BaseHarnessFilters {}

/** Harness for interacting with an `ngAccordionPanel` in tests. */
export class AccordionPanelHarness extends ComponentHarness {
  /** The selector for the host element of an `ngAccordionPanel` instance. */
  static hostSelector = '[ngAccordionPanel]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a panel with specific attributes.
   * @param options Options for narrowing the search.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: AccordionPanelHarnessFilters = {}): HarnessPredicate<AccordionPanelHarness> {
    return new HarnessPredicate(AccordionPanelHarness, options).addOption(
      'trigger',
      options.trigger,
      async (harness, trigger) => {
        const targetPanelId = await (await trigger.host()).getAttribute('aria-controls');
        const panelId = await (await harness.host()).getAttribute('id');
        return panelId === targetPanelId;
      },
    );
  }

  /** Gets the text content of the accordion panel. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Whether the accordion panel is expanded (visible and not inert). */
  async isExpanded(): Promise<boolean> {
    return (await (await this.host()).getAttribute('inert')) === null;
  }
}

/** Harness for interacting with an `ngAccordionTrigger` in tests. */
export class AccordionTriggerHarness extends ComponentHarness {
  /** The selector for the host element of an `ngAccordionTrigger` instance. */
  static hostSelector = '[ngAccordionTrigger]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a trigger with specific attributes.
   * @param options Options for narrowing the search.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: AccordionTriggerHarnessFilters = {},
  ): HarnessPredicate<AccordionTriggerHarness> {
    return new HarnessPredicate(AccordionTriggerHarness, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text),
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

  /** Gets the text content of the accordion trigger. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Clicks the accordion trigger. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }

  /** Focuses the accordion trigger. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the accordion trigger. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the accordion trigger is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }

  /** Whether the accordion panel associated with this trigger is expanded. */
  async isExpanded(): Promise<boolean> {
    const ariaExpanded = await (await this.host()).getAttribute('aria-expanded');
    return ariaExpanded === 'true';
  }

  /** Whether the accordion trigger is disabled. */
  async isDisabled(): Promise<boolean> {
    const ariaDisabled = await (await this.host()).getAttribute('aria-disabled');
    return ariaDisabled === 'true';
  }
}

/** Harness for interacting with an `ngAccordionGroup` in tests. */
export class AccordionGroupHarness extends ComponentHarness {
  /** The selector for the host element of an `ngAccordionGroup` instance. */
  static hostSelector = '[ngAccordionGroup]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for an accordion group with specific attributes.
   * @param options Options for narrowing the search.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: AccordionGroupHarnessFilters = {}): HarnessPredicate<AccordionGroupHarness> {
    return new HarnessPredicate(AccordionGroupHarness, options);
  }

  /** Gets all accordion triggers within this group. */
  async getTriggers(
    filters: AccordionTriggerHarnessFilters = {},
  ): Promise<AccordionTriggerHarness[]> {
    return this.locatorForAll(AccordionTriggerHarness.with(filters))();
  }

  /** Gets all accordion panels within this group. */
  async getPanels(filters: AccordionPanelHarnessFilters = {}): Promise<AccordionPanelHarness[]> {
    return this.locatorForAll(AccordionPanelHarness.with(filters))();
  }
}
