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
  const replacements = [
    {oldStr: '--mat-circular-progress', newStr: '--mat-progress-spinner'},
    {oldStr: '--mat-elevated-card', newStr: '--mat-card-elevated'},
    {oldStr: '--mat-extended-fab', newStr: '--mat-fab-extended'},
    {oldStr: '--mat-filled-button', newStr: '--mat-button-filled'},
    {oldStr: '--mat-filled-text-field', newStr: '--mat-form-field-filled'},
    {oldStr: '--mat-full-pseudo-checkbox', newStr: '--mat-pseudo-checkbox-full'},
    {oldStr: '--mat-legacy-button-toggle', newStr: '--mat-button-toggle-legacy'},
    {oldStr: '--mat-linear-progress', newStr: '--mat-progress-bar'},
    {oldStr: '--mat-minimal-pseudo-checkbox', newStr: '--mat-pseudo-checkbox-minimal'},
    {oldStr: '--mat-outlined-button', newStr: '--mat-button-outlined'},
    {oldStr: '--mat-outlined-card', newStr: '--mat-card-outlined'},
    {oldStr: '--mat-outlined-text-field', newStr: '--mat-form-field-outlined'},
    {oldStr: '--mat-plain-tooltip', newStr: '--mat-tooltip'},
    {oldStr: '--mat-protected-button', newStr: '--mat-button-protected'},
    {oldStr: '--mat-secondary-navigation-tab', newStr: '--mat-tab'},
    {oldStr: '--mat-standard-button-toggle', newStr: '--mat-button-toggle'},
    {oldStr: '--mat-switch', newStr: '--mat-slide-toggle'},
    {oldStr: '--mat-tab-header', newStr: '--mat-tab'},
    {oldStr: '--mat-tab-header-with-background', newStr: '--mat-tab'},
    {oldStr: '--mat-tab-indicator', newStr: '--mat-tab'},
    {oldStr: '--mat-text-button', newStr: '--mat-button-text'},
    {oldStr: '--mat-tonal-button', newStr: '--mat-button-tonal'},
  ];
  return tree => {
    tree.visit(path => {
      const content = tree.readText(path);
      let updatedContent = content;
      for (const replacement of replacements) {
        updatedContent = updatedContent.replace(replacement.oldStr, replacement.newStr);
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
