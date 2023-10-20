/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {extname} from '@angular-devkit/core';
import {SchematicContext} from '@angular-devkit/schematics';
import {DevkitMigration, ResolvedResource, TargetVersion} from '@angular/cdk/schematics';
import {addThemeBaseMixins, checkThemeBaseMixins} from './migration';

/** Adds an @include for theme base mixins that aren't already included by the app. */
export class ThemeBaseMigration extends DevkitMigration<null> {
  /** Number of files that have been migrated. */
  static migratedFileCount = 0;

  /** All base mixins that we have found an existing @include for. */
  static foundBaseMixins = new Set<string>();

  /** All base mixins that appear to be missing an @include. */
  static missingBaseMixins = new Set<string>();

  /** Whether to run this migration. */
  enabled = this.targetVersion === TargetVersion.V17;

  /**
   * All Sass stylesheets visited. (We save a record, so we can go back through them in the
   * `postAnalysis` phase).
   */
  visitedSassStylesheets: ResolvedResource[] = [];

  /**
   * Visit each stylesheet, noting which base mixins are accounted for (because the user is calling
   * `mat.<component>-theme()`), and which ones are missing (because the user is calling one of the
   * theme-partial mixins: `mat.<component-color>()`, `mat.<component>-typography()`,
   * or `mat.<component>-density()`.
   *
   * We don't make any modifications at this point. Instead, the results of visiting each stylesheet
   * are aggregated into a static variable which is used to determine which mixins to add in
   * `postAnalysis` phase.
   */
  override visitStylesheet(stylesheet: ResolvedResource): void {
    if (extname(stylesheet.filePath) === '.scss') {
      this.visitedSassStylesheets.push(stylesheet);

      const content = stylesheet.content;
      const {found, missing} = checkThemeBaseMixins(content);
      for (const mixin of found) {
        ThemeBaseMigration.foundBaseMixins.add(mixin);
        ThemeBaseMigration.missingBaseMixins.delete(mixin);
      }
      for (const mixin of missing) {
        if (!ThemeBaseMigration.foundBaseMixins.has(mixin)) {
          ThemeBaseMigration.missingBaseMixins.add(mixin);
        }
      }
    }
  }

  /**
   * Perform the necessary updates detected while visiting the stylesheets. The
   * `mat.<component>-base()` mixins behave similarly to `mat.core()`, in that they needed to be
   * included once globally. So we locate calls to `mat.core()` and add the missing mixins
   * identified by earlier at these locations.
   */
  override postAnalysis() {
    // If we're not missing any mixins, there's nothing to migrate.
    if (ThemeBaseMigration.missingBaseMixins.size === 0) {
      return;
    }
    // If we have all-component-bases, we don't need any others and there is nothing to migrate.
    if (ThemeBaseMigration.foundBaseMixins.has('all-component-bases')) {
      return;
    }
    // If we're missing all-component-bases, we just need to add it, not the individual mixins.
    if (ThemeBaseMigration.missingBaseMixins.has('all-component-bases')) {
      ThemeBaseMigration.missingBaseMixins = new Set(['all-component-bases']);
    }
    for (const stylesheet of this.visitedSassStylesheets) {
      const content = stylesheet.content;
      const migratedContent = content
        ? addThemeBaseMixins(content, ThemeBaseMigration.missingBaseMixins)
        : content;

      if (migratedContent && migratedContent !== content) {
        this.fileSystem
          .edit(stylesheet.filePath)
          .remove(0, stylesheet.content.length)
          .insertLeft(0, migratedContent);
        ThemeBaseMigration.migratedFileCount++;
      }
    }
    if (ThemeBaseMigration.migratedFileCount === 0) {
      const mixinsText = [...ThemeBaseMigration.missingBaseMixins]
        .sort()
        .map(m => `mat.${m}($theme)`)
        .join('\n');
      this.failures.push({
        filePath: this.context.tree.root.path,
        message:
          `The following mixins could not be automatically added, please add them manually` +
          ` if needed:\n${mixinsText}`,
      });
    }
  }

  /** Logs out the number of migrated files at the end of the migration. */
  static override globalPostMigration(
    _tree: unknown,
    _targetVersion: TargetVersion,
    context: SchematicContext,
  ): void {
    const fileCount = ThemeBaseMigration.migratedFileCount;
    const mixinCount = ThemeBaseMigration.missingBaseMixins.size;

    if (fileCount > 0 && mixinCount > 0) {
      const fileCountText = fileCount === 1 ? '1 file' : `${fileCount} files`;
      const mixinCountText =
        mixinCount === 1 ? '1 theme base mixin' : `${mixinCount} theme base mixins`;
      context.logger.info(
        `Added ${mixinCountText} to ${fileCountText}.` +
          ' Please search for, and address, any "TODO(v17)" comments.',
      );
    }

    // Reset to avoid leaking between tests.
    ThemeBaseMigration.migratedFileCount = 0;
    ThemeBaseMigration.missingBaseMixins = new Set();
    ThemeBaseMigration.foundBaseMixins = new Set();
  }
}
