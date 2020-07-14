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
  INNER_ROW = '.mat-toolbar-row'
}

/** Harness for interacting with a standard mat-toolbar in tests. */
export class MatToolbarHarness extends ContentContainerComponentHarness<MatToolbarSection> {
  static hostSelector = 'mat-toolbar';

  static with(options: ToolbarHarnessFilters = {}): HarnessPredicate<MatToolbarHarness> {
    return new HarnessPredicate(MatToolbarHarness, options)
      .addOption('text', options.text,
        (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
  }

  async isMultiRow(): Promise<boolean> {
    return (await this.host()).hasClass('mat-toolbar-multiple-rows');
  }

  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}
