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
  forwardRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validator,
} from '@angular/forms';
import {MatFormField} from '@angular/material/form-field';
import {MAT_INPUT_VALUE_ACCESSOR} from '@angular/material/input';
import {MatDatepicker} from './datepicker';
import {
  CDK_DATE_FORMATS,
  CdkDatepickerInput,
  CdkDateFormats,
  DateAdapter,
} from '@angular/cdk/datetime';


/**
 * @deprecated
 * @deletion-target 8.0.0 Removing export.
 */
export const MAT_DATEPICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatDatepickerInput),
  multi: true
};


/**
 * @deprecated
 * @deletion-target 8.0.0 Removing export.
 */
export const MAT_DATEPICKER_VALIDATORS: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MatDatepickerInput),
  multi: true
};


/**
 * @deprecated
 * @deletion-target 8.0.0 Use `DatepickerInputEvent<D>` instead.
 *
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
  inputs: ['value', 'min', 'max', 'disabled', 'cdkDatepickerFilter', 'cdkDatepicker'],
  outputs: ['dateChange', 'dateInput'],
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
  exportAs: 'matDatepickerInput',
})
export class MatDatepickerInput<D> extends CdkDatepickerInput<D> implements AfterContentInit,
    ControlValueAccessor, OnDestroy, Validator {
  /** Prefix for form control validator properties. */
  protected _formControlValidatorPrefix = 'mat';

  /** The datepicker that this input is associated with. */
  @Input()
  set matDatepicker(value: MatDatepicker<D>) {
    this.datepicker = value;
  }
  _datepicker: MatDatepicker<D>;

  /** Function that can be used to filter out dates within the datepicker. */
  @Input()
  set matDatepickerFilter(value: (date: D | null) => boolean) {
    this.filter = value;
  }

  constructor(
      _elementRef: ElementRef,
      @Optional() _dateAdapter: DateAdapter<D>,
      @Optional() @Inject(CDK_DATE_FORMATS) _dateFormats: CdkDateFormats,
      @Optional() private _formField: MatFormField) {
    super(_elementRef, _dateAdapter, _dateFormats);
  }

  /**
   * @deprecated
   * @breaking-change 7.0.0 Use `getConnectedOverlayOrigin` instead
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

  /** Returns the palette used by the input's form field, if any. */
  _getThemePalette() {
    return this._formField ? this._formField.color : undefined;
  }
}
