/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  ElementRef,
  Optional,
  InjectionToken,
  Inject,
  OnInit,
  Injector,
  InjectFlags,
  DoCheck,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  NgForm,
  FormGroupDirective,
  NgControl,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  CanUpdateErrorState,
  CanUpdateErrorStateCtor,
  mixinErrorState,
  MAT_DATE_FORMATS,
  DateAdapter,
  MatDateFormats,
  ErrorStateMatcher,
} from '@angular/material/core';
import {BooleanInput} from '@angular/cdk/coercion';
import {MatDatepickerInputBase} from './datepicker-input-base';

/** Parent component that should be wrapped around `MatStartDate` and `MatEndDate`. */
export interface MatDateRangeInputParent {
  id: string;
  _ariaDescribedBy: string | null;
  _ariaLabelledBy: string | null;
  _handleChildValueChange: () => void;
  _openDatepicker: () => void;
}

/**
 * Used to provide the date range input wrapper component
 * to the parts without circular dependencies.
 */
export const MAT_DATE_RANGE_INPUT_PARENT =
    new InjectionToken<MatDateRangeInputParent>('MAT_DATE_RANGE_INPUT_PARENT');

/**
 * Base class for the individual inputs that can be projected inside a `mat-date-range-input`.
 */
@Directive()
class MatDateRangeInputPartBase<D> extends MatDatepickerInputBase<D> implements OnInit, DoCheck {
  protected _validator: ValidatorFn | null;

  /** @docs-private */
  ngControl: NgControl;

  /** @docs-private */
  updateErrorState: () => void;

  constructor(
    @Inject(MAT_DATE_RANGE_INPUT_PARENT) public _rangeInput: MatDateRangeInputParent,
    elementRef: ElementRef<HTMLInputElement>,
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    private _injector: Injector,
    @Optional() public _parentForm: NgForm,
    @Optional() public _parentFormGroup: FormGroupDirective,
    @Optional() dateAdapter: DateAdapter<D>,
    @Optional() @Inject(MAT_DATE_FORMATS) dateFormats: MatDateFormats) {
    super(elementRef, dateAdapter, dateFormats);
  }

  ngOnInit() {
    // We need the date input to provide itself as a `ControlValueAccessor` and a `Validator`, while
    // injecting its `NgControl` so that the error state is handled correctly. This introduces a
    // circular dependency, because both `ControlValueAccessor` and `Validator` depend on the input
    // itself. Usually we can work around it for the CVA, but there's no API to do it for the
    // validator. We work around it here by injecting the `NgControl` in `ngOnInit`, after
    // everything has been resolved.
    const ngControl = this._injector.get(NgControl, null, InjectFlags.Self);

    if (ngControl) {
      this.ngControl = ngControl;
    }
  }

  ngDoCheck() {
    if (this.ngControl) {
      // We need to re-evaluate this on every change detection cycle, because there are some
      // error triggers that we can't subscribe to (e.g. parent form submissions). This means
      // that whatever logic is in here has to be super lean or we risk destroying the performance.
      this.updateErrorState();
    }
  }

  /** Gets whether the input is empty. */
  isEmpty(): boolean {
    return this._elementRef.nativeElement.value.length === 0;
  }

  /** Focuses the input. */
  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  /** Handles `input` events on the input element. */
  _onInput(value: string) {
    super._onInput(value);
    this._rangeInput._handleChildValueChange();
  }

  /** Opens the datepicker associated with the input. */
  protected _openPopup(): void {
    this._rangeInput._openDatepicker();
  }

  protected _assignModelValue(_model: D | null): void {
    // TODO(crisbeto): implement
  }
}

const _MatDateRangeInputBase:
    CanUpdateErrorStateCtor & typeof MatDateRangeInputPartBase =
    mixinErrorState(MatDateRangeInputPartBase);

/** Input for entering the start date in a `mat-date-range-input`. */
@Directive({
  selector: 'input[matStartDate]',
  host: {
    'class': 'mat-date-range-input-inner',
    '[disabled]': 'disabled',
    '(input)': '_onInput($event.target.value)',
    '(change)': '_onChange()',
    '(keydown)': '_onKeydown($event)',
    '[attr.aria-labelledby]': '_rangeInput._ariaLabelledBy',
    '[attr.aria-describedby]': '_rangeInput._ariaDescribedBy',
    '(blur)': '_onBlur()',
    'type': 'text',

    // TODO(crisbeto): to be added once the datepicker is implemented
    // '[attr.aria-haspopup]': '_datepicker ? "dialog" : null',
    // '[attr.aria-owns]': '(_datepicker?.opened && _datepicker.id) || null',
    // '[attr.min]': 'min ? _dateAdapter.toIso8601(min) : null',
    // '[attr.max]': 'max ? _dateAdapter.toIso8601(max) : null',
  },
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: MatStartDate, multi: true},
    {provide: NG_VALIDATORS, useExisting: MatStartDate, multi: true}
  ]
})
export class MatStartDate<D> extends _MatDateRangeInputBase<D> implements CanUpdateErrorState {
  // TODO(crisbeto): start-range-specific validators should go here.
  protected _validator = Validators.compose([this._parseValidator]);

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
  host: {
    'class': 'mat-date-range-input-inner',
    '[disabled]': 'disabled',
    '(input)': '_onInput($event.target.value)',
    '(change)': '_onChange()',
    '(keydown)': '_onKeydown($event)',
    '[attr.aria-labelledby]': '_rangeInput._ariaLabelledBy',
    '[attr.aria-describedby]': '_rangeInput._ariaDescribedBy',
    '(blur)': '_onBlur()',
    'type': 'text',

    // TODO(crisbeto): to be added once the datepicker is implemented
    // '[attr.aria-haspopup]': '_datepicker ? "dialog" : null',
    // '[attr.aria-owns]': '(_datepicker?.opened && _datepicker.id) || null',
    // '[attr.min]': 'min ? _dateAdapter.toIso8601(min) : null',
    // '[attr.max]': 'max ? _dateAdapter.toIso8601(max) : null',
  },
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: MatEndDate, multi: true},
    {provide: NG_VALIDATORS, useExisting: MatEndDate, multi: true}
  ]
})
export class MatEndDate<D> extends _MatDateRangeInputBase<D> implements CanUpdateErrorState {
  // TODO(crisbeto): end-range-specific validators should go here.
  protected _validator = Validators.compose([this._parseValidator]);

  static ngAcceptInputType_disabled: BooleanInput;
}
