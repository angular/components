/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';
import {FormControl, FormGroupDirective, Form, NgForm} from '@angular/forms';

/** Injection token that can be used to specify the global error options. */
export const MD_ERROR_GLOBAL_OPTIONS = new InjectionToken<ErrorOptions>('md-error-global-options');

export type ErrorStateMatcher =
    (control: FormControl, form: FormGroupDirective | NgForm) => boolean;

export interface ErrorOptions {
  errorStateMatcher?: ErrorStateMatcher;
}

export function defaultErrorStateMatcher(control: FormControl, form: FormGroupDirective | NgForm) {
  const isSubmitted = form && form.submitted;
  return !!(control.invalid && (control.touched || isSubmitted));
}

export function showOnDirtyErrorStateMatcher(control: FormControl,
    form: FormGroupDirective | NgForm) {
  const isSubmitted = form && form.submitted;
  return !!(control.invalid && (control.dirty || isSubmitted));
}
