import {
  Component,
  HostListener,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ViewEncapsulation,
  NgModule,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule
} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MdDateUtil} from './dateUtil';


export interface IMyDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export interface IMyWeek {
  dateObj: IMyDate;
  cmo: number;
  today: boolean;
  dayNbr: number;
  disabled: boolean;
}
export interface IMyMonth {
  monthTxt: string;
  monthNbr: number;
  year: number;
}



const noop = () => { };

let nextId = 0;

export const MD2_DATEPICKER_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => Md2Datepicker),
  multi: true
};

@Component({
  moduleId: module.id,
  selector: 'md2-datepicker',
  templateUrl: 'datepicker.html',
  styleUrls: ['datepicker.css'],
  host: {
    'role': 'datepicker',
    '[id]': 'id',
    '[class.md2-datepicker-disabled]': 'disabled',
    '[tabindex]': 'disabled ? -1 : tabindex',
    '[attr.aria-disabled]': 'disabled'
  },
  providers: [MD2_DATEPICKER_CONTROL_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None
})
export class Md2Datepicker implements ControlValueAccessor {

  constructor(private dateUtil: MdDateUtil) {
    //this.generateCalendar(8, 2016);
    this.displayDate = this.today;
    //this.displayDate.getFullYear()
    this.displayDay = {
      date: this.displayDate,
      year: this.displayDate.getFullYear(),
      month: this.displayDate.getMonth(),
      fullMonth: this.months[this.displayDate.getMonth()].substr(0, 3),
      day: this.displayDate.getDate(),
      dayOfWeek: this.days[this.displayDate.getDay()].substr(0, 3),
      hour: this.displayDate.getHours(),
      minute: this.displayDate.getMinutes()
    }
  }

  @Output() change: EventEmitter<any> = new EventEmitter<any>();

  private _value: any = '';
  //private _isInitialized: boolean = false;
  private _onTouchedCallback: () => void = noop;
  private _onChangeCallback: (_: any) => void = noop;

  private isDatepickerVisible: boolean;
  //private isCalendarVisible: boolean;

  private months: Array<string> = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  private days: Array<string> = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  private shortDays: Array<string> = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  private dates: Array<Object> = [];
  private today: Date = new Date();
  private displayDate: Date = null;
  private displayDay: any = null;
  private selectedDate: IMyDate = { year: 0, month: 0, day: 0, hour: 0, minute: 0 };

  @Input() type: 'date' | 'time' | 'datetime' | 'month' = 'date';
  @Input() disabled: boolean;
  @Input() name: string = '';
  @Input() id: string = 'md2-datepicker-' + (++nextId);
  @Input() min: number;
  @Input() max: number;
  @Input() placeholder: string;
  @Input() format: string = 'dd/mm/yyyy';
  @Input() tabindex: number = 0;

  get value(): any { return this._value; }
  @Input() set value(value: any) {
    if (this._value !== value) {
      this._value = value;
      //if (this._isInitialized) {
      //  this._onChangeCallback(value);
      this.change.emit(value);
      //}
    }
  }

  private showDatepicker() {
    //this.displayDate = this.value;
    this.isDatepickerVisible = true;

    //====

    this.isDatepickerVisible = true;

    if (this.isDatepickerVisible) {
      let y = 0, m = 0;
      if (this.selectedDate.year === 0 && this.selectedDate.month === 0 && this.selectedDate.day === 0) {
        if (this.selectedMonth.year === 0 && this.selectedMonth.monthNbr === 0) {
          y = this.today.getFullYear();
          m = this.today.getMonth() + 1;
        } else {
          y = this.selectedMonth.year;
          m = this.selectedMonth.monthNbr;
        }
      }
      else {
        y = this.selectedDate.year;
        m = this.selectedDate.month;
      }
      // Set current month
      this.visibleMonth = { monthTxt: this.months[m - 1], monthNbr: m, year: y };

      // Create current month
      this.generateCalendar(m, y);
    }
  }

  //private hideDatepicker() {
  //  this.isDatepickerVisible = true;
  //}

  private selectDate(e: Event, d: any) {
    e.stopPropagation();
    if (d.disabled) { return; }
    if (d.cmo === this.PREV_MONTH) {
      // Previous month of day
      this.updateMonth(-1);
    }
    else if (d.cmo === this.CURR_MONTH) {
      // Current month of day
      //this.selectDate1(d.dateObj);
      this.selectedDate = { day: d.dateObj.day, month: d.dateObj.month, year: d.dateObj.year, hour: 0, minute: 0 };
      this.selectionDayTxt = this.formatDate(this.selectedDate);
      this.isDatepickerVisible = false;
      let epoc = new Date(this.selectedDate.year, this.selectedDate.month, this.selectedDate.day, 0, 0, 0, 0).getTime() / 1000.0;
      //this.dateChanged.emit({ date: this.selectedDate, formatted: this.selectionDayTxt, epoc: epoc });
      this.value = { date: this.selectedDate, formatted: this.selectionDayTxt, epoc: epoc };
    }
    else if (d.cmo === this.NEXT_MONTH) {
      // Next month of day
      this.updateMonth(1);
    }
  }

  private updateMonth(month: number) {
    //this.generateCalendar(month + month, 2016);
    let m = this.visibleMonth.monthNbr;
    let y = this.visibleMonth.year;

    m += month;
    y = m > 11 ? y + 1 : m < 0 ? y - 1 : y;
    m = (m + 12) % 12;
    this.visibleMonth = { monthTxt: this.monthText(m), monthNbr: m, year: y };
    this.generateCalendar(m, y);
  }





  @Input() locale: string;
  @Input() defaultMonth: string;
  @Input() selDate: string;

  visibleMonth: IMyMonth = { monthTxt: '', monthNbr: 0, year: 0 };
  selectedMonth: IMyMonth = { monthTxt: '', monthNbr: 0, year: 0 };
  selectionDayTxt: string = '';

  PREV_MONTH: number = 1;
  CURR_MONTH: number = 2;
  NEXT_MONTH: number = 3;

  firstDayOfWeek: string = '';
  sunHighlight: boolean = true;

  height: string = '34px';
  width: string = '100%';
  selectionTxtFontSize: string = '18px';
  minDate: IMyDate = { year: 0, month: 0, day: 0, hour: 0, minute: 0 };
  maxDate: IMyDate = { year: 0, month: 0, day: 0, hour: 0, minute: 0 };

  //ngOnChanges(changes: SimpleChanges): void {
  //  if (changes.hasOwnProperty('selDate')) {
  //    this.selectionDayTxt = changes['selDate'].currentValue;
  //    this.selectedDate = this.parseSelectedDate(this.selectionDayTxt);
  //  }

  //  if (changes.hasOwnProperty('defaultMonth')) {
  //    this.selectedMonth = this.parseSelectedMonth((changes['defaultMonth'].currentValue).toString());
  //  }

  //  if (changes.hasOwnProperty('locale')) {
  //    this.locale = changes['locale'].currentValue;
  //  }

  //  if (changes.hasOwnProperty('options')) {
  //    this.options = changes['options'].currentValue;
  //  }

  //}

  prevYear(): void {
    this.visibleMonth.year--;
    this.generateCalendar(this.visibleMonth.monthNbr, this.visibleMonth.year);
  }

  nextYear(): void {
    this.visibleMonth.year++;
    this.generateCalendar(this.visibleMonth.monthNbr, this.visibleMonth.year);
  }





  preZero(val: string): string {
    // Prepend zero if smaller than 10
    return parseInt(val) < 10 ? '0' + val : val;
  }

  formatDate(val: any): string {
    return this.format.replace('yyyy', val.year)
      .replace('mm', this.preZero(val.month))
      .replace('dd', this.preZero(val.day));
  }

  monthText(m: number): string {
    // Returns mont as a text
    return this.months[m - 1];
  }

  monthStartIdx(y: number, m: number): number {
    // Month start index
    let d = new Date();
    d.setDate(1);
    d.setMonth(m - 1);
    d.setFullYear(y);
    return (d.getDay() + 7) % 7;
  }

  daysInMonth(m: number, y: number): number {
    // Return number of days of current month
    return new Date(y, m, 0).getDate();
  }

  daysInPrevMonth(m: number, y: number): number {
    // Return number of days of the previous month
    if (m === 1) {
      m = 12;
      y--;
    }
    else {
      m--;
    }
    return this.daysInMonth(m, y);
  }

  //isCurrDay(d: number, m: number, y: number, cmo: any): boolean {
  //  // Check is a given date the current date
  //  return d === this.today.getDate() && m === this.today.getMonth() + 1 && y === this.today.getFullYear() && cmo === 2;
  //}

  isDisabledDay(date: IMyDate): boolean {
    // Check is a given date <= disabledUntil or given date >= disabledSince or disabled weekend
    let givenDate = this.getTimeInMilliseconds(date);
    if (this.minDate.year !== 0 && this.minDate.month !== 0 && this.minDate.day !== 0 && givenDate <= this.getTimeInMilliseconds(this.minDate)) {
      return true;
    }
    if (this.maxDate.year !== 0 && this.maxDate.month !== 0 && this.maxDate.day !== 0 && givenDate >= this.getTimeInMilliseconds(this.maxDate)) {
      return true;
    }
    //if (this.disableWeekends) {
    //  let dayNbr = this.getDayNumber(date);
    //  if (dayNbr === 0 || dayNbr === 6) {
    //    return true;
    //  }
    //}
    return false;
  }

  getTimeInMilliseconds(date: IMyDate): number {
    return new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0).getTime();
  }

  getDayNumber(date: IMyDate): number {
    // Get day number: sun=0, mon=1, tue=2, wed=3 ...
    let d = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
    return d.getDay();
  }

  //sundayIdx(): number {
  //  // Index of Sunday day
  //  return this.dayIdx > 0 ? 7 - this.dayIdx : 0;
  //}

  generateCalendar(m: number, y: number): void {
    this.dates.length = 0;
    let monthStart = this.monthStartIdx(y, m);
    let dInThisM = this.daysInMonth(m, y);
    let dInPrevM = this.daysInPrevMonth(m, y);

    let dayNbr = 1;
    let cmo = this.PREV_MONTH;
    for (let i = 1; i < 7; i++) {
      let week: IMyWeek[] = [];
      if (i === 1) {
        // First week
        var pm = dInPrevM - monthStart + 1;
        // Previous month
        for (var j = pm; j <= dInPrevM; j++) {
          let date: IMyDate = { year: y, month: m - 1, day: j, hour: 0, minute: 0 };
          week.push({
            dateObj: date,
            cmo: cmo,
            today: this.dateUtil.isSameDay(this.today, new Date(y, m - 1, j)),//this.isCurrDay(j, m, y, cmo),
            dayNbr: this.getDayNumber(date),
            disabled: this.isDisabledDay(date)
          });
        }

        cmo = this.CURR_MONTH;
        // Current month
        var daysLeft = 7 - week.length;
        for (var j = 0; j < daysLeft; j++) {
          let date: IMyDate = { year: y, month: m, day: dayNbr, hour: 0, minute: 0 };
          week.push({
            dateObj: date,
            cmo: cmo,
            today: this.dateUtil.isSameDay(this.today, new Date(y, m - 1, dayNbr)),//this.isCurrDay(dayNbr, m, y, cmo),
            dayNbr: this.getDayNumber(date),
            disabled: this.isDisabledDay(date)
          });
          dayNbr++;
        }
      }
      else {
        // Rest of the weeks
        for (var j = 1; j < 8; j++) {
          if (dayNbr > dInThisM) {
            // Next month
            dayNbr = 1;
            cmo = this.NEXT_MONTH;
          }
          let date: IMyDate = { year: y, month: cmo === this.CURR_MONTH ? m : m + 1, day: dayNbr, hour: 0, minute: 0 };
          week.push({
            dateObj: date,
            cmo: cmo,
            today: this.dateUtil.isSameDay(this.today, new Date(y, m - 1, dayNbr)),//this.isCurrDay(dayNbr, m, y, cmo),
            dayNbr: this.getDayNumber(date),
            disabled: this.isDisabledDay(date)
          });
          dayNbr++;
        }
      }
      this.dates.push(week);
    }
  }

  parseSelectedDate(ds: string): IMyDate {
    let date: IMyDate = { day: 0, month: 0, year: 0, hour: 0, minute: 0 };
    if (ds !== '') {
      let fmt = this.format;
      let dpos = fmt.indexOf('dd');
      if (dpos >= 0) {
        date.day = parseInt(ds.substring(dpos, dpos + 2));
      }
      let mpos = fmt.indexOf('mm');
      if (mpos >= 0) {
        date.month = parseInt(ds.substring(mpos, mpos + 2));
      }
      let ypos = fmt.indexOf('yyyy');
      if (ypos >= 0) {
        date.year = parseInt(ds.substring(ypos, ypos + 4));
      }
    }
    return date;
  }

  parseSelectedMonth(ms: string): IMyMonth {
    let split = ms.split(ms.match(/[^0-9]/)[0]);
    return (parseInt(split[0]) > parseInt(split[1])) ?
      { monthTxt: '', monthNbr: parseInt(split[1]), year: parseInt(split[0]) } :
      { monthTxt: '', monthNbr: parseInt(split[0]), year: parseInt(split[1]) };
  }


  writeValue(value: any): void { this._value = value; }

  registerOnChange(fn: any) { this._onChangeCallback = fn; }

  registerOnTouched(fn: any) { this._onTouchedCallback = fn; }

}

export const MD2_DATEPICKER_DIRECTIVES = [Md2Datepicker];

@NgModule({
  declarations: MD2_DATEPICKER_DIRECTIVES,
  imports: [CommonModule, FormsModule],
  exports: MD2_DATEPICKER_DIRECTIVES,
  providers: [MdDateUtil]
})
export class Md2DatepickerModule { }
