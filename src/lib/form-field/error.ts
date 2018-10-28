/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input} from '@angular/core';


let nextUniqueId = 0;


/** Single error message to be shown underneath the form field. */
@Directive({
  selector: 'mat-error',
  host: {
    'class': 'mat-error',
    'role': 'alert',
    '[attr.id]': 'id',
  }
})
export class MatError {
  /**
   * Element ID of the dialog title HTML element. If no ID is specified,
   * one is being generated automatically on instantiation.
   */
  @Input() id: string = `mat-error-${nextUniqueId++}`;
}
