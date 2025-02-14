/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, InjectionToken, Input, inject} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';

/**
 * Injection token that can be used to reference instances of `MatError`. It serves as
 * alternative token to the actual `MatError` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_ERROR = new InjectionToken<MatError>('MatError');

/** Single error message to be shown underneath the form-field. */
@Directive({
  selector: 'mat-error, [matError]',
  host: {
    'class': 'mat-mdc-form-field-error mat-mdc-form-field-bottom-align',
    '[id]': 'id',
  },
  providers: [{provide: MAT_ERROR, useExisting: MatError}],
})
export class MatError {
  @Input() id: string = inject(_IdGenerator).getId('mat-mdc-error-');

  constructor(...args: unknown[]);

  constructor() {}
}
