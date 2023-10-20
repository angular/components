/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext} from '@angular-devkit/schematics';
import {
  createMigrationSchematicRule,
  NullableDevkitMigration,
  TargetVersion,
} from '@angular/cdk/schematics';

import {materialUpgradeData} from './upgrade-data';
import {ThemeBaseMigration} from './migrations/theme-base-v17';

const materialMigrations: NullableDevkitMigration[] = [ThemeBaseMigration];

/** Entry point for the migration schematics with target of Angular Material v17 */
export function updateToV17(): Rule {
  return createMigrationSchematicRule(
    TargetVersion.V17,
    materialMigrations,
    materialUpgradeData,
    onMigrationComplete,
  );
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
