/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbstractControl, FormGroupDirective, NgControl, NgForm} from '@angular/forms';
import {Subject} from 'rxjs';
import {ErrorStateMatcher as _ErrorStateMatcher} from '../error/error-options';

// Declare ErrorStateMatcher as an interface to have compatibility with Closure Compiler.
interface ErrorStateMatcher extends _ErrorStateMatcher {}

/**
 * Class that tracks the error state of a component.
 * @nodoc
 */
export class _ErrorStateTracker {
  /** Whether the tracker is currently in an error state. */
  errorState = false;

  /** User-defined matcher for the error state. */
  matcher: ErrorStateMatcher;

  constructor(
    private _defaultMatcher: ErrorStateMatcher | null,
    public ngControl: NgControl | null,
    private _parentFormGroup: FormGroupDirective | null,
    private _parentForm: NgForm | null,
    private _stateChanges: Subject<void>,
  ) {}

  /** Updates the error state based on the provided error state matcher. */
  updateErrorState() {
    const oldState = this.errorState;
    const parent = this._parentFormGroup || this._parentForm;
    const matcher = this.matcher || this._defaultMatcher;
    const control = this.ngControl ? (this.ngControl.control as AbstractControl) : null;
    const newState = matcher?.isErrorState(control, parent) ?? false;

    if (newState !== oldState) {
      this.errorState = newState;
      this._stateChanges.next();
    }
  }
}
