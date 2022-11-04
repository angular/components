/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as compiler from '@angular/compiler';
import {TemplateMigrator} from '../../template-migrator';
import {visitElements} from '../../tree-traversal';
import {Update} from '../../../../../migration-utilities';
import {RENAMED_TYPOGRAPHY_CLASSES} from './constants';

export class TypographyHierarchyTemplateMigrator extends TemplateMigrator {
  getUpdates(ast: compiler.ParsedTemplate): Update[] {
    const updates: Update[] = [];

    visitElements(ast.nodes, node => {
      this._addStaticClassUpdates(node, updates);
      this._addClassBindingUpdates(node, updates);
    });

    return updates;
  }

  /** Migrates the legacy typography classes in a static `class` attribute. */
  private _addStaticClassUpdates(node: compiler.TmplAstElement, updates: Update[]): void {
    const classAttr = node.attributes.find(attr => attr.name === 'class');

    if (classAttr && classAttr.keySpan && classAttr.valueSpan && classAttr.value.includes('mat-')) {
      const classes = classAttr.value.split(' ');
      let hasChanged = false;

      classes.forEach((current, index) => {
        if (RENAMED_TYPOGRAPHY_CLASSES.has(current)) {
          hasChanged = true;
          classes[index] = RENAMED_TYPOGRAPHY_CLASSES.get(current)!;
        }
      });

      if (hasChanged) {
        updates.push({
          offset: classAttr.keySpan.start.offset,
          updateFn: html =>
            html.slice(0, classAttr.valueSpan!.start.offset) +
            classes.join(' ') +
            html.slice(classAttr.valueSpan!.end.offset),
        });
      }
    }
  }

  /** Migrates the legacy typography classes in `[class.x]` bindings. */
  private _addClassBindingUpdates(node: compiler.TmplAstElement, updates: Update[]): void {
    node.inputs.forEach(input => {
      if (input.type === compiler.BindingType.Class && RENAMED_TYPOGRAPHY_CLASSES.has(input.name)) {
        updates.push({
          offset: input.keySpan.start.offset,
          updateFn: html => {
            return (
              html.slice(0, input.keySpan.start.offset) +
              'class.' +
              RENAMED_TYPOGRAPHY_CLASSES.get(input.name)! +
              html.slice(input.keySpan.end.offset)
            );
          },
        });
      }
    });
  }
}
