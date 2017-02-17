import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Input,
  AfterContentInit,
  Output,
  EventEmitter
} from '@angular/core';
import {MdCalendarCell} from './calendar-table';
import {CalendarLocale} from '../core/datetime/calendar-locale';
import {SimpleDate} from '../core/datetime/simple-date';


/**
 * An internal component used to display a single year in the datepicker.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'md-year-view',
  templateUrl: 'year-view.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdYearView implements AfterContentInit {
  /** The date to display in this year view (everything other than the year is ignored). */
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
    this._selectedMonth = this._getMonthInCurrentYear(this.selected);
  }
  private _selected: SimpleDate;

  /** Emits when a new month is selected. */
  @Output() selectedChange = new EventEmitter<SimpleDate>();

  /** Grid of calendar cells representing the months of the year. */
  _months: MdCalendarCell[][];

  /** The label for this year (e.g. "2017"). */
  _yearLabel: string;

  /** The month in this year that today falls on. Null if today is in a different year. */
  _todayMonth: number;

  /**
   * The month in this year that the selected Date falls on.
   * Null if the selected Date is in a different year.
   */
  _selectedMonth: number;

  constructor(private _locale: CalendarLocale) {
    // First row of months only contains 5 elements so we can fit the year label on the same row.
    this._months = [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9, 10, 11]].map(row => row.map(
        month => this._createCellForMonth(month)));
  }

  ngAfterContentInit() {
    this._init();
  }

  /** Handles when a new month is selected. */
  _monthSelected(month: number) {
    if (this.selected && this.selected.month == month) {
      return;
    }
    this.selectedChange.emit(new SimpleDate(this.date.year, month, 1));
  }

  /** Initializes this month view. */
  private _init() {
    this._selectedMonth = this._getMonthInCurrentYear(this.selected);
    this._todayMonth = this._getMonthInCurrentYear(SimpleDate.today());
    this._yearLabel = this._locale.getCalendarYearHeaderLabel(this._date);
  }

  /**
   * Gets the month in this year that the given Date falls on.
   * Returns null if the given Date is in another year.
   */
  private _getMonthInCurrentYear(date: SimpleDate) {
    return date && date.year == this.date.year ? date.month : null;
  }

  /** Creates an MdCalendarCell for the given month. */
  private _createCellForMonth(month: number) {
    return new MdCalendarCell(month, this._locale.shortMonths[month].toLocaleUpperCase());
  }
}
