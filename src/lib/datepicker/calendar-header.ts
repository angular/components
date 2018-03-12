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
  Host,
  Inject,
  OnDestroy,
  Optional,
  ViewEncapsulation
} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {MatDatepickerIntl} from './datepicker-intl';
import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats} from '@angular/material/core';
import {takeUntil} from 'rxjs/operators/takeUntil';
import {yearsPerPage} from './multi-year-view';
import {MatCalendar} from './calendar';

/** Default header for MatCalendar */
@Component({
  moduleId: module.id,
  selector: 'mat-calendar-header',
  templateUrl: 'calendar-header.html',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatCalendarHeader implements OnDestroy {
  /** Subject that emits when the component has been destroyed. */
  private _destroyed = new Subject<void>();

  constructor(private _intl: MatDatepickerIntl,
              @Host() public calendar: MatCalendar<any>,
              @Optional() private _dateAdapter: DateAdapter<any>,
              @Optional() @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats,
              changeDetectorRef: ChangeDetectorRef) {
    _intl.changes.pipe(takeUntil(this._destroyed)).subscribe(
            () => changeDetectorRef.markForCheck()
    );
  }

  /** The label for the current calendar view. */
  get periodButtonText(): string {
    if (this.calendar.currentView == 'month') {
      return this._dateAdapter
              .format(this.calendar.activeDate, this._dateFormats.display.monthYearLabel)
              .toLocaleUpperCase();
    }
    if (this.calendar.currentView == 'year') {
      return this._dateAdapter.getYearName(this.calendar.activeDate);
    }
    const activeYear = this._dateAdapter.getYear(this.calendar.activeDate);
    const firstYearInView = this._dateAdapter.getYearName(
            this._dateAdapter.createDate(activeYear - activeYear % 24, 0, 1));
    const lastYearInView = this._dateAdapter.getYearName(
            this._dateAdapter.createDate(activeYear + yearsPerPage - 1 - activeYear % 24, 0, 1));
    return `${firstYearInView} \u2013 ${lastYearInView}`;
  }

  get periodButtonLabel(): string {
    return this.calendar.currentView == 'month' ?
            this._intl.switchToMultiYearViewLabel : this._intl.switchToMonthViewLabel;
  }

  /** The label for the the previous button. */
  get prevButtonLabel(): string {
    return {
      'month': this._intl.prevMonthLabel,
      'year': this._intl.prevYearLabel,
      'multi-year': this._intl.prevMultiYearLabel
    }[this.calendar.currentView];
  }

  /** The label for the the next button. */
  get nextButtonLabel(): string {
    return {
      'month': this._intl.nextMonthLabel,
      'year': this._intl.nextYearLabel,
      'multi-year': this._intl.nextMultiYearLabel
    }[this.calendar.currentView];
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
