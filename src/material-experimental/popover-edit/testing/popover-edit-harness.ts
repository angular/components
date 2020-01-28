/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  BaseHarnessFilters,
  ComponentHarness,
  HarnessPredicate,
  TestKey,
} from '@angular/cdk/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {CellHarnessFilters} from '@angular/material/table/testing';

/** Harness for interacting with a popover edit table cell in tests. */
export class MatPopoverEditCellHarness extends ComponentHarness {
  static hostSelector = '.mat-popover-edit-cell';

  private _documentRootLocator = this.documentRootLocatorFactory();

  /**
   * Gets a `HarnessPredicate` that can be used to search for a menu with specific attributes.
   * @param options Options for narrowing the search:
   *   - `selector` finds a menu whose host element matches the given selector.
   *   - `label` finds a menu with specific label text.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: CellHarnessFilters = {}): HarnessPredicate<MatPopoverEditCellHarness> {
    return new HarnessPredicate(MatPopoverEditCellHarness, options)
        .addOption('text', options.text,
            (harness, text) => HarnessPredicate.stringMatches(harness.getCellText(), text));
  }

  /** Gets a boolean promise indicating if the menu is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  async isOpen(): Promise<boolean> {
    const isOpen = (await this.host()).getAttribute('aria-expanded');
    return coerceBooleanProperty(await isOpen);
  }

  async getCellText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Focuses the menu and returns a void promise that indicates when the action is complete. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the menu and returns a void promise that indicates when the action is complete. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  async open(): Promise<void> {
    await this.focus();
    return (await this.host()).sendKeys(TestKey.ENTER);
  }

  async close(): Promise<void> {
    const lens = await this.getLens();
    await lens.close();
  }

  async getLens(): Promise<MatPopoverEditLensHarness> {
    if (!(await this.isOpen())) {
      throw Error('Popover edit is not open for this cell');
    }

    const panelId = await (await this.host()).getAttribute('aria-controls');

    return this._documentRootLocator.locatorFor(MatPopoverEditLensHarness.with({
      selector: '#' + panelId
    }))();
  }
}

/** Harness for interacting with a popover edit lens in tests. */
export class MatPopoverEditLensHarness extends ComponentHarness {
  static hostSelector = '.mat-edit-lens';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a menu with specific attributes.
   * @param options Options for narrowing the search:
   *   - `selector` finds a menu whose host element matches the given selector.
   *   - `label` finds a menu with specific label text.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: BaseHarnessFilters = {}): HarnessPredicate<MatPopoverEditLensHarness> {
    return new HarnessPredicate(MatPopoverEditLensHarness, options);
  }

  /** Closes the popover lens by pressing escape. */
  async close(): Promise<void> {
    await (await this.host()).sendKeys(TestKey.ESCAPE);
  }

  /**
   * Submits the lens form by pressing enter.
   * This also closes the popover unless the form is invalid and
   * matEditLensIgnoreSubmitUnlessValid is set.
   */
  async submit(): Promise<void> {
    await (await this.host()).sendKeys(TestKey.ENTER);
  }
}
