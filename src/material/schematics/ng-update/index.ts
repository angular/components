/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {chain, Rule} from '@angular-devkit/schematics';
import {
  createMigrationSchematicRule,
  NullableDevkitMigration,
  TargetVersion,
} from '@angular/cdk/schematics';

import {materialUpgradeData} from './upgrade-data';

const materialMigrations: NullableDevkitMigration[] = [];

/** Entry point for the migration schematics with target of Angular Material v21 */
export function updateToV21(): Rule {
  return chain([
    createMigrationSchematicRule(TargetVersion.V21, materialMigrations, materialUpgradeData),
  ]);
}
