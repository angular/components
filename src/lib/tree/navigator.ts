/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CdkTreeNavigator} from '@angular/cdk/tree';
import {Directive} from '@angular/core';

/**
 * Wrapper for keyboard navigator for Material design tree
 */
@Directive({
  selector: '[matTreeNavigator]',
  host: {
    '(keydown)': '_handleKeydown($event)',
    'class': 'mat-tree-navigator',
  },
  providers: [{provide: CdkTreeNavigator, useExisting: MatTreeNavigator}]
})
export class MatTreeNavigator<T> extends CdkTreeNavigator<T> {
}
