/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CdkTreeNavigator} from '@angular/cdk-experimental/tree';
import {Directive} from '@angular/core';
import {MatTree} from './tree';

/**
 * Outlet for nested CdkNode. Put `[matTreeNodeOutlet]` on a tag to place children dataNodes
 * inside the outlet.
 */
@Directive({
  selector: '[matTreeNavigator]',
  host: {
    '(keydown)': '_handleKeydown($event)'
  }
})
export class MatTreeNavigator<T> extends CdkTreeNavigator<T> {
  constructor(protected _tree: MatTree<T>) {
    super(_tree);
  }
}
