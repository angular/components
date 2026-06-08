/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {
  ToolbarWidgetHarnessFilters,
  ToolbarWidgetGroupHarnessFilters,
} from './toolbar-harness-filters';
import {ToolbarWidgetHarness} from './toolbar-widget-harness';

/** Harness for interacting with an Aria toolbar widget group in tests. */
export class ToolbarWidgetGroupHarness extends ComponentHarness {
  static hostSelector = '[ngToolbarWidgetGroup]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `ToolbarWidgetGroupHarness`
   * that meets certain criteria.
   * @param options Options for filtering which dialog instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: ToolbarWidgetGroupHarnessFilters = {},
  ): HarnessPredicate<ToolbarWidgetGroupHarness> {
    return new HarnessPredicate(ToolbarWidgetGroupHarness, options);
  }

  /** Gets all widgets in the group. */
  async getWidgets(filters: ToolbarWidgetHarnessFilters = {}): Promise<ToolbarWidgetHarness[]> {
    return await this.locatorForAll(ToolbarWidgetHarness.with(filters))();
  }
}
