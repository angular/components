/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';
import * as ts from 'typescript';

/** String with which legacy imports start. */
const LEGACY_IMPORTS_START = '@angular/material/legacy-';

/** Maximum files to print in the error message. */
const MAX_FILES_TO_PRINT = 50;

/**
 * "Migration" that logs an error and prevents further migrations
 * from running if the project is using legacy components.
 * @param onSuccess Rule to run if there are no legacy imports.
 */
export function legacyImportsError(onSuccess: Rule): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const filesUsingLegacyImports = new Set<string>();

    tree.visit(path => {
      if (path.includes('node_modules') || path.endsWith('.d.ts') || !path.endsWith('.ts')) {
        return;
      }

      const content = tree.readText(path);

      // Skip over any files that definitely cannot contain the legacy imports.
      if (!content.includes(LEGACY_IMPORTS_START)) {
        return;
      }

      const sourceFile = ts.createSourceFile(path, content, ts.ScriptTarget.Latest);

      // Only check top-level imports/exports.
      for (const statement of sourceFile.statements) {
        if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) {
          continue;
        }

        if (
          statement.moduleSpecifier &&
          ts.isStringLiteralLike(statement.moduleSpecifier) &&
          statement.moduleSpecifier.text.startsWith(LEGACY_IMPORTS_START)
        ) {
          filesUsingLegacyImports.add(path);
        }
      }
    });

    // If there are no legacy imports left, we can continue with the migrations.
    if (filesUsingLegacyImports.size === 0) {
      return onSuccess;
    }

    // At this point the project is already at v17 so we need to downgrade it back
    // to v16 and run `npm install` again. Ideally we would also throw an error here
    // to interrupt the update process, but that would interrupt `npm install` as well.
    if (tree.exists('package.json')) {
      let packageJson: Record<string, any> | null = null;

      try {
        packageJson = JSON.parse(tree.readText('package.json')) as Record<string, any>;
      } catch {}

      if (packageJson !== null && packageJson['dependencies']) {
        packageJson['dependencies']['@angular/material'] = '^16.2.0';
        tree.overwrite('package.json', JSON.stringify(packageJson, null, 2));
        context.addTask(new NodePackageInstallTask());
      }
    }

    context.logger.fatal(formatErrorMessage(filesUsingLegacyImports));
    return;
  };
}

function formatErrorMessage(filesUsingLegacyImports: Set<string>): string {
  const files = Array.from(filesUsingLegacyImports, path => ' - ' + path);
  const filesMessage =
    files.length > MAX_FILES_TO_PRINT
      ? [
          ...files.slice(0, MAX_FILES_TO_PRINT),
          `${files.length - MAX_FILES_TO_PRINT} more...`,
          `Search your project for "${LEGACY_IMPORTS_START}" to view all usages.`,
        ].join('\n')
      : files.join('\n');

  return (
    `Cannot update to Angular Material v17 because the project is using the legacy ` +
    `Material components\nthat have been deleted. While Angular Material v16 is compatible with ` +
    `Angular v17, it is recommended\nto switch away from the legacy components as soon as possible ` +
    `because they no longer receive bug fixes,\naccessibility improvements and new features.\n\n` +
    `Read more about migrating away from legacy components: https://material.angular.io/guide/mdc-migration\n\n` +
    `Files in the project using legacy Material components:\n${filesMessage}\n`
  );
}
