/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DateAdapter} from '@angular/material/core';
import {FactoryProvider, Optional, SkipSelf, Injectable} from '@angular/core';
import {Subject, Observable} from 'rxjs';

export class DateRange<D> {
    // DateRange should be a class with a private member.
    // Otherwise any object with a `start` and `end` property might be considered a
    // `DateRange`
    private _disableStructuralEquivalency: never;

    start: D | null;
    end: D | null;

    constructor(range?: { start?: D | null, end?: D | null } | null) {
        this.start = range && range.start || null;
        this.end = range && range.end || null;
    }
}

type ExtractDateTypeFromSelection<T> = T extends DateRange<infer D> ? D : T;

export abstract class MatDateSelectionModel<S, D = ExtractDateTypeFromSelection<S>> {
  protected _valueChangesSubject = new Subject<void>();
  valueChanges: Observable<void> = this._valueChangesSubject.asObservable();

  constructor(protected readonly adapter: DateAdapter<D>, protected _selection: S |
             null = null) {}

  abstract get selection(): S | null;
  abstract set selection(selection: S | null);
  abstract add(date: D): void;
  abstract isComplete(): boolean;
  abstract isValid(): boolean;
  abstract isSame(other: MatDateSelectionModel<any, any>):boolean;
  abstract overlaps(range: DateRange<D>): boolean;
}

/**
 * Concrete implementation of a MatDateSelectionModel that holds a single date.
 */
@Injectable()
export class MatSingleDateSelectionModel<D> extends MatDateSelectionModel<D, D> {

  constructor(adapter: DateAdapter<D>, date?: D | null) {
    super(adapter, date);
  }

  get selection(): D | null {
    return this._selection;
  }

  set selection(selection: D | null) {
    this._selection = selection;
  }

  add(date: D) {
    this._selection = date;
    this._valueChangesSubject.next();
  }

  isComplete(): boolean {
    return this._selection != null;
  }

  isValid(): boolean {
    return this._selection != null && this.adapter.isDateInstance(this._selection) &&
           this.adapter.isValid(this._selection);
  }

  isSame(other: MatDateSelectionModel<D>): boolean {
    return other instanceof MatSingleDateSelectionModel &&
        this._selection === other.selection;
  }

  /**
   * Determines if the single date is within a given date range. Retuns false if either dates of
   * the range is null or if the selection is undefined.
   */
  overlaps(range: DateRange<D>): boolean {
    return !!(this._selection && range.start && range.end &&
        this.adapter.compareDate(range.start, this._selection) <= 0 &&
        this.adapter.compareDate(this._selection, range.end) <= 0);
  }
}

/**
 * Concrete implementation of a MatDateSelectionModel that holds a date range, represented by
 * a start date and an end date.
 */
@Injectable()
export class MatRangeDateSelectionModel<D> extends
  MatDateSelectionModel<DateRange<D>, D> {
  protected _selection: DateRange<D>;

  constructor(adapter: DateAdapter<D>, range?: DateRange<D> | null) {
    super(adapter, range || new DateRange<D>());
  }

  get selection(): DateRange<D> | null {
    return new DateRange(this._selection);
  }

  set selection(selection: DateRange<D> | null) {
    this._selection = new DateRange(selection);
  }

  /**
   * Adds an additional date to the range. If no date is set thus far, it will set it to the
   * beginning. If the beginning is set, it will set it to the end.
   * If add is called on a complete selection, it will empty the selection and set it as the start.
   */
  add(date: D | null): void {
    if (this._selection.start == null) {
      this._selection.start = date;
    } else if (this._selection.end == null) {
      this._selection.end = date;
    } else {
      this._selection.start = date;
      this._selection.end = null;
    }

    this._valueChangesSubject.next();
  }

  setRange(start: D | null, end: D | null) {
    this._selection.start = start;
    this._selection.end = end;
  }

  isComplete(): boolean {
    return this._selection && this._selection.start != null && this._selection.end != null;
  }

  isValid(): boolean {
    return this._selection.start != null && this._selection.end != null &&
        this.adapter.isValid(this._selection.start!) &&
        this.adapter.isValid(this._selection.end!);
  }

  isSame(other: MatDateSelectionModel<D>): boolean {
    if (other instanceof MatRangeDateSelectionModel) {
      return this._selection.start === other._selection.start &&
             this._selection.end === other._selection.end;
    }
    return false;
  }

  /**
   * Returns true if the given range and the selection overlap in any way. False if otherwise, that
   * includes incomplete selections or ranges.
   */
  overlaps(range: DateRange<D>): boolean {
    const selectionStart = this._selection.start;
    const selectionEnd = this._selection.end;
    const rangeStart = range.start;
    const rangeEnd = range.end;
    if (!(selectionStart && selectionEnd && rangeStart && rangeEnd)) {
      return false;
    }

    return (
      this._isBetween(rangeStart, selectionStart, selectionEnd) ||
      this._isBetween(rangeEnd, selectionStart, selectionEnd) ||
      (
        this.adapter.compareDate(rangeStart, selectionStart) <= 0 &&
        this.adapter.compareDate(selectionEnd, rangeEnd) <= 0
      )
    );
  }

  private _isBetween(value: D, from: D, to: D): boolean {
    return this.adapter.compareDate(from, value) <= 0 && this.adapter.compareDate(value, to) <= 0;
  }
}
