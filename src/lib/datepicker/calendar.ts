import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {SimpleDate} from '../core/datetime/simple-date';
import {CalendarLocale} from '../core/datetime/calendar-locale';
import {
  DOWN_ARROW,
  END, ENTER,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  UP_ARROW
} from '../core/keyboard/keycodes';


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
   * The current active date. This determines which time period is shown and which date is
   * highlighted when using keyboard navigation.
   */
  get _activeDate() { return this._clampedActiveDate; }
  set _activeDate(value: SimpleDate) {
    this._clampedActiveDate = value.clamp(this.minDate, this.maxDate);
  }
  private _clampedActiveDate: SimpleDate;

  /** Whether the calendar is in month view. */
  _monthView: boolean;

  /** The names of the weekdays. */
  _weekdays: string[];

  /** The label for the current calendar view. */
  get _label(): string {
    return this._monthView ?
        this._locale.getCalendarMonthHeaderLabel(this._activeDate).toLocaleUpperCase() :
        this._locale.getCalendarYearHeaderLabel(this._activeDate);
  }

  constructor(private _locale: CalendarLocale) {
    this._weekdays = this._locale.narrowDays.slice(this._locale.firstDayOfWeek)
        .concat(this._locale.narrowDays.slice(0, this._locale.firstDayOfWeek));
  }

  ngAfterContentInit() {
    this._activeDate = this.startAt || SimpleDate.today();
    this._monthView = this.startView != 'year';
  }

  /** Handles date selection in the month view. */
  _dateSelected(date: SimpleDate): void {
    if ((!date || !this.selected) && date != this.selected || date.compare(this.selected)) {
      this.selectedChange.emit(date);
    }
  }

  /** Handles month selection in the year view. */
  _monthSelected(month: SimpleDate): void {
    this._activeDate = month;
    this._monthView = true;
  }

  /** Handles user clicks on the period label. */
  _currentPeriodClicked(): void {
    this._monthView = !this._monthView;
  }

  /** Handles user clicks on the previous button. */
  _previousClicked(): void {
    this._activeDate = this._monthView ?
        this._addCalendarMonths(this._activeDate, -1) :
        this._addCalendarYears(this._activeDate, -1);
  }

  /** Handles user clicks on the next button. */
  _nextClicked(): void {
    this._activeDate = this._monthView ?
        this._addCalendarMonths(this._activeDate, 1) : this._addCalendarYears(this._activeDate, 1);
  }

  /** Whether the previous period button is enabled. */
  _previousEnabled(): boolean {
    if (!this.minDate) {
      return true;
    }
    return !this.minDate || !this._isSameView(this._activeDate, this.minDate);
  }

  /** Whether the next period button is enabled. */
  _nextEnabled(): boolean {
    return !this.maxDate || !this._isSameView(this._activeDate, this.maxDate);
  }

  /** Whether the two dates represent the same view in the current view mode (month or year). */
  private _isSameView(date1: SimpleDate, date2: SimpleDate): boolean {
    return this._monthView ?
        date1.year == date2.year && date1.month == date2.month :
        date1.year == date2.year;
  }

  /** Handles keydown events on the calendar body. */
  _handleCalendarBodyKeydown(event: KeyboardEvent): void {
    // TODO(mmalerba): We currently allow keyboard navigation to disabled dates, but just prevent
    // disabled ones from being selected. This may not be ideal, we should look into whether
    // navigation should skip over disabled dates, and if so, how to implement that efficiently.
    if (this._monthView) {
      this._handleCalendarBodyKeydownInMonthView(event);
    } else {
      this._handleCalendarBodyKeydownInYearView(event);
    }
  }

  /** Handles keydown events on the calendar body when calendar is in month view. */
  private _handleCalendarBodyKeydownInMonthView(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case LEFT_ARROW:
        this._activeDate = this._addCalendarDays(this._activeDate, -1);
        break;
      case RIGHT_ARROW:
        this._activeDate = this._addCalendarDays(this._activeDate, 1);
        break;
      case UP_ARROW:
        this._activeDate = this._addCalendarDays(this._activeDate, -7);
        break;
      case DOWN_ARROW:
        this._activeDate = this._addCalendarDays(this._activeDate, 7);
        break;
      case HOME:
        this._activeDate = new SimpleDate(this._activeDate.year, this._activeDate.month, 1);
        break;
      case END:
        this._activeDate = new SimpleDate(this._activeDate.year, this._activeDate.month + 1, 0);
        break;
      case PAGE_UP:
        this._activeDate = event.altKey ?
            this._addCalendarYears(this._activeDate, -1) :
            this._addCalendarMonths(this._activeDate, -1);
        break;
      case PAGE_DOWN:
        this._activeDate = event.altKey ?
            this._addCalendarYears(this._activeDate, 1) :
            this._addCalendarMonths(this._activeDate, 1);
        break;
      case ENTER:
        if (this._dateFilterForViews(this._activeDate)) {
          this._dateSelected(this._activeDate);
          break;
        }
        return;
      default:
        // Don't prevent default on keys that we don't explicitly handle.
        return;
    }

    event.preventDefault();
  }

  /** Handles keydown events on the calendar body when calendar is in year view. */
  private _handleCalendarBodyKeydownInYearView(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case LEFT_ARROW:
        this._activeDate = this._addCalendarMonths(this._activeDate, -1);
        break;
      case RIGHT_ARROW:
        this._activeDate = this._addCalendarMonths(this._activeDate, 1);
        break;
      case UP_ARROW:
        this._activeDate = this._prevMonthInSameCol(this._activeDate);
        break;
      case DOWN_ARROW:
        this._activeDate = this._nextMonthInSameCol(this._activeDate);
        break;
      case HOME:
        this._activeDate = this._addCalendarMonths(this._activeDate, -this._activeDate.month);
        break;
      case END:
        this._activeDate = this._addCalendarMonths(this._activeDate, 11 - this._activeDate.month);
        break;
      case PAGE_UP:
        this._activeDate = this._addCalendarYears(this._activeDate, event.altKey ? -10 : -1);
        break;
      case PAGE_DOWN:
        this._activeDate = this._addCalendarYears(this._activeDate, event.altKey ? 10 : 1);
        break;
      case ENTER:
        this._monthSelected(this._activeDate);
        break;
      default:
        // Don't prevent default on keys that we don't explicitly handle.
        return;
    }

    event.preventDefault();
  }

  /** Adds the given number of days to the date. */
  private _addCalendarDays(date: SimpleDate, days: number): SimpleDate {
    return date.add({days});
  }

  /**
   * Adds the given number of months to the date. Months are counted as if flipping pages on a
   * calendar and then finding the closest date in the new month. For example when adding 1 month to
   * Jan 31, 2017, the resulting date will be Feb 28, 2017.
   */
  private _addCalendarMonths(date: SimpleDate, months: number): SimpleDate {
    let newDate = date.add({months});

    // It's possible to wind up in the wrong month if the original month has more days than the new
    // month. In this case we want to go to the last day of the desired month.
    // Note: the additional + 12 % 12 ensures we end up with a positive number, since JS % doesn't
    // guarantee this.
    if (newDate.month != ((date.month + months) % 12 + 12) % 12) {
      newDate = new SimpleDate(newDate.year, newDate.month, 0);
    }

    return newDate;
  }

  /**
   * Adds the given number of months to the date. Months are counted as if flipping 12 pages for
   * each year on a calendar and then finding the closest date in the new month. For example when
   * adding 1 year to Feb 29, 2016, the resulting date will be Feb 28, 2017.
   */
  private _addCalendarYears(date: SimpleDate, years: number): SimpleDate {
    return this._addCalendarMonths(date, years * 12);
  }

  /**
   * Determine the date for the month that comes before the given month in the same column in the
   * calendar table.
   */
  private _prevMonthInSameCol(date: SimpleDate) {
    // Determine how many months to jump forward given that there are 2 empty slots at the beginning
    // of each year.
    let increment = date.month <= 4 ? -5 : (date.month >= 7 ? -7 : -12);
    return this._addCalendarMonths(date, increment);
  }

  /**
   * Determine the date for the month that comes after the given month in the same column in the
   * calendar table.
   */
  private _nextMonthInSameCol(date: SimpleDate): SimpleDate {
    // Determine how many months to jump forward given that there are 2 empty slots at the beginning
    // of each year.
    let increment = date.month <= 4 ? 7 : (date.month >= 7 ? 5 : 12);
    return this._addCalendarMonths(date, increment);
  }
}
