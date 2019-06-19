/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ValidatorFn, ValidationErrors, AbstractControl} from '@angular/forms';
import {DateAdapter, MatDateFormats} from '@angular/material/core';

/**
 * Provides a set of date validators that can be used by form controls.
 * @dynamic
 */
export class MatDateValidators {
  /**
   * The form control validator for whether the input parses.
   * @param dateAdapter the date object adapter.
   * @param dateFormats the date formats. Could be injected by token MAT_DATE_FORMATS
   * @param input the datepicker input html element.
   */
  static parse<D>(
    dateAdapter: DateAdapter<D>,
    dateFormats: MatDateFormats,
    input: HTMLInputElement): ValidatorFn {
    return (): ValidationErrors | null => {
      const parsedValue = dateAdapter.parse(input.value, dateFormats.parse.dateInput);
      const valid = !parsedValue || dateAdapter.isValid(parsedValue);
      return valid ? null : {'matDatepickerParse': {'text': input.value}};
    };
  }

  /**
   * The form control validator for the min date.
   * @param dateAdapter the date object adapter.
   * @param min The minimum valid date.
   */
  static min<D>(dateAdapter: DateAdapter<D>, min: D): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const controlValue = getValidDateOrNull(dateAdapter, dateAdapter.deserialize(control.value));
      return (!min || !controlValue || dateAdapter.compareDate(min, controlValue) <= 0) ?
          null : {'matDatepickerMin': {'min': min, 'actual': controlValue}};
    };
  }

  /**
   * The form control validator for the max date.
   * @param dateAdapter the date object adapter.
   * @param max The maximum valid date.
   */
  static max<D>(dateAdapter: DateAdapter<D>, max: D): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const controlValue = getValidDateOrNull(dateAdapter, dateAdapter.deserialize(control.value));
      return (!max || !controlValue || dateAdapter.compareDate(max, controlValue) >= 0) ?
          null : {'matDatepickerMax': {'max': max, 'actual': controlValue}};
    };
  }

  /**
   * The form control validator for the date filter.
   * @param dateAdapter the date object adapter.
   * @param dateFilter Function to filter out dates within the datepicker.
   */
  static filter<D>(
    dateAdapter: DateAdapter<D>,
    dateFilter: (date: D | null) => boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const serializedValue = dateAdapter.deserialize(control.value);
      const controlValue = <D>getValidDateOrNull(dateAdapter, serializedValue);
      return !dateFilter || !controlValue || dateFilter(controlValue) ?
          null : {'matDatepickerFilter': true};
    };
  }
}

function getValidDateOrNull<D>(dateAdapter: DateAdapter<D>, obj: any): D | null {
  return (dateAdapter.isDateInstance(obj) && dateAdapter.isValid(obj)) ? obj : null;
}
