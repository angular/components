/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {extname} from '@angular-devkit/core';
import {DevkitMigration, ResolvedResource, TargetVersion} from '@angular/cdk/schematics';
import {migrateM2ThemingApiUsages} from './migration';

/** Migration that updates usages of the renamed M2 theming APIs in v18. */
export class M2ThemingMigration extends DevkitMigration<null> {
  private _potentialThemes: ResolvedResource[] = [];

  /** Whether to run this migration. */
  enabled = this.targetVersion === TargetVersion.V18;

  override visitStylesheet(stylesheet: ResolvedResource): void {
    if (
      extname(stylesheet.filePath) === '.scss' &&
      // Note: intended to also capture `@angular/material-experimental`.
      stylesheet.content.includes('@angular/material')
    ) {
      this._potentialThemes.push(stylesheet);
    }
  }

  override postAnalysis(): void {
    for (const theme of this._potentialThemes) {
      const migrated = migrateM2ThemingApiUsages(theme.content);

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
