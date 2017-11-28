/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input} from '@angular/core';
import {CdkTreeNodeTrigger} from '@angular/cdk/tree';

/**
 * Wrapper for the CdkTree's trigger with Material design styles.
 */
@Directive({
  selector: '[matTreeNodeTrigger]',
  host: {
    '(click)': '_trigger($event)',
  },
  providers: [{provide: CdkTreeNodeTrigger, useExisting: MatTreeNodeTrigger}]
})
export class MatTreeNodeTrigger<T> extends CdkTreeNodeTrigger<T> {
  @Input('matTreeNodeTriggerRecursive') recursive: boolean = true;
}
