/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FactoryProvider, Injectable, Optional, SkipSelf, OnDestroy} from '@angular/core';
import {DateAdapter} from './date-adapter';
import {Observable, Subject} from 'rxjs';

/** A class representing a range of dates. */
export class DateRange<D> {
  /**
   * Ensures that objects with a `start` and `end` property can't be assigned to a variable that
   * expects a `DateRange`
   */
  // tslint:disable-next-line:no-unused-variable
  private _disableStructuralEquivalency: never;

  constructor(
    /** The start date of the range. */
    readonly start: D | null,
    /** The end date of the range. */
    readonly end: D | null) {}
}

type ExtractDateTypeFromSelection<T> = T extends DateRange<infer D> ? D : NonNullable<T>;

/** Event emitted by the date selection model when its selection changes. */
export interface DateSelectionModelChange<S> {
  /** New value for the selection. */
  selection: S;

  /** Object that triggered the change. */
  source: unknown;
}

/** A selection model containing a date selection. */
export abstract class MatDateSelectionModel<S, D = ExtractDateTypeFromSelection<S>>
    implements OnDestroy {
  private _selectionChanged = new Subject<DateSelectionModelChange<S>>();

  /** Emits when the selection has changed. */
  selectionChanged: Observable<DateSelectionModelChange<S>> = this._selectionChanged.asObservable();

  protected constructor(
    /** Date adapter used when interacting with dates in the model. */
    protected readonly adapter: DateAdapter<D>,
    /** The current selection. */
    readonly selection: S) {
    this.selection = selection;
  }

  /**
   * Updates the current selection in the model.
   * @param value New selection that should be assigned.
   * @param source Object that triggered the selection change.
   */
  updateSelection(value: S, source: unknown) {
    (this as {selection: S}).selection = value;
    this._selectionChanged.next({selection: value, source});
  }

  ngOnDestroy() {
    this._selectionChanged.complete();
  }

  /** Adds a date to the current selection. */
  abstract add(date: D | null): void;

  /** Checks whether the current selection is complete. */
  abstract isComplete(): boolean;

  /** Checks whether the current selection is identical to the passed-in selection. */
  abstract isSame(other: S): boolean;

  /** Checks whether the current selection is valid. */
  abstract isValid(): boolean;

  /** Checks whether the current selection overlaps with the given range. */
  abstract overlaps(range: DateRange<D>): boolean;
}

/**  A selection model that contains a single date. */
@Injectable()
export class MatSingleDateSelectionModel<D> extends MatDateSelectionModel<D | null, D> {
  constructor(adapter: DateAdapter<D>) {
    super(adapter, null);
  }

  /**
   * Adds a date to the current selection. In the case of a single date selection, the added date
   * simply overwrites the previous selection
   */
  add(date: D | null) {
    super.updateSelection(date, this);
  }

  /**
   * Checks whether the current selection is complete. In the case of a single date selection, this
   * is true if the current selection is not null.
   */
  isComplete() { return this.selection != null; }

  /** Checks whether the current selection is identical to the passed-in selection. */
  isSame(other: D): boolean {
    return this.adapter.sameDate(other, this.selection);
  }

  /**
   * Checks whether the current selection is valid. In the case of a single date selection, this
   * means that the current selection is not null and is a valid date.
   */
  isValid(): boolean {
    return this.selection != null && this.adapter.isDateInstance(this.selection) &&
        this.adapter.isValid(this.selection);
  }

  /** Checks whether the current selection overlaps with the given range. */
  overlaps(range: DateRange<D>): boolean {
    return !!(this.selection && range.start && range.end &&
        this.adapter.compareDate(range.start, this.selection) <= 0 &&
        this.adapter.compareDate(this.selection, range.end) <= 0);
  }
}

/**  A selection model that contains a date range. */
@Injectable()
export class MatRangeDateSelectionModel<D> extends MatDateSelectionModel<DateRange<D>, D> {
  constructor(adapter: DateAdapter<D>) {
    super(adapter, new DateRange<D>(null, null));
  }

  /**
   * Adds a date to the current selection. In the case of a date range selection, the added date
   * fills in the next `null` value in the range. If both the start and the end already have a date,
   * the selection is reset so that the given date is the new `start` and the `end` is null.
   */
  add(date: D | null): void {
    let {start, end} = this.selection;

    if (start == null) {
      start = date;
    } else if (end == null) {
      end = date;
    } else {
      start = date;
      end = null;
    }

    super.updateSelection(new DateRange<D>(start, end), this);
  }

  /**
   * Checks whether the current selection is complete. In the case of a date range selection, this
   * is true if the current selection has a non-null `start` and `end`.
   */
  isComplete(): boolean {
    return this.selection.start != null && this.selection.end != null;
  }

  /** Checks whether the current selection is identical to the passed-in selection. */
  isSame(other: DateRange<D>): boolean {
      return this.adapter.sameDate(this.selection.start, other.start) &&
             this.adapter.sameDate(this.selection.end, other.end);
  }

  /**
   * Checks whether the current selection is valid. In the case of a date range selection, this
   * means that the current selection has a `start` and `end` that are both non-null and valid
   * dates.
   */
  isValid(): boolean {
    return this.selection.start != null && this.selection.end != null &&
        this.adapter.isValid(this.selection.start!) && this.adapter.isValid(this.selection.end!);
  }

  /**
   * Returns true if the given range and the selection overlap in any way. False if otherwise, that
   * includes incomplete selections or ranges.
   */
  overlaps(range: DateRange<D>): boolean {
    if (!(this.selection.start && this.selection.end && range.start && range.end)) {
      return false;
    }

    return (
        this._isBetween(range.start, this.selection.start, this.selection.end) ||
        this._isBetween(range.end, this.selection.start, this.selection.end) ||
        (
            this.adapter.compareDate(range.start, this.selection.start) <= 0 &&
            this.adapter.compareDate(this.selection.end, range.end) <= 0
        )
    );
  }

  private _isBetween(value: D, from: D, to: D): boolean {
    return this.adapter.compareDate(from, value) <= 0 && this.adapter.compareDate(value, to) <= 0;
  }
}

/** @docs-private */
export function MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY(
    parent: MatSingleDateSelectionModel<unknown>, adapter: DateAdapter<unknown>) {
  return parent || new MatSingleDateSelectionModel(adapter);
}

/** Used to provide a single selection model to a component. */
export const MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER: FactoryProvider = {
  provide: MatDateSelectionModel,
  deps: [[new Optional(), new SkipSelf(), MatDateSelectionModel], DateAdapter],
  useFactory: MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY,
};
