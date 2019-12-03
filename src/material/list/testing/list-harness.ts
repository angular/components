/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate
} from '@angular/cdk/testing';
import {DividerHarnessFilters, MatDividerHarness} from '@angular/material/divider/testing';
import {
  MAT_ACTION_LIST_SELECTOR,
  MAT_LIST_SELECTOR,
  MAT_NAV_LIST_SELECTOR
} from '@angular/material/list/testing/list-selectors';
import {
  ActionListHarnessFilters,
  ActionListItemHarnessFilters,
  BaseListItemHarnessFilters,
  ListHarnessFilters,
  ListItemHarnessFilters,
  ListOptionHarnessFilters,
  NavListHarnessFilters,
  NavListItemHarnessFilters,
  SelectionListHarnessFilters,
  SubheaderHarnessFilters
} from './list-harness-filters';
import {
  MatActionListItemHarness,
  MatListItemHarness,
  MatListOptionHarness,
  MatNavListItemHarness,
  MatSubheaderHarness
} from './list-item-harness';

/** Represents a section of a list falling under a specific header. */
export interface ListSection<I> {
  /** The heading for this list section. `undefined` if there is no heading. */
  heading?: string;

  /** The items in this list section. */
  items: I[];
}

/**
 * Shared behavior among the harnesses for the various `MatList` flavors.
 * @template T A constructor type for a list item harness type used by this list harness.
 * @template C The list item harness type that `T` constructs.
 * @template F The filter type used filter list item harness of type `C`.
 * @docs-private
 */
export class MatListHarnessBase
    <
      T extends (ComponentHarnessConstructor<C> & {with: (options?: F) => HarnessPredicate<C>}),
      C extends ComponentHarness,
      F extends BaseListItemHarnessFilters
    > extends ComponentHarness {
  protected _itemHarness: T;

  /**
   * Gets a list of harnesses representing the items in this list.
   * @param filters Optional filters used to narrow which harnesses are included
   * @return The list of items matching the given filters.
   */
  async getItems(filters?: F): Promise<C[]> {
    return this.locatorForAll(this._itemHarness.with(filters))();
  }

  /**
   * Gets a list of `ListSection` representing the list items grouped by subheaders. If the list has
   * no subheaders it is represented as a single `ListSection` with an undefined `heading` property.
   * @param filters?? Optional filters used to narrow which list item harnesses are included
   * @return The list of items matching the given filters, grouped into sections by subheader.
   */
  async getItemsGroupedBySubheader(filters?: F): Promise<ListSection<C>[]> {
    const listSections = [];
    let currentSection: ListSection<C> = {items: []};
    const itemsAndSubheaders =
        await this.getItemsWithSubheadersAndDividers({item: filters, divider: false});
    for (const itemOrSubheader of itemsAndSubheaders) {
      if (itemOrSubheader instanceof MatSubheaderHarness) {
        if (currentSection.heading !== undefined || currentSection.items.length) {
          listSections.push(currentSection);
        }
        currentSection = {heading: await itemOrSubheader.getText(), items: []};
      } else {
        currentSection.items.push(itemOrSubheader);
      }
    }
    if (currentSection.heading !== undefined || currentSection.items.length ||
        !listSections.length) {
      listSections.push(currentSection);
    }
    return listSections;
  }

  /**
   * Gets a list of sub-lists representing the list items grouped by dividers. If the list has no
   * dividers it is represented as a list with a single sub-list.
   * @param filters Optional filters used to narrow which list item harnesses are included
   * @return The list of items matching the given filters, grouped into sub-lists by divider.
   */
  async getItemsGroupedByDividers(filters?: F): Promise<C[][]> {
    const listSections = [];
    let currentSection = [];
    const itemsAndDividers =
        await this.getItemsWithSubheadersAndDividers({item: filters, subheader: false});
    for (const itemOrDivider of itemsAndDividers) {
      if (itemOrDivider instanceof MatDividerHarness) {
        listSections.push(currentSection);
        currentSection = [];
      } else {
        currentSection.push(itemOrDivider);
      }
    }
    listSections.push(currentSection);
    return listSections;
  }

  /**
   * Gets a list of harnesses representing all of the items, subheaders, and dividers
   * (in the order they appear in the list). Use `instanceof` to check which type of harness a given
   * item is.
   * @param filters Optional filters used to narrow which list items, subheaders, and dividers are
   *     included. A value of `false` for the `item`, `subheader`, or `divider` properties indicates
   *     that the respective harness type should be omitted completely.
   * @return The list of harnesses representing the items, subheaders, and dividers matching the
   *     given filters.
   */
  getItemsWithSubheadersAndDividers(filters: {
    item: false,
    subheader: false,
    divider: false
  }): Promise<[]>;
  getItemsWithSubheadersAndDividers(filters: {
    item?: F | false,
    subheader: false,
    divider: false
  }): Promise<C[]>;
  getItemsWithSubheadersAndDividers(filters: {
    item: false,
    subheader?: SubheaderHarnessFilters | false,
    divider: false
  }): Promise<MatSubheaderHarness[]>;
  getItemsWithSubheadersAndDividers(filters: {
    item: false,
    subheader: false,
    divider?: DividerHarnessFilters | false
  }): Promise<MatDividerHarness[]>;
  getItemsWithSubheadersAndDividers(filters: {
    item?: F | false,
    subheader?: SubheaderHarnessFilters | false,
    divider: false
  }): Promise<(C | MatSubheaderHarness)[]>;
  getItemsWithSubheadersAndDividers(filters: {
    item?: F | false,
    subheader: false,
    divider?: false | DividerHarnessFilters
  }): Promise<(C | MatDividerHarness)[]>;
  getItemsWithSubheadersAndDividers(filters: {
    item: false,
    subheader?: false | SubheaderHarnessFilters,
    divider?: false | DividerHarnessFilters
  }): Promise<(MatSubheaderHarness | MatDividerHarness)[]>;
  getItemsWithSubheadersAndDividers(filters?: {
    item?: F | false,
    subheader?: SubheaderHarnessFilters | false,
    divider?: DividerHarnessFilters | false
  }): Promise<(C | MatSubheaderHarness | MatDividerHarness)[]>;
  async getItemsWithSubheadersAndDividers(filters: {
    item?: F | false,
    subheader?: SubheaderHarnessFilters | false,
    divider?: DividerHarnessFilters | false
  } = {}): Promise<(C | MatSubheaderHarness | MatDividerHarness)[]> {
    const query = [];
    if (filters.item !== false) {
      query.push(this._itemHarness.with(filters.item || {} as F));
    }
    if (filters.subheader !== false) {
      query.push(MatSubheaderHarness.with(filters.subheader));
    }
    if (filters.divider !== false) {
      query.push(MatDividerHarness.with(filters.divider));
    }
    return this.locatorForAll(...query)();
  }
}

/** Harness for interacting with a standard mat-list in tests. */
export class MatListHarness extends
    MatListHarnessBase<typeof MatListItemHarness, MatListItemHarness, ListItemHarnessFilters> {
  /** The selector for the host element of a `MatList` instance. */
  static hostSelector = MAT_LIST_SELECTOR;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatListHarness` that meets certain
   * criteria.
   * @param options Options for filtering which list instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ListHarnessFilters = {}): HarnessPredicate<MatListHarness> {
    return new HarnessPredicate(MatListHarness, options);
  }

  _itemHarness = MatListItemHarness;
}

/** Harness for interacting with a standard mat-action-list in tests. */
export class MatActionListHarness extends MatListHarnessBase<
    typeof MatActionListItemHarness, MatActionListItemHarness, ActionListItemHarnessFilters> {
  /** The selector for the host element of a `MatActionList` instance. */
  static hostSelector = MAT_ACTION_LIST_SELECTOR;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatActionListHarness` that meets
   * certain criteria.
   * @param options Options for filtering which action list instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ActionListHarnessFilters = {}): HarnessPredicate<MatActionListHarness> {
    return new HarnessPredicate(MatActionListHarness, options);
  }

  _itemHarness = MatActionListItemHarness;
}

/** Harness for interacting with a standard mat-nav-list in tests. */
export class MatNavListHarness extends MatListHarnessBase<
    typeof MatNavListItemHarness, MatNavListItemHarness, NavListItemHarnessFilters> {
  /** The selector for the host element of a `MatNavList` instance. */
  static hostSelector = MAT_NAV_LIST_SELECTOR;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatNavListHarness` that meets
   * certain criteria.
   * @param options Options for filtering which nav list instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: NavListHarnessFilters = {}): HarnessPredicate<MatNavListHarness> {
    return new HarnessPredicate(MatNavListHarness, options);
  }

  _itemHarness = MatNavListItemHarness;
}

/** Harness for interacting with a standard mat-selection-list in tests. */
export class MatSelectionListHarness extends MatListHarnessBase<
    typeof MatListOptionHarness, MatListOptionHarness, ListOptionHarnessFilters> {
  /** The selector for the host element of a `MatSelectionList` instance. */
  static hostSelector = 'mat-selection-list';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatSelectionListHarness` that meets
   * certain criteria.
   * @param options Options for filtering which selection list instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: SelectionListHarnessFilters = {}):
      HarnessPredicate<MatSelectionListHarness> {
    return new HarnessPredicate(MatSelectionListHarness, options);
  }

  _itemHarness = MatListOptionHarness;

  /** Whether the selection list is disabled. */
  async isDisabled(): Promise<boolean> {
    return await (await this.host()).getAttribute('aria-disabled') === 'true';
  }

  /**
   * Selects all items matching any of the given filters.
   * @param filters Filters that specify which items should be selected.
   */
  async selectItems(...filters: ListOptionHarnessFilters[]): Promise<void> {
    const items = await this._getItems(filters);
    await Promise.all(items.map(item => item.select()));
  }

  /**
   * Deselects all items matching any of the given filters.
   * @param filters Filters that specify which items should be deselected.
   */
  async deselectItems(...filters: ListItemHarnessFilters[]): Promise<void> {
    const items = await this._getItems(filters);
    await Promise.all(items.map(item => item.deselect()));
  }

  /** Gets all items matching the given list of filters. */
  private async _getItems(filters: ListOptionHarnessFilters[]): Promise<MatListOptionHarness[]> {
    if (!filters.length) {
      return this.getItems();
    }
    return ([] as MatListOptionHarness[]).concat(...await Promise.all(
        filters.map(filter => this.locatorForAll(MatListOptionHarness.with(filter))())));
  }
}
