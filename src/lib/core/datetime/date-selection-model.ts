/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FactoryProvider, Injectable, Optional, SkipSelf} from '@angular/core';
import {Subject} from 'rxjs';
import {DateAdapter} from './date-adapter';


export abstract class MatDateSelectionModel<D> {
  valueChanges = new Subject<void>();

  constructor(protected readonly adapter: DateAdapter<D>) {}

  dispose() {
    this.valueChanges.complete();
  }

  abstract add(date: D | null): void;
  abstract clone(): MatDateSelectionModel<D>;
  abstract getFirstSelectedDate(): D|null;
  abstract getLastSelectedDate(): D|null;
  abstract isComplete(): boolean;
  abstract isSame(other: MatDateSelectionModel<D>): boolean;
  abstract isValid(): boolean;
  abstract contains(value: D): boolean;
  abstract overlaps(range: DateRange<D>): boolean;
}

export interface DateRange<D> {
  start: D | null;
  end: D | null;
}

/**
 * Concrete implementation of a MatDateSelectionModel that holds a single date.
 */
@Injectable()
export class MatSingleDateSelectionModel<D> extends MatDateSelectionModel<D> {
  private date: D | null = null;

  constructor(adapter: DateAdapter<D>) {
    super(adapter);
  }

  setSelection(date: D | null) {
    this.date = date;
  }

  add(date: D | null) {
    this.date = date;
    this.valueChanges.next();
  }

  compareDate(other: MatSingleDateSelectionModel<D>) {
    const date = this.asDate();
    const otherDate = other.asDate();
    if (date && otherDate) {
      return this.adapter.compareDate(date, otherDate);
    }

    throw Error;
  }

  clone(): MatDateSelectionModel<D> {
    const cloned = new MatSingleDateSelectionModel<D>(this.adapter);
    cloned.setSelection(this.date);
    return cloned;
  }

  getFirstSelectedDate() { return this.date; }

  getLastSelectedDate() { return this.date; }

  isComplete() { return !!this.date; }

  isSame(other: MatDateSelectionModel<D>): boolean {
    return other instanceof MatSingleDateSelectionModel &&
        this.adapter.sameDate(other.getFirstSelectedDate(), this.getFirstSelectedDate());
  }

  isValid(): boolean {
    return !!(this.date &&
      this.adapter.isDateInstance(this.date) &&
      this.adapter.isValid(this.date));
  }

  asDate(): D | null {
    return this.isValid() ? this.adapter.deserialize(this.date) : null;
  }

  contains(value: D): boolean {
    return !!(this.date && this.adapter.sameDate(value, this.date));
  }

  /**
   * Determines if the single date is within a given date range. Retuns false if either dates of
   * the range is null or if the selection is undefined.
   */
  overlaps(range: DateRange<D>): boolean {
    return !!(this.date && range.start && range.end &&
        this.adapter.compareDate(range.start, this.date) <= 0 &&
        this.adapter.compareDate(this.date, range.end) <= 0);
  }
}

/**
 * Concrete implementation of a MatDateSelectionModel that holds a date range, represented by
 * a start date and an end date.
 */
@Injectable()
export class MatRangeDateSelectionModel<D> extends MatDateSelectionModel<D> {
  private start: D | null = null;
  private end: D | null = null;

  constructor(adapter: DateAdapter<D>) {
    super(adapter);
  }

  /**
   * Adds an additional date to the range. If no date is set thus far, it will set it to the
   * beginning. If the beginning is set, it will set it to the end.
   * If add is called on a complete selection, it will empty the selection and set it as the start.
   */
  add(date: D): void {
    if (!this.start) {
      this.start = date;
    } else if (!this.end) {
      this.end = date;
    } else {
      this.start = date;
      this.end = null;
    }

    this.valueChanges.next();
  }

  setSelection(range: DateRange<D>) {
    this.start = range.start;
    this.end = range.end;
  }

  clone(): MatDateSelectionModel<D> {
    const cloned = new MatRangeDateSelectionModel<D>(this.adapter);
    cloned.setSelection({start: this.start, end: this.end});
    return cloned;
  }

  getFirstSelectedDate() { return this.start; }

  getLastSelectedDate() { return this.end; }

  setFirstSelectedDate(value: D | null) { this.start = value; }

  setLastSelectedDate(value: D | null) { this.end = value; }

  isComplete(): boolean {
    return !!(this.start && this.end);
  }

  isSame(other: MatDateSelectionModel<D>): boolean {
    return other instanceof MatRangeDateSelectionModel &&
        this.adapter.sameDate(this.getFirstSelectedDate(), other.getFirstSelectedDate()) &&
        this.adapter.sameDate(this.getLastSelectedDate(), other.getLastSelectedDate());
  }

  isValid(): boolean {
    return !!(this.start && this.end &&
        this.adapter.isValid(this.start!) && this.adapter.isValid(this.end!));
  }

  asRange(): DateRange<D> {
    return {
      start: this.start,
      end: this.end,
    };
  }

  contains(value: D): boolean {
    if (this.start && this.end) {
      return this.adapter.compareDate(this.start, value) <= 0 &&
          this.adapter.compareDate(this.end, value) >= 0;
    } else if (this.start) {
      return this.adapter.sameDate(this.start, value);
    }

    return false;
  }

  /**
   * Returns true if the given range and the selection overlap in any way. False if otherwise, that
   * includes incomplete selections or ranges.
   */
  overlaps(range: DateRange<D>): boolean {
    if (!(this.start && this.end && range.start && range.end)) {
      return false;
    }

    return (
      this.isBetween(range.start, this.start, this.end) ||
      this.isBetween(range.end, this.start, this.end) ||
      (
        this.adapter.compareDate(range.start, this.start) <= 0 &&
        this.adapter.compareDate(this.end, range.end) <= 0
      )
    );
  }

  private isBetween(value: D, from: D, to: D): boolean {
    return this.adapter.compareDate(from, value) <= 0 && this.adapter.compareDate(value, to) <= 0;
  }
}

export function MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY<D>(parent: MatSingleDateSelectionModel<D>,
                                                           adapter: DateAdapter<D>) {
  return parent || new MatSingleDateSelectionModel(adapter);
}

export const MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER: FactoryProvider = {
  provide: MatDateSelectionModel,
  deps: [[new Optional(), new SkipSelf(), MatDateSelectionModel], DateAdapter],
  useFactory: MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY,
};
