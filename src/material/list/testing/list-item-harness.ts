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
  HarnessLoader,
  HarnessPredicate
} from '@angular/cdk/testing';
import {
  MAT_ACTION_LIST_SELECTOR,
  MAT_LIST_SELECTOR, MAT_NAV_LIST_SELECTOR
} from '@angular/material/list/testing/list-selectors';
import {
  ActionListItemHarnessFilters,
  BaseListItemHarnessFilters,
  ListItemHarnessFilters,
  ListOptionHarnessFilters,
  NavListItemHarnessFilters,
  SubheaderHarnessFilters
} from './list-harness-filters';

function getListItemPredicate
    <H extends MatListItemHarnessBase, F extends BaseListItemHarnessFilters>
    (harnessType: ComponentHarnessConstructor<H>, options: F): HarnessPredicate<H> {
  return new HarnessPredicate(harnessType, options)
      .addOption('text', options.text,
          (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
}

/** Harness for interacting with a list subheader. */
export class MatSubheaderHarness extends ComponentHarness {
  static hostSelector = '[mat-subheader], [matSubheader]';

  static with(options: SubheaderHarnessFilters = {}): HarnessPredicate<MatSubheaderHarness> {
    return new HarnessPredicate(MatSubheaderHarness, options)
        .addOption('text', options.text,
            (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
  }

  /** Gets the full text content of the list item (including text from any font icons). */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}

/**
 * Shared behavior among the harnesses for the various `MatListItem` flavors.
 * @docs-private
 */
export class MatListItemHarnessBase extends ComponentHarness {
  private _lines = this.locatorForAll('[mat-line], [matLine]');
  private _avatar = this.locatorForOptional('[mat-list-avatar], [matListAvatar]');
  private _icon = this.locatorForOptional('[mat-list-icon], [matListIcon]');

  /** Gets the full text content of the list item (including text from any font icons). */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Gets the lines of text (`mat-line` elements) in this nav list item. */
  async getLines(): Promise<string[]> {
    return Promise.all((await this._lines()).map(l => l.text()));
  }

  /** Whether this list item has an avatar. */
  async hasAvatar(): Promise<boolean> {
    return !!await this._avatar();
  }

  /** Whether this list item has an icon. */
  async hasIcon(): Promise<boolean> {
    return !!await this._icon();
  }

  /** Gets a `HarnessLoader` used to get harnesses within the list item's content. */
  async getHarnessLoaderForContent(): Promise<HarnessLoader> {
    return this.locatorFactory.harnessLoaderFor('.mat-list-item-content');
  }
}

/** Harness for interacting with a list item. */
export class MatListItemHarness extends MatListItemHarnessBase {
  /** The selector for the host element of a `MatListItem` instance. */
  static hostSelector = ['mat-list-item', 'a[mat-list-item]', 'button[mat-list-item]']
      .map(selector => `${MAT_LIST_SELECTOR} ${selector}`)
      .join(',');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatListItemHarness` that meets
   * certain criteria.
   * @param options Options for filtering which list item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ListItemHarnessFilters = {}): HarnessPredicate<MatListItemHarness> {
    return getListItemPredicate(MatListItemHarness, options);
  }
}

/** Harness for interacting with an action list item. */
export class MatActionListItemHarness extends MatListItemHarnessBase {
  /** The selector for the host element of a `MatListItem` instance. */
  static hostSelector = ['mat-list-item', 'a[mat-list-item]', 'button[mat-list-item]']
      .map(selector => `${MAT_ACTION_LIST_SELECTOR} ${selector}`)
      .join(',');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatActionListItemHarness` that
   * meets certain criteria.
   * @param options Options for filtering which action list item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ActionListItemHarnessFilters = {}):
      HarnessPredicate<MatActionListItemHarness> {
    return getListItemPredicate(MatActionListItemHarness, options);
  }

  /** Clicks on the action list item. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }

  /** Focuses the action list item. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the action list item. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }
}

/** Harness for interacting with a nav list item. */
export class MatNavListItemHarness extends MatListItemHarnessBase {
  /** The selector for the host element of a `MatListItem` instance. */
  static hostSelector = ['mat-list-item', 'a[mat-list-item]', 'button[mat-list-item]']
      .map(selector => `${MAT_NAV_LIST_SELECTOR} ${selector}`)
      .join(',');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatNavListItemHarness` that
   * meets certain criteria.
   * @param options Options for filtering which nav list item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: NavListItemHarnessFilters = {}): HarnessPredicate<MatNavListItemHarness> {
    return getListItemPredicate(MatNavListItemHarness, options)
        .addOption('href', options.href,
            async (harness, href) => HarnessPredicate.stringMatches(harness.getHref(), href));
  }

  /** Gets the href for this nav list item. */
  async getHref(): Promise<string | null> {
    return (await this.host()).getAttribute('href');
  }

  /** Clicks on the nav list item. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }

  /** Focuses the nav list item. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the nav list item. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }
}

/** Harness for interacting with a list option. */
export class MatListOptionHarness extends MatListItemHarnessBase {
  /** The selector for the host element of a `MatListOption` instance. */
  static hostSelector = 'mat-list-option';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatListOptionHarness` that
   * meets certain criteria.
   * @param options Options for filtering which list option instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ListOptionHarnessFilters = {}): HarnessPredicate<MatListOptionHarness> {
    return getListItemPredicate(MatListOptionHarness, options)
        .addOption('is selected', options.selected,
            async (harness, selected) => await harness.isSelected() === selected);
  }

  private _itemContent = this.locatorFor('.mat-list-item-content');

  /** Gets the position of the checkbox relative to the list option content. */
  async getCheckboxPosition(): Promise<'before' | 'after'> {
    return await (await this._itemContent()).hasClass('mat-list-item-content-reverse') ?
        'after' : 'before';
  }

  /** Whether the list option is selected. */
  async isSelected(): Promise<boolean> {
    return await (await this.host()).getAttribute('aria-selected') === 'true';
  }

  /** Whether the list option is disabled. */
  async isDisabled(): Promise<boolean> {
    return await (await this.host()).getAttribute('aria-disabled') === 'true';
  }

  /** Focuses the list option. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the list option. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Toggles the checked state of the checkbox. */
  async toggle() {
    return (await this.host()).click();
  }

  /**
   * Puts the list option in a checked state by toggling it if it is currently unchecked, or doing
   * nothing if it is already checked.
   */
  async check() {
    if (!await this.isSelected()) {
      return this.toggle();
    }
  }

  /**
   * Puts the list option in an unchecked state by toggling it if it is currently checked, or doing
   * nothing if it is already unchecked.
   */
  async uncheck() {
    if (await this.isSelected()) {
      return this.toggle();
    }
  }
}
