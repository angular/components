/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DateAdapter} from '@angular/material/core';
import {Subject} from 'rxjs';

export abstract class MatDateSelectionModel<D> {
  private _valueChangesSubject = new Subject<void>();
  valueChanges = this._valueChangesSubject.asObservable();

  constructor(protected readonly adapter: DateAdapter<D>) {}

  destroy() {
    this.valueChanges.complete();
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
  private date: D | null = null;

  constructor(adapter: DateAdapter<D>, date?: D | null) {
    super(adapter);
    this.date = date === undefined ? null : date;
  }

  add(date: D | null) {
    this.date = date;
    this.valueChanges.next();
  }

  compareDate(other: MatSingleDateSelectionModel<D>) {
    const date = this.asDate();
    const otherDate = other.asDate();
    if (date != null && otherDate != null) {
      return this.adapter.compareDate(date, otherDate);
    }
    return date === otherDate;
  }

  isComplete() { return this.date != null; }

  isSame(other: MatDateSelectionModel<D>): boolean {
    return other instanceof MatSingleDateSelectionModel &&
        this.adapter.sameDate(other.asDate(), this.date);
  }

  isValid(): boolean {
    return this.date != null && this.adapter.isDateInstance(this.date) &&
           this.adapter.isValid(this.date);
  }

  asDate(): D | null {
    return (this.isValid()) ? this.date : null;
  }
}

/**
 * Concrete implementation of a MatDateSelectionModel that holds a date range, represented by
 * a start date and an end date.
 */
export class MatRangeDateSelectionModel<D> extends MatDateSelectionModel<D> {
  private start: D | null = null;
  private end: D | null = null;

  constructor(adapter: DateAdapter<D>, start?: D | null, end?: D | null) {
    super(adapter);

    this.start = start === undefined ? null : start;

    this.end = end === undefined ? null : end;
  }

  /**
   * Adds an additional date to the range. If no date is set thus far, it will set it to the
   * beginning. If the beginning is set, it will set it to the end.
   * If add is called on a complete selection, it will empty the selection and set it as the start.
   */
  add(date: D | null): void {
    if (this.start == null) {
      this.start = date;
    } else if (this.end == null) {
      this.end = date;
    } else {
      this.start = date;
      this.end = null;
    }

    this.valueChanges.next();
  }

  setRange(start: D | null, end: D | null) {
    this.start = start;
    this.end = end;
  }

  isComplete(): boolean {
    return this.start != null && this.end != null;
  }

  isSame(other: MatDateSelectionModel<D>): boolean {
    if (other instanceof MatRangeDateSelectionModel) {
      otherRange = other.asRange();
      return this.adapter.sameDate(this.start, otherRange.start) &&
             this.adapter.sameDate(this.end, otherRange.end);
    }
    return false;
  }

  isValid(): boolean {
    return this.start != null && this.end != null &&
        this.adapter.isValid(this.start!) && this.adapter.isValid(this.end!);
  }

  asRange(): DateRange<D> {
    return {
      start: this.start,
      end: this.end,
    };
  }
}
