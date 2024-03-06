/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbstractControl, FormGroupDirective, NgControl, NgForm} from '@angular/forms';
import {Subject} from 'rxjs';
import {ErrorStateMatcher as _ErrorStateMatcher} from '../error/error-options';
import {AbstractConstructor, Constructor} from './constructor';

// Declare ErrorStateMatcher as an interface to have compatibility with Closure Compiler.
interface ErrorStateMatcher extends _ErrorStateMatcher {}

/**
 * @docs-private
 * @deprecated Will be removed together with `mixinErrorState`.
 * @breaking-change 19.0.0
 */
export interface CanUpdateErrorState {
  /** Updates the error state based on the provided error state matcher. */
  updateErrorState(): void;
  /** Whether the component is in an error state. */
  errorState: boolean;
  /** An object used to control the error state of the component. */
  errorStateMatcher: ErrorStateMatcher;
}

type CanUpdateErrorStateCtor = Constructor<CanUpdateErrorState> &
  AbstractConstructor<CanUpdateErrorState>;

/** @docs-private */
interface HasErrorState {
  _parentFormGroup: FormGroupDirective | null;
  _parentForm: NgForm | null;
  _defaultErrorStateMatcher: ErrorStateMatcher;

  // These properties are defined as per the `MatFormFieldControl` interface. Since
  // this mixin is commonly used with custom form-field controls, we respect the
  // properties (also with the public name they need according to `MatFormFieldControl`).
  ngControl: NgControl | null;
  stateChanges: Subject<void>;
}

/**
 * Class that tracks the error state of a component.
 * @docs-private
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

/**
 * Mixin to augment a directive with updateErrorState method.
 * For component with `errorState` and need to update `errorState`.
 * @deprecated Implement the `updateErrorState` method directly.
 * @breaking-change 19.0.0
 */
export function mixinErrorState<T extends AbstractConstructor<HasErrorState>>(
  base: T,
): CanUpdateErrorStateCtor & T;
export function mixinErrorState<T extends Constructor<HasErrorState>>(
  base: T,
): CanUpdateErrorStateCtor & T {
  return class extends base {
    private _tracker: _ErrorStateTracker | undefined;

    /** Whether the component is in an error state. */
    get errorState() {
      return this._getTracker().errorState;
    }
    set errorState(value: boolean) {
      this._getTracker().errorState = value;
    }

    /** An object used to control the error state of the component. */
    get errorStateMatcher() {
      return this._getTracker().matcher;
    }
    set errorStateMatcher(value: ErrorStateMatcher) {
      this._getTracker().matcher = value;
    }

    /** Updates the error state based on the provided error state matcher. */
    updateErrorState() {
      this._getTracker().updateErrorState();
    }

    private _getTracker() {
      if (!this._tracker) {
        this._tracker = new _ErrorStateTracker(
          this._defaultErrorStateMatcher,
          this.ngControl,
          this._parentFormGroup,
          this._parentForm,
          this.stateChanges,
        );
      }

      return this._tracker;
    }

    constructor(...args: any[]) {
      super(...args);
    }
  };
}
