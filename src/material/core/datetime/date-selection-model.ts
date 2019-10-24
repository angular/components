/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DateAdapter} from '@angular/material/core';
import {Subject, Observable} from 'rxjs';

export abstract class MatDateSelectionModel<D> {
  protected _valueChangesSubject = new Subject<void>();
  valueChanges: Observable<void> = this._valueChangesSubject.asObservable();

  constructor(protected readonly adapter: DateAdapter<D>) {}

  destroy() {
    this._valueChangesSubject.complete();
  }

  abstract add(date: D | null): void;
  abstract isComplete(): boolean;
  abstract isSame(other: MatDateSelectionModel<D>): boolean;
  abstract isValid(): boolean;
}

export interface DateRange<D> {
  start: D | null;
  end: D | null;
}

/**
 * Concrete implementation of a MatDateSelectionModel that holds a single date.
 */
export class MatSingleDateSelectionModel<D> extends MatDateSelectionModel<D> {
  private _date: D | null = null;

  constructor(adapter: DateAdapter<D>, date?: D | null) {
    super(adapter);
    this._date = date === undefined ? null : date;
  }

  add(date: D | null) {
    this._date = date;
    this._valueChangesSubject.next();
  }

  compareDate(other: MatSingleDateSelectionModel<D>) {
    const date = this.asDate();
    const otherDate = other.asDate();
    if (date != null && otherDate != null) {
      return this.adapter.compareDate(date, otherDate);
    }
    return date === otherDate;
  }

  isComplete() { return this._date != null; }

  isSame(other: MatDateSelectionModel<D>): boolean {
    return other instanceof MatSingleDateSelectionModel &&
        this.adapter.sameDate(other.asDate(), this._date);
  }

  isValid(): boolean {
    return this._date != null && this.adapter.isDateInstance(this._date) &&
           this.adapter.isValid(this._date);
  }

  asDate(): D | null {
    return this.isValid() ? this._date : null;
  }

  setDate(date: D | null) {
    this._date = date;
    this._valueChangesSubject.next();
  }
}

/**
 * Concrete implementation of a MatDateSelectionModel that holds a date range, represented by
 * a start date and an end date.
 */
export class MatRangeDateSelectionModel<D> extends MatDateSelectionModel<D> {
  private _start: D | null = null;
  private _end: D | null = null;

  constructor(adapter: DateAdapter<D>, start?: D | null, end?: D | null) {
    super(adapter);
    this._start = start === undefined ? null : start;
    this._end = end === undefined ? null : end;
  }

  /**
   * Adds an additional date to the range. If no date is set thus far, it will set it to the
   * beginning. If the beginning is set, it will set it to the end.
   * If add is called on a complete selection, it will empty the selection and set it as the start.
   */
  add(date: D | null): void {
    if (this._start == null) {
      this._start = date;
    } else if (this._end == null) {
      this._end = date;
    } else {
      this._start = date;
      this._end = null;
    }

    this._valueChangesSubject.next();
  }

  setRange(start: D | null, end: D | null) {
    this._start = start;
    this._end = end;
  }

  isComplete(): boolean {
    return this._start != null && this._end != null;
  }

  isSame(other: MatDateSelectionModel<D>): boolean {
    if (other instanceof MatRangeDateSelectionModel) {
      const otherRange = other.asRange();
      return this.adapter.sameDate(this._start, otherRange.start) &&
             this.adapter.sameDate(this._end, otherRange.end);
    }
    return false;
  }

  isValid(): boolean {
    return this._start != null && this._end != null &&
        this.adapter.isValid(this._start!) && this.adapter.isValid(this._end!);
  }

  asRange(): DateRange<D> {
    return {
      start: this._start,
      end: this._end,
    };
  }
}
