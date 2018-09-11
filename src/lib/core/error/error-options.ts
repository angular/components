/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defineInjectable, Injectable} from '@angular/core';
import {FormControl, FormGroupDirective, NgForm} from '@angular/forms';


/** Error state matcher that matches when a control is invalid and dirty. */
@Injectable()
export class ShowOnDirtyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.dirty || (form && form.submitted)));
  }
}

/**
 * Provider that defines how form controls behave with regards to displaying error messages.
 * @dynamic
 */
export class ErrorStateMatcher {
  // This is what the Angular compiler would generate for the @Injectable decorator. See #23917.
  /** @nocollapse */
  static ngInjectableDef = defineInjectable({
    providedIn: 'root',
    factory: () => new ErrorStateMatcher(),
  });

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.touched || (form && form.submitted)));
  }
}
