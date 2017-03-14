import {
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Component,
  Input,
  AfterContentInit, Output, EventEmitter
} from '@angular/core';
import {SimpleDate} from '../core/datetime/simple-date';
import {CalendarLocale} from '../core/datetime/calendar-locale';


/**
 * A calendar that is used as part of the datepicker.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'md-calendar',
  templateUrl: 'calendar.html',
  styleUrls: ['calendar.css'],
  host: {
    '[class.mat-calendar]': 'true',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdCalendar implements AfterContentInit {
  /** A date representing the period (month or year) to start the calendar in. */
  @Input()
  get startAt() { return this._startAt; }
  set startAt(value: any) { this._startAt = this._locale.parseDate(value); }
  private _startAt: SimpleDate;

  /** Whether the calendar should be started in month or year view. */
  @Input() startView: 'month' | 'year' = 'month';

  /** The currently selected date. */
  @Input()
  get selected() { return this._selected; }
  set selected(value: any) { this._selected = this._locale.parseDate(value); }
  private _selected: SimpleDate;

  /** The minimum selectable date. */
  @Input()
  get minDate(): SimpleDate { return this._minDate; };
  set minDate(date: SimpleDate) { this._minDate = this._locale.parseDate(date); }
  private _minDate: SimpleDate;

  /** The maximum selectable date. */
  @Input()
  get maxDate(): SimpleDate { return this._maxDate; };
  set maxDate(date: SimpleDate) { this._maxDate = this._locale.parseDate(date); }
  private _maxDate: SimpleDate;

  /** A function used to filter which dates are selectable. */
  @Input() dateFilter: (date: SimpleDate) => boolean;

  /** Emits when the currently selected date changes. */
  @Output() selectedChange = new EventEmitter<SimpleDate>();

  /** Date filter for the month and year views. */
  _dateFilterForViews = (date: SimpleDate) => {
    return !!date &&
        (!this.dateFilter || this.dateFilter(date)) &&
        (!this.minDate || date.compare(this.minDate) >= 0) &&
        (!this.maxDate || date.compare(this.maxDate) <= 0);
  }

  /**
   * A date representing the current period shown in the calendar. The current period is always
   * normalized to the 1st of a month, this prevents date overflow issues (e.g. adding a month to
   * January 31st and overflowing into March).
   */
  get _currentPeriod() { return this._normalizedCurrentPeriod; }
  set _currentPeriod(value: SimpleDate) {
    const clampedValue = value.clamp(this.minDate, this.maxDate);
    this._normalizedCurrentPeriod = new SimpleDate(clampedValue.year, clampedValue.month, 1);
  }
  private _normalizedCurrentPeriod: SimpleDate;

  /** Whether the calendar is in month view. */
  _monthView: boolean;

  /** The names of the weekdays. */
  _weekdays: string[];

  /** The label for the current calendar view. */
  get _label(): string {
    return this._monthView ?
        this._locale.getCalendarMonthHeaderLabel(this._currentPeriod).toLocaleUpperCase() :
        this._locale.getCalendarYearHeaderLabel(this._currentPeriod);
  }

  constructor(private _locale: CalendarLocale) {
    this._weekdays = this._locale.narrowDays.slice(this._locale.firstDayOfWeek)
        .concat(this._locale.narrowDays.slice(0, this._locale.firstDayOfWeek));
  }

  ngAfterContentInit() {
    this._currentPeriod = this.startAt || SimpleDate.today();
    this._monthView = this.startView != 'year';
  }

  /** Handles date selection in the month view. */
  _dateSelected(date: SimpleDate) {
    if ((!date || !this.selected) && date != this.selected || date.compare(this.selected)) {
      this.selectedChange.emit(date);
    }
  }

  /** Handles month selection in the year view. */
  _monthSelected(month: SimpleDate) {
    this._currentPeriod = month;
    this._monthView = true;
  }

  /** Handles user clicks on the period label. */
  _currentPeriodClicked() {
    this._monthView = !this._monthView;
  }

  /** Handles user clicks on the previous button. */
  _previousClicked() {
    let amount = this._monthView ? {months: -1} : {years: -1};
    this._currentPeriod = this._currentPeriod.add(amount);
  }

  /** Handles user clicks on the next button. */
  _nextClicked() {
    let amount = this._monthView ? {months: 1} : {years: 1};
    this._currentPeriod = this._currentPeriod.add(amount);
  }

  /** Whether the previous period button is enabled. */
  _previousEnabled() {
    if (!this.minDate) {
      return true;
    }
    return !this.minDate || !this._isSameView(this._currentPeriod, this.minDate);
  }

  /** Whether the next period button is enabled. */
  _nextEnabled() {
    return !this.maxDate || !this._isSameView(this._currentPeriod, this.maxDate);
  }

  /** Whether the two dates represent the same view in the current view mode (month or year). */
  private _isSameView(date1: SimpleDate, date2: SimpleDate) {
    return this._monthView ?
        date1.year == date2.year && date1.month == date2.month :
        date1.year == date2.year;
  }
}
