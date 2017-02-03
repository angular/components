import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Input,
  AfterContentInit,
  Output,
  EventEmitter
} from '@angular/core';
import {DateLocale} from './date-locale';
import {coerceDateProperty} from '../core/coercion/date-property';
import {MdCalendarCell} from './calendar-table';


/**
 * An internal component used to display a single year in the date-picker.
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
    this._date = coerceDateProperty(value);
    this._init();
  }
  private _date = new Date();

  /** The currently selected date. */
  @Input()
  get selected() { return this._selected; }
  set selected(value) {
    this._selected = coerceDateProperty(value, null);
    this._selectedMonth = this._getMonthInCurrentYear(this.selected);
  }
  private _selected: Date;

  /** Emits when a new month is selected. */
  @Output() selectedChange = new EventEmitter<Date>();

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

  constructor(private _locale: DateLocale) {
    // First row of months only contains 5 elements so we can fit the year label on the same row.
    this._months = [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9, 10, 11]].map(row => row.map(
        month => this._createCellForMonth(month)));
  }

  ngAfterContentInit() {
    this._init();
  }

  /** Handles when a new month is selected. */
  _monthSelected(month: number) {
    if (this.selected && this.selected.getMonth() == month) {
      return;
    }
    this.selectedChange.emit(new Date(this.date.getFullYear(), month, 1));
  }

  /** Initializes this month view. */
  private _init() {
    this._selectedMonth = this._getMonthInCurrentYear(this.selected);
    this._todayMonth = this._getMonthInCurrentYear(new Date());
    this._yearLabel = this._locale.getYearLabel(this._date.getFullYear());
  }

  /**
   * Gets the month in this year that the given Date falls on.
   * Returns null if the given Date is in another year.
   */
  private _getMonthInCurrentYear(date: Date) {
    return date && date.getFullYear() == this.date.getFullYear() ? date.getMonth() : null;
  }

  /** Creates an MdCalendarCell for the given month. */
  private _createCellForMonth(month: number) {
    return new MdCalendarCell(month, this._locale.months[month].short);
  }
}
