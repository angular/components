/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FactoryProvider, Injectable, OnDestroy, Optional, SkipSelf} from '@angular/core';
import {Subject} from 'rxjs';
import {DateAdapter} from './date-adapter';


/** A selection model used to represent the currently selected value in a date picker. */
export abstract class MatDateSelectionModel<D> implements OnDestroy {
  /** Emits when the selected value has changed. */
  selectionChange = new Subject<void>();

  protected constructor(protected readonly adapter: DateAdapter<D>) {}

  ngOnDestroy() {
    this.selectionChange.complete();
  }

  /** Adds a date to the current selection. */
  abstract add(date: D): void;

  /** Clones this selection model. */
  abstract clone(): MatDateSelectionModel<D>;

  /** Gets the first date in the current selection. */
  abstract getFirstSelectedDate(): D | null;

  /** Gets the last date in the current selection. */
  abstract getLastSelectedDate(): D | null;

  /** Whether the selection is complete for this selection model. */
  abstract isComplete(): boolean;

  /** Whether the selection model contains the same selection as the given selection model. */
  abstract isSame(other: MatDateSelectionModel<D>): boolean;

  /** Whether the current selection is valid. */
  abstract isValid(): boolean;

  /** Whether the given date is contained in the current selection. */
  abstract contains(value: D): boolean;

  /** Whether the given date range overlaps the current selection in any way. */
  abstract overlaps(range: DateRange<D>): boolean;
}

/** Represents a date range. */
export interface DateRange<D> {
  /** The start of the range. */
  start: D | null;

  /** The end of the range. */
  end: D | null;
}

/** A concrete implementation of a `MatDateSelectionModel` that holds a single date. */
@Injectable()
export class MatSingleDateSelectionModel<D> extends MatDateSelectionModel<D> {
  private date: D | null = null;

  constructor(adapter: DateAdapter<D>) {
    super(adapter);
  }

  /** Sets the current selection. */
  setSelection(date: D | null) {
    this.date = date;
  }

  /** Gets the current selection. */
  getSelection(): D | null {
    return this.isValid() ? this.date : null;
  }

  /**
   * Adds the given date to the selection model. For a `MatSingleDateSelectionModel` this means
   * simply replacing the current selection with the given selection.
   */
  add(date: D) {
    if (!this.adapter.sameDate(date, this.date)) {
      this.date = date;
      this.selectionChange.next();
    }
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
        this.adapter.sameDate(other.date, this.date);
  }

  isValid(): boolean {
    return !!(this.date &&
      this.adapter.isDateInstance(this.date) &&
      this.adapter.isValid(this.date));
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

  /** Sets the current selection. */
  setSelection(range: DateRange<D>) {
    this.start = range.start;
    this.end = range.end;
  }

  /** Gets the current selection. */
  getSelection(): DateRange<D> {
    return {
      start: this.start,
      end: this.end,
    };
  }

  /**
   * Adds the given date to the selection model. For a `MatRangeDateSelectionModel` this means:
   * - Setting the start date if nothing is already selected.
   * - Setting the end date if the start date is already set but the end is not.
   * - Clearing the selection and setting the start date if both the start and end are already set.
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

    this.selectionChange.next();
  }

  clone(): MatDateSelectionModel<D> {
    const cloned = new MatRangeDateSelectionModel<D>(this.adapter);
    cloned.setSelection({start: this.start, end: this.end});
    return cloned;
  }

  getFirstSelectedDate() { return this.start; }

  getLastSelectedDate() { return this.end; }

  isComplete(): boolean {
    return !!(this.start && this.end);
  }

  isSame(other: MatDateSelectionModel<D>): boolean {
    return other instanceof MatRangeDateSelectionModel &&
        this.adapter.sameDate(this.start, other.start) &&
        this.adapter.sameDate(this.end, other.end);
  }

  isValid(): boolean {
    return !!(this.start && this.end &&
        this.adapter.isValid(this.start!) && this.adapter.isValid(this.end!));
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
      this._isBetween(range.start, this.start, this.end) ||
      this._isBetween(range.end, this.start, this.end) ||
      (
        this.adapter.compareDate(range.start, this.start) <= 0 &&
        this.adapter.compareDate(this.end, range.end) <= 0
      )
    );
  }

  private _isBetween(value: D, from: D, to: D): boolean {
    return this.adapter.compareDate(from, value) <= 0 && this.adapter.compareDate(value, to) <= 0;
  }
}

/**
 * A factory used to create a `MatDateSelectionModel`. If one is provided by the parent it reuses
 * that one, if not it creates a new `MatSingleDateSelectionModel`.
 */
export function MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY<D>(parent: MatSingleDateSelectionModel<D>,
                                                           adapter: DateAdapter<D>) {
  return parent || new MatSingleDateSelectionModel(adapter);
}

/**
 * A provider that re-provides the parent `MatDateSelectionModel` if available, otherwise provides a
 * new `MatSingleDateSelectionModel`
 */
export const MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER: FactoryProvider = {
  provide: MatDateSelectionModel,
  deps: [[new Optional(), new SkipSelf(), MatDateSelectionModel], DateAdapter],
  useFactory: MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY,
};
