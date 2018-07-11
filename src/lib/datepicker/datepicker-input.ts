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
import {CdkDatepickerInput, DateAdapter} from '@angular/cdk/datetime';
import {MAT_DATE_FORMATS, MatDateFormats} from '@angular/material/core';
import {MatDatepicker} from './datepicker';
import {MatFormField} from '@angular/material/form-field';
import {MAT_INPUT_VALUE_ACCESSOR} from '@angular/material/input';
import {Subscription} from 'rxjs';

/**
 * Provider that allows the datepicker to register as a ControlValueAccessor.
 */
export const MAT_DATEPICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatDatepickerInput),
  multi: true
};


/**
 * Provider that allows the datepicker to register as a ControlValueAccessor.
 */
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
    '[attr.min]': 'min ? dateAdapter.toIso8601(min) : null',
    '[attr.max]': 'max ? dateAdapter.toIso8601(max) : null',
    '[disabled]': 'disabled',
    '(input)': '_onInput($event.target.value)',
    '(change)': 'emitDateChange()',
    '(blur)': 'onBlur()',
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

  /** Register material datepicker to input. */
  private _registerDatepicker(value: MatDatepicker<D>) {
    if (value) {
      this._datepicker = value;
      this._datepicker._registerInput(this);
    }
  }

  /** Formats value and emits the value change if the dates differ. */
  emitValue(oldDate: D | null, value: D | null) {
    this._formatValue(value);
    if (!this.dateAdapter.sameDate(oldDate, value)) {
      this.valueChange.emit(value);
    }
  }

  /** Function that can be used to filter out dates within the datepicker. */
  @Input()
  set matDatepickerFilter(value: (date: D | null) => boolean) {
    this.dateFilter = value;
    this.validatorOnChange();
  }

  /** Emits when a `change` event is fired on this `<input>`. */
  @Output() readonly dateChange: EventEmitter<MatDatepickerInputEvent<D>> =
    new EventEmitter<MatDatepickerInputEvent<D>>();

  /** Emits when an `input` event is fired on this `<input>`. */
  @Output() readonly dateInput: EventEmitter<MatDatepickerInputEvent<D>> =
    new EventEmitter<MatDatepickerInputEvent<D>>();

  /** Implemented for material datepicker subscription. */
  private _datepickerSubscription = Subscription.EMPTY;

  /** The form control validator for whether the input parses. */
  private _parseValidator: ValidatorFn = (): ValidationErrors | null => {
    return this.lastValueValid ?
      null : {'matDatepickerParse': {'text': this.inputElement.value}};
  }

  /** The form control validator for the min date. */
  private _minValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));
    return (!this.min || !controlValue ||
      this.dateAdapter.compareDate(this.min, controlValue) <= 0) ?
        null : {'matDatepickerMin': {'min': this.min, 'actual': controlValue}};
  }

  /** The form control validator for the max date. */
  private _maxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));
    return (!this.max || !controlValue ||
      this.dateAdapter.compareDate(this.max, controlValue) >= 0) ?
        null : {'matDatepickerMax': {'max': this.max, 'actual': controlValue}};
  }

  /** The form control validator for the date filter. */
  private _filterValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const controlValue = this.getValidDateOrNull(this.dateAdapter.deserialize(control.value));
    return !this.dateFilter || !controlValue || this.dateFilter(controlValue) ?
      null : {'matDatepickerFilter': true};
  }

  /** The combined form control validator for this input. */
  private _validator: ValidatorFn | null =
    Validators.compose(
      [this._parseValidator, this._minValidator, this._maxValidator,
        this._filterValidator]);

  /** Constructor for material datepicker input. */
  constructor(@Optional() @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats,
    @Optional() private _formField: MatFormField, public dateAdapter: DateAdapter<D>,
      protected elementRef: ElementRef) {
    super(dateAdapter, elementRef);
    if (!this._dateFormats) {
      throw Error('MatDatepicker: No provider found for MAT_DATE_FORMATS');
    }
  }

  /** Unsubscribes datepicker subscription. */
  destroy() {
    this._datepickerSubscription.unsubscribe();
  }

  /** Formats date of input and emits change detection. */
  _onInput(value: string) {
    let date = this.dateAdapter.parse(value, this._dateFormats.parse.dateInput);
    this.lastValueValid = !date || this.dateAdapter.isValid(date);
    date = this.getValidDateOrNull(date);

    if (!this.dateAdapter.sameDate(date, this.value)) {
      this.value = date;
      this.controlValueAccessorOnChange(date);
      this.valueChange.emit(date);
      this.emitDateInput();
    }
  }

  /**
   * Initializes datepicker with subscription and ControlValueAccessor
   * implementations.
   */
  init() {
    if (this._datepicker) {
      this._datepickerSubscription = this._datepicker.selectedChanged.subscribe(
        (selected: D) => {
        this.emitChange(selected);
        this.emitDateInput();
        this.emitDateChange();
      });
    }
  }

  /** Format value if it exists. */
  formatIfValueExists() {
    // Reformat the input only if we have a valid value.
    if (this.value) {
      this._formatValue(this.value);
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
    return this._formField ? this._formField.getConnectedOverlayOrigin() : this.elementRef;
  }

  /** Opens datepicker on keydown event */
  _onKeydown(event: KeyboardEvent) {
    if (event.altKey && event.keyCode === DOWN_ARROW) {
      this._datepicker.open();
      event.preventDefault();
    }
  }

  /** Emits new datepicker input event when the input event is emitted. */
  emitDateInput() {
    this.dateInput.emit(new MatDatepickerInputEvent(this, this.inputElement));
  }

  /** Emits new datepicker change event when the change event is emitted. */
  emitDateChange() {
    this.dateChange.emit(new MatDatepickerInputEvent(this, this.inputElement));
  }

  /** Formats a value and sets it on the input element. */
  private _formatValue(value: D | null) {
    this.inputElement.value =
      value ? this.dateAdapter.format(value, this._dateFormats.display.dateInput) : '';
  }

  /** Returns the palette used by the input's form field, if any. */
  _getThemePalette() {
    return this._formField ? this._formField.color : undefined;
  }
}
