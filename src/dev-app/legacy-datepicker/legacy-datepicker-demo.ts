/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  Optional,
  ViewChild,
  ViewEncapsulation,
  Directive,
  Injectable,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatDateFormats,
  ThemePalette,
  MatNativeDateModule,
} from '@angular/material/core';
import {
  MatLegacyDatepickerModule,
  MatLegacyCalendarHeader,
  MatLegacyCalendar,
  MatLegacyDatepickerInputEvent,
  MAT_LEGACY_DATE_RANGE_SELECTION_STRATEGY,
  MatLegacyDateRangeSelectionStrategy,
  LegacyDateRange,
} from '@angular/material/legacy-datepicker';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacySelectModule} from '@angular/material/legacy-select';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/** Range selection strategy that preserves the current range. */
@Injectable()
export class PreserveRangeStrategy<D> implements MatLegacyDateRangeSelectionStrategy<D> {
  constructor(private _dateAdapter: DateAdapter<D>) {}

  selectionFinished(date: D, currentRange: LegacyDateRange<D>) {
    let {start, end} = currentRange;

    if (start && end) {
      return this._getRangeRelativeToDate(date, start, end);
    }

    if (start == null) {
      start = date;
    } else if (end == null) {
      end = date;
    }

    return new LegacyDateRange<D>(start, end);
  }

  createPreview(activeDate: D | null, currentRange: LegacyDateRange<D>): LegacyDateRange<D> {
    if (activeDate) {
      if (currentRange.start && currentRange.end) {
        return this._getRangeRelativeToDate(activeDate, currentRange.start, currentRange.end);
      } else if (currentRange.start && !currentRange.end) {
        return new LegacyDateRange(currentRange.start, activeDate);
      }
    }

    return new LegacyDateRange<D>(null, null);
  }

  private _getRangeRelativeToDate(date: D | null, start: D, end: D): LegacyDateRange<D> {
    let rangeStart: D | null = null;
    let rangeEnd: D | null = null;

    if (date) {
      const delta = Math.round(Math.abs(this._dateAdapter.compareDate(start, end)) / 2);
      rangeStart = this._dateAdapter.addCalendarDays(date, -delta);
      rangeEnd = this._dateAdapter.addCalendarDays(date, delta);
    }

    return new LegacyDateRange(rangeStart, rangeEnd);
  }
}

@Directive({
  selector: '[customRangeStrategy]',
  standalone: true,
  providers: [
    {
      provide: MAT_LEGACY_DATE_RANGE_SELECTION_STRATEGY,
      useClass: PreserveRangeStrategy,
    },
  ],
})
export class CustomRangeStrategy {}

// Custom header component for datepicker
@Component({
  selector: 'custom-header',
  templateUrl: 'custom-header.html',
  styleUrls: ['custom-header.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatLegacyButtonModule, MatIconModule],
})
export class CustomHeader<D> implements OnDestroy {
  private readonly _destroyed = new Subject<void>();

  constructor(
    private _calendar: MatLegacyCalendar<D>,
    private _dateAdapter: DateAdapter<D>,
    @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats,
    cdr: ChangeDetectorRef,
  ) {
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
  selector: 'customer-header-ng-content',
  template: `
      <mat-calendar-header #header>
        <button mat-button type="button" (click)="todayClicked()">TODAY</button>
      </mat-calendar-header>
    `,
  standalone: true,
  imports: [MatLegacyButtonModule, MatLegacyDatepickerModule],
})
export class CustomHeaderNgContent<D> {
  @ViewChild(MatLegacyCalendarHeader)
  header: MatLegacyCalendarHeader<D>;

  constructor(@Optional() private _dateAdapter: DateAdapter<D>) {}

  todayClicked() {
    let calendar = this.header.calendar;

    calendar.activeDate = this._dateAdapter.today();
    calendar.currentView = 'month';
  }
}

@Component({
  selector: 'legacy-datepicker-demo',
  templateUrl: 'legacy-datepicker-demo.html',
  styleUrls: ['legacy-datepicker-demo.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatLegacyButtonModule,
    MatLegacyCheckboxModule,
    MatLegacyDatepickerModule,
    MatLegacyFormFieldModule,
    MatIconModule,
    MatLegacyInputModule,
    MatNativeDateModule,
    MatLegacySelectModule,
    ReactiveFormsModule,
    CustomHeader,
    CustomHeaderNgContent,
    CustomRangeStrategy,
  ],
})
export class LegacyDatepickerDemo {
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

  onDateInput = (e: MatLegacyDatepickerInputEvent<Date>) => (this.lastDateInput = e.value);
  onDateChange = (e: MatLegacyDatepickerInputEvent<Date>) => (this.lastDateChange = e.value);

  // pass custom header component type as input
  customHeader = CustomHeader;
  customHeaderNgContent = CustomHeaderNgContent;
}
