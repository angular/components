/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ts from 'typescript';
import {ResolvedResource} from '../../update-tool/component-resource-collector';
import {WorkspacePath} from '../../update-tool/file-system';
import {Migration} from '../../update-tool/migration';
import {CssTokenUpgradeData} from '../data/css-tokens';
import {findAllSubstringIndices} from '../typescript/literal';
import {getVersionUpgradeData, UpgradeData} from '../upgrade-data';

/** Characters that can be part of a valid token name. */
const TOKEN_CHARACTER = /[-_a-z0-9]/i;

/**
 * Migration that walks through every string literal, template and stylesheet in
 * order to migrate outdated CSS tokens to their new name.
 */
export class CssTokensMigration extends Migration<UpgradeData> {
  /** Change data that upgrades to the specified target version. */
  data: CssTokenUpgradeData[] = getVersionUpgradeData(this, 'cssTokens');

  // Only enable the migration rule if there is upgrade data.
  enabled = this.data.length !== 0;

  override visitNode(node: ts.Node): void {
    if (ts.isStringLiteralLike(node)) {
      this._visitStringLiteralLike(node);
    }
  }

  override visitTemplate(template: ResolvedResource): void {
    this.data.forEach(data => {
      if (data.replaceIn && !data.replaceIn.html) {
        return;
      }

      findAllSubstringIndices(template.content, data.replace)
        .map(offset => template.start + offset)
        // Filter out matches that are followed by a valid token character, so that we don't match
        // partial token names.
        .filter(start => !TOKEN_CHARACTER.test(template.content[start + data.replace.length] || ''))
        .forEach(start => this._replaceSelector(template.filePath, start, data));
    });
  }

  override visitStylesheet(stylesheet: ResolvedResource): void {
    this.data.forEach(data => {
      if (data.replaceIn && !data.replaceIn.stylesheet) {
        return;
      }

      findAllSubstringIndices(stylesheet.content, data.replace)
        .map(offset => stylesheet.start + offset)
        // Filter out matches that are followed by a valid token character, so that we don't match
        // partial token names.
        .filter(
          start => !TOKEN_CHARACTER.test(stylesheet.content[start + data.replace.length] || ''),
        )
        .forEach(start => this._replaceSelector(stylesheet.filePath, start, data));
    });
  }

  private _visitStringLiteralLike(node: ts.StringLiteralLike) {
    const textContent = node.getText();
    const filePath = this.fileSystem.resolve(node.getSourceFile().fileName);

    this.data.forEach(data => {
      if (data.replaceIn && !data.replaceIn.tsStringLiterals) {
        return;
      }

      findAllSubstringIndices(textContent, data.replace)
        .map(offset => node.getStart() + offset)
        // Filter out matches that are followed by a valid token character, so that we don't match
        // partial token names.
        .filter(start => !TOKEN_CHARACTER.test(textContent[start + data.replace.length] || ''))
        .forEach(start => this._replaceSelector(filePath, start, data));
    });
  }

  private _replaceSelector(filePath: WorkspacePath, start: number, data: CssTokenUpgradeData) {
    this.fileSystem
      .edit(filePath)
      .remove(start, data.replace.length)
      .insertRight(start, data.replaceWith);
  }
}
