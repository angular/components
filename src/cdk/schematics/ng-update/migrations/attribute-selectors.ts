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
import {AttributeSelectorUpgradeData} from '../data/attribute-selectors';
import {findAllSubstringIndices} from '../typescript/literal';
import {getVersionUpgradeData, UpgradeData} from '../upgrade-data';

/**
 * Migration that walks through every string literal, template and stylesheet
 * in order to switch deprecated attribute selectors to the updated selector.
 */
export class AttributeSelectorsMigration extends Migration<UpgradeData> {
  /** Required upgrade changes for specified target version. */
  data = getVersionUpgradeData(this, 'attributeSelectors');

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
      const currentSelector = `[${selector.replace}]`;
      const updatedSelector = `[${selector.replaceWith}]`;

      findAllSubstringIndices(stylesheet.content, currentSelector)
        .map(offset => stylesheet.start + offset)
        .forEach(start =>
          replacements.push(
            this._replaceSelector(start, {
              replace: currentSelector,
              replaceWith: updatedSelector,
            }),
          ),
        );
    });

    return replacements;
  }

  private _visitStringLiteralLike(literal: ts.StringLiteralLike): Replacement[] | null {
    if (literal.parent && literal.parent.kind !== ts.SyntaxKind.CallExpression) {
      return null;
    }

    const literalText = literal.getText();
    const replacements: Replacement[] = [];

    this.data.forEach(selector => {
      findAllSubstringIndices(literalText, selector.replace)
        .map(offset => literal.getStart() + offset)
        .forEach(start => replacements.push(this._replaceSelector(start, selector)));
    });

    return replacements;
  }

  private _replaceSelector(start: number, data: AttributeSelectorUpgradeData): Replacement {
    return {start, length: data.replace.length, content: data.replaceWith};
  }
}
