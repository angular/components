/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule} from '@angular-devkit/schematics';
import {createUpgradeRule, TargetVersion} from '@angular/cdk/schematics';
import {green, yellow} from 'chalk';

import {materialUpgradeData} from './upgrade-data';
import {MiscClassInheritanceRule} from './upgrade-rules/misc-checks/misc-class-inheritance-rule';
import {MiscClassNamesRule} from './upgrade-rules/misc-checks/misc-class-names-rule';
import {MiscImportsRule} from './upgrade-rules/misc-checks/misc-imports-rule';
import {MiscPropertyNamesRule} from './upgrade-rules/misc-checks/misc-property-names-rule';
import {MiscTemplateRule} from './upgrade-rules/misc-checks/misc-template-rule';
import {RippleSpeedFactorRule} from './upgrade-rules/misc-ripples-v7/ripple-speed-factor-rule';
import {
  SecondaryEntryPointsRule
} from './upgrade-rules/package-imports-v8/secondary-entry-points-rule';

const materialMigrationRules = [
  MiscClassInheritanceRule,
  MiscClassNamesRule,
  MiscImportsRule,
  MiscPropertyNamesRule,
  MiscTemplateRule,
  RippleSpeedFactorRule,
  SecondaryEntryPointsRule,
];

/** Entry point for the migration schematics with target of Angular Material v6 */
export function updateToV6(): Rule {
  return createUpgradeRule(
      TargetVersion.V6, materialMigrationRules, materialUpgradeData, onMigrationComplete);
}

/** Entry point for the migration schematics with target of Angular Material v7 */
export function updateToV7(): Rule {
  return createUpgradeRule(
      TargetVersion.V7, materialMigrationRules, materialUpgradeData, onMigrationComplete);
}

/** Entry point for the migration schematics with target of Angular Material v8 */
export function updateToV8(): Rule {
  return createUpgradeRule(
      TargetVersion.V8, materialMigrationRules, materialUpgradeData, onMigrationComplete);
}

/** Function that will be called when migration completed. */
export function onMigrationComplete() {
  console.log();
  console.log(green('  ✓  Angular Material update complete'));
  console.log();
  console.log(yellow(
      '  ⚠  Please check the output above for any issues that were detected ' +
      'but could not be automatically fixed.'));
}
