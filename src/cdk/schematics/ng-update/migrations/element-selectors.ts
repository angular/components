/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ResolvedResource} from '../../update-tool/component-resource-collector';
import {WorkspacePath} from '../../update-tool/file-system';
import {Migration, Replacement} from '../../update-tool/migration';
import {ElementSelectorUpgradeData} from '../data/element-selectors';
import {findAllSubstringIndices} from '../typescript/literal';
import {getVersionUpgradeData, UpgradeData} from '../upgrade-data';

/**
 * Migration that walks through every string literal, template and stylesheet in order
 * to migrate outdated element selectors to the new one.
 */
export class ElementSelectorsMigration extends Migration<UpgradeData> {
  /** Change data that upgrades to the specified target version. */
  data = getVersionUpgradeData(this, 'elementSelectors');

  // Only enable the migration rule if there is upgrade data.
  enabled: boolean = this.data.length !== 0;

  override visitNode(node: ts.Node) {
    if (ts.isStringLiteralLike(node)) {
      return this._visitStringLiteralLike(node);
    }

    return null;
  }

  override visitTemplate(template: ResolvedResource) {
    const replacements: Replacement[] = [];

    this.data.forEach(selector => {
      findAllSubstringIndices(template.content, selector.replace)
        .map(offset => template.start + offset)
        .forEach(start => replacements.push(this._replaceSelector(start, selector)));
    });

    return replacements;
  }

  override visitStylesheet(stylesheet: ResolvedResource) {
    const replacements: Replacement[] = [];

    this.data.forEach(selector => {
      findAllSubstringIndices(stylesheet.content, selector.replace)
        .map(offset => stylesheet.start + offset)
        .forEach(start => replacements.push(this._replaceSelector(start, selector)));
    });

    return replacements;
  }

  private _visitStringLiteralLike(node: ts.StringLiteralLike) {
    if (node.parent && node.parent.kind !== ts.SyntaxKind.CallExpression) {
      return null;
    }

    const textContent = node.getText();
    const replacements: Replacement[] = [];

    this.data.forEach(selector => {
      findAllSubstringIndices(textContent, selector.replace)
        .map(offset => node.getStart() + offset)
        .forEach(start => replacements.push(this._replaceSelector(start, selector)));
    });

    return replacements;
  }

  private _replaceSelector(start: number, data: ElementSelectorUpgradeData) {
    return {start, length: data.replace.length, content: data.replaceWith};
  }
}
