/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, ResolvedResource} from '@angular/cdk/schematics';
import {SchematicContext} from '@angular-devkit/schematics';
import {StyleMigrator} from './style-migrator';
import * as compiler from '@angular/compiler';

/**
 * Traverses the given tree of nodes and runs the given callback for each Element node encountered.
 *
 * @param nodes The nodes of the ast from a parsed template.
 * @param callback A function that gets run for each Element node.
 */
function visitElements(
  nodes: compiler.TmplAstNode[],
  callback: (node: compiler.TmplAstElement) => void,
): void {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node instanceof compiler.TmplAstElement) {
      callback(node);
      visitElements(node.children, callback);
    }
  }
}

export class TemplateMigration extends Migration<StyleMigrator[], SchematicContext> {
  enabled = true;

  override visitTemplate(template: ResolvedResource) {
    const ast = compiler.parseTemplate(template.content, template.filePath, {
      preserveWhitespaces: true,
      preserveLineEndings: true,
      leadingTriviaChars: [],
    });

    visitElements(ast.nodes, node => {
      // TODO(wagnermaciel): implement the migration updates.
    });

    this.fileSystem.overwrite(template.filePath, template.content);
  }
}
