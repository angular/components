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


@Component({
  moduleId: module.id,
  selector: 'md-month-view, mat-month-view',
  templateUrl: 'month-view.html',
  styleUrls: ['month-view.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdMonthView implements AfterContentInit {
  @Input()
  get date() { return this._date; }
  set date(value) {
    this._date = coerceDateProperty(value);
    this._init();
  }
  private _date = new Date();

  @Input()
  get selected() { return this._selected; }
  set selected(value) {
    this._selected = coerceDateProperty(value);
    this._selectedDate = (this.selected && this.selected.getMonth() == this.date.getMonth()) ?
        this.selected.getDate() : 0;
  }
  private _selected: Date;

  @Output() selectedChange = new EventEmitter<Date>();

  _monthLabel: string;

  _weeks: MdCalendarCell[][];

  _firstWeekOffset: number;

  _selectedDate = 0;

  _todayDate = 0;

  private _localeSettings = {
    firstDayOfWeek: 0,
    getDateString: (d: number) => '' + d,
    getMonthLabel: (m: number, y: number) => {
      let months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUL', 'AUG', 'SEP', 'OCT', 'DEC'];
      return `${months[m]} ${y}`;
    }
  };

  ngAfterContentInit(): void {
    this._init();
  }

  _getDateString(date: number) {
    return date === null ? '' : this._localeSettings.getDateString(date);
  }

  _dateSelected(date: number) {
    if (this.selected && this.selected.getDate() == date) {
      return;
    }
    this.selectedChange.emit(new Date(this.date.getFullYear(), this.date.getMonth(), date));
  }

  private _init() {
    this._selectedDate = (this.selected && this.selected.getMonth() == this.date.getMonth()) ?
        this.selected.getDate() : 0;

    let today = new Date();
    this._todayDate = (today.getMonth() == this.date.getMonth()) ? today.getDate() : 0;

    this._monthLabel =
        this._localeSettings.getMonthLabel(this.date.getMonth(), this.date.getFullYear());

    let firstOfMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
    let daysInMonth = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
    this._firstWeekOffset = (7 + firstOfMonth.getDay() - this._localeSettings.firstDayOfWeek) % 7;

    this._weeks = [[]];
    for (let i = 0, cell = this._firstWeekOffset; i < daysInMonth; i++, cell++) {
      if (cell == 7) {
        this._weeks.push([]);
        cell = 0;
      }
      this._weeks[this._weeks.length - 1].push(new MdCalendarCell(i + 1, this._getDateString(i + 1)));
    }
  }
}
