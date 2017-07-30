/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';
import {FormGroupDirective, NgForm, NgControl} from '@angular/forms';

/** Injection token that can be used to specify the global error options. */
export const MD_ERROR_GLOBAL_OPTIONS = new InjectionToken<ErrorOptions>('md-error-global-options');

export type ErrorStateMatcher =
  (control: NgControl | null, form: FormGroupDirective | NgForm | null) => boolean;

export interface ErrorOptions {
  errorStateMatcher?: ErrorStateMatcher;
}

/** Returns whether control is invalid and is either touched or is a part of a submitted form. */
export const defaultErrorStateMatcher: ErrorStateMatcher = (control, form) => {
  return control ? !!(control.invalid && (control.touched || (form && form.submitted))) : false;
};

/** Returns whether control is invalid and is either dirty or is a part of a submitted form. */
export const showOnDirtyErrorStateMatcher: ErrorStateMatcher = (control, form) => {
  return control ? !!(control.invalid && (control.dirty || (form && form.submitted))) : false;
};
