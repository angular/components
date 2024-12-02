/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as postcss from 'postcss';
import * as scss from 'postcss-scss';
import {
  DevkitContext,
  Migration,
  ResolvedResource,
  UpgradeData,
  WorkspacePath,
} from '@angular/cdk/schematics';

export class MatCoreMigration extends Migration<UpgradeData, DevkitContext> {
  override enabled = true;
  private _namespace: string | undefined;

  override init() {
    // TODO: Check if mat-app-background is used in the application.
  }

  override visitStylesheet(stylesheet: ResolvedResource): void {
    try {
      const processor = new postcss.Processor([
        {
          postcssPlugin: 'mat-core-removal-v19-plugin',
          AtRule: {
            use: node => this._getNamespace(node),
            include: node => this._handleAtInclude(node, stylesheet.filePath),
          },
        },
      ]);
      processor.process(stylesheet.content, {syntax: scss}).sync();
    } catch (e) {
      this.logger.warn(
        `Failed to migrate usages of mat.core in ${stylesheet.filePath} due to error:`,
      );
      this.logger.warn(e + '');
    }
  }

  /** Handles updating the at-include rules of uses of the core mixin. */
  private _handleAtInclude(node: postcss.AtRule, filePath: WorkspacePath): void {
    if (!this._namespace || !node.source?.start || !node.source.end) {
      return;
    }

    if (this._isMatCoreMixin(node)) {
      const end = node.source.end.offset;
      const start = node.source.start.offset;

      const prefix = '\n' + (node.raws.before?.split('\n').pop() || '');
      const snippet = prefix + node.source.input.css.slice(start, end);

      const elevation = prefix + `@include ${this._namespace}.elevation-classes();`;
      const background = prefix + `@include ${this._namespace}.app-background();`;

      this._replaceAt(filePath, node.source.start.offset - prefix.length, {
        old: snippet,
        new: elevation + background,
      });
    }
  }

  /** Returns true if the given at-rule is a use of the core mixin. */
  private _isMatCoreMixin(node: postcss.AtRule): boolean {
    if (node.params.startsWith(`${this._namespace}.core`)) {
      return true;
    }
    return false;
  }

  /** Sets the namespace if the given at-rule if it is importing from @angular/material. */
  private _getNamespace(node: postcss.AtRule): void {
    if (!this._namespace && node.params.startsWith('@angular/material', 1)) {
      this._namespace = node.params.split(/\s+/)[2] || 'material';
    }
  }

  /** Updates the source file with the given replacements. */
  private _replaceAt(
    filePath: WorkspacePath,
    offset: number,
    str: {old: string; new: string},
  ): void {
    const index = this.fileSystem.read(filePath)!.indexOf(str.old, offset);
    this.fileSystem.edit(filePath).remove(index, str.old.length).insertRight(index, str.new);
  }
}
