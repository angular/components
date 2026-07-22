/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Service} from '@angular/core';
import type {FormGroupDirective, NgForm, AbstractControl} from '@angular/forms';
import type {Field} from '@angular/forms/signals';

/** Error state matcher that matches when a control is invalid and dirty. */
@Service({autoProvided: false})
export class ShowOnDirtyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.dirty || (form && form.submitted)));
  }

  isSignalErrorState(field: Field<unknown> | null): boolean {
    if (!field) {
      return false;
    }
    const invalid = field().invalid();
    const dirty = field().dirty();
    return invalid && dirty;
  }
}

/** Provider that defines how form controls behave with regards to displaying error messages. */
@Service()
export class ErrorStateMatcher {
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.touched || (form && form.submitted)));
  }

  isSignalErrorState?(field: Field<unknown> | null): boolean {
    if (!field) {
      return false;
    }
    const invalid = field().invalid();
    const touched = field().touched();
    return invalid && touched;
  }
}
