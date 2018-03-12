/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats} from '@angular/material/core';
import {Subscription} from 'rxjs/Subscription';
import {createMissingDateImplError} from './datepicker-errors';
import {MatDatepickerIntl} from './datepicker-intl';
import {MatMonthView} from './month-view';
import {MatMultiYearView, yearsPerPage} from './multi-year-view';
import {MatYearView} from './year-view';
import {ComponentPortal, ComponentType, Portal} from '@angular/cdk/portal';
import {MatCalendarHeader} from './calendar-header';

/**
 * A calendar that is used as part of the datepicker.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'mat-calendar',
  templateUrl: 'calendar.html',
  styleUrls: ['calendar.css'],
  host: {
    'class': 'mat-calendar',
  },
  exportAs: 'matCalendar',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatCalendar<D> implements AfterContentInit, OnDestroy, OnChanges {
  /** An input indicating the type of the header component, if set. */
  @Input() headerComponent: ComponentType<any>;

  /** A portal containing the header component type for this calendar. */
  _calendarHeaderPortal: Portal<any>;

  private _intlChanges: Subscription;

  /** A date representing the period (month or year) to start the calendar in. */
  @Input()
  get startAt(): D | null { return this._startAt; }
  set startAt(value: D | null) {
    this._startAt = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
  }
  private _startAt: D | null;

  /** Whether the calendar should be started in month or year view. */
  @Input() startView: 'month' | 'year' | 'multi-year' = 'month';

  /** The currently selected date. */
  @Input()
  get selected(): D | null { return this._selected; }
  set selected(value: D | null) {
    this._selected = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
  }
  private _selected: D | null;

  /** The minimum selectable date. */
  @Input()
  get minDate(): D | null { return this._minDate; }
  set minDate(value: D | null) {
    this._minDate = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
  }
  private _minDate: D | null;

  /** The maximum selectable date. */
  @Input()
  get maxDate(): D | null { return this._maxDate; }
  set maxDate(value: D | null) {
    this._maxDate = this._getValidDateOrNull(this._dateAdapter.deserialize(value));
  }
  private _maxDate: D | null;

  /** A function used to filter which dates are selectable. */
  @Input() dateFilter: (date: D) => boolean;

  /** Emits when the currently selected date changes. */
  @Output() readonly selectedChange: EventEmitter<D> = new EventEmitter<D>();

  /**
   * Emits the year chosen in multiyear view.
   * This doesn't imply a change on the selected date.
   */
  @Output() readonly yearSelected: EventEmitter<D> = new EventEmitter<D>();

  /**
   * Emits the month chosen in year view.
   * This doesn't imply a change on the selected date.
   */
  @Output() readonly monthSelected: EventEmitter<D> = new EventEmitter<D>();

  /** Emits when any date is selected. */
  @Output() readonly _userSelection: EventEmitter<void> = new EventEmitter<void>();

  /** Reference to the current month view component. */
  @ViewChild(MatMonthView) monthView: MatMonthView<D>;

  /** Reference to the current year view component. */
  @ViewChild(MatYearView) yearView: MatYearView<D>;

  /** Reference to the current multi-year view component. */
  @ViewChild(MatMultiYearView) multiYearView: MatMultiYearView<D>;

  /**
   * The current active date. This determines which time period is shown and which date is
   * highlighted when using keyboard navigation.
   */
  get activeDate(): D { return this._clampedActiveDate; }
  set activeDate(value: D) {
    this._clampedActiveDate = this._dateAdapter.clampDate(value, this.minDate, this.maxDate);
  }
  private _clampedActiveDate: D;

  /** Whether the calendar is in month view. */
  currentView: 'month' | 'year' | 'multi-year';

  constructor(_intl: MatDatepickerIntl,
              @Optional() private _dateAdapter: DateAdapter<D>,
              @Optional() @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats,
              changeDetectorRef: ChangeDetectorRef) {

    if (!this._dateAdapter) {
      throw createMissingDateImplError('DateAdapter');
    }

    if (!this._dateFormats) {
      throw createMissingDateImplError('MAT_DATE_FORMATS');
    }

    this._intlChanges = _intl.changes.subscribe(() => changeDetectorRef.markForCheck());
  }

  ngAfterContentInit() {
    this._calendarHeaderPortal = new ComponentPortal(this.headerComponent || MatCalendarHeader);

    this.activeDate = this.startAt || this._dateAdapter.today();
    this.currentView = this.startView;
  }

  ngOnDestroy() {
    this._intlChanges.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    const change = changes.minDate || changes.maxDate || changes.dateFilter;

    if (change && !change.firstChange) {
      const view = this.monthView || this.yearView || this.multiYearView;

      if (view) {
        view._init();
      }
    }
  }

  /** Handles date selection in the month view. */
  _dateSelected(date: D): void {
    if (!this._dateAdapter.sameDate(date, this.selected)) {
      this.selectedChange.emit(date);
    }
  }

  /** Handles year selection in the multiyear view. */
  _yearSelectedInMultiYearView(normalizedYear: D) {
    this.yearSelected.emit(normalizedYear);
  }

  /** Handles month selection in the year view. */
  _monthSelectedInYearView(normalizedMonth: D) {
    this.monthSelected.emit(normalizedMonth);
  }

  _userSelected(): void {
    this._userSelection.emit();
  }

  /** Handles year/month selection in the multi-year/year views. */
  _goToDateInView(date: D, view: 'month' | 'year' | 'multi-year'): void {
    this.activeDate = date;
    this.currentView = view;
  }

  /** Handles user clicks on the period label. */
  currentPeriodClicked(): void {
    this.currentView = this.currentView == 'month' ? 'multi-year' : 'month';
  }

  /** Handles user clicks on the previous button. */
  previousClicked(): void {
    this.activeDate = this.currentView == 'month' ?
        this._dateAdapter.addCalendarMonths(this.activeDate, -1) :
        this._dateAdapter.addCalendarYears(
            this.activeDate, this.currentView == 'year' ? -1 : -yearsPerPage);
  }

  /** Handles user clicks on the next button. */
  nextClicked(): void {
    this.activeDate = this.currentView == 'month' ?
        this._dateAdapter.addCalendarMonths(this.activeDate, 1) :
        this._dateAdapter.addCalendarYears(
            this.activeDate, this.currentView == 'year' ? 1 : yearsPerPage);
  }

  /** Whether the previous period button is enabled. */
  previousEnabled(): boolean {
    if (!this.minDate) {
      return true;
    }
    return !this.minDate || !this._isSameView(this.activeDate, this.minDate);
  }

  /** Whether the next period button is enabled. */
  nextEnabled(): boolean {
    return !this.maxDate || !this._isSameView(this.activeDate, this.maxDate);
  }

  /** Whether the two dates represent the same view in the current view mode (month or year). */
  private _isSameView(date1: D, date2: D): boolean {
    if (this.currentView == 'month') {
      return this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2) &&
          this._dateAdapter.getMonth(date1) == this._dateAdapter.getMonth(date2);
    }
    if (this.currentView == 'year') {
      return this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2);
    }
    // Otherwise we are in 'multi-year' view.
    return Math.floor(this._dateAdapter.getYear(date1) / yearsPerPage) ==
        Math.floor(this._dateAdapter.getYear(date2) / yearsPerPage);
  }

  /**
   * @param obj The object to check.
   * @returns The given object if it is both a date instance and valid, otherwise null.
   */
  private _getValidDateOrNull(obj: any): D | null {
    return (this._dateAdapter.isDateInstance(obj) && this._dateAdapter.isValid(obj)) ? obj : null;
  }
}
