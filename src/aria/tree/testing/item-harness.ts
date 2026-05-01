/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ContentContainerComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {TreeItemHarnessFilters} from './tree-harness-filters';

/** Harness for interacting with an Aria tree item. */
export class TreeItemHarness extends ContentContainerComponentHarness<string> {
  static hostSelector = '[ngTreeItem]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tree item with specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: TreeItemHarnessFilters = {}): HarnessPredicate<TreeItemHarness> {
    return new HarnessPredicate(TreeItemHarness, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text),
      )
      .addOption(
        'disabled',
        options.disabled,
        async (harness, disabled) => (await harness.isDisabled()) === disabled,
      )
      .addOption(
        'expanded',
        options.expanded,
        async (harness, expanded) => (await harness.isExpanded()) === expanded,
      )
      .addOption(
        'selected',
        options.selected,
        async (harness, selected) => (await harness.isSelected()) === selected,
      )
      .addOption(
        'level',
        options.level,
        async (harness, level) => (await harness.getLevel()) === level,
      );
  }

  /** Whether the tree item is expanded. */
  async isExpanded(): Promise<boolean> {
    return (await this._getHostAttribute('aria-expanded')) === 'true';
  }

  /** Whether the tree item is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this._getHostAttribute('aria-disabled')) === 'true';
  }

  /** Whether the tree item is selected. */
  async isSelected(): Promise<boolean> {
    return (await this._getHostAttribute('aria-selected')) === 'true';
  }

  /** Gets the level of the tree item. Note that this gets the aria-level and is 1 indexed. */
  async getLevel(): Promise<number> {
    const level = (await this._getHostAttribute('aria-level')) ?? '1';
    return parseInt(level);
  }

  /** Gets the tree item's text. */
  async getText(): Promise<string> {
    return (await this.host()).text({exclude: '[ngTreeItem], [ngTreeItemGroup]'});
  }

  /** Clicks the tree item. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }

  /** Focuses the tree item. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the tree item. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the tree item is active. */
  async isActive(): Promise<boolean> {
    return (await this._getHostAttribute('data-active')) === 'true';
  }

  /** Whether the tree item has focus. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }

  private async _getHostAttribute(attributeName: string): Promise<string | null> {
    return (await this.host()).getAttribute(attributeName);
  }
}
