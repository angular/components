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


export interface IDay {
  year: number;
  month: string;
  date: number;
  day: string;
  hour: number;
  minute: number;
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
  //day: number;
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
export class Md2Datepicker implements ControlValueAccessor {

  constructor(private dateUtil: MdDateUtil) {
    this.displayDate = this.today;
  }

  @Output() change: EventEmitter<any> = new EventEmitter<any>();

  private _value: any = '';
  //private _isInitialized: boolean = false;
  private _onTouchedCallback: () => void = noop;
  private _onChangeCallback: (_: any) => void = noop;

  private isDatepickerVisible: boolean;
  private isCalendarVisible: boolean;

  private months: Array<string> = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  private days: Array<string> = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  private prevMonth: number = 1;
  private currMonth: number = 2;
  private nextMonth: number = 3;

  private dates: Array<Object> = [];
  private today: Date = new Date();
  private _displayDate: Date = null;
  private selectedDate: Date = null;
  private displayDay: IDay = { year: 0, month: '', date: 0, day: '', hour: 0, minute: 0 };
  private displayInputDate: string = '';
  //private selectedDate: IDate = { year: 0, month: 0, day: 0, hour: 0, minute: 0 };

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
    //if (this._value !== value) {
    this.setValue(value);
    //this._value = value;
    //if (this._isInitialized) {
    //  this._onChangeCallback(value);
    //this.change.emit(value);
    //}
    //}
  }

  /**
   * set value
   * @param value of ngModel
   */
  private setValue(value: any) {
    if (value !== this._value) {
      this._value = value;
      //if (value && this.dateUtil.isValidDate(value)) {
      //} else { }
      //  let date = new Date(value);
      //  //this.selectedDate = {
      //  //  year: date.getFullYear(),
      //  //  month: date.getMonth(),
      //  //  day: date.getDate(),
      //  //  hour: date.getHours(),
      //  //  minute: date.getMinutes()
      //  //};


      //  this.displayDate = this.selectedDate;
      //} else {
      //  this._value = this.today;
      //}
      //if (this._isInitialized) {
      //  this._onChangeCallback(this._value);
      //  this.change.emit(this._value);
      //}
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
    if (date && this.dateUtil.isValidDate(date)) {// && !this.dateUtil.isSameDay(this._displayDate, date)
      this._displayDate = date;
      this.displayDay = {
        year: date.getFullYear(),
        month: this.months[date.getMonth()],
        date: date.getDate(),
        day: this.days[date.getDay()],
        hour: date.getHours(),
        minute: date.getMinutes()
      };
      //this.generateCalendar();
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

    // Tab Key
    if (event.keyCode === 9) {
      if (this.isDatepickerVisible) {
        this.onBlur();
        event.preventDefault();
      }
      return;
    }

    // Escape Key
    if (event.keyCode === 27) {
      this.onBlur();
      event.stopPropagation();
      event.preventDefault();
      return;
    }



    //handleKeyEvent = function (event, action) {
    //  var calendarCtrl = this.calendarCtrl;
    //  var displayDate = calendarCtrl.displayDate;

    //  if (action === 'select') {
    //    calendarCtrl.setNgModelValue(displayDate);
    //  } else {
    //    var date = null;
    //    var dateUtil = this.dateUtil;

    //    switch (action) {
    //      case 'move-right': date = dateUtil.incrementDays(displayDate, 1); break;
    //      case 'move-left': date = dateUtil.incrementDays(displayDate, -1); break;

    //      case 'move-page-down': date = dateUtil.incrementMonths(displayDate, 1); break;
    //      case 'move-page-up': date = dateUtil.incrementMonths(displayDate, -1); break;

    //      case 'move-row-down': date = dateUtil.incrementDays(displayDate, 7); break;
    //      case 'move-row-up': date = dateUtil.incrementDays(displayDate, -7); break;

    //      case 'start': date = dateUtil.getFirstDateOfMonth(displayDate); break;
    //      case 'end': date = dateUtil.getLastDateOfMonth(displayDate); break;
    //    }

    //    if (date) {
    //      date = this.dateUtil.clampDate(date, calendarCtrl.minDate, calendarCtrl.maxDate);

    //      this.changeDisplayDate(date).then(function () {
    //        calendarCtrl.focus(date);
    //      });
    //    }
    //  }
    //};

    if (this.isDatepickerVisible) {
      event.preventDefault();
      event.stopPropagation();
      if (this.isCalendarVisible) {
        switch (event.keyCode) {
          case 13: break;
          case 32: break;

          case 39: this.displayDate = this.dateUtil.incrementDays(this.displayDate, 1); break;
          case 37: this.displayDate = this.dateUtil.incrementDays(this.displayDate, -1); break;

          case 34: this.displayDate = this.dateUtil.incrementMonths(this.displayDate, 1); break;
          case 33: this.displayDate = this.dateUtil.incrementMonths(this.displayDate, -1); break;

          case 40: this.displayDate = this.dateUtil.incrementDays(this.displayDate, 7); break;
          case 38: this.displayDate = this.dateUtil.incrementDays(this.displayDate, -7); break;

          case 36: this.displayDate = this.dateUtil.getFirstDateOfMonth(this.displayDate); break;
          case 35: this.displayDate = this.dateUtil.getLastDateOfMonth(this.displayDate); break;
        }
      } else {
        switch (event.keyCode) {
          case 13: break;
          case 32: break;

          //case 40: this.displayDate = this.dateUtil.incrementHours(this.displayDate, 1); break;
          //case 38: this.displayDate = this.dateUtil.incrementHours(this.displayDate, -1); break;
        }
      }
    }
  }

  private onFocus() {
    this.isDatepickerVisible = true;
  }

  @HostListener('blur')
  private onBlur() { this.isDatepickerVisible = false; }

  private showDatepicker() {
    //this.displayDate = this.value;
    this.isDatepickerVisible = true;
    if (!this.selectedDate) {
      this.selectedDate = this.today;
    }
    if (!this.displayDate) {
      this.displayDate = this.today;//this.selectedDate || this.today;
    }
    //====

    this.isDatepickerVisible = true;

    if (this.isDatepickerVisible) {
      let y = 0, m = 0;
      if (!this.selectedDate) {
        y = this.today.getFullYear();
        m = this.today.getMonth();
      }
      else {
        y = this.selectedDate.getFullYear();
        m = this.selectedDate.getMonth();
      }
      // Set current month
      this.displayDate = new Date(y, m, this.displayDate.getDate());

      this.generateCalendar();
    }
  }

  //private hideDatepicker() {
  //  this.isDatepickerVisible = true;
  //}

  private setDate(e: Event, d: any) {
    e.stopPropagation();
    if (d.disabled) { return; }
    if (d.calMonth === this.prevMonth) {
      this.updateMonth(-1);
    }
    else if (d.calMonth === this.currMonth) {
      this.selectedDate = new Date(d.dateObj.year, d.dateObj.month, d.dateObj.day);
      this.displayInputDate = this.formatDate(this.selectedDate);
      //this.isDatepickerVisible = false;
      //let epoc = this.selectedDate.getTime() / 1000.0;
      //this.dateChanged.emit({ date: this.selectedDate, formatted: this.selectionDayTxt, epoc: epoc });
      this.displayDate = this.selectedDate;
      this.value = this.selectedDate;//{ date: this.selectedDate, formatted: this.selectionDayTxt, epoc: epoc };
    }
    else if (d.calMonth === this.nextMonth) {
      this.updateMonth(1);
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

  preZero(val: string): string {
    // Prepend zero if smaller than 10
    return parseInt(val) < 10 ? '0' + val : val;
  }

  formatDate(d: Date): string {
    return this.format
      .replace('yyyy', d.getFullYear() + '')
      .replace('mm', (d.getMonth() + 1) + '')
      .replace('dd', d.getDate() + '');
  }

  //monthText(m: number): string {
  //  // Returns mont as a text
  //  return this.months[m - 1];
  //}

  monthStartIdx(y: number, m: number): number {
    // Month start index
    let d = new Date();
    d.setDate(1);
    d.setMonth(m - 1);
    d.setFullYear(y);
    return (d.getDay() + 7) % 7;
  }

  //isCurrDay(d: number, m: number, y: number, calMonth: any): boolean {
  //  // Check is a given date the current date
  //  return d === this.today.getDate() && m === this.today.getMonth() + 1 && y === this.today.getFullYear() && calMonth === 2;
  //}

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
    // Get day number: sun=0, mon=1, tue=2, wed=3 ...
    let d = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
    return d.getDay();
  }

  //sundayIdx(): number {
  //  // Index of Sunday day
  //  return this.dayIdx > 0 ? 7 - this.dayIdx : 0;
  //}

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
