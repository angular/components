/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, TargetVersion} from '@angular/cdk/schematics';
import * as ts from 'typescript';

export class LegacyComponentsMigration extends Migration<null> {
  enabled = this.targetVersion === TargetVersion.V15;

  override visitNode(node: ts.Node): void {
    if (ts.isImportDeclaration(node)) {
      this._handleImportDeclaration(node);
    }
  }

  /** Handles updating the module specifier of @angular/material imports. */
  private _handleImportDeclaration(node: ts.ImportDeclaration): void {
    const moduleSpecifier = node.moduleSpecifier as ts.StringLiteral;
    if (moduleSpecifier.text.startsWith('@angular/material/')) {
      this._replaceAt(node, {old: '@angular/material/', new: '@angular/material/legacy-'});

      if (node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
        this._handleNamedImportBindings(node.importClause.namedBindings);
      }
    }
  }

  /** Handles updating the named bindings of @angular/material imports. */
  private _handleNamedImportBindings(node: ts.NamedImports): void {
    for (let i = 0; i < node.elements.length; i++) {
      const n = node.elements[i];
      const name = n.propertyName ? n.propertyName : n.name;
      const oldExport = name.escapedText.toString();
      const suffix = oldExport.slice(3);
      const newExport = n.propertyName
        ? `MatLegacy${suffix}`
        : `MatLegacy${suffix} as Mat${suffix}`;
      this._replaceAt(name, {old: oldExport, new: newExport});
    }
  }

  /** Updates the source file of the given node with the given replacements. */
  private _replaceAt(node: ts.Node, str: {old: string; new: string}): void {
    const filePath = this.fileSystem.resolve(node.getSourceFile().fileName);
    const index = this.fileSystem.read(filePath)!.indexOf(str.old, node.pos);
    this.fileSystem.edit(filePath).remove(index, str.old.length).insertRight(index, str.new);
  }
}
