/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  OnDestroy,
  OutputRefSubscription,
  Signal,
  signal,
} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {MAT_FORM_FIELD} from '@angular/material/form-field';
import {MatTimepicker} from './timepicker';
import {MAT_INPUT_VALUE_ACCESSOR} from '@angular/material/input';
import {Subscription} from 'rxjs';
import {DOWN_ARROW, ESCAPE, hasModifierKey, UP_ARROW} from '@angular/cdk/keycodes';
import {validateAdapter} from './util';
import {DOCUMENT} from '@angular/common';

/**
 * Input that can be used to enter time and connect to a `mat-timepicker`.
 */
@Directive({
  selector: 'input[matTimepicker]',
  exportAs: 'matTimepickerInput',
  host: {
    'class': 'mat-timepicker-input',
    'role': 'combobox',
    'type': 'text',
    'aria-haspopup': 'listbox',
    '[attr.aria-activedescendant]': '_ariaActiveDescendant()',
    '[attr.aria-expanded]': '_ariaExpanded()',
    '[attr.aria-controls]': '_ariaControls()',
    '[attr.mat-timepicker-id]': 'timepicker()?.panelId',
    '[disabled]': 'disabled()',
    '(blur)': '_handleBlur()',
    '(input)': '_handleInput($event.target.value)',
    '(keydown)': '_handleKeydown($event)',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MatTimepickerInput,
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: MatTimepickerInput,
      multi: true,
    },
    {
      provide: MAT_INPUT_VALUE_ACCESSOR,
      useExisting: MatTimepickerInput,
    },
  ],
})
export class MatTimepickerInput<D> implements ControlValueAccessor, Validator, OnDestroy {
  private _elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private _document = inject(DOCUMENT);
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter, {optional: true})!;
  private _dateFormats = inject(MAT_DATE_FORMATS, {optional: true})!;
  private _formField = inject(MAT_FORM_FIELD, {optional: true});

  private _onChange: ((value: any) => void) | undefined;
  private _onTouched: (() => void) | undefined;
  private _validatorOnChange: (() => void) | undefined;
  private _accessorDisabled = signal(false);
  private _localeSubscription: Subscription;
  private _timepickerSubscription: OutputRefSubscription | undefined;
  private _validator: ValidatorFn;
  private _lastValueValid = true;
  private _lastValidDate: D | null = null;

  /** Value of the `aria-activedescendant` attribute. */
  protected readonly _ariaActiveDescendant = computed(() => {
    const timepicker = this.timepicker();
    const isOpen = timepicker.isOpen();
    const activeDescendant = timepicker.activeDescendant();
    return isOpen && activeDescendant ? activeDescendant : null;
  });

  /** Value of the `aria-expanded` attribute. */
  protected readonly _ariaExpanded = computed(() => this.timepicker().isOpen() + '');

  /** Value of the `aria-controls` attribute. */
  protected readonly _ariaControls = computed(() => {
    const timepicker = this.timepicker();
    return timepicker.isOpen() ? timepicker.panelId : null;
  });

  /** Current value of the input. */
  readonly value: ModelSignal<D | null> = model<D | null>(null);

  /** Timepicker that the input is associated with. */
  readonly timepicker: InputSignal<MatTimepicker<D>> = input.required<MatTimepicker<D>>({
    alias: 'matTimepicker',
  });

  /**
   * Minimum time that can be selected or typed in. Can be either
   * a date object (only time will be used) or a valid time string.
   */
  readonly min: InputSignalWithTransform<D | null, unknown> = input(null, {
    alias: 'matTimepickerMin',
    transform: (value: unknown) => this._transformDateInput<D>(value),
  });

  /**
   * Maximum time that can be selected or typed in. Can be either
   * a date object (only time will be used) or a valid time string.
   */
  readonly max: InputSignalWithTransform<D | null, unknown> = input(null, {
    alias: 'matTimepickerMax',
    transform: (value: unknown) => this._transformDateInput<D>(value),
  });

  /** Whether the input is disabled. */
  readonly disabled: Signal<boolean> = computed(
    () => this.disabledInput() || this._accessorDisabled(),
  );

  /**
   * Whether the input should be disabled through the template.
   * @docs-private
   */
  readonly disabledInput: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
    alias: 'disabled',
  });

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      validateAdapter(this._dateAdapter, this._dateFormats);
    }

    this._validator = this._getValidator();
    this._respondToValueChanges();
    this._respondToMinMaxChanges();
    this._registerTimepicker();
    this._localeSubscription = this._dateAdapter.localeChanges.subscribe(() => {
      if (!this._hasFocus()) {
        this._formatValue(this.value());
      }
    });

    // Bind the click listener manually to the overlay origin, because we want the entire
    // form field to be clickable, if the timepicker is used in `mat-form-field`.
    this.getOverlayOrigin().nativeElement.addEventListener('click', this._handleClick);
  }

  /**
   * Implemented as a part of `ControlValueAccessor`.
   * @docs-private
   */
  writeValue(value: any): void {
    // Note that we need to deserialize here, rather than depend on the value change effect,
    // because `getValidDateOrNull` will clobber the value if it's parseable, but not created by
    // the current adapter (see #30140).
    const deserialized = this._dateAdapter.deserialize(value);
    this.value.set(this._dateAdapter.getValidDateOrNull(deserialized));
  }

  /**
   * Implemented as a part of `ControlValueAccessor`.
   * @docs-private
   */
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  /**
   * Implemented as a part of `ControlValueAccessor`.
   * @docs-private
   */
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  /**
   * Implemented as a part of `ControlValueAccessor`.
   * @docs-private
   */
  setDisabledState(isDisabled: boolean): void {
    this._accessorDisabled.set(isDisabled);
  }

  /**
   * Implemented as a part of `Validator`.
   * @docs-private
   */
  validate(control: AbstractControl): ValidationErrors | null {
    return this._validator(control);
  }

  /**
   * Implemented as a part of `Validator`.
   * @docs-private
   */
  registerOnValidatorChange(fn: () => void): void {
    this._validatorOnChange = fn;
  }

  /** Gets the element to which the timepicker popup should be attached. */
  getOverlayOrigin(): ElementRef<HTMLElement> {
    return this._formField?.getConnectedOverlayOrigin() || this._elementRef;
  }

  /** Focuses the input. */
  focus(): void {
    this._elementRef.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.getOverlayOrigin().nativeElement.removeEventListener('click', this._handleClick);
    this._timepickerSubscription?.unsubscribe();
    this._localeSubscription.unsubscribe();
  }

  /** Gets the ID of the input's label. */
  _getLabelId(): string | null {
    return this._formField?.getLabelId() || null;
  }

  /** Handles clicks on the input or the containing form field. */
  private _handleClick = (): void => {
    if (!this.disabled()) {
      this.timepicker().open();
    }
  };

  /** Handles the `input` event. */
  protected _handleInput(value: string) {
    const currentValue = this.value();
    const date = this._dateAdapter.parseTime(value, this._dateFormats.parse.timeInput);
    const hasChanged = !this._dateAdapter.sameTime(date, currentValue);

    if (!date || hasChanged || !!(value && !currentValue)) {
      // We need to fire the CVA change event for all nulls, otherwise the validators won't run.
      this._assignUserSelection(date, true);
    } else {
      // Call the validator even if the value hasn't changed since
      // some fields change depending on what the user has entered.
      this._validatorOnChange?.();
    }
  }

  /** Handles the `blur` event. */
  protected _handleBlur() {
    const value = this.value();

    // Only reformat on blur so the value doesn't change while the user is interacting.
    if (value && this._isValid(value)) {
      this._formatValue(value);
    }

    this._onTouched?.();
  }

  /** Handles the `keydown` event. */
  protected _handleKeydown(event: KeyboardEvent) {
    // All keyboard events while open are handled through the timepicker.
    if (this.timepicker().isOpen() || this.disabled()) {
      return;
    }

    if (event.keyCode === ESCAPE && !hasModifierKey(event) && this.value() !== null) {
      event.preventDefault();
      this.value.set(null);
      this._formatValue(null);
    } else if (event.keyCode === DOWN_ARROW || event.keyCode === UP_ARROW) {
      event.preventDefault();
      this.timepicker().open();
    }
  }

  /** Sets up the code that watches for changes in the value and adjusts the input. */
  private _respondToValueChanges(): void {
    effect(() => {
      const value = this._dateAdapter.deserialize(this.value());
      const wasValid = this._lastValueValid;
      this._lastValueValid = this._isValid(value);

      // Reformat the value if it changes while the user isn't interacting.
      if (!this._hasFocus()) {
        this._formatValue(value);
      }

      if (value && this._lastValueValid) {
        this._lastValidDate = value;
      }

      // Trigger the validator if the state changed.
      if (wasValid !== this._lastValueValid) {
        this._validatorOnChange?.();
      }
    });
  }

  /** Sets up the logic that registers the input with the timepicker. */
  private _registerTimepicker(): void {
    effect(() => {
      const timepicker = this.timepicker();
      timepicker.registerInput(this);
      timepicker.closed.subscribe(() => this._onTouched?.());
      timepicker.selected.subscribe(({value}) => {
        if (!this._dateAdapter.sameTime(value, this.value())) {
          this._assignUserSelection(value, true);
          this._formatValue(value);
        }
      });
    });
  }

  /** Sets up the logic that adjusts the input if the min/max changes. */
  private _respondToMinMaxChanges(): void {
    effect(() => {
      // Read the min/max so the effect knows when to fire.
      this.min();
      this.max();
      this._validatorOnChange?.();
    });
  }

  /**
   * Assigns a value set by the user to the input's model.
   * @param selection Time selected by the user that should be assigned.
   * @param propagateToAccessor Whether the value should be propagated to the ControlValueAccessor.
   */
  private _assignUserSelection(selection: D | null, propagateToAccessor: boolean) {
    if (selection == null || !this._isValid(selection)) {
      this.value.set(selection);
    } else {
      // If a datepicker and timepicker are writing to the same object and the user enters an
      // invalid time into the timepicker, we may end up clearing their selection from the
      // datepicker. If the user enters a valid time afterwards, the datepicker's selection will
      // have been lost. This logic restores the previously-valid date and sets its time to
      // the newly-selected time.
      const adapter = this._dateAdapter;
      const target = adapter.getValidDateOrNull(this._lastValidDate || this.value());
      const hours = adapter.getHours(selection);
      const minutes = adapter.getMinutes(selection);
      const seconds = adapter.getSeconds(selection);
      this.value.set(target ? adapter.setTime(target, hours, minutes, seconds) : selection);
    }

    if (propagateToAccessor) {
      this._onChange?.(this.value());
    }
  }

  /** Formats the current value and assigns it to the input. */
  private _formatValue(value: D | null): void {
    value = this._dateAdapter.getValidDateOrNull(value);
    this._elementRef.nativeElement.value =
      value == null ? '' : this._dateAdapter.format(value, this._dateFormats.display.timeInput);
  }

  /** Checks whether a value is valid. */
  private _isValid(value: D | null): boolean {
    return !value || this._dateAdapter.isValid(value);
  }

  /** Transforms an arbitrary value into a value that can be assigned to a date-based input. */
  private _transformDateInput<D>(value: unknown): D | null {
    const date =
      typeof value === 'string'
        ? this._dateAdapter.parseTime(value, this._dateFormats.parse.timeInput)
        : this._dateAdapter.deserialize(value);
    return date && this._dateAdapter.isValid(date) ? (date as D) : null;
  }

  /** Whether the input is currently focused. */
  private _hasFocus(): boolean {
    return this._document.activeElement === this._elementRef.nativeElement;
  }

  /** Gets a function that can be used to validate the input. */
  private _getValidator(): ValidatorFn {
    return Validators.compose([
      () =>
        this._lastValueValid
          ? null
          : {'matTimepickerParse': {'text': this._elementRef.nativeElement.value}},
      control => {
        const controlValue = this._dateAdapter.getValidDateOrNull(
          this._dateAdapter.deserialize(control.value),
        );
        const min = this.min();
        return !min || !controlValue || this._dateAdapter.compareTime(min, controlValue) <= 0
          ? null
          : {'matTimepickerMin': {'min': min, 'actual': controlValue}};
      },
      control => {
        const controlValue = this._dateAdapter.getValidDateOrNull(
          this._dateAdapter.deserialize(control.value),
        );
        const max = this.max();
        return !max || !controlValue || this._dateAdapter.compareTime(max, controlValue) >= 0
          ? null
          : {'matTimepickerMax': {'max': max, 'actual': controlValue}};
      },
    ])!;
  }
}
