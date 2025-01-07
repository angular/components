/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Path} from '@angular-devkit/core';
import {Rule, Tree} from '@angular-devkit/schematics';
import ts from 'typescript';

/** Tag name of the clusterer component. */
const TAG_NAME = 'map-marker-clusterer';

/** Module from which the clusterer is being imported. */
const MODULE_NAME = '@angular/google-maps';

/** Old name of the clusterer class. */
const CLASS_NAME = 'MapMarkerClusterer';

/** New name of the clusterer class. */
const DEPRECATED_CLASS_NAME = 'DeprecatedMapMarkerClusterer';

/** Entry point for the migration schematics with target of Angular Material v19 */
export function updateToV19(): Rule {
  return tree => {
    tree.visit(path => {
      if (path.includes('node_modules')) {
        return;
      }

      if (path.endsWith('.html')) {
        const content = tree.read(path)?.toString();

        if (content && content.includes('<' + TAG_NAME)) {
          tree.overwrite(path, migrateHtml(content));
        }
      } else if (path.endsWith('.ts') && !path.endsWith('.d.ts')) {
        migrateTypeScript(path, tree);
      }
    });
  };
}

/** Migrates an HTML template from the old tag name to the new one. */
function migrateHtml(content: string): string {
  return content
    .replace(/<map-marker-clusterer/g, '<deprecated-map-marker-clusterer')
    .replace(/<\/map-marker-clusterer/g, '</deprecated-map-marker-clusterer');
}

/** Migrates a TypeScript file from the old tag and class names to the new ones. */
function migrateTypeScript(path: Path, tree: Tree) {
  const content = tree.read(path)?.toString();

  // Exit early if none of the symbols we're looking for are mentioned.
  if (
    !content ||
    (!content.includes('<' + TAG_NAME) &&
      !content.includes(MODULE_NAME) &&
      !content.includes(CLASS_NAME))
  ) {
    return;
  }

  const sourceFile = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
  const toMigrate = findTypeScriptNodesToMigrate(sourceFile);

  if (toMigrate.length === 0) {
    return;
  }

  const printer = ts.createPrinter();
  const update = tree.beginUpdate(path);

  for (const node of toMigrate) {
    let replacement: ts.Node;

    if (ts.isStringLiteralLike(node)) {
      // Strings should be migrated as if they're HTML.
      if (ts.isStringLiteral(node)) {
        replacement = ts.factory.createStringLiteral(
          migrateHtml(node.text),
          node.getText()[0] === `'`,
        );
      } else {
        replacement = ts.factory.createNoSubstitutionTemplateLiteral(migrateHtml(node.text));
      }
    } else {
      // Imports/exports should preserve the old name, but import the clusterer using the new one.
      const propertyName = ts.factory.createIdentifier(DEPRECATED_CLASS_NAME);
      const name = node.name as ts.Identifier;

      replacement = ts.isImportSpecifier(node)
        ? ts.factory.updateImportSpecifier(node, node.isTypeOnly, propertyName, name)
        : ts.factory.updateExportSpecifier(node, node.isTypeOnly, propertyName, name);
    }

    update
      .remove(node.getStart(), node.getWidth())
      .insertLeft(
        node.getStart(),
        printer.printNode(ts.EmitHint.Unspecified, replacement, sourceFile),
      );
  }

  tree.commitUpdate(update);
}

/** Finds the TypeScript nodes that need to be migrated from a specific file. */
function findTypeScriptNodesToMigrate(sourceFile: ts.SourceFile) {
  const results: (ts.StringLiteralLike | ts.ImportSpecifier | ts.ExportSpecifier)[] = [];

  sourceFile.forEachChild(function walk(node) {
    // Most likely a template using the clusterer.
    if (ts.isStringLiteral(node) && node.text.includes('<' + TAG_NAME)) {
      results.push(node);
    } else if (
      // Import/export referencing the clusterer.
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier) &&
      node.moduleSpecifier.text === MODULE_NAME
    ) {
      const bindings = ts.isImportDeclaration(node)
        ? node.importClause?.namedBindings
        : node.exportClause;

      if (bindings && (ts.isNamedImports(bindings) || ts.isNamedExports(bindings))) {
        bindings.elements.forEach(element => {
          const symbolName = element.propertyName || element.name;

          if (ts.isIdentifier(symbolName) && symbolName.text === CLASS_NAME) {
            results.push(element);
          }
        });
      }
    } else {
      node.forEachChild(walk);
    }
  });

  // Sort the results in reverse order to make applying the updates easier.
  return results.sort((a, b) => b.getStart() - a.getStart());
}
