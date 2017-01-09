import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
  AfterContentInit
} from '@angular/core';
import {coerceDateProperty} from '../core/coercion/date-property';
import {MdCalendarCell} from './calendar-table';
import {DateLocale} from './date-locale';


/**
 * An internal component used to display a single month in the date-picker.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'md-month-view, mat-month-view',
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
    this._date = coerceDateProperty(value);
    this._init();
  }
  private _date = new Date();

  /** The currently selected date. */
  @Input()
  get selected() { return this._selected; }
  set selected(value) {
    this._selected = coerceDateProperty(value, null);
    this._selectedDate = this._getDateInCurrentMonth(this.selected);
  }
  private _selected: Date;

  /** Emits when a new date is selected. */
  @Output() selectedChange = new EventEmitter<Date>();

  _monthLabel: string;

  _weeks: MdCalendarCell[][];

  _daysPerWeek: number;

  _firstWeekOffset: number;

  _selectedDate = 0;

  _todayDate = 0;

  constructor(private _locale: DateLocale) {
    this._daysPerWeek = _locale.days.length;
  }

  ngAfterContentInit(): void {
    this._init();
  }

  _dateSelected(date: number) {
    if (this.selected && this.selected.getDate() == date) {
      return;
    }
    this.selectedChange.emit(new Date(this.date.getFullYear(), this.date.getMonth(), date));
  }

  private _init() {
    this._selectedDate = this._getDateInCurrentMonth(this.selected);
    this._todayDate = this._getDateInCurrentMonth(new Date());
    this._monthLabel = this._locale.getMonthLabel(this.date.getMonth(), this.date.getFullYear());

    let firstOfMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
    let daysInMonth = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
    this._firstWeekOffset =
        (this._daysPerWeek + firstOfMonth.getDay() - this._locale.firstDayOfWeek) %
        this._daysPerWeek;

    this._weeks = [[]];
    for (let i = 0, cell = this._firstWeekOffset; i < daysInMonth; i++, cell++) {
      if (cell == this._daysPerWeek) {
        this._weeks.push([]);
        cell = 0;
      }
      this._weeks[this._weeks.length - 1].push(
          new MdCalendarCell(i + 1, this._getDateString(i + 1)));
    }
  }

  private _getDateString(date: number) {
    return date === null ? '' : this._locale.getDateLabel(date);
  }

  private _getDateInCurrentMonth(date: Date) {
    return date && date.getMonth() == this.date.getMonth() ? date.getDate() : null;
  }
}
