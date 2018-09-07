/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DateAdapter} from '@angular/material/core';

export abstract class MatDateSelection<D> {
  abstract add(date: D): void;
  abstract clone(adaptor: DateAdapter<D>): MatDateSelection<D>;
  abstract getFirstSelectedDate(): D|null;
  abstract getLastSelectedDate(): D|null;
  abstract isComplete(): boolean;
  abstract isSame(adapter: DateAdapter<D>, other: MatDateSelection<D>): boolean;
  abstract isValid(adapter: DateAdapter<D>): boolean;
}

export class MatSingleDateSelection<D> extends MatDateSelection<D> {
  private date: D | null = null;

  add(date: D) {
    this.date = date;
  }

  clone(adapter: DateAdapter<D>): MatDateSelection<D> {
    const copy = new MatSingleDateSelection<D>();

    if (this.date) {
      copy.add(adapter.clone(this.date));
    }

    return copy as MatDateSelection<D>;
  }

  getFirstSelectedDate() { return this.date; }

  getLastSelectedDate() { return this.date; }

  isComplete() { return !!this.date; }

  isSame(adapter: DateAdapter<D>, other: MatDateSelection<D>): boolean {
    return other instanceof MatSingleDateSelection &&
        adapter.sameDate(other.getFirstSelectedDate(), this.getFirstSelectedDate());
  }

  isValid(adapter: DateAdapter<D>): boolean {
    return !!(this.date && adapter.isValid(this.date));
  }
}

export class MatRangeDateSelection<D> extends MatDateSelection<D> {
  private start: D | null = null;
  private end: D | null = null;

  add(date: D): void {
    if (!this.start) {
      this.start = date;
    } else if (!this.end) {
      this.end = date;
    } else {
      this.start = date;
      this.end = null;
    }
  }


  clone(adapter: DateAdapter<D>): MatDateSelection<D> {
    const copy = new MatRangeDateSelection<D>();

    if (this.start) {
      copy.setFirstSelectedDate(adapter.clone(this.start));
    }

    if (this.end) {
      copy.setLastSelectedDate(adapter.clone(this.end));
    }

    return copy as MatDateSelection<D>;
  }

  getFirstSelectedDate() { return this.start; }

  getLastSelectedDate() { return this.start; }

  setFirstSelectedDate(value: D | null) { this.start = value; }

  setLastSelectedDate(value: D | null) { this.end = value; }

  isComplete(): boolean {
    return !!(this.start && this.end);
  }

  isSame(adapter: DateAdapter<D>, other: MatDateSelection<D>): boolean {
    return other instanceof MatRangeDateSelection &&
        adapter.sameDate(this.getFirstSelectedDate(), other.getFirstSelectedDate()) &&
        adapter.sameDate(this.getLastSelectedDate(), other.getLastSelectedDate());
  }

  isValid(adapter: DateAdapter<D>): boolean {
    return !!(this.start && this.end && adapter.isValid(this.start!) && adapter.isValid(this.end!));
  }
}
