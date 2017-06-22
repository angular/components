/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';
import {NgControl, FormGroupDirective, NgForm} from '@angular/forms';

/** Injection token that can be used to specify the global error options. */
export const MD_ERROR_GLOBAL_OPTIONS =
  new InjectionToken<ErrorOptions>('md-error-global-options');

export type ErrorStateMatcher =
  (control: NgControl, parentFormGroup: FormGroupDirective, parentForm: NgForm) => boolean;

export interface ErrorOptions {
  errorStateMatcher?: ErrorStateMatcher;
}

export class DefaultErrorStateMatcher {

  errorStateMatcher(control: NgControl, formGroup: FormGroupDirective, form: NgForm): boolean {
    const isInvalid = control && control.invalid;
    const isTouched = control && control.touched;
    const isSubmitted = (formGroup && formGroup.submitted) ||
        (form && form.submitted);

    return !!(isInvalid && (isTouched || isSubmitted));
  }
}

export class ShowOnDirtyErrorStateMatcher {

  errorStateMatcher(control: NgControl, formGroup: FormGroupDirective, form: NgForm): boolean {
    const isInvalid = control && control.invalid;
    const isDirty = control && control.dirty;
    const isSubmitted = (formGroup && formGroup.submitted) ||
        (form && form.submitted);

    return !!(isInvalid && (isDirty || isSubmitted));
  }
}
