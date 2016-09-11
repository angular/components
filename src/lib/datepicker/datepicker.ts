import {
  Component,
  HostListener,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ViewEncapsulation,
  NgModule,
  //OnChanges,
  //ElementRef,
  //SimpleChanges
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule
} from '@angular/forms';
import {CommonModule} from '@angular/common';
//import {Md2Calendar} from './calendar';
//import {LocaleService} from './dateLocaleProvider';


//export interface IMyMonthLabels {
//  [month: number]: string;
//}
//export interface IMyOptions {
//  dayLabels?: IMyDayLabels;
//  monthLabels?: IMyMonthLabels;
//  dateFormat?: string;
//  firstDayOfWeek?: string;
//  sunHighlight?: boolean;
//  disabledUntil?: IMyDate;
//  disabledSince?: IMyDate;
//  disableWeekends?: boolean;
//  height?: string;
//  width?: string;
//  inline?: boolean;
//}

//export interface IMyLocales {
//  [lang: string]: IMyOptions;
//}

//export interface IMyDayLabels {
//  [day: string]: string;
//}export interface IMyDate {
//  year: number;
//  month: number;
//  day: number;
//}

//export interface IMyWeek {
//  dateObj: IMyDate;
//  cmo: number;
//  currDay: boolean;
//  dayNbr: number;
//  disabled: boolean;
//}
//export interface IMyMonth {
//  monthTxt: string;
//  monthNbr: number;
//  year: number;
//}

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

  //constructor() { }

  @Output() change: EventEmitter<any> = new EventEmitter<any>();

  private _value: any = '';
  private _isinitialized: boolean = false;
  private _ontouchedcallback: () => void = noop;
  private _onchangecallback: (_: any) => void = noop;

  private isFocused: boolean;
  private weekDays: Array<string> = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  private monthNames: Array<string> = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  private dates: Array<Object> = [[1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12, 13, 14], [15, 16, 17, 18, 19, 20, 21], [22, 23, 24, 25, 26, 27, 28], [29, 30]];
  private hours: Array<string> = ['00', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
  private minutes: Array<string> = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  //private weeks = [];

  @Input() type: 'date' | 'time' | 'datetime' | 'month' = 'date';
  @Input() disabled: boolean;
  @Input() readonly: boolean;
  @Input() required: boolean;
  @Input() name: string = '';
  @Input() id: string = 'md2-datepicker-' + (++nextId);
  @Input() min: number;
  @Input() max: number;
  @Input() placeholder: string;
  @Input() format: string;
  @Input() tabindex: number = 0;

  get value(): any { return this._value; }
  @Input() set value(value: any) {
    if (this._value !== value) {
      this._value = value;
      this.updateValue();
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

    //// Tab Key
    //if (event.keyCode === 9) {
    //  if (this.isMenuVisible) {
    //    this.onBlur();
    //    event.preventDefault();
    //  }
    //  return;
    //}

    //// Escape Key
    //if (event.keyCode === 27) {
    //  this.onBlur();
    //  event.stopPropagation();
    //  event.preventDefault();
    //  return;
    //}

    //// Down Arrow
    //if (event.keyCode === 40) {
    //  if (this.isMenuVisible) {
    //    this.focusedOption = (this.focusedOption === this.list.length - 1) ? 0 : Math.min(this.focusedOption + 1, this.list.length - 1);
    //    this.updateScroll();
    //  } else {
    //    this.updateOptions();
    //  }
    //  event.stopPropagation();
    //  event.preventDefault();
    //  return;
    //}

    //// Up Arrow
    //if (event.keyCode === 38) {
    //  if (this.isMenuVisible) {
    //    this.focusedOption = (this.focusedOption === 0) ? this.list.length - 1 : Math.max(0, this.focusedOption - 1);
    //    this.updateScroll();
    //  } else {
    //    this.updateOptions();
    //  }
    //  event.stopPropagation();
    //  event.preventDefault();
    //  return;
    //}

    //// Enter / Space
    //if (event.keyCode === 13 || event.keyCode === 32) {
    //  if (this.isMenuVisible) {
    //    this.toggleOption(event, this.focusedOption);
    //  } else {
    //    this.updateOptions();
    //  }
    //  event.preventDefault();
    //  return;
    //}
  }

  /**
   * on focus current component
   */
  private onFocus() {
    this.isFocused = true;
  }

  @HostListener('blur')
  private onBlur() { this.isFocused = false; }

  get isDatepickerVisible(): boolean {
    return this.isFocused ? true : false;
  }

  //get isTimepickerVisible(): boolean {
  //  return this.isFocused ? true : false;
  //}

  private opencalendarpane(event: Event) { }
  private setfocused(value: boolean) { }

  private updateValue() {
    this._onchangecallback(this._value);
    this.change.emit(this._value);
  }

  writeValue(value: any): void { this._value = value; }

  registerOnChange(fn: any) { this._onchangecallback = fn; }

  registerOnTouched(fn: any) { this._ontouchedcallback = fn; }



  //@Input() options: any;
  //@Input() locale: string;
  //@Input() defaultMonth: string;
  //@Input() selDate: string;
  //@Output() dateChanged: EventEmitter<Object> = new EventEmitter();

  //showSelector: boolean = false;
  //visibleMonth: IMyMonth = { monthTxt: '', monthNbr: 0, year: 0 };
  //selectedMonth: IMyMonth = { monthTxt: '', monthNbr: 0, year: 0 };
  //selectedDate: IMyDate = { year: 0, month: 0, day: 0 };
  //weekDays: Array<string> = [];
  //dates: Array<Object> = [];
  //selectionDayTxt: string = '';
  //dayIdx: number = 0;
  //today: Date = null;

  //PREV_MONTH: number = 1;
  //CURR_MONTH: number = 2;
  //NEXT_MONTH: number = 3;

  //dayLabels: IMyDayLabels = {};
  //monthLabels: IMyMonthLabels = {};
  //dateFormat: string = ''
  //firstDayOfWeek: string = '';
  //sunHighlight: boolean = true;

  //height: string = '34px';
  //width: string = '100%';
  //disableUntil: IMyDate = { year: 0, month: 0, day: 0 };
  //disableSince: IMyDate = { year: 0, month: 0, day: 0 };
  //disableWeekends: boolean = false;
  //inline: boolean = false;

  //constructor(public elem: ElementRef, private localeService: LocaleService) {
  //  let defaultOptions = this.localeService.getLocaleOptions('en');
  //  for (let propname in defaultOptions) {
  //    if (defaultOptions.hasOwnProperty(propname)) {
  //      (<any>this)[propname] = (<any>defaultOptions)[propname];
  //    }
  //  }

  //  this.today = new Date();
  //  let doc = document.getElementsByTagName('html')[0];
  //  doc.addEventListener('click', (event) => {
  //    if (this.showSelector && event.target && this.elem.nativeElement !== event.target && !this.elem.nativeElement.contains(event.target)) {
  //      this.showSelector = false;
  //    }
  //  }, false);
  //}

  //parseOptions() {
  //  let localeOptions = this.localeService.getLocaleOptions(this.locale);

  //  // the relatively ugly casts to any in this loop are needed to
  //  // avoid tsc errors when noImplicitAny is true.
  //  let optionprops = ['dayLabels', 'monthLabels', 'dateFormat',  'firstDayOfWeek', 'sunHighlight', 'disableUntil', 'disableSince', 'disableWeekends', 'height', 'width', 'inline'];
  //  for (let i = 0; i < optionprops.length; i++) {
  //    let propname = optionprops[i];
  //    if (localeOptions.hasOwnProperty(propname)) {
  //      (<any>this)[propname] = (<any>localeOptions)[propname];
  //    }
  //    else if (this.options && (<any>this.options)[propname] !== undefined) {
  //      (<any>this)[propname] = (<any>this.options)[propname];
  //    }
  //  }

  //  let days = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
  //  this.dayIdx = days.indexOf(this.firstDayOfWeek);
  //  if (this.dayIdx !== -1) {
  //    let idx = this.dayIdx;
  //    for (var i = 0; i < days.length; i++) {
  //      this.weekDays.push(this.dayLabels[days[idx]]);
  //      idx = days[idx] === 'sa' ? 0 : idx + 1;
  //    }
  //  }

  //  if (this.inline) {
  //    this.openBtnClicked();
  //  }
  //}

  //ngOnChanges(changes: SimpleChanges) {
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

  //  //this.weekDays.length = 0;
  //  this.parseOptions();
  //}

  //removeBtnClicked(): void {
  //  this.selectionDayTxt = '';
  //  this.selectedDate = { year: 0, month: 0, day: 0 };
  //  this.dateChanged.emit({ date: {}, formatted: this.selectionDayTxt, epoc: 0 });
  //}

  //openBtnClicked(): void {
  //  this.showSelector = !this.showSelector;

  //  if (this.showSelector || this.inline) {
  //    let y = 0, m = 0;
  //    if (this.selectedDate.year === 0 && this.selectedDate.month === 0 && this.selectedDate.day === 0) {
  //      if (this.selectedMonth.year === 0 && this.selectedMonth.monthNbr === 0) {
  //        y = this.today.getFullYear();
  //        m = this.today.getMonth() + 1;
  //      } else {
  //        y = this.selectedMonth.year;
  //        m = this.selectedMonth.monthNbr;
  //      }
  //    }
  //    else {
  //      y = this.selectedDate.year;
  //      m = this.selectedDate.month;
  //    }
  //    // Set current month
  //    this.visibleMonth = { monthTxt: this.monthLabels[m], monthNbr: m, year: y };

  //    // Create current month
  //    this.generateCalendar(m, y);
  //  }
  //}

  //prevMonth(): void {
  //  let m = this.visibleMonth.monthNbr;
  //  let y = this.visibleMonth.year;
  //  if (m === 1) {
  //    m = 12;
  //    y--;
  //  }
  //  else {
  //    m--;
  //  }
  //  this.visibleMonth = { monthTxt: this.monthText(m), monthNbr: m, year: y };
  //  this.generateCalendar(m, y);
  //}

  //nextMonth(): void {
  //  let m = this.visibleMonth.monthNbr;
  //  let y = this.visibleMonth.year;
  //  if (m === 12) {
  //    m = 1;
  //    y++;
  //  }
  //  else {
  //    m++;
  //  }
  //  this.visibleMonth = { monthTxt: this.monthText(m), monthNbr: m, year: y };
  //  this.generateCalendar(m, y);
  //}

  //prevYear(): void {
  //  this.visibleMonth.year--;
  //  this.generateCalendar(this.visibleMonth.monthNbr, this.visibleMonth.year);
  //}

  //nextYear(): void {
  //  this.visibleMonth.year++;
  //  this.generateCalendar(this.visibleMonth.monthNbr, this.visibleMonth.year);
  //}

  //todayClicked(): void {
  //  // Today selected
  //  let m = this.today.getMonth() + 1;
  //  let y = this.today.getFullYear();
  //  this.selectDate({ day: this.today.getDate(), month: m, year: y });
  //  if (this.inline) {
  //    this.visibleMonth = { monthTxt: this.monthLabels[m], monthNbr: m, year: y };
  //    this.generateCalendar(m, y);
  //  }
  //}

  //cellClicked(cell: any): void {
  //  // Cell clicked in the selector
  //  if (cell.cmo === this.PREV_MONTH) {
  //    // Previous month of day
  //    this.prevMonth();
  //  }
  //  else if (cell.cmo === this.CURR_MONTH) {
  //    // Current month of day
  //    this.selectDate(cell.dateObj);
  //  }
  //  else if (cell.cmo === this.NEXT_MONTH) {
  //    // Next month of day
  //    this.nextMonth();
  //  }
  //}

  //selectDate(date: any): void {
  //  this.selectedDate = { day: date.day, month: date.month, year: date.year };
  //  this.selectionDayTxt = this.formatDate(this.selectedDate);
  //  this.showSelector = false;
  //  let epoc = new Date(this.selectedDate.year, this.selectedDate.month, this.selectedDate.day, 0, 0, 0, 0).getTime() / 1000.0;
  //  this.dateChanged.emit({ date: this.selectedDate, formatted: this.selectionDayTxt, epoc: epoc });
  //}

  //preZero(val: string): string {
  //  // Prepend zero if smaller than 10
  //  return parseInt(val) < 10 ? '0' + val : val;
  //}

  //formatDate(val: any): string {
  //  return this.dateFormat.replace('yyyy', val.year)
  //    .replace('mm', this.preZero(val.month))
  //    .replace('dd', this.preZero(val.day));
  //}

  //monthText(m: number): string {
  //  // Returns mont as a text
  //  return this.monthLabels[m];
  //}

  //monthStartIdx(y: number, m: number): number {
  //  // Month start index
  //  let d = new Date();
  //  d.setDate(1);
  //  d.setMonth(m - 1);
  //  d.setFullYear(y);
  //  let idx = d.getDay() + this.sundayIdx();
  //  return idx >= 7 ? idx - 7 : idx;
  //}

  //daysInMonth(m: number, y: number): number {
  //  // Return number of days of current month
  //  return new Date(y, m, 0).getDate();
  //}

  //daysInPrevMonth(m: number, y: number): number {
  //  // Return number of days of the previous month
  //  if (m === 1) {
  //    m = 12;
  //    y--;
  //  }
  //  else {
  //    m--;
  //  }
  //  return this.daysInMonth(m, y);
  //}

  //isCurrDay(d: number, m: number, y: number, cmo: any): boolean {
  //  // Check is a given date the current date
  //  return d === this.today.getDate() && m === this.today.getMonth() + 1 && y === this.today.getFullYear() && cmo === 2;
  //}

  //isDisabledDay(date: IMyDate): boolean {
  //  // Check is a given date <= disabledUntil or given date >= disabledSince or disabled weekend
  //  let givenDate = this.getTimeInMilliseconds(date);
  //  if (this.disableUntil.year !== 0 && this.disableUntil.month !== 0 && this.disableUntil.day !== 0 && givenDate <= this.getTimeInMilliseconds(this.disableUntil)) {
  //    return true;
  //  }
  //  if (this.disableSince.year !== 0 && this.disableSince.month !== 0 && this.disableSince.day !== 0 && givenDate >= this.getTimeInMilliseconds(this.disableSince)) {
  //    return true;
  //  }
  //  if (this.disableWeekends) {
  //    let dayNbr = this.getDayNumber(date);
  //    if (dayNbr === 0 || dayNbr === 6) {
  //      return true;
  //    }
  //  }
  //  return false;
  //}

  //getTimeInMilliseconds(date: IMyDate): number {
  //  return new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0).getTime();
  //}

  //getDayNumber(date: IMyDate): number {
  //  // Get day number: sun=0, mon=1, tue=2, wed=3 ...
  //  let d = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
  //  return d.getDay();
  //}

  //sundayIdx(): number {
  //  // Index of Sunday day
  //  return this.dayIdx > 0 ? 7 - this.dayIdx : 0;
  //}

  //generateCalendar(m: number, y: number): void {
  //  this.dates.length = 0;
  //  let monthStart = this.monthStartIdx(y, m);
  //  let dInThisM = this.daysInMonth(m, y);
  //  let dInPrevM = this.daysInPrevMonth(m, y);

  //  let dayNbr = 1;
  //  let cmo = this.PREV_MONTH;
  //  for (let i = 1; i < 7; i++) {
  //    let week: IMyWeek[] = [];
  //    if (i === 1) {
  //      // First week
  //      var pm = dInPrevM - monthStart + 1;
  //      // Previous month
  //      for (var j = pm; j <= dInPrevM; j++) {
  //        let date: IMyDate = { year: y, month: m - 1, day: j };
  //        week.push({ dateObj: date, cmo: cmo, currDay: this.isCurrDay(j, m, y, cmo), dayNbr: this.getDayNumber(date), disabled: this.isDisabledDay(date) });
  //      }

  //      cmo = this.CURR_MONTH;
  //      // Current month
  //      var daysLeft = 7 - week.length;
  //      for (var j = 0; j < daysLeft; j++) {
  //        let date: IMyDate = { year: y, month: m, day: dayNbr };
  //        week.push({ dateObj: date, cmo: cmo, currDay: this.isCurrDay(dayNbr, m, y, cmo), dayNbr: this.getDayNumber(date), disabled: this.isDisabledDay(date) });
  //        dayNbr++;
  //      }
  //    }
  //    else {
  //      // Rest of the weeks
  //      for (var j = 1; j < 8; j++) {
  //        if (dayNbr > dInThisM) {
  //          // Next month
  //          dayNbr = 1;
  //          cmo = this.NEXT_MONTH;
  //        }
  //        let date: IMyDate = { year: y, month: cmo === this.CURR_MONTH ? m : m + 1, day: dayNbr };
  //        week.push({ dateObj: date, cmo: cmo, currDay: this.isCurrDay(dayNbr, m, y, cmo), dayNbr: this.getDayNumber(date), disabled: this.isDisabledDay(date) });
  //        dayNbr++;
  //      }
  //    }
  //    this.dates.push(week);
  //  }
  //}

  //parseSelectedDate(ds: string): IMyDate {
  //  let date: IMyDate = { day: 0, month: 0, year: 0 };
  //  if (ds !== '') {
  //    let fmt = this.options && this.options.dateFormat !== undefined ? this.options.dateFormat : this.dateFormat;
  //    let dpos = fmt.indexOf('dd');
  //    if (dpos >= 0) {
  //      date.day = parseInt(ds.substring(dpos, dpos + 2));
  //    }
  //    let mpos = fmt.indexOf('mm');
  //    if (mpos >= 0) {
  //      date.month = parseInt(ds.substring(mpos, mpos + 2));
  //    }
  //    let ypos = fmt.indexOf('yyyy');
  //    if (ypos >= 0) {
  //      date.year = parseInt(ds.substring(ypos, ypos + 4));
  //    }
  //  }
  //  return date;
  //}

  //parseSelectedMonth(ms: string): IMyMonth {
  //  let split = ms.split(ms.match(/[^0-9]/)[0]);
  //  return (parseInt(split[0]) > parseInt(split[1])) ?
  //    { monthTxt: '', monthNbr: parseInt(split[1]), year: parseInt(split[0]) } :
  //    { monthTxt: '', monthNbr: parseInt(split[0]), year: parseInt(split[1]) };
  //}

}

export const MD2_DATEPICKER_DIRECTIVES = [Md2Datepicker];

@NgModule({
  declarations: MD2_DATEPICKER_DIRECTIVES,
  imports: [CommonModule, FormsModule],
  exports: MD2_DATEPICKER_DIRECTIVES,
  //providers: [LocaleService]
})
export class Md2DatepickerModule { }