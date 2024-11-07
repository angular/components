/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DevkitContext, Migration, ResolvedResource, UpgradeData} from '@angular/cdk/schematics';

/**
 * Migration that adds `system-variables-prefix` to apps that have `use-system-variables` enabled.
 */
export class ExplicitSystemVariablePrefixMigration extends Migration<UpgradeData, DevkitContext> {
  override enabled = true;

  override visitStylesheet(stylesheet: ResolvedResource): void {
    if (!stylesheet.filePath.endsWith('.scss')) {
      return;
    }

    const content = this.fileSystem.read(stylesheet.filePath);
    if (!content || !content.includes('@angular/material')) {
      return;
    }

    const changes = this._getChanges(content);

    if (changes.length > 0) {
      const update = this.fileSystem.edit(stylesheet.filePath);

      for (let i = changes.length - 1; i > -1; i--) {
        update.insertRight(changes[i].start, changes[i].text);
      }

      this.fileSystem.commitEdits();
    }
  }

  /** Gets the changes that should be applied to a file. */
  private _getChanges(content: string) {
    const key = 'use-system-variables';
    const prefixKey = 'system-variables-prefix';
    const changes: {start: number; text: string}[] = [];
    let index = content.indexOf(key);

    // Note: this migration is a bit rudimentary, because Sass doesn't expose a proper AST.
    while (index > -1) {
      const colonIndex = content.indexOf(':', index);
      const valueEnd = colonIndex === -1 ? -1 : this._getValueEnd(content, colonIndex);

      if (valueEnd === -1) {
        index = content.indexOf(key, index + key.length);
        continue;
      }

      const value = content.slice(colonIndex + 1, valueEnd + 1).trim();
      if (value.startsWith('true') && !this._hasSystemPrefix(content, index, prefixKey)) {
        changes.push({
          start: this._getInsertIndex(content, valueEnd),
          text: `${value.endsWith(',') ? '' : ','}\n    ${prefixKey}: sys,`,
        });
      }

      index = content.indexOf(key, valueEnd);
    }

    return changes;
  }

  /**
   * Gets the end index of a Sass map key.
   * @param content Content of the file.
   * @param startIndex Index at which to start the search.
   */
  private _getValueEnd(content: string, startIndex: number): number {
    for (let i = startIndex + 1; i < content.length; i++) {
      const char = content[i];

      if (char === ',' || char === '\n' || char === ')') {
        return i;
      }
    }

    return -1;
  }

  /**
   * Gets the index at which to insert the migrated content.
   * @param content Initial file content.
   * @param valueEnd Index at which the value of the system variables opt-in ends.
   */
  private _getInsertIndex(content: string, valueEnd: number): number {
    for (let i = valueEnd; i < content.length; i++) {
      if (content[i] === '\n') {
        return i;
      } else if (content[i] === ')') {
        return i;
      }
    }

    return valueEnd;
  }

  /**
   * Determines if a map that enables system variables is using system variables already.
   * @param content Full file contents.
   * @param keyIndex Index at which the systems variable key is defined.
   * @param prefixKey Name of the key that defines the prefix.
   */
  private _hasSystemPrefix(content: string, keyIndex: number, prefixKey: string): boolean {
    // Note: technically this can break if there are other inline maps, but it should be rare.
    const mapEnd = content.indexOf(')', keyIndex);

    if (mapEnd > -1) {
      for (let i = keyIndex; i > -1; i--) {
        if (content[i] === '(') {
          return content.slice(i, mapEnd).includes(prefixKey);
        }
      }
    }

    return false;
  }
}
