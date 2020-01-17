/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Optional, Self, InjectionToken, Inject} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ControlValueAccessor,
  Validator,
  AbstractControl,
  ValidationErrors,
  NgForm,
  FormGroupDirective,
  NgControl,
} from '@angular/forms';
import {
  CanUpdateErrorState,
  CanDisable,
  ErrorStateMatcher,
  CanDisableCtor,
  CanUpdateErrorStateCtor,
  mixinErrorState,
  mixinDisabled,
} from '@angular/material/core';
import {BooleanInput} from '@angular/cdk/coercion';

/**  Parent component that should be wrapped around `MatStartDate` and `MatEndDate`. */
export interface MatDateRangeInputParent {
  id: string;
  _ariaDescribedBy: string | null;
  _ariaLabelledBy: string | null;
  _handleChildValueChange: () => void;
}

/**
 * Used to provide the date range input wrapper component
 * to the parts without circular dependencies.
 */
export const MAT_DATE_RANGE_INPUT_PARENT =
    new InjectionToken<MatDateRangeInputParent>('MAT_DATE_RANGE_INPUT_PARENT');

// Boilerplate for applying mixins to MatDateRangeInput.
/** @docs-private */
class MatDateRangeInputPartMixinBase {
  constructor(public _defaultErrorStateMatcher: ErrorStateMatcher,
              public _parentForm: NgForm,
              public _parentFormGroup: FormGroupDirective,
              /** @docs-private */
              public ngControl: NgControl) {}
}
const _MatDateRangeInputMixinBase: CanDisableCtor &
    CanUpdateErrorStateCtor & typeof MatDateRangeInputPartMixinBase =
    mixinErrorState(mixinDisabled(MatDateRangeInputPartMixinBase));

/**
 * Base class for the individual inputs that can be projected inside a `mat-date-range-input`.
 */
@Directive()
abstract class MatDateRangeInputPartBase<D> extends _MatDateRangeInputMixinBase implements
  ControlValueAccessor, Validator, CanUpdateErrorState, CanDisable, CanUpdateErrorState {

  private _onTouched = () => {};

  constructor(
    protected _elementRef: ElementRef<HTMLInputElement>,
    @Inject(MAT_DATE_RANGE_INPUT_PARENT) public _rangeInput: MatDateRangeInputParent,
    defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional() parentForm: NgForm,
    @Optional() parentFormGroup: FormGroupDirective,
    @Optional() @Self() ngControl: NgControl) {
    super(defaultErrorStateMatcher, parentForm, parentFormGroup, ngControl);
  }

  /** @docs-private */
  writeValue(_value: D | null): void {
    // TODO(crisbeto): implement
  }

  /** @docs-private */
  registerOnChange(_fn: () => void): void {
    // TODO(crisbeto): implement
  }

  /** @docs-private */
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  /** @docs-private */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** @docs-private */
  validate(_control: AbstractControl): ValidationErrors | null {
    // TODO(crisbeto): implement
    return null;
  }

  /** @docs-private */
  registerOnValidatorChange(_fn: () => void): void {
    // TODO(crisbeto): implement
  }

  /** Gets whether the input is empty. */
  isEmpty(): boolean {
    // TODO(crisbeto): should look at the CVA value.
    return this._elementRef.nativeElement.value.length === 0;
  }

  /** Focuses the input. */
  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  /** Handles blur events on the input. */
  _handleBlur(): void {
    this._onTouched();
  }

  static ngAcceptInputType_disabled: BooleanInput;
}


/** Input for entering the start date in a `mat-date-range-input`. */
@Directive({
  selector: 'input[matStartDate]',
  inputs: ['disabled'],
  host: {
    '[id]': '_rangeInput.id',
    '[attr.aria-labelledby]': '_rangeInput._ariaLabelledBy',
    '[attr.aria-describedby]': '_rangeInput._ariaDescribedBy',
    'class': 'mat-date-range-input-inner',
    'type': 'text',
    '(blur)': '_handleBlur()',
    '(input)': '_rangeInput._handleChildValueChange()'
  },
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: MatStartDate, multi: true},
    {provide: NG_VALIDATORS, useExisting: MatStartDate, multi: true}
  ]
})
export class MatStartDate<D> extends MatDateRangeInputPartBase<D> {
  /** Gets the value that should be used when mirroring the input's size. */
  getMirrorValue(): string {
    const element = this._elementRef.nativeElement;
    const value = element.value;
    return value.length > 0 ? value : element.placeholder;
  }

  static ngAcceptInputType_disabled: BooleanInput;
}


/** Input for entering the end date in a `mat-date-range-input`. */
@Directive({
  selector: 'input[matEndDate]',
  inputs: ['disabled'],
  host: {
    'class': 'mat-date-range-input-inner',
    '[attr.aria-labelledby]': '_rangeInput._ariaLabelledBy',
    '[attr.aria-describedby]': '_rangeInput._ariaDescribedBy',
    '(blur)': '_handleBlur',
    'type': 'text',
  },
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: MatEndDate, multi: true},
    {provide: NG_VALIDATORS, useExisting: MatEndDate, multi: true}
  ]
})
export class MatEndDate<D> extends MatDateRangeInputPartBase<D> {
  static ngAcceptInputType_disabled: BooleanInput;
}
