/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {FormGroupDirective, NgForm, NgControl} from '@angular/forms';

export type ErrorStateMatcher =
  (control: NgControl | null, form: FormGroupDirective | NgForm | null) => boolean;

/** Returns whether control is invalid and is either touched or is a part of a submitted form. */
export const defaultErrorStateMatcher: ErrorStateMatcher = (control, form) => {
  return control ? !!(control.invalid && (control.touched || (form && form.submitted))) : false;
};

/** Returns whether control is invalid and is either dirty or is a part of a submitted form. */
export const showOnDirtyErrorStateMatcher: ErrorStateMatcher = (control, form) => {
  return control ? !!(control.invalid && (control.dirty || (form && form.submitted))) : false;
};

/**
 * Provider that defines how form controls behave with
 * regards to displaying error messages.
 */
@Injectable()
export class ErrorOptions {
  errorStateMatcher: ErrorStateMatcher = defaultErrorStateMatcher;
}
