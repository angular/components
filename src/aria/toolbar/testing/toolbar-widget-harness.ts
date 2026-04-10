/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ContentContainerComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {ToolbarWidgetHarnessFilters} from './toolbar-harness-filters';

/** Harness for interacting with an Aria toolbar widget in tests. */
export class ToolbarWidgetHarness extends ContentContainerComponentHarness<string> {
  static hostSelector = '[ngToolbarWidget]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `ToolbarWidgetHarness`
   * that meets certain criteria.
   * @param options Options for filtering which dialog instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ToolbarWidgetHarnessFilters = {}): HarnessPredicate<ToolbarWidgetHarness> {
    return new HarnessPredicate(ToolbarWidgetHarness, options)
      .addOption('text', options.text, (harness, pattern) =>
        HarnessPredicate.stringMatches(harness.getText(), pattern),
      )
      .addOption(
        'active',
        options.active,
        async (harness, active) => (await harness.isActive()) === active,
      );
  }

  /** Gets the widget's text. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Clicks the widget. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }

  /** Gets whether the widget is active. */
  async isActive(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('data-active')) === 'true';
  }

  /** Gets whether the widget is disabled. */
  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-disabled')) === 'true';
  }
}
