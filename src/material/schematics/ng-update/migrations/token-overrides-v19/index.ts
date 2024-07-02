/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {extname} from '@angular-devkit/core';
import {DevkitMigration, ResolvedResource, TargetVersion} from '@angular/cdk/schematics';
import {migrateTokenOverridesUsages} from './migration';

/** Migration that updates usages of the token overrides APIs in v19. */
export class TokenOverridesMigration extends DevkitMigration<null> {
  private _potentialThemes: ResolvedResource[] = [];

  /** Whether to run this migration. */
  enabled = this.targetVersion === TargetVersion.V19;

  override visitStylesheet(stylesheet: ResolvedResource): void {
    if (
      extname(stylesheet.filePath) === '.scss' &&
      // Note: intended to exclude `@angular/material-experimental`.
      stylesheet.content.match(/@angular\/material["']/)
    ) {
      this._potentialThemes.push(stylesheet);
    }
  }

  override postAnalysis(): void {
    for (const theme of this._potentialThemes) {
      const migrated = migrateTokenOverridesUsages(theme.content);

      if (migrated !== theme.content) {
        this.fileSystem
          .edit(theme.filePath)
          .remove(0, theme.content.length)
          .insertLeft(0, migrated);
        this.fileSystem.commitEdits();
      }
    }
  }
}
