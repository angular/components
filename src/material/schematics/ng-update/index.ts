/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {chain, Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {
  appendHtmlElementToHead,
  createMigrationSchematicRule,
  getProjectFromWorkspace,
  getProjectIndexFiles,
  getWorkspaceConfigGracefully,
  NullableDevkitMigration,
  TargetVersion,
} from '@angular/cdk/schematics';
import {getWorkspace} from '@schematics/angular/utility/workspace';

import {materialUpgradeData} from './upgrade-data';

const materialMigrations: NullableDevkitMigration[] = [];

/** Entry point for the migration schematics with target of Angular Material v20 */
export function updateToV20(): Rule {
  return chain([
    createMigrationSchematicRule(
      TargetVersion.V20,
      materialMigrations,
      materialUpgradeData,
      onMigrationComplete,
    ),
    // Updating to the new Material Symbols isn't a migration within materialMigrations since
    // the index files are never visited within the migration schematic rule. The
    // migrate() function within the update-tool only visits files referenced in
    // typescript files which excludes the index template files:
    // https://github.com/angular/components/blob/main/src/cdk/schematics/update-tool/index.ts#L71.
    updateIconFontToMaterialSymbolsRule(),
  ]);
}

/**
 * Finds the index files and adds the import for Material Symbols font if needed. As of v20,
 * Material Symbols becomes the default font icon since Material Icons is deprecated. This
 * rule ensures the Material Symbols font is imported for existing applications.
 * @returns Rule that adds the import for the Material Symbols icon font to the index files
 */
function updateIconFontToMaterialSymbolsRule(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await getWorkspaceConfigGracefully(tree);
    const projectNames = workspace!.projects.keys();

    let indexFiles: string[] = [];
    for (const projectName of projectNames) {
      const project = getProjectFromWorkspace(await getWorkspace(tree), projectName);
      indexFiles = [...indexFiles, ...getProjectIndexFiles(project)];
    }

    const materialSymbolsFont =
      'https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined';
    for (const indexFile of indexFiles) {
      // Add Material Symbols font if not imported in index file. References to the deprecated
      // Material Icons are not removed since some applications may have manual overrides in their
      // component styles that still reference it.
      if (!tree.read(indexFile)?.includes(materialSymbolsFont)) {
        appendHtmlElementToHead(
          tree,
          indexFile,
          `<link href="${materialSymbolsFont}" rel="stylesheet">`,
        );
      }
    }
  };
}

/** Function that will be called when the migration completed. */
function onMigrationComplete(
  context: SchematicContext,
  targetVersion: TargetVersion,
  hasFailures: boolean,
) {
  context.logger.info('');
  context.logger.info(`  ✓  Updated Angular Material to ${targetVersion}`);
  context.logger.info('');

  if (hasFailures) {
    context.logger.warn(
      '  ⚠  Some issues were detected but could not be fixed automatically. Please check the ' +
        'output above and fix these issues manually.',
    );
  }
}
