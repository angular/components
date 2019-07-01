/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule} from '@angular-devkit/schematics';
import {green, yellow} from 'chalk';
import {TargetVersion} from '../update-tool/target-version';
import {cdkUpgradeData} from './upgrade-data';
import {createUpgradeRule} from './upgrade-rules';

/** Entry point for the migration schematics with target of Angular Material 6.0.0 */
export function updateToV6(): Rule {
  return createUpgradeRule(TargetVersion.V6, [], cdkUpgradeData, onMigrationComplete);
}

/** Entry point for the migration schematics with target of Angular Material 7.0.0 */
export function updateToV7(): Rule {
  return createUpgradeRule(TargetVersion.V7, [], cdkUpgradeData, onMigrationComplete);
}

/** Entry point for the migration schematics with target of Angular Material 8.0.0 */
export function updateToV8(): Rule {
  return createUpgradeRule(TargetVersion.V8, [], cdkUpgradeData, onMigrationComplete);
}

/** Function that will be called when migration completed. */
function onMigrationComplete() {
  console.log();
  console.log(green('  ✓  Angular CDK update complete'));
  console.log();
  console.log(yellow(
      '  ⚠  Please check the output above for any issues that were detected ' +
      'but could not be automatically fixed.'));
}
