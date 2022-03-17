/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TmplAstElement} from '@angular/compiler';
import {TemplateMigrator} from '../../template-migrator';
import {addAttribute} from '../../tree-traversal';

export class CardTemplateMigrator extends TemplateMigrator {
  override preorder(node: TmplAstElement): void {
    if (node.name !== 'mat-card') {
      return;
    }

    this.updates.push({
      location: node.startSourceSpan.end,
      updateFn: html => addAttribute(html, node, 'appearance', 'outlined'),
    });
  }
}
