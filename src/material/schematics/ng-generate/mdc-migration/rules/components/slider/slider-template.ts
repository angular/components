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

export class SliderTemplateMigrator extends TemplateMigrator {
  getUpdates(ast: compiler.ParsedTemplate): Update[] {
    const updates: Update[] = [];

    visitElements(ast.nodes, (node: compiler.TmplAstElement) => {
      if (node.name === 'mat-slider') {
        updates.push({
          offset: node.sourceSpan.start.offset,
          updateFn: (html: string) => html,
        });
      }
    });
    return updates;
  }
}
