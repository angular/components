/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CdkTreeKeyboardInteraction} from '@angular/cdk/tree';
import {Directive} from '@angular/core';

/**
 * Wrapper for keyboard interaction for Material design tree
 * @docs-private
 */
@Directive({
  selector: '[matTreeKeyboardInteraction]',
  host: {
    '(keydown)': '_handleKeydown($event)',
    'class': 'mat-tree-keyboard-interaction',
  },
  providers: [{provide: CdkTreeKeyboardInteraction, useExisting: MatTreeKeyboardInteraction}]
})
export class MatTreeKeyboardInteraction<T> extends CdkTreeKeyboardInteraction<T> {
}
