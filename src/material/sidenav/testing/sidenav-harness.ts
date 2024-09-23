/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {MatDrawerHarnessBase} from './drawer-harness';
import {DrawerHarnessFilters} from './drawer-harness-filters';

/** Harness for interacting with a standard mat-sidenav in tests. */
export class MatSidenavHarness extends MatDrawerHarnessBase {
  /** The selector for the host element of a `MatSidenav` instance. */
  static hostSelector = '.mat-sidenav';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatSidenavHarness` that meets
   * certain criteria.
   * @param options Options for filtering which sidenav instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: DrawerHarnessFilters = {}): HarnessPredicate<MatSidenavHarness> {
    return new HarnessPredicate(MatSidenavHarness, options).addOption(
      'position',
      options.position,
      async (harness, position) => (await harness.getPosition()) === position,
    );
  }

  /** Whether the sidenav is fixed in the viewport. */
  async isFixedInViewport(): Promise<boolean> {
    return (await this.host()).hasClass('mat-sidenav-fixed');
  }
}
