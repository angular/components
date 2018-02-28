/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs/Subject';
import {DateAdapter} from '@angular/material/core';
import {EventEmitter} from '@angular/core';


/**
 * Class to be used to power selecting one or two dates.
 */
export class MatDateSelectionModel<D> {

  /** Event emitted when the value has changed. */
  readonly onChange: Subject<MatDateSelectionChange<D>> = new EventEmitter();

  /** In range there is two selections necessary. */
  private _selectionFinished = true;

  constructor(public _dateAdapter: DateAdapter<D>,
              private _rangeMode = false,
              private _selected: D | null = null) {
    if (this._selected !== undefined) {
      this.validateDate(this._selected);
    }
  }

  /** Selected value. */
  get selected(): D | null {
    return this._selected;
  }

  get rangeMode(): boolean {
    return this._rangeMode;
  }

  /*
   * Clears selected value.
   */
  clear(): void {
    this._selected = null;
    this._emitChangeEvent();
  }

  /**
   * Determines whether a value is selected.
   */
  isSelected(): boolean {
    return this._selected !== null;
  }

  /**
   * Selects passed value. In range mode, the value will be attached to begin or end of range.
   */
  select(value: D | null) {
    this.validateDate(value);
    const oldValue = this._selected;
    this._selected = value;
    if (oldValue === undefined || !this._dateAdapter.sameDate(oldValue, value)) {
      this._emitChangeEvent();
    }
  }

  /** Emits a change event. */
  private _emitChangeEvent() {
    this.onChange.next({
      value: this.selected,
      source: this,
      selectionFinished: this._selectionFinished,
    });
  }

  /**
   * @param obj The object to check.
   * @returns The given object if it is both a date instance and valid, otherwise null.
   */
  private validateDate(obj: any): void {
    if (obj !== null &&
      (!this._dateAdapter.isDateInstance(obj) || !this._dateAdapter.isValid(obj))) {
      throw Error(`MatDateSelectionModel: The passed value is not a correct date or null`);
    }
  }
}

/**
 * Event emitted when the value of a MatDateSelectionModel has changed.
 * @docs-private
 */
export interface MatDateSelectionChange<D> {
  /** The value from model */
  value: D | null;
  /** Model that dispatched the event. */
  source: MatDateSelectionModel<D>;
  /** Whenever all necessary selection is made. */
  selectionFinished: boolean;
}
