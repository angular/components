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
import {DateAdapter} from './date-adapter';
import {Subscription} from 'rxjs';
import {CdkDatepicker} from './datepicker';
import {CDK_DATE_FORMATS, CdkDateFormats} from './date-formats';


/**
 * Provider that allows the datepicker to register as a ControlValueAccessor.
 */
const DATEPICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CdkDatepickerInput),
  multi: true
};


/**
 * Provider that allows the datepicker to register as a ControlValueAccessor.
 */
const DATEPICKER_VALIDATORS: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => CdkDatepickerInput),
  multi: true
};


/**
 * An event used for datepicker input and change events. For consistency, we always use
 * DatepickerInputEvent instead.
 */
export class DatepickerInputEvent<D> {
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
    DATEPICKER_VALUE_ACCESSOR,
    DATEPICKER_VALIDATORS,
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
  @Input('cdkDatepicker')
  set datepicker(value: CdkDatepicker<D>) {
    this._registerDatepicker(value);
  }
  _datepicker: CdkDatepicker<D>;

  /** Registering datepicker with this input. */
  private _registerDatepicker(value: CdkDatepicker<D>) {
    if (value) {
      this._datepicker = value;
      this._datepicker._registerInput(this);
    }
  }

  /** Function that can be used to filter out dates within the datepicker. */
  @Input('cdkDatepickerFilter')
  set filter(value: (date: D | null) => boolean) {
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
    this._datepicker.view.minDate = this._min;
  }
  private _min: D | null;

  /** The maximum valid date. */
  @Input()
  get max(): D | null { return this._max; }
  set max(value: D | null) {
    this._max = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
    this._validatorOnChange();
    this._datepicker.view.maxDate = this._max;
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
  @Output() readonly dateChange: EventEmitter<DatepickerInputEvent<D>> =
      new EventEmitter<DatepickerInputEvent<D>>();

  /** Emits when an `input` event is fired on this `<input>`. */
  @Output() readonly dateInput: EventEmitter<DatepickerInputEvent<D>>  =
      new EventEmitter<DatepickerInputEvent<D>>();

  /** Emits when the value changes (either due to user input or programmatic change). */
  _valueChange = new EventEmitter<D | null>();

  /** Emits when the disabled state has changed */
  _disabledChange = new EventEmitter<boolean>();

  /** Implemented as part of ControlValueAccessor. */
  _onTouched = () => {};

  /** Implemented as part of ControlValueAccessor. */
  private _controlValueAccessorOnChange: (value: any) => void = () => {};

  /** Implemented as part of ControlValueAccessor. */
  private _validatorOnChange = () => {};

  /** Implemented for datepicker CDK and locale subscriptions. */
  private readonly _subscriptions = new Subscription();

  /** Prefix for form control validator properties. */
  protected _formControlValidatorPrefix = 'cdk';

  /** The form control validator for whether the input parses. */
  private _parseValidator: ValidatorFn = (): ValidationErrors | null => {
    return this._lastValueValid ?
        null : {[`${this._formControlValidatorPrefix}DatepickerParse`]:
            {'text': this._elementRef.nativeElement.value}};
  }

  /** The form control validator for the min date. */
  private _minValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    return (!this.min || !controlValue ||
        this._dateAdapter.compareDate(this.min, controlValue) <= 0) ?
        null : {[`${this._formControlValidatorPrefix}DatepickerMin`]:
            {'min': this.min, 'actual': controlValue}};
  }

  /** The form control validator for the max date. */
  private _maxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    return (!this.max || !controlValue ||
        this._dateAdapter.compareDate(this.max, controlValue) >= 0) ?
        null : {[`${this._formControlValidatorPrefix}DatepickerMax`]:
            {'max': this.max, 'actual': controlValue}};
  }

  /** The form control validator for the date filter. */
  private _filterValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this._getValidDateOrNull(this._dateAdapter.deserialize(control.value));
    return !this._dateFilter || !controlValue || this._dateFilter(controlValue) ?
        null : {[`${this._formControlValidatorPrefix}DatepickerFilter`]: true};
  }

  /** The combined form control validator for this input. */
  private _validator: ValidatorFn | null =
      Validators.compose(
      [this._parseValidator, this._minValidator, this._maxValidator, this._filterValidator]);

  /** Whether the last value set on the input was valid. */
  private _lastValueValid = false;

  constructor(
      protected _elementRef: ElementRef,
      @Optional() public _dateAdapter: DateAdapter<D>,
      @Optional() @Inject(CDK_DATE_FORMATS) protected _dateFormats: CdkDateFormats) {
    if (!this._dateAdapter) {
      throw Error('CdkDatepicker: No provider found for DateAdapter.');
    }

    if (!this._dateFormats) {
      throw Error('CdkDatepicker: No provider found for CDK_DATE_FORMATS.');
    }
    // Update the displayed date when the locale changes.
    this._subscriptions.add(_dateAdapter.localeChanges.subscribe(() => {
      this.value = this.value;
    }));
  }

  ngAfterContentInit() {
    if (this._datepicker) {
      this._subscriptions.add(this._datepicker._selectedChanged.subscribe((selected: D) => {
        this.value = selected;
        this._controlValueAccessorOnChange(selected);
        this._onTouched();
        this.dateInput.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
        this.dateChange.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
      }));
    }
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this._valueChange.complete();
    this._disabledChange.complete();
  }

  /** @docs-private */
  registerOnValidatorChange(fn: () => void): void {
    this._validatorOnChange = fn;
  }

  /** @docs-private */
  validate(c: AbstractControl): ValidationErrors | null {
    return this._validator ? this._validator(c) : null;
  }

  // Implemented as part of ControlValueAccessor.
  writeValue(value: D): void {
    this.value = value;
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: any) => void): void {
    this._controlValueAccessorOnChange = fn;
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Handles change events on the input. */
  _onChange() {
    this.dateChange.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
  }

  /** Handles blur events on the input. */
  _onBlur() {
    // Reformat the input only if we have a valid value.
    if (this.value) {
      this._formatValue(this.value);
    }

    this._onTouched();
  }

  _onInput(value: string) {
    let date = this._dateAdapter.parse(value, this._dateFormats.parse.dateInput);
    this._lastValueValid = !date || this._dateAdapter.isValid(date);
    date = this._getValidDateOrNull(date);

    if (!this._dateAdapter.sameDate(date, this._value)) {
      this._value = date;
      this._controlValueAccessorOnChange(date);
      this._valueChange.emit(date);
      this.dateInput.emit(new DatepickerInputEvent(this, this._elementRef.nativeElement));
    }
  }

  /**
   * @param obj The object to check.
   * @returns The given object if it is both a date instance and valid, otherwise null.
   */
  private _getValidDateOrNull(obj: any): D | null {
    return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
  }

  /** Formats a value and sets it on the input element. */
  private _formatValue(value: D | null) {
    this._elementRef.nativeElement.value =
        value ? this._dateAdapter.format(value, this._dateFormats.display.dateInput) : '';
  }
}
