import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
  AfterContentInit
} from '@angular/core';
import {MdCalendarCell} from './calendar-table';
import {CalendarLocale} from '../core/datetime/calendar-locale';
import {SimpleDate} from '../core/datetime/simple-date';


const DAYS_PER_WEEK = 7;


/**
 * An internal component used to display a single month in the datepicker.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'md-month-view',
  templateUrl: 'month-view.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdMonthView implements AfterContentInit {
  /**
   * The date to display in this month view (everything other than the month and year is ignored).
   */
  @Input()
  get date() { return this._date; }
  set date(value) {
    this._date = this._locale.parseDate(value) || SimpleDate.today();
    this._init();
  }
  private _date = SimpleDate.today();

  /** The currently selected date. */
  @Input()
  get selected() { return this._selected; }
  set selected(value) {
    this._selected = this._locale.parseDate(value);
    this._selectedDate = this._getDateInCurrentMonth(this.selected);
  }
  private _selected: SimpleDate;

  /** A function used to filter which dates are selectable. */
  @Input() dateFilter: (date: SimpleDate) => boolean;

  /** Emits when a new date is selected. */
  @Output() selectedChange = new EventEmitter<SimpleDate>();

  /** The label for this month (e.g. "January 2017"). */
  _monthLabel: string;

  /** Grid of calendar cells representing the dates of the month. */
  _weeks: MdCalendarCell[][];

  /** The number of blank cells in the first row before the 1st of the month. */
  _firstWeekOffset: number;

  /**
   * The date of the month that the currently selected Date falls on.
   * Null if the currently selected Date is in another month.
   */
  _selectedDate: number;

  /** The date of the month that today falls on. Null if today is in another month. */
  _todayDate: number;

  constructor(private _locale: CalendarLocale) {}

  ngAfterContentInit(): void {
    this._init();
  }

  /** Handles when a new date is selected. */
  _dateSelected(date: number) {
    if (this._selectedDate == date) {
      return;
    }
    this.selectedChange.emit(new SimpleDate(this.date.year, this.date.month, date));
  }

  /** Initializes this month view. */
  private _init() {
    this._selectedDate = this._getDateInCurrentMonth(this.selected);
    this._todayDate = this._getDateInCurrentMonth(SimpleDate.today());
    this._monthLabel = this._locale.shortMonths[this.date.month].toLocaleUpperCase();

    let firstOfMonth = new SimpleDate(this.date.year, this.date.month, 1);
    this._firstWeekOffset =
        (DAYS_PER_WEEK + firstOfMonth.day - this._locale.firstDayOfWeek) % DAYS_PER_WEEK;

    this._createWeekCells();
  }

  /** Creates MdCalendarCells for the dates in this month. */
  private _createWeekCells() {
    let daysInMonth = new SimpleDate(this.date.year, this.date.month + 1, 0).date;
    this._weeks = [[]];
    for (let i = 0, cell = this._firstWeekOffset; i < daysInMonth; i++, cell++) {
      if (cell == DAYS_PER_WEEK) {
        this._weeks.push([]);
        cell = 0;
      }
      let enabled = !this.dateFilter ||
          this.dateFilter(new SimpleDate(this.date.year, this.date.month, i + 1));
      this._weeks[this._weeks.length - 1]
          .push(new MdCalendarCell(i + 1, this._locale.dates[i + 1], enabled));
    }
  }

  /**
   * Gets the date in this month that the given Date falls on.
   * Returns null if the given Date is in another month.
   */
  private _getDateInCurrentMonth(date: SimpleDate) {
    return date && date.month == this.date.month && date.year == this.date.year ? date.date : null;
  }
}
