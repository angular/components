/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';
import {FormGroupDirective, NgForm, AbstractControl} from '@angular/forms';

/** Error state matcher that matches when a control is invalid and dirty. */
@Injectable()
export class ShowOnDirtyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.dirty || (form && form.submitted)));
  }
}

/** Provider that defines how form controls behave with regards to displaying error messages. */
@Injectable({providedIn: 'root'})
export class ErrorStateMatcher {
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.touched || (form && form.submitted)));
  }
}
