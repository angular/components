/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  Injectable,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {JsonPipe} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {DateAdapter, MAT_DATE_FORMATS, ThemePalette} from '@angular/material/core';
import {
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatCalendar,
  MatCalendarHeader,
  MatDateRangeSelectionStrategy,
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/** Range selection strategy that preserves the current range. */
@Injectable()
export class PreserveRangeStrategy<D> implements MatDateRangeSelectionStrategy<D> {
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter<D>);

  selectionFinished(date: D, currentRange: DateRange<D>) {
    let {start, end} = currentRange;

    if (start && end) {
      return this._getRangeRelativeToDate(date, start, end);
    }

    if (start == null) {
      start = date;
    } else if (end == null) {
      end = date;
    }

    return new DateRange<D>(start, end);
  }

  createPreview(activeDate: D | null, currentRange: DateRange<D>): DateRange<D> {
    if (activeDate) {
      if (currentRange.start && currentRange.end) {
        return this._getRangeRelativeToDate(activeDate, currentRange.start, currentRange.end);
      } else if (currentRange.start && !currentRange.end) {
        return new DateRange(currentRange.start, activeDate);
      }
    }

    return new DateRange<D>(null, null);
  }

  private _getRangeRelativeToDate(date: D | null, start: D, end: D): DateRange<D> {
    let rangeStart: D | null = null;
    let rangeEnd: D | null = null;

    if (date) {
      const delta = Math.round(Math.abs(this._dateAdapter.compareDate(start, end)) / 2);
      rangeStart = this._dateAdapter.addCalendarDays(date, -delta);
      rangeEnd = this._dateAdapter.addCalendarDays(date, delta);
    }

    return new DateRange(rangeStart, rangeEnd);
  }
}

@Directive({
  selector: '[customRangeStrategy]',
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: PreserveRangeStrategy,
    },
  ],
})
export class CustomRangeStrategy {}

// Custom header component for datepicker
@Component({
  selector: 'custom-header',
  templateUrl: 'custom-header.html',
  styleUrl: 'custom-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule],
})
export class CustomHeader<D> implements OnDestroy {
  private _calendar = inject<MatCalendar<D>>(MatCalendar);
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);
  private _dateFormats = inject(MAT_DATE_FORMATS);

  private readonly _destroyed = new Subject<void>();

  constructor() {
    const _calendar = this._calendar;
    const cdr = inject(ChangeDetectorRef);

    _calendar.stateChanges.pipe(takeUntil(this._destroyed)).subscribe(() => cdr.markForCheck());
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  get periodLabel() {
    return this._dateAdapter
      .format(this._calendar.activeDate, this._dateFormats.display.monthYearLabel)
      .toLocaleUpperCase();
  }

  previousClicked(mode: 'month' | 'year') {
    this._calendar.activeDate =
      mode === 'month'
        ? this._dateAdapter.addCalendarMonths(this._calendar.activeDate, -1)
        : this._dateAdapter.addCalendarYears(this._calendar.activeDate, -1);
  }

  nextClicked(mode: 'month' | 'year') {
    this._calendar.activeDate =
      mode === 'month'
        ? this._dateAdapter.addCalendarMonths(this._calendar.activeDate, 1)
        : this._dateAdapter.addCalendarYears(this._calendar.activeDate, 1);
  }
}

@Component({
  selector: 'custom-header-ng-content',
  template: `
      <mat-calendar-header #header>
        <button mat-button type="button" (click)="todayClicked()">TODAY</button>
      </mat-calendar-header>
    `,
  imports: [MatDatepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomHeaderNgContent<D> {
  private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);

  @ViewChild(MatCalendarHeader)
  header: MatCalendarHeader<D>;

  todayClicked() {
    let calendar = this.header.calendar;

    calendar.activeDate = this._dateAdapter.today();
    calendar.currentView = 'month';
  }
}

@Component({
  selector: 'datepicker-demo',
  templateUrl: 'datepicker-demo.html',
  styleUrl: 'datepicker-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    JsonPipe,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    CustomRangeStrategy,
  ],
})
export class DatepickerDemo {
  touch: boolean;
  filterOdd: boolean;
  yearView: boolean;
  inputDisabled: boolean;
  datepickerDisabled: boolean;
  minDate: Date;
  maxDate: Date;
  startAt: Date;
  date: any;
  lastDateInput: Date | null;
  lastDateChange: Date | null;
  color: ThemePalette;
  showActions = false;

  dateCtrl = new FormControl<Date | null>(null);
  range1 = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  range2 = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  range3 = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  comparisonStart: Date;
  comparisonEnd: Date;

  constructor() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    this.comparisonStart = new Date(year, month, 9);
    this.comparisonEnd = new Date(year, month, 13);
  }

  dateFilter: (date: Date | null) => boolean = (date: Date | null) => {
    if (date === null) {
      return true;
    }
    return !(date.getFullYear() % 2) && Boolean(date.getMonth() % 2) && !(date.getDate() % 2);
  };

  onDateInput = (e: MatDatepickerInputEvent<Date, Date | null>) => (this.lastDateInput = e.value);
  onDateChange = (e: MatDatepickerInputEvent<Date, Date | null>) => (this.lastDateChange = e.value);

  // pass custom header component type as input
  customHeader = CustomHeader;
  customHeaderNgContent = CustomHeaderNgContent;
}
