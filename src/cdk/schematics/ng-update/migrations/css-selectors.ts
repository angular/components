/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {WorkspacePath} from '../../update-tool/file-system';
import {ResolvedResource} from '../../update-tool/component-resource-collector';
import {Migration, Replacement} from '../../update-tool/migration';
import {CssSelectorUpgradeData} from '../data/css-selectors';
import {findAllSubstringIndices} from '../typescript/literal';
import {getVersionUpgradeData, UpgradeData} from '../upgrade-data';

/**
 * Migration that walks through every string literal, template and stylesheet in
 * order to migrate outdated CSS selectors to the new selector.
 */
export class CssSelectorsMigration extends Migration<UpgradeData> {
  /** Change data that upgrades to the specified target version. */
  data: CssSelectorUpgradeData[] = getVersionUpgradeData(this, 'cssSelectors');

  // Only enable the migration rule if there is upgrade data.
  enabled = this.data.length !== 0;

  override visitNode(node: ts.Node) {
    if (ts.isStringLiteralLike(node)) {
      return this._visitStringLiteralLike(node);
    }

    return null;
  }

  override visitTemplate(template: ResolvedResource) {
    const replacements: Replacement[] = [];

    this.data.forEach(data => {
      if (data.replaceIn && !data.replaceIn.html) {
        return;
      }

      findAllSubstringIndices(template.content, data.replace)
        .map(offset => template.start + offset)
        .forEach(start => replacements.push(this._replaceSelector(template.filePath, start, data)));
    });

    return replacements;
  }

  override visitStylesheet(stylesheet: ResolvedResource) {
    const replacements: Replacement[] = [];

    this.data.forEach(data => {
      if (data.replaceIn && !data.replaceIn.stylesheet) {
        return;
      }

      findAllSubstringIndices(stylesheet.content, data.replace)
        .map(offset => stylesheet.start + offset)
        .forEach(start =>
          replacements.push(this._replaceSelector(stylesheet.filePath, start, data)),
        );
    });

    return replacements;
  }

  private _visitStringLiteralLike(node: ts.StringLiteralLike) {
    if (node.parent && node.parent.kind !== ts.SyntaxKind.CallExpression) {
      return null;
    }

    const textContent = node.getText();
    const filePath = this.fileSystem.resolve(node.getSourceFile().fileName);
    const replacements: Replacement[] = [];

    this.data.forEach(data => {
      if (data.replaceIn && !data.replaceIn.tsStringLiterals) {
        return;
      }

      findAllSubstringIndices(textContent, data.replace)
        .map(offset => node.getStart() + offset)
        .forEach(start => replacements.push(this._replaceSelector(filePath, start, data)));
    });

    return replacements;
  }

  private _replaceSelector(filePath: WorkspacePath, start: number, data: CssSelectorUpgradeData) {
    return {start, length: data.replace.length, content: data.replaceWith};
  }
}
