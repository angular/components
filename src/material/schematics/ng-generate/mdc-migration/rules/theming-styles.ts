/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, ResolvedResource} from '@angular/cdk/schematics';
import {SchematicContext} from '@angular-devkit/schematics';
import * as postcss from 'postcss';
import * as button from './button-styles/button-styles';

/**
 * Returns whether the given AtRule is an import for @angular/material styles.
 *
 * @param atRule a postcss AtRule node.
 * @returns true if the given AtRule is an import for @angular/material styles.
 */
function isAngularMaterialImport(atRule: postcss.AtRule): boolean {
  if (atRule.name !== 'use') {
    return false;
  }
  const params = postcss.list.space(atRule.params);
  return params[0] === "'@angular/material'";
}

/**
 * Parses the given @use AtRule and returns the namespace being used.
 *
 * @param atRule a postcss @use AtRule.
 * @returns the namespace being used.
 */
function parseNamespace(atRule: postcss.AtRule): string {
  const params = postcss.list.space(atRule.params);
  return params[params.length - 1];
}

export class ThemingStylesMigration extends Migration<string[], SchematicContext> {
  enabled = true;

  override visitStylesheet(stylesheet: ResolvedResource) {
    let namespace: string;
    const shouldMigrateButton = this.upgradeData.includes('all') || this.upgradeData.includes('button');

    const processor = new postcss.Processor([{
      postcssPlugin: 'button-plugin',
      AtRule: function(atRule) {
        if (isAngularMaterialImport(atRule)) {
          namespace = parseNamespace(atRule);
          return;
        }
        if (shouldMigrateButton && button.updateMixin(namespace, atRule)) {
          return;
        }
      }
    }]);

    const result = processor.process(stylesheet.content);
    this.fileSystem.overwrite(stylesheet.filePath, result.toString());
  }
}
