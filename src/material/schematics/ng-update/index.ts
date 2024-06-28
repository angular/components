/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext} from '@angular-devkit/schematics';
import {
  NullableDevkitMigration,
  TargetVersion,
  createMigrationSchematicRule,
} from '@angular/cdk/schematics';

import {M2ThemingMigration} from './migrations/m2-theming-v18';
import {TokenOverridesMigration} from './migrations/token-overrides-v19';
import {materialUpgradeData} from './upgrade-data';

const materialMigrationsV18: NullableDevkitMigration[] = [M2ThemingMigration];
const materialMigrationsV19: NullableDevkitMigration[] = [TokenOverridesMigration];

/** Entry point for the migration schematics with target of Angular Material v18 */
export function updateToV18(): Rule {
  return createMigrationSchematicRule(
    TargetVersion.V18,
    materialMigrationsV18,
    materialUpgradeData,
    onMigrationComplete,
  );
}

/** Entry point for the migration schematics with target of Angular Material v19 */
export function updateToV19(): Rule {
  return createMigrationSchematicRule(
    TargetVersion.V19,
    materialMigrationsV19,
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
