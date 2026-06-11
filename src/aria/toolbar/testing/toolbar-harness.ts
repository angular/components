/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {
  ToolbarHarnessFilters,
  ToolbarWidgetHarnessFilters,
  ToolbarWidgetGroupHarnessFilters,
} from './toolbar-harness-filters';
import {ToolbarWidgetHarness} from './toolbar-widget-harness';
import {ToolbarWidgetGroupHarness} from './toolbar-widget-group-harness';

/** Harness for interacting with an Aria toolbar in tests. */
export class ToolbarHarness extends ComponentHarness {
  static hostSelector = '[ngToolbar]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `ToolbarHarness`
   * that meets certain criteria.
   * @param options Options for filtering which dialog instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ToolbarHarnessFilters = {}): HarnessPredicate<ToolbarHarness> {
    return new HarnessPredicate(ToolbarHarness, options);
  }

  /** Gets all widgets in the toolbar. */
  async getWidgets(filters: ToolbarWidgetHarnessFilters = {}): Promise<ToolbarWidgetHarness[]> {
    return await this.locatorForAll(ToolbarWidgetHarness.with(filters))();
  }

  /** Gets all widget groups in the toolbar. */
  async getWidgetGroups(
    filters: ToolbarWidgetGroupHarnessFilters = {},
  ): Promise<ToolbarWidgetGroupHarness[]> {
    return await this.locatorForAll(ToolbarWidgetGroupHarness.with(filters))();
  }

  /** Gets whether the toolbar is disabled. */
  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-disabled')) === 'true';
  }

  /** Gets the orientation of the toolbar. */
  async getOrientation(): Promise<'vertical' | 'horizontal'> {
    const host = await this.host();
    return (await host.getAttribute('aria-orientation')) as 'vertical' | 'horizontal';
  }
}
