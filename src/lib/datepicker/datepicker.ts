import {
  AfterContentInit,
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


export interface IDay {
  year: number;
  month: string;
  date: string;
  day: string;
  hour: string;
  minute: string;
}

export interface IDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export interface IWeek {
  dateObj: IDate;
  date: Date;
  calMonth: number;
  today: boolean;
  disabled: boolean;
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
export class Md2Datepicker implements AfterContentInit, ControlValueAccessor {

  constructor(private dateUtil: MdDateUtil) {
    this.displayDate = this.today;
    this.generateClock();
    this.isCalendarVisible = this.type !== 'time' ? true : false;
  }

  ngAfterContentInit() { this._isInitialized = true; }

  @Output() change: EventEmitter<any> = new EventEmitter<any>();

  private _value: any = '';
  private _isInitialized: boolean = false;
  private _onTouchedCallback: () => void = noop;
  private _onChangeCallback: (_: any) => void = noop;

  private isDatepickerVisible: boolean;
  private isCalendarVisible: boolean;
  private isHoursVisible: boolean = true;

  private months: Array<string> = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  private days: Array<string> = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  private hours: Array<Object> = [];
  private minutes: Array<Object> = [];

  private prevMonth: number = 1;
  private currMonth: number = 2;
  private nextMonth: number = 3;

  private dates: Array<Object> = [];
  private today: Date = new Date();
  private _displayDate: Date = null;
  private selectedDate: Date = null;
  private displayDay: IDay = { year: 0, month: '', date: '', day: '', hour: '', minute: '' };
  private displayInputDate: string = '';

  @Input() type: 'date' | 'time' | 'datetime' = 'datetime';//'date';
  @Input() disabled: boolean;
  @Input() name: string = '';
  @Input() id: string = 'md2-datepicker-' + (++nextId);
  @Input() min: number;
  @Input() max: number;
  @Input() placeholder: string;
  @Input() format: string = this.type === 'date' ? 'dd/mm/yyyy' : this.type === 'time' ? 'hh:mm' : this.type === 'datetime' ? 'dd/mm/yyyy hh:mm' : 'dd/mm/yyyy';
  @Input() tabindex: number = 0;

  get value(): any { return this._value; }
  @Input() set value(value: any) {
    this.setValue(value);
  }

  /**
   * set value
   * @param value of ngModel
   */
  private setValue(value: any) {
    if (value !== this._value) {
      if (value) {
        if (this.dateUtil.isValidDate(value)) {
          this._value = value;
        }
        else {
          this._value = new Date(value);
        }
      } else {
        this._value = new Date();
      }
      this.displayInputDate = this.formatDate(this._value);
      if (this._isInitialized) {
        this._onChangeCallback(this._value);
        this.change.emit(this._value);
      }
    }
  }

  get displayDate(): Date {
    if (this._displayDate && this.dateUtil.isValidDate(this._displayDate)) {
      return this._displayDate;
    } else {
      return this.today;
    }
  }
  set displayDate(date: Date) {
    if (date && this.dateUtil.isValidDate(date)) {
      this._displayDate = date;
      this.displayDay = {
        year: date.getFullYear(),
        month: this.months[date.getMonth()],
        date: this.prependZero(date.getDate() + ''),
        day: this.days[date.getDay()],
        hour: this.prependZero(date.getHours() + ''),
        minute: this.prependZero(date.getMinutes() + '')
      };
    }
  }

  @HostListener('click', ['$event'])
  private onClick(event: MouseEvent) {
    if (this.disabled) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }
  }

  @HostListener('keydown', ['$event'])
  private onKeyDown(event: KeyboardEvent) {
    // check enabled
    if (this.disabled) { return; }

    if (this.isDatepickerVisible) {
      event.preventDefault();
      event.stopPropagation();

      switch (event.keyCode) {
        case 9:
        case 27: this.onBlur(); break;
      }

      if (this.isCalendarVisible) {
        let displayDate = this.displayDate;
        switch (event.keyCode) {
          case 13:
          case 32: this.setDate(this.displayDate); break;

          case 39: this.displayDate = this.dateUtil.incrementDays(displayDate, 1); break;
          case 37: this.displayDate = this.dateUtil.incrementDays(displayDate, -1); break;

          case 34: this.displayDate = this.dateUtil.incrementMonths(displayDate, 1); break;
          case 33: this.displayDate = this.dateUtil.incrementMonths(displayDate, -1); break;

          case 40: this.displayDate = this.dateUtil.incrementDays(displayDate, 7); break;
          case 38: this.displayDate = this.dateUtil.incrementDays(displayDate, -7); break;

          case 36: this.displayDate = this.dateUtil.getFirstDateOfMonth(displayDate); break;
          case 35: this.displayDate = this.dateUtil.getLastDateOfMonth(displayDate); break;
        }
        if (!this.dateUtil.isSameMonthAndYear(displayDate, this.displayDate)) {
          this.generateCalendar();
        }
      } else {
        switch (event.keyCode) {
          case 13: break;
          case 32: break;

          //case 40: this.displayDate = this.dateUtil.incrementHours(this.displayDate, 1); break;
          //case 38: this.displayDate = this.dateUtil.incrementHours(this.displayDate, -1); break;
        }
      }
    } else {
      switch (event.keyCode) {
        case 13:
        case 32:
          event.preventDefault();
          event.stopPropagation();
          this.showDatepicker();
          break;
      }
    }
  }

  @HostListener('blur')
  private onBlur() {
    this.isDatepickerVisible = false;
    this.isCalendarVisible = this.type !== 'time' ? true : false;
    this.isHoursVisible = true;
  }

  private showDatepicker() {
    if (this.disabled) { return; }
    this.isDatepickerVisible = true;
    this.selectedDate = this.value || new Date(1, 0, 1);
    this.displayDate = this.value || this.today;
    this.generateCalendar();
  }

  private showCalendar() { this.isCalendarVisible = true; }

  private showHours() {
    this.isCalendarVisible = false;
    this.isHoursVisible = true;
  }

  private showMinutes() {
    this.isCalendarVisible = false;
    this.isHoursVisible = false;
  }

  private onClickDate(event: Event, d: any) {
    event.preventDefault();
    event.stopPropagation();
    if (d.disabled) { return; }
    if (d.calMonth === this.prevMonth) {
      this.updateMonth(-1);
    }
    else if (d.calMonth === this.currMonth) {
      this.setDate(new Date(d.dateObj.year, d.dateObj.month, d.dateObj.day, this.displayDate.getHours(), this.displayDate.getMinutes()));
    }
    else if (d.calMonth === this.nextMonth) {
      this.updateMonth(1);
    }
  }

  private setDate(date: Date) {
    this.displayDate = date;
    if (this.type === 'date') {
      this.value = this.displayDate;
      this.onBlur();
    } else {
      this.selectedDate = this.displayDate;
      this.isCalendarVisible = false;
      this.isHoursVisible = true;
    }
  }

  private updateMonth(noOfMonths: number) {
    this.displayDate = this.dateUtil.incrementMonths(this.displayDate, noOfMonths);
    this.generateCalendar();
  }





  @Input() defaultMonth: string;
  @Input() selDate: string;





  minDate: IDate = { year: 0, month: 0, day: 0, hour: 0, minute: 0 };
  maxDate: IDate = { year: 0, month: 0, day: 0, hour: 0, minute: 0 };

  monthStartIdx(y: number, m: number): number {
    // Month start index
    let d = new Date();
    d.setDate(1);
    d.setMonth(m - 1);
    d.setFullYear(y);
    return (d.getDay() + 7) % 7;
  }

  isDisabledDay(date: IDate): boolean {
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

  getTimeInMilliseconds(date: IDate): number {
    return new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0).getTime();
  }

  getDayNumber(date: IDate): number {
    let d = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
    return d.getDay();
  }

  generateCalendar(): void {
    let year = this.displayDate.getFullYear();
    let month = this.displayDate.getMonth();
    let date = this.displayDate.getDate();

    //m += 1;

    this.dates.length = 0;

    let firstDayOfMonth = this.dateUtil.getFirstDateOfMonth(this.displayDate);
    //let firstDayOfTheWeek = this.getLocaleDay_(firstDayOfMonth);
    let numberOfDaysInMonth = this.dateUtil.getNumberOfDaysInMonth(this.displayDate);
    let numberOfDaysInPrevMonth = this.dateUtil.getNumberOfDaysInMonth(this.dateUtil.incrementMonths(this.displayDate, -1));

    let dayNbr = 1;
    let calMonth = this.prevMonth;
    for (let i = 1; i < 7; i++) {
      let week: IWeek[] = [];
      if (i === 1) {
        let prevMonth = numberOfDaysInPrevMonth - firstDayOfMonth.getDay() + 1;
        for (let j = prevMonth; j <= numberOfDaysInPrevMonth; j++) {
          let date: IDate = { year: year, month: month - 1, day: j, hour: 0, minute: 0 };
          week.push({
            date: new Date(year, month - 1, j),
            dateObj: date,
            calMonth: calMonth,
            today: this.dateUtil.isSameDay(this.today, new Date(year, month - 1, j)),
            //day: this.getDayNumber(date),
            disabled: this.isDisabledDay(date)
          });
        }

        calMonth = this.currMonth;
        let daysLeft = 7 - week.length;
        for (let j = 0; j < daysLeft; j++) {
          let date: IDate = { year: year, month: month, day: dayNbr, hour: 0, minute: 0 };
          week.push({
            date: new Date(year, month, dayNbr),
            dateObj: date,
            calMonth: calMonth,
            //selected: this.dateUtil.isSameDay(this.selectedDate, new Date(y, m, dayNbr)),
            today: this.dateUtil.isSameDay(this.today, new Date(year, month, dayNbr)),
            //day: this.getDayNumber(date),
            disabled: this.isDisabledDay(date)
          });
          dayNbr++;
        }
      }
      else {
        // Rest of the weeks
        for (let j = 1; j < 8; j++) {
          if (dayNbr > numberOfDaysInMonth) {
            // Next month
            dayNbr = 1;
            calMonth = this.nextMonth;
          }
          let date: IDate = { year: year, month: calMonth === this.currMonth ? month : month + 1, day: dayNbr, hour: 0, minute: 0 };
          week.push({
            date: new Date(year, date.month, dayNbr),
            dateObj: date,
            calMonth: calMonth,
            today: this.dateUtil.isSameDay(this.today, new Date(year, date.month, dayNbr)),
            //day: this.getDayNumber(date),
            disabled: this.isDisabledDay(date)
          });
          dayNbr++;
        }
      }
      this.dates.push(week);
    }
  }

  private onClickHour(event: Event, hour: number) {
    event.preventDefault();
    event.stopPropagation();
    this.setHour(hour);
  }

  private onClickMinute(event: Event, minute: number) {
    event.preventDefault();
    event.stopPropagation();
    this.setMinute(minute);
  }

  private setHour(hour: number) {
    let date = this.displayDate;
    this.isHoursVisible = false;
    this.displayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, date.getMinutes());
    this.setDisplayDate();
  }

  private setMinute(minute: number) {
    let date = this.displayDate;
    this.displayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), minute);
    this.setDisplayDate();
    this.selectedDate = this.displayDate;
    this.value = this.selectedDate;
    this.onBlur();
  }

  private clockOptions: any = {
    dialRadius: 120,
    outerRadius: 99,
    innerRadius: 66,
    tickRadius: 17
  }

  private generateClock() {
    this.hours.length = 0;

    for (let i = 0; i < 24; i++) {
      let radian = i / 6 * Math.PI;
      let inner = i > 0 && i < 13,
        radius = inner ? this.clockOptions.innerRadius : this.clockOptions.outerRadius;
      this.hours.push({
        hour: i === 0 ? '00' : i,
        top: this.clockOptions.dialRadius - Math.cos(radian) * radius - this.clockOptions.tickRadius,
        left: this.clockOptions.dialRadius + Math.sin(radian) * radius - this.clockOptions.tickRadius
      });
    }

    for (let i = 0; i < 60; i += 5) {
      let radian = i / 30 * Math.PI;
      this.minutes.push({
        minute: i === 0 ? '00' : i,
        top: this.clockOptions.dialRadius - Math.cos(radian) * this.clockOptions.outerRadius - this.clockOptions.tickRadius,
        left: this.clockOptions.dialRadius + Math.sin(radian) * this.clockOptions.outerRadius - this.clockOptions.tickRadius
      });
    }
  }

  private setDisplayDate() {
    let date = this.displayDate;
    this.displayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
  }

  private formatDate(d: Date): string {
    return this.format
      .replace('yyyy', d.getFullYear() + '')
      .replace('mm', this.prependZero((d.getMonth() + 1) + ''))
      .replace('dd', this.prependZero(d.getDate() + ''))
      .replace('hh', this.prependZero(d.getHours() + ''))
      .replace('mm', this.prependZero(d.getMinutes() + ''));
  }

  private prependZero(value: string): string {
    return parseInt(value) < 10 ? '0' + value : value;
  }

  writeValue(value: any): void { this.setValue(value); }

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
