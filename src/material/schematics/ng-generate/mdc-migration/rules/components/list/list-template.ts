/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as compiler from '@angular/compiler';
import {TemplateMigrator} from '../../template-migrator';
import {replaceAttribute, visitElements} from '../../tree-traversal';
import {Update} from '../../../../../migration-utilities';

export class ListTemplateMigrator extends TemplateMigrator {
  getUpdates(ast: compiler.ParsedTemplate): Update[] {
    const updates: Update[] = [];
    visitElements(ast.nodes, (node: compiler.TmplAstElement) => {
      if (node.name !== 'mat-list-item') {
        return;
      }

      let hasMatLine = false;
      // The order of traversing the attributes is important since
      // 'matListItemTitle' replaces only the first 'mat-line', the attributes
      // aren't in the right order and need to be reversed to be correct.
      visitElements(node.children.reverse(), (childNode: compiler.TmplAstElement) => {
        childNode.attributes.forEach(attribute => {
          let attributeReplacement: {old: string; new: string} | undefined;
          // Each attribute has two different selectors
          switch (attribute.name) {
            case 'mat-list-icon':
              attributeReplacement = {old: 'mat-list-icon', new: 'matListItemIcon'};
              break;
            case 'matListIcon':
              attributeReplacement = {old: 'matListIcon', new: 'matListItemIcon'};
              break;
            case 'mat-list-avatar':
              attributeReplacement = {old: 'mat-list-avatar', new: 'matListItemAvatar'};
              break;
            case 'matListAvatar':
              attributeReplacement = {old: 'matListAvatar', new: 'matListItemAvatar'};
              break;
            case 'mat-line':
              attributeReplacement = {
                old: 'mat-line',
                new: hasMatLine ? 'matListItemLine' : 'matListItemTitle',
              };
              if (!hasMatLine) {
                hasMatLine = true;
              }
              break;
            case 'matLine':
              attributeReplacement = {
                old: 'matLine',
                new: hasMatLine ? 'matListItemLine' : 'matListItemTitle',
              };
              if (!hasMatLine) {
                hasMatLine = true;
              }
              break;
          }
          if (attributeReplacement) {
            updates.push({
              offset: childNode.startSourceSpan.start.offset,
              updateFn: html =>
                replaceAttribute(
                  html,
                  childNode,
                  attributeReplacement!.old,
                  attributeReplacement!.new,
                  null,
                ),
            });
          }
        });
      });
    });

    return updates;
  }
}
