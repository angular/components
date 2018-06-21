/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  AfterContentInit,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnDestroy,
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
import {CdkDatepicker} from './datepicker';
import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats} from '@angular/material/core';
import {MatFormField} from '@angular/material/form-field';
import {MAT_INPUT_VALUE_ACCESSOR} from '@angular/material/input';
import {Subscription} from 'rxjs';

export const CDK_DATEPICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CdkDatepickerInput),
  multi: true
};


export const CDK_DATEPICKER_VALIDATORS: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => CdkDatepickerInput),
  multi: true
};


/**
 * An event used for datepicker input and change events. For consistency, we always use
 * CdkDatepickerInputEvent instead.
 */
export class CdkDatepickerInputEvent<D> {
  /** The new value for the target datepicker input. */
  value: D | null;

  constructor(
      /** Reference to the datepicker input component that emitted the event. */
      public target: CdkDatepickerInput<D>,
      /** Reference to the native input element associated with the datepicker input. */
      public targetElement: HTMLElement) {
    this.value = this.target.value;
  }
}


/** Directive used to connect an input to a CdkDatepicker. */
@Directive({
  selector: 'input[cdkDatepicker]',
  providers: [
    CDK_DATEPICKER_VALUE_ACCESSOR,
    CDK_DATEPICKER_VALIDATORS,
    {provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: CdkDatepickerInput},
  ],
  host: {
    '[attr.aria-owns]': '(_datepicker.id) || null',
    '[attr.min]': 'min ? _dateAdapter.toIso8601(min) : null',
    '[attr.max]': 'max ? _dateAdapter.toIso8601(max) : null',
    '[disabled]': 'disabled',
    '(input)': '_onInput($event.target.value)',
    '(change)': '_onChange()',
    '(blur)': '_onBlur()',
  },
  exportAs: 'cdkDatepickerInput',
})
export class CdkDatepickerInput<D> implements AfterContentInit, ControlValueAccessor, OnDestroy,
    Validator {
  /** The datepicker that this input is associated with. */
  @Input()
  set cdkDatepicker(value: CdkDatepicker<D>) {
    this.registerCdkDatepicker(value);
  }
  _cdkDatepicker: CdkDatepicker<D>;

  private registerCdkDatepicker(value: CdkDatepicker<D>) {
    if (value) {
      this._cdkDatepicker = value;
      this._cdkDatepicker._registerCdkInput(this);
    }
  }

  /** Function that can be used to filter out dates within the datepicker. */
  @Input()
  set cdkDatepickerFilter(value: (date: D | null) => boolean) {
    this._dateFilter = value;
    this._validatorOnChange();
  }
  _dateFilter: (date: D | null) => boolean;

  /** The value of the input. */
  @Input()
  get value(): D | null { return this._value; }
  set value(value: D | null) {
    value = this._dateAdapter.deserialize(value);
    this._lastValueValid = !value || this._dateAdapter.isValid(value);
    value = this._getValidDateOrNull(value);
    const oldDate = this.value;
    this._value = value;
    this._formatValue(value);

    if (!this._dateAdapter.sameDate(oldDate, value)) {
      this._valueChange.emit(value);
    }
  }
  private _value: D | null;

  /** The minimum valid date. */
  @Input()
  get min(): D | null { return this._min; }
  set min(value: D | null) {
    this._min = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
    this._validatorOnChange();
  }
  private _min: D | null;

  /** The maximum valid date. */
  @Input()
  get max(): D | null { return this._max; }
  set max(value: D | null) {
    this._max = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
    this._validatorOnChange();
  }
  private _max: D | null;

  /** Whether the datepicker-input is disabled. */
  @Input()
  get disabled(): boolean { return !!this._disabled; }
  set disabled(value: boolean) {
    const newValue = coerceBooleanProperty(value);
    const element = this._elementRef.nativeElement;

    if (this._disabled !== newValue) {
      this._disabled = newValue;
      this._disabledChange.emit(newValue);
    }

    // We need to null check the `blur` method, because it's undefined during SSR.
    if (newValue && element.blur) {
      // Normally, native input elements automatically blur if they turn disabled. This behavior
      // is problematic, because it would mean that it triggers another change detection cycle,
      // which then causes a changed after checked error if the input element was focused before.
      element.blur();
    }
  }
  private _disabled: boolean;

  /** Emits when a `change` event is fired on this `<input>`. */
  @Output() readonly cdkDateChange: EventEmitter<CdkDatepickerInputEvent<D>> =
      new EventEmitter<CdkDatepickerInputEvent<D>>();

  /** Emits when an `input` event is fired on this `<input>`. */
  @Output() readonly cdkDateInput: EventEmitter<CdkDatepickerInputEvent<D>> =
      new EventEmitter<CdkDatepickerInputEvent<D>>();

  /** Emits when the value changes (either due to user input or programmatic change). */
  _valueChange = new EventEmitter<D | null>();

  /** Emits when the disabled state has changed */
  _disabledChange = new EventEmitter<boolean>();

  _onTouched = () => {};

  private _cvaOnChange: (value: any) => void = () => {};

  protected _validatorOnChange = () => {};

  private _cdkDatepickerSubscription = Subscription.EMPTY;

  private _localeSubscription = Subscription.EMPTY;

  /** The form control validator for whether the input parses. */
  private _parseCdkValidator: ValidatorFn = (): ValidationErrors | null => {
    return this._lastValueValid ?
        null : {'cdkDatepickerParse': {'text': this._elementRef.nativeElement.value}};
  }

  /** The form control validator for the min date. */
  private _minCdkValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    return (!this.min || !controlValue ||
        this._dateAdapter.compareDate(this.min, controlValue) <= 0) ?
        null : {'cdkDatepickerMin': {'min': this.min, 'actual': controlValue}};
  }

  /** The form control validator for the max date. */
  private _maxCdkValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    return (!this.max || !controlValue ||
        this._dateAdapter.compareDate(this.max, controlValue) >= 0) ?
        null : {'cdkDatepickerMax': {'max': this.max, 'actual': controlValue}};
  }

  /** The form control validator for the date filter. */
  private _filterCdkValidator: ValidatorFn = (control: AbstractControl):
      ValidationErrors | null => {
    const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    return !this._dateFilter || !controlValue || this._dateFilter(controlValue) ?
        null : {'cdkDatepickerFilter': true};
  }

  /** The combined form control validator for this input. */
  private _cdkValidator: ValidatorFn | null =
      Validators.compose(
          [this._parseCdkValidator, this._minCdkValidator, this._maxCdkValidator,
              this._filterCdkValidator]);

  /** Whether the last value set on the input was valid. */
  protected _lastValueValid = false;

  protected _elementRef: ElementRef;

  _dateAdapter: DateAdapter<D>;

  @Inject(MAT_DATE_FORMATS)
  private _dateFormats: MatDateFormats;

  constructor() {
    if (!this._dateAdapter) {
      throw Error('CdkDatepicker: No provider found for DateAdapter.');
    }
    if (!this._dateFormats) {
      throw Error('CdkDatepicker: No provider found for MAT_DATE_FORMATS');
    }

    // Update the displayed date when the locale changes.
    this._localeSubscription = this._dateAdapter.localeChanges.subscribe(() => {
      this.value = this.value;
    });
  }

  init() {
    if (this._cdkDatepicker) {
      this._cdkDatepickerSubscription = this._cdkDatepicker._selectedChanged.subscribe(
          (selected: D) => {
        this.emitChange(selected);
        this.emitDateInput();
        this.emitDateChange();
      });
    }
  }

  emitChange(selected: D) {
    this.value = selected;
    this._cvaOnChange(selected);
    this._onTouched();
  }

  ngAfterContentInit() {
    this.init();
  }

  destroy() {
    this._cdkDatepickerSubscription.unsubscribe();
  }

  ngOnDestroy() {
    this.destroy();
    this._localeSubscription.unsubscribe();
    this._valueChange.complete();
    this._disabledChange.complete();
  }

  /** @docs-private */
  registerOnValidatorChange(fn: () => void): void {
    this._validatorOnChange = fn;
  }

  /** @docs-private */
  validate(c: AbstractControl): ValidationErrors | null {
    return this._cdkValidator ? this._cdkValidator(c) : null;
  }

  // Implemented as part of ControlValueAccessor.
  writeValue(value: D): void {
    this.value = value;
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: any) => void): void {
    this._cvaOnChange = fn;
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _onInput(value: string) {
    let date = this._dateAdapter.parse(value, this._dateFormats.parse.dateInput);
    this._lastValueValid = !date || this._dateAdapter.isValid(date);
    date = this._getValidDateOrNull(date);

    if (!this._dateAdapter.sameDate(date, this._value)) {
      this._value = date;
      this._cvaOnChange(date);
      this._valueChange.emit(date);
      this.emitDateInput();
    }
  }

  emitDateInput() {
    this.cdkDateInput.emit(new CdkDatepickerInputEvent(this, this._elementRef.nativeElement));
  }

  emitDateChange() {
    this.cdkDateChange.emit(new CdkDatepickerInputEvent(this, this._elementRef.nativeElement));
  }

  _onChange() {
    this.emitDateChange();
  }

  /** Handles blur events on the input. */
  _onBlur() {
    // Reformat the input only if we have a valid value.
    if (this.value) {
      this._formatValue(this.value);
    }

    this._onTouched();
  }

  /** Formats a value and sets it on the input element. */
  protected _formatValue(value: D | null) {
    this._elementRef.nativeElement.value =
        value ? this._dateAdapter.format(value, this._dateFormats.display.dateInput) : '';
  }

  /**
   * @param obj The object to check.
   * @returns The given object if it is both a date instance and valid, otherwise null.
   */
  protected _getValidDateOrNull(obj: any): D | null {
    return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
  }
}
