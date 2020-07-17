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
import {TreeNodeHarnessFilters} from './tree-harness-filters';
import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';

export class MatTreeNodeHarness extends ComponentHarness {
  static hostSelector = '.mat-tree-node';

   _toggle = this.locatorForOptional('mattreenodetoggle');

  static with(options: TreeNodeHarnessFilters = {}): HarnessPredicate<MatTreeNodeHarness> {
    return getNodePredicate(MatTreeNodeHarness, options);
  }

  async isExpanded(): Promise<boolean> {
    return coerceBooleanProperty(await (await this.host()).getAttribute('aria-expanded'));
  }

  async isDisabled(): Promise<boolean> {
    return coerceBooleanProperty(await (await this.host()).getProperty('aria-disabled'));
  }

  async getLevel(): Promise<number> {
    return coerceNumberProperty(await (await this.host()).getAttribute('aria-level'));
  }

  async getRole(): Promise<string|null> {
    return (await this.host()).getAttribute('role');
  }

  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  async toggleExpansion(): Promise<void> {
    const toggle = await this._toggle();
    if (toggle) {
      return toggle.click();
    }
  }
}

export class MatNestedTreeNodeHarness extends MatTreeNodeHarness {
  static hostSelector = '.mat-nested-tree-node';

  static with(options: TreeNodeHarnessFilters = {}): HarnessPredicate<MatNestedTreeNodeHarness> {
    return getNodePredicate(MatNestedTreeNodeHarness, options);
  }
}


function getNodePredicate<T extends MatTreeNodeHarness>(
  type: ComponentHarnessConstructor<T>,
  options: TreeNodeHarnessFilters): HarnessPredicate<T> {
  return new HarnessPredicate(type, options)
    .addOption('text', options.text,
      (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
    .addOption(
      'disabled', options.disabled,
      async (harness, disabled) => (await harness.isDisabled()) === disabled)
    .addOption(
      'expanded', options.expanded,
      async (harness, expanded) => (await harness.isExpanded()) === expanded)
    .addOption(
      'level', options.level,
      async (harness, level) => (await harness.getLevel()) === level)
    .addOption(
      'role', options.role,
      async (harness, role) => (await harness.getRole()) === role);
}
