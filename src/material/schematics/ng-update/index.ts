/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {chain, Rule, SchematicContext} from '@angular-devkit/schematics';
import {
  createMigrationSchematicRule,
  NullableDevkitMigration,
  TargetVersion,
} from '@angular/cdk/schematics';

import {materialUpgradeData} from './upgrade-data';
import {MatCoreMigration} from './migrations/mat-core-removal';
import {ExplicitSystemVariablePrefixMigration} from './migrations/explicit-system-variable-prefix';

const materialMigrations: NullableDevkitMigration[] = [
  MatCoreMigration,
  ExplicitSystemVariablePrefixMigration,
];

/** Entry point for the migration schematics with target of Angular Material v20 */
export function updateToV20(): Rule {
  return chain([
    createMigrationSchematicRule(
      TargetVersion.V20,
      materialMigrations,
      materialUpgradeData,
      onMigrationComplete,
    ),
    renameMdcTokens(),
    renameComponentTokens(),
  ]);
}

// Renames any CSS variables beginning with "--mdc-" to be "--mat-". These CSS variables
// refer to tokens that used to be derived from a mix of MDC and Angular. Now all the tokens
// are converged on being prefixed "--mat-".
function renameMdcTokens(): Rule {
  return tree => {
    tree.visit(path => {
      const content = tree.readText(path);
      const updatedContent = content.replace('--mdc-', '--mat-');
      tree.overwrite(path, updatedContent);
    });
  };
}

// Renames Angular Material component token CSS variables that were renamed so that the base
// component's name came first or otherwise renamed to match our terminology instead of MDC's.
function renameComponentTokens(): Rule {
  const tokenPrefixes = [
    {old: '--mat-circular-progress', replacement: '--mat-progress-spinner'},
    {old: '--mat-elevated-card', replacement: '--mat-card-elevated'},
    {old: '--mat-extended-fab', replacement: '--mat-fab-extended'},
    {old: '--mat-filled-button', replacement: '--mat-button-filled'},
    {old: '--mat-filled-text-field', replacement: '--mat-form-field-filled'},
    {old: '--mat-full-pseudo-checkbox', replacement: '--mat-pseudo-checkbox-full'},
    {old: '--mat-legacy-button-toggle', replacement: '--mat-button-toggle-legacy'},
    {old: '--mat-linear-progress', replacement: '--mat-progress-bar'},
    {old: '--mat-minimal-pseudo-checkbox', replacement: '--mat-pseudo-checkbox-minimal'},
    {old: '--mat-outlined-button', replacement: '--mat-button-outlined'},
    {old: '--mat-outlined-card', replacement: '--mat-card-outlined'},
    {old: '--mat-outlined-text-field', replacement: '--mat-form-field-outlined'},
    {old: '--mat-plain-tooltip', replacement: '--mat-tooltip'},
    {old: '--mat-protected-button', replacement: '--mat-button-protected'},
    {old: '--mat-secondary-navigation-tab', replacement: '--mat-tab'},
    {old: '--mat-standard-button-toggle', replacement: '--mat-button-toggle'},
    {old: '--mat-switch', replacement: '--mat-slide-toggle'},
    {old: '--mat-tab-header', replacement: '--mat-tab'},
    {old: '--mat-tab-header-with-background', replacement: '--mat-tab'},
    {old: '--mat-tab-indicator', replacement: '--mat-tab'},
    {old: '--mat-text-button', replacement: '--mat-button-text'},
    {old: '--mat-tonal-button', replacement: '--mat-button-tonal'},
  ];
  return tree => {
    tree.visit(path => {
      const content = tree.readText(path);
      let updatedContent = content;
      for (const tokenPrefix of tokenPrefixes) {
        updatedContent = updatedContent.replace(tokenPrefix.old, tokenPrefix.replacement);
      }
      if (content !== updatedContent) {
        tree.overwrite(path, updatedContent);
      }
    });
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
