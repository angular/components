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
  parallel,
} from '@angular/cdk/testing';
import {
  GridHarnessFilters,
  GridRowHarnessFilters,
  GridCellHarnessFilters,
} from './grid-harness-filters';

/** Harness for interacting with a standard ngGridCell in tests. */
export class GridCellHarness extends ContentContainerComponentHarness {
  static hostSelector = '[ngGridCell]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a grid cell with specific attributes.
   * @param options Options for filtering which cell instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: GridCellHarnessFilters = {}): HarnessPredicate<GridCellHarness> {
    return new HarnessPredicate(GridCellHarness, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text),
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

  /** Whether the cell is selected. */
  async isSelected(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-selected')) === 'true';
  }

  /** Whether the cell is disabled. */
  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-disabled')) === 'true';
  }

  /** Gets the text content of the cell. */
  async getText(): Promise<string> {
    const host = await this.host();
    return host.text();
  }

  /** Clicks the cell. */
  async click(): Promise<void> {
    const host = await this.host();
    return host.click();
  }

  /** Focuses the cell. */
  async focus(): Promise<void> {
    const host = await this.host();
    return host.focus();
  }

  /** Blurs the cell. */
  async blur(): Promise<void> {
    const host = await this.host();
    return host.blur();
  }
}

/** Harness for interacting with a standard ngGridRow in tests. */
export class GridRowHarness extends ComponentHarness {
  static hostSelector = '[ngGridRow]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a grid row with specific attributes.
   * @param options Options for filtering which row instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: GridRowHarnessFilters = {}): HarnessPredicate<GridRowHarness> {
    return new HarnessPredicate(GridRowHarness, options);
  }

  /** Gets all cells in the row. */
  async getCells(filters: GridCellHarnessFilters = {}): Promise<GridCellHarness[]> {
    return this.locatorForAll(GridCellHarness.with(filters))();
  }

  /** Gets the text of the cells in the row. */
  async getCellTextByIndex(filters: GridCellHarnessFilters = {}): Promise<string[]> {
    const cells = await this.getCells(filters);
    return parallel(() => cells.map(cell => cell.getText()));
  }
}

/** Harness for interacting with a standard ngGrid in tests. */
export class GridHarness extends ComponentHarness {
  static hostSelector = '[ngGrid]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a grid with specific attributes.
   * @param options Options for filtering which grid instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: GridHarnessFilters = {}): HarnessPredicate<GridHarness> {
    return new HarnessPredicate(GridHarness, options).addOption(
      'disabled',
      options.disabled,
      async (harness, disabled) => (await harness.isDisabled()) === disabled,
    );
  }

  /** Whether the grid is disabled. */
  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-disabled')) === 'true';
  }

  /** Whether the grid is multi-selectable. */
  async isMultiSelectable(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-multiselectable')) === 'true';
  }

  /** Gets all rows in the grid. */
  async getRows(filters: GridRowHarnessFilters = {}): Promise<GridRowHarness[]> {
    return this.locatorForAll(GridRowHarness.with(filters))();
  }

  /** Gets all cells in the grid. */
  async getCells(filters: GridCellHarnessFilters = {}): Promise<GridCellHarness[]> {
    return this.locatorForAll(GridCellHarness.with(filters))();
  }

  /** Gets the text inside the entire grid organized by rows. */
  async getCellTextByIndex(): Promise<string[][]> {
    const rows = await this.getRows();
    return parallel(() => rows.map(row => row.getCellTextByIndex()));
  }
}
