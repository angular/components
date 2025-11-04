/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  inject,
  Component,
  WritableSignal,
  signal,
  Signal,
  computed,
  untracked,
  afterRenderEffect,
} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats} from '@angular/material/core';
import {Grid, GridRow, GridCell, GridCellWidget} from '@angular/aria/grid';

const DAYS_PER_WEEK = 7;

interface CalendarCell<D = any> {
  displayName: string;
  ariaLabel: string;
  date: D;
  selected: WritableSignal<boolean>;
}

/** @title Grid Calendar. */
@Component({
  selector: 'grid-calendar-example',
  exportAs: 'GridCalendarExample',
  templateUrl: 'grid-calendar-example.html',
  styleUrls: ['../grid-common.css', 'grid-calendar-example.css'],
  imports: [Grid, GridRow, GridCell, GridCellWidget],
})
export class GridCalendarExample<D> {
  private readonly _dateAdapter = inject<DateAdapter<D>>(DateAdapter, {optional: true})!;
  private readonly _dateFormats = inject<MatDateFormats>(MAT_DATE_FORMATS, {optional: true})!;
  private readonly _firstWeekOffset: Signal<number> = computed(() => {
    const firstOfMonth = this._dateAdapter.createDate(
      this._dateAdapter.getYear(this.viewMonth()),
      this._dateAdapter.getMonth(this.viewMonth()),
      1,
    );

    return (
      (DAYS_PER_WEEK +
        this._dateAdapter.getDayOfWeek(firstOfMonth) -
        this._dateAdapter.getFirstDayOfWeek()) %
      DAYS_PER_WEEK
    );
  });

  private readonly _activeDate: WritableSignal<D> = signal(this._dateAdapter.today());
  readonly displayActiveDate: Signal<string> = computed(() =>
    this._dateAdapter.format(this._activeDate(), this._dateFormats.display),
  );

  readonly monthYearLabel: Signal<string> = computed(() =>
    this._dateAdapter
      .format(this.viewMonth(), this._dateFormats.display.monthYearLabel)
      .toLocaleUpperCase(),
  );
  readonly prevMonthNumDays: Signal<number> = computed(() =>
    this._dateAdapter.getNumDaysInMonth(this._dateAdapter.addCalendarMonths(this.viewMonth(), -1)),
  );
  readonly daysFromPrevMonth: Signal<number[]> = computed(() => {
    const days: number[] = [];
    for (let i = this._firstWeekOffset() - 1; i >= 0; i--) {
      days.push(this.prevMonthNumDays() - i);
    }
    return days;
  });
  readonly viewMonth: WritableSignal<D> = signal(this._dateAdapter.today());
  readonly weekdays: Signal<{long: string; narrow: string}[]> = computed(() => {
    const firstDayOfWeek = this._dateAdapter.getFirstDayOfWeek();
    const narrowWeekdays = this._dateAdapter.getDayOfWeekNames('narrow');
    const longWeekdays = this._dateAdapter.getDayOfWeekNames('long');

    // Rotate the labels for days of the week based on the configured first day of the week.
    const weekdays = longWeekdays.map((long, i) => {
      return {long, narrow: narrowWeekdays[i]};
    });
    return weekdays.slice(firstDayOfWeek).concat(weekdays.slice(0, firstDayOfWeek));
  });
  readonly weeks: Signal<CalendarCell<D>[][]> = computed(() =>
    this._createWeekCells(this.viewMonth()),
  );

  constructor() {
    afterRenderEffect(() => {
      for (const day of this.weeks().flat()) {
        if (day.selected()) {
          this._activeDate.set(day.date);
          return;
        }
      }
    });
  }

  nextMonth(): void {
    this.viewMonth.set(this._dateAdapter.addCalendarMonths(this.viewMonth(), 1));
  }

  prevMonth(): void {
    this.viewMonth.set(this._dateAdapter.addCalendarMonths(this.viewMonth(), -1));
  }

  private _createWeekCells(viewMonth: D): CalendarCell[][] {
    const daysInMonth = this._dateAdapter.getNumDaysInMonth(viewMonth);
    const dateNames = this._dateAdapter.getDateNames();
    const weeks: CalendarCell[][] = [[]];
    for (let i = 0, cell = this._firstWeekOffset(); i < daysInMonth; i++, cell++) {
      if (cell == DAYS_PER_WEEK) {
        weeks.push([]);
        cell = 0;
      }
      const date = this._dateAdapter.createDate(
        this._dateAdapter.getYear(viewMonth),
        this._dateAdapter.getMonth(viewMonth),
        i + 1,
      );
      const ariaLabel = this._dateAdapter.format(date, this._dateFormats.display.dateA11yLabel);

      weeks[weeks.length - 1].push({
        displayName: dateNames[i],
        ariaLabel,
        date,
        selected: signal(
          this._dateAdapter.compareDate(
            date,
            untracked(() => this._activeDate()),
          ) === 0,
        ),
      });
    }
    return weeks;
  }
}
