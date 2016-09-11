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



///*!
// * ClockPicker v{package.version} (http://weareoutman.github.io/clockpicker/)
// * Copyright 2014 Wang Shenwei.
// * Licensed under MIT (https://github.com/weareoutman/clockpicker/blob/master/LICENSE)
// */

//; (function () {
//  var $ = window.jQuery,
//    $win = $(window),
//    $doc = $(document),
//    $body;

//  // Can I use inline svg ?
//  var svgNS = 'http://www.w3.org/2000/svg',
//    svgSupported = 'SVGAngle' in window && (function () {
//      var supported,
//        el = document.createElement('div');
//      el.innerHTML = '<svg/>';
//      supported = (el.firstChild && el.firstChild.namespaceURI) == svgNS;
//      el.innerHTML = '';
//      return supported;
//    })();

//  // Can I use transition ?
//  var transitionSupported = (function () {
//    var style = document.createElement('div').style;
//    return 'transition' in style ||
//      'WebkitTransition' in style ||
//      'MozTransition' in style ||
//      'msTransition' in style ||
//      'OTransition' in style;
//  })();

//  // Listen touch events in touch screen device, instead of mouse events in desktop.
//  var touchSupported = 'ontouchstart' in window,
//    mousedownEvent = 'mousedown' + (touchSupported ? ' touchstart' : ''),
//    mousemoveEvent = 'mousemove.clockpicker' + (touchSupported ? ' touchmove.clockpicker' : ''),
//    mouseupEvent = 'mouseup.clockpicker' + (touchSupported ? ' touchend.clockpicker' : '');

//  // Vibrate the device if supported
//  var vibrate = navigator.vibrate ? 'vibrate' : navigator.webkitVibrate ? 'webkitVibrate' : null;

//  function createSvgElement(name) {
//    return document.createElementNS(svgNS, name);
//  }

//  function leadingZero(num) {
//    return (num < 10 ? '0' : '') + num;
//  }

//  // Get a unique id
//  var idCounter = 0;
//  function uniqueId(prefix) {
//    var id = ++idCounter + '';
//    return prefix ? prefix + id : id;
//  }

//  // Clock size
//  var dialRadius = 100,
//    outerRadius = 80,
//    // innerRadius = 80 on 12 hour clock
//    innerRadius = 54,
//    tickRadius = 13,
//    diameter = dialRadius * 2,
//    duration = transitionSupported ? 350 : 1;

//  // Popover template
//  var tpl = [
//    '<div class="popover clockpicker-popover">',
//    '<div class="arrow"></div>',
//    '<div class="popover-title">',
//				'<span class="clockpicker-span-hours text-primary"></span>',
//				' : ',
//				'<span class="clockpicker-span-minutes"></span>',
//				'<span class="clockpicker-span-am-pm"></span>',
//    '</div>',
//    '<div class="popover-content">',
//				'<div class="clockpicker-plate">',
//    '<div class="clockpicker-canvas"></div>',
//    '<div class="clockpicker-dial clockpicker-hours"></div>',
//    '<div class="clockpicker-dial clockpicker-minutes clockpicker-dial-out"></div>',
//				'</div>',
//				'<span class="clockpicker-am-pm-block">',
//				'</span>',
//    '</div>',
//    '</div>'
//  ].join('');

//  // ClockPicker
//  function ClockPicker(element, options) {
//    var popover = $(tpl),
//      plate = popover.find('.clockpicker-plate'),
//      hoursView = popover.find('.clockpicker-hours'),
//      minutesView = popover.find('.clockpicker-minutes'),
//      amPmBlock = popover.find('.clockpicker-am-pm-block'),
//      isInput = element.prop('tagName') === 'INPUT',
//      input = isInput ? element : element.find('input'),
//      addon = element.find('.input-group-addon'),
//      self = this,
//      timer;

//    this.id = uniqueId('cp');
//    this.element = element;
//    this.options = options;
//    this.isAppended = false;
//    this.isShown = false;
//    this.currentView = 'hours';
//    this.isInput = isInput;
//    this.input = input;
//    this.addon = addon;
//    this.popover = popover;
//    this.plate = plate;
//    this.hoursView = hoursView;
//    this.minutesView = minutesView;
//    this.amPmBlock = amPmBlock;
//    this.spanHours = popover.find('.clockpicker-span-hours');
//    this.spanMinutes = popover.find('.clockpicker-span-minutes');
//    this.spanAmPm = popover.find('.clockpicker-span-am-pm');
//    this.amOrPm = "PM";

//    // Setup for for 12 hour clock if option is selected
//    if (options.twelvehour) {

//      var amPmButtonsTemplate = ['<div class="clockpicker-am-pm-block">',
//        '<button type="button" class="btn btn-sm btn-default clockpicker-button clockpicker-am-button">',
//        'AM</button>',
//        '<button type="button" class="btn btn-sm btn-default clockpicker-button clockpicker-pm-button">',
//        'PM</button>',
//        '</div>'].join('');

//      var amPmButtons = $(amPmButtonsTemplate);
//      //amPmButtons.appendTo(plate);

//      ////Not working b/c they are not shown when this runs
//      //$('clockpicker-am-button')
//      //    .on("click", function() {
//      //        self.amOrPm = "AM";
//      //        $('.clockpicker-span-am-pm').empty().append('AM');
//      //    });
//      //    
//      //$('clockpicker-pm-button')
//      //    .on("click", function() {
//      //         self.amOrPm = "PM";
//      //        $('.clockpicker-span-am-pm').empty().append('PM');
//      //    });

//      $('<button type="button" class="btn btn-sm btn-default clockpicker-button am-button">' + "AM" + '</button>')
//        .on("click", function () {
//          self.amOrPm = "AM";
//          $('.clockpicker-span-am-pm').empty().append('AM');
//        }).appendTo(this.amPmBlock);


//      $('<button type="button" class="btn btn-sm btn-default clockpicker-button pm-button">' + "PM" + '</button>')
//        .on("click", function () {
//          self.amOrPm = "PM";
//          $('.clockpicker-span-am-pm').empty().append('PM');
//        }).appendTo(this.amPmBlock);

//    }

//    if (!options.autoclose) {
//      // If autoclose is not setted, append a button
//      $('<button type="button" class="btn btn-sm btn-default btn-block clockpicker-button">' + options.donetext + '</button>')
//        .click($.proxy(this.done, this))
//        .appendTo(popover);
//    }

//    // Placement and arrow align - make sure they make sense.
//    if ((options.placement === 'top' || options.placement === 'bottom') && (options.align === 'top' || options.align === 'bottom')) options.align = 'left';
//    if ((options.placement === 'left' || options.placement === 'right') && (options.align === 'left' || options.align === 'right')) options.align = 'top';

//    popover.addClass(options.placement);
//    popover.addClass('clockpicker-align-' + options.align);

//    this.spanHours.click($.proxy(this.toggleView, this, 'hours'));
//    this.spanMinutes.click($.proxy(this.toggleView, this, 'minutes'));

//    // Show or toggle
//    input.on('focus.clockpicker click.clockpicker', $.proxy(this.show, this));
//    addon.on('click.clockpicker', $.proxy(this.toggle, this));

//    // Build ticks
//    var tickTpl = $('<div class="clockpicker-tick"></div>'),
//      i, tick, radian;

//    // Hours view
//    if (options.twelvehour) {
//      for (i = 1; i < 13; i += 1) {
//        tick = tickTpl.clone();
//        radian = i / 6 * Math.PI;
//        var radius = outerRadius;
//        tick.css('font-size', '120%');
//        tick.css({
//          left: dialRadius + Math.sin(radian) * radius - tickRadius,
//          top: dialRadius - Math.cos(radian) * radius - tickRadius
//        });
//        tick.html(i === 0 ? '00' : i);
//        hoursView.append(tick);
//        tick.on(mousedownEvent, mousedown);
//      }
//    }
//    else {
//      for (i = 0; i < 24; i += 1) {
//        tick = tickTpl.clone();
//        radian = i / 6 * Math.PI;
//        var inner = i > 0 && i < 13,
//          radius = inner ? innerRadius : outerRadius;
//        tick.css({
//          left: dialRadius + Math.sin(radian) * radius - tickRadius,
//          top: dialRadius - Math.cos(radian) * radius - tickRadius
//        });
//        if (inner) {
//          tick.css('font-size', '120%');
//        }
//        tick.html(i === 0 ? '00' : i);
//        hoursView.append(tick);
//        tick.on(mousedownEvent, mousedown);
//      }
//    }

//    // Minutes view
//    for (i = 0; i < 60; i += 5) {
//      tick = tickTpl.clone();
//      radian = i / 30 * Math.PI;
//      tick.css({
//        left: dialRadius + Math.sin(radian) * outerRadius - tickRadius,
//        top: dialRadius - Math.cos(radian) * outerRadius - tickRadius
//      });
//      tick.css('font-size', '120%');
//      tick.html(leadingZero(i));
//      minutesView.append(tick);
//      tick.on(mousedownEvent, mousedown);
//    }

//    // Clicking on minutes view space
//    plate.on(mousedownEvent, function (e) {
//      if ($(e.target).closest('.clockpicker-tick').length === 0) {
//        mousedown(e, true);
//      }
//    });

//    // Mousedown or touchstart
//    function mousedown(e, space) {
//      var offset = plate.offset(),
//        isTouch = /^touch/.test(e.type),
//        x0 = offset.left + dialRadius,
//        y0 = offset.top + dialRadius,
//        dx = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0,
//        dy = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0,
//        z = Math.sqrt(dx * dx + dy * dy),
//        moved = false;

//      // When clicking on minutes view space, check the mouse position
//      if (space && (z < outerRadius - tickRadius || z > outerRadius + tickRadius)) {
//        return;
//      }
//      e.preventDefault();

//      // Set cursor style of body after 200ms
//      var movingTimer = setTimeout(function () {
//        $body.addClass('clockpicker-moving');
//      }, 200);

//      // Place the canvas to top
//      if (svgSupported) {
//        plate.append(self.canvas);
//      }

//      // Clock
//      self.setHand(dx, dy, !space, true);

//      // Mousemove on document
//      $doc.off(mousemoveEvent).on(mousemoveEvent, function (e) {
//        e.preventDefault();
//        var isTouch = /^touch/.test(e.type),
//          x = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0,
//          y = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0;
//        if (!moved && x === dx && y === dy) {
//          // Clicking in chrome on windows will trigger a mousemove event
//          return;
//        }
//        moved = true;
//        self.setHand(x, y, false, true);
//      });

//      // Mouseup on document
//      $doc.off(mouseupEvent).on(mouseupEvent, function (e) {
//        $doc.off(mouseupEvent);
//        e.preventDefault();
//        var isTouch = /^touch/.test(e.type),
//          x = (isTouch ? e.originalEvent.changedTouches[0] : e).pageX - x0,
//          y = (isTouch ? e.originalEvent.changedTouches[0] : e).pageY - y0;
//        if ((space || moved) && x === dx && y === dy) {
//          self.setHand(x, y);
//        }
//        if (self.currentView === 'hours') {
//          self.toggleView('minutes', duration / 2);
//        } else {
//          if (options.autoclose) {
//            self.minutesView.addClass('clockpicker-dial-out');
//            setTimeout(function () {
//              self.done();
//            }, duration / 2);
//          }
//        }
//        plate.prepend(canvas);

//        // Reset cursor style of body
//        clearTimeout(movingTimer);
//        $body.removeClass('clockpicker-moving');

//        // Unbind mousemove event
//        $doc.off(mousemoveEvent);
//      });
//    }

//    if (svgSupported) {
//      // Draw clock hands and others
//      var canvas = popover.find('.clockpicker-canvas'),
//        svg = createSvgElement('svg');
//      svg.setAttribute('class', 'clockpicker-svg');
//      svg.setAttribute('width', diameter);
//      svg.setAttribute('height', diameter);
//      var g = createSvgElement('g');
//      g.setAttribute('transform', 'translate(' + dialRadius + ',' + dialRadius + ')');
//      var bearing = createSvgElement('circle');
//      bearing.setAttribute('class', 'clockpicker-canvas-bearing');
//      bearing.setAttribute('cx', 0);
//      bearing.setAttribute('cy', 0);
//      bearing.setAttribute('r', 2);
//      var hand = createSvgElement('line');
//      hand.setAttribute('x1', 0);
//      hand.setAttribute('y1', 0);
//      var bg = createSvgElement('circle');
//      bg.setAttribute('class', 'clockpicker-canvas-bg');
//      bg.setAttribute('r', tickRadius);
//      var fg = createSvgElement('circle');
//      fg.setAttribute('class', 'clockpicker-canvas-fg');
//      fg.setAttribute('r', 3.5);
//      g.appendChild(hand);
//      g.appendChild(bg);
//      g.appendChild(fg);
//      g.appendChild(bearing);
//      svg.appendChild(g);
//      canvas.append(svg);

//      this.hand = hand;
//      this.bg = bg;
//      this.fg = fg;
//      this.bearing = bearing;
//      this.g = g;
//      this.canvas = canvas;
//    }
//  }

//  // Default options
//  ClockPicker.DEFAULTS = {
//    'default': '',       // default time, 'now' or '13:14' e.g.
//    fromnow: 0,          // set default time to * milliseconds from now (using with default = 'now')
//    placement: 'bottom', // clock popover placement
//    align: 'left',       // popover arrow align
//    donetext: 'ok',    // done button text
//    autoclose: false,    // auto close when minute is selected
//    twelvehour: false, // change to 12 hour AM/PM clock from 24 hour
//    vibrate: true        // vibrate the device when dragging clock hand
//  };

//  // Show or hide popover
//  ClockPicker.prototype.toggle = function () {
//    this[this.isShown ? 'hide' : 'show']();
//  };

//  // Set popover position
//  ClockPicker.prototype.locate = function () {
//    var element = this.element,
//      popover = this.popover,
//      offset = element.offset(),
//      width = element.outerWidth(),
//      height = element.outerHeight(),
//      placement = this.options.placement,
//      align = this.options.align,
//      styles = {},
//      self = this;

//    popover.show();

//    // Place the popover
//    switch (placement) {
//      case 'bottom':
//        styles.top = offset.top + height;
//        break;
//      case 'right':
//        styles.left = offset.left + width;
//        break;
//      case 'top':
//        styles.top = offset.top - popover.outerHeight();
//        break;
//      case 'left':
//        styles.left = offset.left - popover.outerWidth();
//        break;
//    }

//    // Align the popover arrow
//    switch (align) {
//      case 'left':
//        styles.left = offset.left;
//        break;
//      case 'right':
//        styles.left = offset.left + width - popover.outerWidth();
//        break;
//      case 'top':
//        styles.top = offset.top;
//        break;
//      case 'bottom':
//        styles.top = offset.top + height - popover.outerHeight();
//        break;
//    }

//    popover.css(styles);
//  };

//  // Show popover
//  ClockPicker.prototype.show = function (e) {
//    // Not show again
//    if (this.isShown) {
//      return;
//    }

//    var self = this;

//    // Initialize
//    if (!this.isAppended) {
//      // Append popover to body
//      $body = $(document.body).append(this.popover);

//      // Reset position when resize
//      $win.on('resize.clockpicker' + this.id, function () {
//        if (self.isShown) {
//          self.locate();
//        }
//      });

//      this.isAppended = true;
//    }

//    // Get the time
//    var value = ((this.input.prop('value') || this.options['default'] || '') + '').split(':');
//    if (value[0] === 'now') {
//      var now = new Date(+ new Date() + this.options.fromnow);
//      value = [
//        now.getHours(),
//        now.getMinutes()
//      ];
//    }
//    this.hours = + value[0] || 0;
//    this.minutes = + value[1] || 0;
//    this.spanHours.html(leadingZero(this.hours));
//    this.spanMinutes.html(leadingZero(this.minutes));

//    // Toggle to hours view
//    this.toggleView('hours');

//    // Set position
//    this.locate();

//    this.isShown = true;

//    // Hide when clicking or tabbing on any element except the clock, input and addon
//    $doc.on('click.clockpicker.' + this.id + ' focusin.clockpicker.' + this.id, function (e) {
//      var target = $(e.target);
//      if (target.closest(self.popover).length === 0 &&
//        target.closest(self.addon).length === 0 &&
//        target.closest(self.input).length === 0) {
//        self.hide();
//      }
//    });

//    // Hide when ESC is pressed
//    $doc.on('keyup.clockpicker.' + this.id, function (e) {
//      if (e.keyCode === 27) {
//        self.hide();
//      }
//    });
//  };

//  // Hide popover
//  ClockPicker.prototype.hide = function () {
//    this.isShown = false;

//    // Unbinding events on document
//    $doc.off('click.clockpicker.' + this.id + ' focusin.clockpicker.' + this.id);
//    $doc.off('keyup.clockpicker.' + this.id);

//    this.popover.hide();
//  };

//  // Toggle to hours or minutes view
//  ClockPicker.prototype.toggleView = function (view, delay) {
//    var isHours = view === 'hours',
//      nextView = isHours ? this.hoursView : this.minutesView,
//      hideView = isHours ? this.minutesView : this.hoursView;

//    this.currentView = view;

//    this.spanHours.toggleClass('text-primary', isHours);
//    this.spanMinutes.toggleClass('text-primary', !isHours);

//    // Let's make transitions
//    hideView.addClass('clockpicker-dial-out');
//    nextView.css('visibility', 'visible').removeClass('clockpicker-dial-out');

//    // Reset clock hand
//    this.resetClock(delay);

//    // After transitions ended
//    clearTimeout(this.toggleViewTimer);
//    this.toggleViewTimer = setTimeout(function () {
//      hideView.css('visibility', 'hidden');
//    }, duration);
//  };

//  // Reset clock hand
//  ClockPicker.prototype.resetClock = function (delay) {
//    var view = this.currentView,
//      value = this[view],
//      isHours = view === 'hours',
//      unit = Math.PI / (isHours ? 6 : 30),
//      radian = value * unit,
//      radius = isHours && value > 0 && value < 13 ? innerRadius : outerRadius,
//      x = Math.sin(radian) * radius,
//      y = - Math.cos(radian) * radius,
//      self = this;
//    if (svgSupported && delay) {
//      self.canvas.addClass('clockpicker-canvas-out');
//      setTimeout(function () {
//        self.canvas.removeClass('clockpicker-canvas-out');
//        self.setHand(x, y);
//      }, delay);
//    } else {
//      this.setHand(x, y);
//    }
//  };

//  // Set clock hand to (x, y)
//  ClockPicker.prototype.setHand = function (x, y, roundBy5, dragging) {
//    var radian = Math.atan2(x, - y),
//      isHours = this.currentView === 'hours',
//      unit = Math.PI / (isHours || roundBy5 ? 6 : 30),
//      z = Math.sqrt(x * x + y * y),
//      options = this.options,
//      inner = isHours && z < (outerRadius + innerRadius) / 2,
//      radius = inner ? innerRadius : outerRadius,
//      value;

//    if (options.twelvehour) {
//      radius = outerRadius;
//    }

//    // Radian should in range [0, 2PI]
//    if (radian < 0) {
//      radian = Math.PI * 2 + radian;
//    }

//    // Get the round value
//    value = Math.round(radian / unit);

//    // Get the round radian
//    radian = value * unit;

//    // Correct the hours or minutes
//    if (options.twelvehour) {
//      if (isHours) {
//        if (value === 0) {
//          value = 12;
//        }
//      } else {
//        if (roundBy5) {
//          value *= 5;
//        }
//        if (value === 60) {
//          value = 0;
//        }
//      }
//	   } else {
//      if (isHours) {
//        if (value === 12) {
//          value = 0;
//        }
//        value = inner ? (value === 0 ? 12 : value) : value === 0 ? 0 : value + 12;
//      } else {
//        if (roundBy5) {
//          value *= 5;
//        }
//        if (value === 60) {
//          value = 0;
//        }
//      }
//    }

//    // Once hours or minutes changed, vibrate the device
//    if (this[this.currentView] !== value) {
//      if (vibrate && this.options.vibrate) {
//        // Do not vibrate too frequently
//        if (!this.vibrateTimer) {
//          navigator[vibrate](10);
//          this.vibrateTimer = setTimeout($.proxy(function () {
//            this.vibrateTimer = null;
//          }, this), 100);
//        }
//      }
//    }

//    this[this.currentView] = value;
//    this[isHours ? 'spanHours' : 'spanMinutes'].html(leadingZero(value));

//    // If svg is not supported, just add an active class to the tick
//    if (!svgSupported) {
//      this[isHours ? 'hoursView' : 'minutesView'].find('.clockpicker-tick').each(function () {
//        var tick = $(this);
//        tick.toggleClass('active', value === + tick.html());
//      });
//      return;
//    }

//    // Place clock hand at the top when dragging
//    if (dragging || (!isHours && value % 5)) {
//      this.g.insertBefore(this.hand, this.bearing);
//      this.g.insertBefore(this.bg, this.fg);
//      this.bg.setAttribute('class', 'clockpicker-canvas-bg clockpicker-canvas-bg-trans');
//    } else {
//      // Or place it at the bottom
//      this.g.insertBefore(this.hand, this.bg);
//      this.g.insertBefore(this.fg, this.bg);
//      this.bg.setAttribute('class', 'clockpicker-canvas-bg');
//    }

//    // Set clock hand and others' position
//    var cx = Math.sin(radian) * radius,
//      cy = - Math.cos(radian) * radius;
//    this.hand.setAttribute('x2', cx);
//    this.hand.setAttribute('y2', cy);
//    this.bg.setAttribute('cx', cx);
//    this.bg.setAttribute('cy', cy);
//    this.fg.setAttribute('cx', cx);
//    this.fg.setAttribute('cy', cy);
//  };

//  // Hours and minutes are selected
//  ClockPicker.prototype.done = function () {
//    this.hide();
//    var last = this.input.prop('value'),
//      value = leadingZero(this.hours) + ':' + leadingZero(this.minutes);
//    if (this.options.twelvehour) {
//      value = value + this.amOrPm;
//    }

//    this.input.prop('value', value);
//    if (value !== last) {
//      this.input.triggerHandler('change');
//      if (!this.isInput) {
//        this.element.trigger('change');
//      }
//    }

//    if (this.options.autoclose) {
//      this.input.trigger('blur');
//    }
//  };

//  // Remove clockpicker from input
//  ClockPicker.prototype.remove = function () {
//    this.element.removeData('clockpicker');
//    this.input.off('focus.clockpicker click.clockpicker');
//    this.addon.off('click.clockpicker');
//    if (this.isShown) {
//      this.hide();
//    }
//    if (this.isAppended) {
//      $win.off('resize.clockpicker' + this.id);
//      this.popover.remove();
//    }
//  };

//  // Extends $.fn.clockpicker
//  $.fn.clockpicker = function (option) {
//    var args = Array.prototype.slice.call(arguments, 1);
//    return this.each(function () {
//      var $this = $(this),
//        data = $this.data('clockpicker');
//      if (!data) {
//        var options = $.extend({}, ClockPicker.DEFAULTS, $this.data(), typeof option == 'object' && option);
//        $this.data('clockpicker', new ClockPicker($this, options));
//      } else {
//        // Manual operatsions. show, hide, remove, e.g.
//        if (typeof data[option] === 'function') {
//          data[option].apply(data, args);
//        }
//      }
//    });
//  };
//} ());
