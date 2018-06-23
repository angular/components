/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOWN_ARROW} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  Optional,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {CdkDatepickerInput} from '@angular/cdk/datepicker';
import {MatDatepicker} from './datepicker';
import {MatFormField} from '@angular/material/form-field';
import {MAT_INPUT_VALUE_ACCESSOR} from '@angular/material/input';
import {Subscription} from 'rxjs';

export const MAT_DATEPICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatDatepickerInput),
  multi: true
};


export const MAT_DATEPICKER_VALIDATORS: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MatDatepickerInput),
  multi: true
};


/**
 * An event used for datepicker input and change events. We don't always have access to a native
 * input or change event because the event may have been triggered by the user clicking on the
 * calendar popup. For consistency, we always use MatDatepickerInputEvent instead.
 */
export class MatDatepickerInputEvent<D> {
  /** The new value for the target datepicker input. */
  value: D | null;

  constructor(
    /** Reference to the datepicker input component that emitted the event. */
    public target: MatDatepickerInput<D>,
    /** Reference to the native input element associated with the datepicker input. */
    public targetElement: HTMLElement) {
    this.value = this.target.value;
  }
}


/** Directive used to connect an input to a MatDatepicker. */
@Directive({
  selector: 'input[matDatepicker]',
  providers: [
    MAT_DATEPICKER_VALUE_ACCESSOR,
    MAT_DATEPICKER_VALIDATORS,
    {provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: MatDatepickerInput},
  ],
  host: {
    '[attr.aria-haspopup]': 'true',
    '[attr.aria-owns]': '(_datepicker?.opened && _datepicker.id) || null',
    '[attr.min]': 'min ? _dateAdapter.toIso8601(min) : null',
    '[attr.max]': 'max ? _dateAdapter.toIso8601(max) : null',
    '[disabled]': 'disabled',
    '(input)': '_onInput($event.target.value)',
    '(change)': '_onChange()',
    '(blur)': '_onBlur()',
    '(keydown)': '_onKeydown($event)',
  },
  inputs: ['value', 'min', 'max', 'disabled'],
  exportAs: 'matDatepickerInput',
})
export class MatDatepickerInput<D> extends CdkDatepickerInput<D> implements AfterContentInit,
    ControlValueAccessor, OnDestroy, Validator {
  /** The datepicker that this input is associated with. */
  @Input()
  set matDatepicker(value: MatDatepicker<D>) {
    this._registerDatepicker(value);
  }
  _datepicker: MatDatepicker<D>;

  private _registerDatepicker(value: MatDatepicker<D>) {
    if (value) {
      this._datepicker = value;
      this._datepicker._registerInput(this);
    }
  }

  /** Function that can be used to filter out dates within the datepicker. */
  @Input('matDatepickerFilter')
  set filter(value: (date: D | null) => boolean) {
    this._dateFilter = value;
    this._validatorOnChange();
  }

  /** Emits when a `change` event is fired on this `<input>`. */
  @Output() readonly dateChange: EventEmitter<MatDatepickerInputEvent<D>> =
      new EventEmitter<MatDatepickerInputEvent<D>>();

  /** Emits when an `input` event is fired on this `<input>`. */
  @Output() readonly dateInput: EventEmitter<MatDatepickerInputEvent<D>> =
      new EventEmitter<MatDatepickerInputEvent<D>>();

  private _datepickerSubscription = Subscription.EMPTY;

  /** The form control validator for whether the input parses. */
  private _parseValidator: ValidatorFn = (): ValidationErrors | null => {
    return this._lastValueValid ?
        null : {'matDatepickerParse': {'text': this._elementRef.nativeElement.value}};
  }

  /** The form control validator for the min date. */
  private _minValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    return (!this.min || !controlValue ||
        this._dateAdapter.compareDate(this.min, controlValue) <= 0) ?
        null : {'matDatepickerMin': {'min': this.min, 'actual': controlValue}};
  }

  /** The form control validator for the max date. */
  private _maxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    return (!this.max || !controlValue ||
        this._dateAdapter.compareDate(this.max, controlValue) >= 0) ?
        null : {'matDatepickerMax': {'max': this.max, 'actual': controlValue}};
  }

  /** The form control validator for the date filter. */
  private _filterValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    return !this._dateFilter || !controlValue || this._dateFilter(controlValue) ?
        null : {'matDatepickerFilter': true};
  }

  /** The combined form control validator for this input. */
  private _validator: ValidatorFn | null =
      Validators.compose(
          [this._parseValidator, this._minValidator, this._maxValidator,
              this._filterValidator]);

  constructor(@Optional() private _formField: MatFormField) {
    super();
  }

  destroy() {
    this._datepickerSubscription.unsubscribe();
  }

  init() {
    if (this._datepicker) {
      this._datepickerSubscription = this._datepicker._selectedChanged.subscribe(
          (selected: D) => {
        this.emitChange(selected);
        this.emitDateInput();
        this.emitDateChange();
      });
    }
  }

  /** @docs-private */
  validate(c: AbstractControl): ValidationErrors | null {
    return this._validator ? this._validator(c) : null;
  }

  /**
   * @deprecated
   * @deletion-target 7.0.0 Use `getConnectedOverlayOrigin` instead
   */
  getPopupConnectionElementRef(): ElementRef {
    return this.getConnectedOverlayOrigin();
  }

  /**
   * Gets the element that the datepicker popup should be connected to.
   * @return The element to connect the popup to.
   */
  getConnectedOverlayOrigin(): ElementRef {
    return this._formField ? this._formField.getConnectedOverlayOrigin() : this._elementRef;
  }

  _onKeydown(event: KeyboardEvent) {
    if (event.altKey && event.keyCode === DOWN_ARROW) {
      this._datepicker.open();
      event.preventDefault();
    }
  }

  emitDateInput() {
    this.dateInput.emit(new MatDatepickerInputEvent(this, this._elementRef.nativeElement));
  }

  emitDateChange() {
    this.dateChange.emit(new MatDatepickerInputEvent(this, this._elementRef.nativeElement));
  }

  /** Returns the palette used by the input's form field, if any. */
  _getThemePalette() {
    return this._formField ? this._formField.color : undefined;
  }
}
