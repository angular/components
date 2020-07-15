/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {ContentContainerComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {ToolbarHarnessFilters} from '@angular/material/toolbar/testing/toolbar-harness-filters';

/** Selectors for different sections of the mat-toolbar that can container user content. */
export const enum MatToolbarSection {
  ROW = '.mat-toolbar-row'
}

/** Harness for interacting with a standard mat-toolbar in tests. */
export class MatToolbarHarness extends ContentContainerComponentHarness<MatToolbarSection> {
  static hostSelector = 'mat-toolbar';

  getToolbars = this.locatorForAll('mat-toolbar-row');


  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatToolbarHarness` that meets
   * certain criteria.
   * @param options Options for filtering which card instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ToolbarHarnessFilters = {}): HarnessPredicate<MatToolbarHarness> {
    return new HarnessPredicate(MatToolbarHarness, options)
      .addOption('text', options.text,
        (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
  }

  async hasMultipleRows(): Promise<boolean> {
    return (await this.host()).hasClass('mat-toolbar-multiple-rows');
  }

  /** Gets all of the toolbar's content as text. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Gets the toolbar's content as text separated by rows. */
  async getRowsAsText(): Promise<string[]> {
    const toolbars = await this.getToolbars();
    return toolbars.length ? Promise.all(toolbars.map(t => t.text())) :
      Promise.all([this.getText()]);
  }
}
