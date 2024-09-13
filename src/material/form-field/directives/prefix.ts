/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, InjectionToken, Input} from '@angular/core';

/**
 * Injection token that can be used to reference instances of `MatPrefix`. It serves as
 * alternative token to the actual `MatPrefix` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_PREFIX = new InjectionToken<MatPrefix>('MatPrefix');

/** Prefix to be placed in front of the form field. */
@Directive({
  selector: '[matPrefix], [matIconPrefix], [matTextPrefix]',
  providers: [{provide: MAT_PREFIX, useExisting: MatPrefix}],
  standalone: true,
})
export class MatPrefix {
  @Input('matTextPrefix')
  set _isTextSelector(value: '') {
    this._isText = true;
  }

  _isText = false;
}
