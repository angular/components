import {
  Component,
  ElementRef,
  forwardRef,
  NgModule,
  Input,
  Output,
  SimpleChange,
  OnChanges,
  AfterContentInit,
  EventEmitter,
  ModuleWithProviders,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

const noop = () => {};

export const MD_PICKER_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => datePicker),
  multi: true
};

@Component({
  selector: 'md-date-picker',
  styleUrls: ['./datePicker.scss'],
  template: `
  <div class="_picker"
        tabindex="0"
        [class._focusedPicker]="_focused"
        (focus)="_handleClick()"
        (blur)="_handleOutFocus()"
  >
    <div class="_input">
      <ng-content></ng-content>
    </div>
    <div class="_datePicker" [class._dual]="_mode">
      <div class="_datePicker-content">
        <div class="_top">
          <div class="_top_year">{{_value | date: 'y'}}</div>
          <div class="_top_date">{{_value | date: 'EE, MMM d'}}</div>
        </div>
        <div class="_header _control">
          <div>{{ days._INI | date: 'MMMM y' }}</div>
          <span (click)="_left(false, days)" class="_left">
            <svg viewBox="0 0 24 24" style="display: inline-block;
            fill: rgba(0, 0, 0, 0.870588); height: 24px; width: 24px;
            user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>
          </span>
          <span (click)="_right(false, days)" class="_right">
            <svg viewBox="0 0 24 24" style="display: inline-block;
            fill: rgba(0, 0, 0, 0.870588); height: 24px; width: 24px;
            user-select: none; transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>
          </span>
        </div>
        <div class="_header">
          <span class="_DaysName" *ngFor="let day of daysName">{{day}}</span>
        </div>
        <div class="_days">
          <div
            [class._before]="day.date<dateINT"
            [class._days_selected]="days2.length!=0&&day.date<=date2_INT&&day.date>INT_DATE(_value)"
            [class._today]="day.dateActive == dateToday"
            [class._focused]="dayActive == day.dateActive ||
            dayActive2 == day.dateActive && days2!=0"
            [class._parent_S]="dayActive == day.dateActive && !stateSELECT && days2!=0
            || dayActive2 == day.dateActive && stateSELECT && days2!=0"
            *ngFor="let day of days.data;" class="_day">
              <span
                (focus)="selectDate(day.date, false, $event); _handleClick();"
                (blur)="_handleOutFocus()"
                tabindex="0" *ngIf="day.date!=0">{{day.index}}
                  <div (mouseenter)="stateSELECT=false"
                  *ngIf="dayActive == day.dateActive && days2!=0"></div>
                  <div (mouseenter)="stateSELECT=true"
                  *ngIf="dayActive2 == day.dateActive && days2!=0"></div>
                </span>
          </div>
        </div>
      </div>
      <div *ngIf="days2.length!=0 && _mode" class="_datePicker-content">
        <div class="_top">
          <div class="_top_year">{{date2_INT | date: 'y'}}</div>
          <div class="_top_date">{{date2_INT | date: 'EE, MMM d'}}</div>
        </div>
        <div class="_header _control">
          <div>{{ days2._INI | date: 'MMMM y' }}</div>
          <span (click)="_left(true, days2)" class="_left">
            <svg viewBox="0 0 24 24"
            style="display: inline-block; fill: rgba(0, 0, 0, 0.870588);
            height: 24px; width: 24px; user-select: none;
            transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>
          </span>
          <span (click)="_right(true, days2)" class="_right">
            <svg viewBox="0 0 24 24"
            style="display: inline-block; fill: rgba(0, 0, 0, 0.870588);
            height: 24px; width: 24px; user-select: none;
            transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>
          </span>
        </div>
        <div class="_header">
          <span class="_DaysName" *ngFor="let day of daysName">{{day}}</span>
        </div>
        <div class="_days">
          <div
            [class._before]="day.date<dateINT"
            [class._days_selected]="days2.length!=0&&day.date<=date2_INT&&day.date>INT_DATE(_value)"
            [class._today]="day.dateActive == dateToday"
            [class._focused]="dayActive == day.dateActive || dayActive2 == day.dateActive"
            [class._parent_S]="dayActive == day.dateActive && !stateSELECT ||
            dayActive2 == day.dateActive && stateSELECT"
            *ngFor="let day of days2.data;"
            class="_day">
              <span
                (focus)="selectDate(day.date, true, $event); _handleClick()"
                (blur)="_handleOutFocus()"
                tabindex="0"
                *ngIf="day.date!=0">{{day.index}}
                  <div (mouseenter)="stateSELECT=false"
                  *ngIf="dayActive == day.dateActive"></div>
                  <div (mouseenter)="stateSELECT=true"
                  *ngIf="dayActive2 == day.dateActive"></div>
              </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  providers: [MD_PICKER_CONTROL_VALUE_ACCESSOR],
})
export class datePicker implements ControlValueAccessor, AfterContentInit, OnChanges {
  // ADD other datepicker !important;
  // select days
  Date: string = `${new Date()}`;
  stateSELECT: boolean = false;
  dateNow: any = new Date();
  dayActive: any;
  dayActive2: any;
  days: any = [];
  days2: any = [];
  date2_INT = Date.now();
  dateINI: any;
  dateEND: any;
  dateINT: any;
  dateToday: any;
  _focused: boolean = false;
  _mode: boolean = false;
  daysName: Array<string> = [
    'm',
    't',
    'w',
    't',
    'f',
    's',
    's',
  ];
  _value: any = '';
  @Input()
  set mode(v: string) {
    console.warn('datew___2', v);
    if (v  ==  'dual') {
      console.warn('datew___2rf', v);
      this._mode = true;
    }else {
      this._mode = false;
    }
  }
  @Input()
  set date2(v: any) {
    console.warn('datew___2', v);
    if (v ! ==  this.days2) {
      console.warn('datew___2rf', v);
      this.days2 = this.Month(v);
      this.date2_INT = new Date(v).getTime();
    }
  }
  @Output() date2Change: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private elementRef: ElementRef,
  ) {

  }

  _handleClick() {
    let selector = this.elementRef.nativeElement.querySelector('._picker');
    let DatePicker = this.elementRef.nativeElement.querySelector('._datePicker');
    DatePicker.setAttribute('style', `
      top: ${selector.offsetHeight}px
    `);
    this._focused = true;
  }

  /**
   * OutFocus.
   * TODO: internal
   */
  _handleOutFocus(state: boolean) {
      this._focused = false;

  }

  registerOnChange(fn: any) {
    this._onChangeCallback = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  registerOnTouched(fn: any) {
    this._onTouchedCallback = fn;
  }

  /** Callback registered via registerOnTouched (ControlValueAccessor) */
  private _onTouchedCallback: () => void = noop;

  /** Callback registered via registerOnChange (ControlValueAccessor) */
  private _onChangeCallback: (_: any) => void = noop;

  get value(): any {
    console.warn('out__');
    return this._value;
  };

  @Input() set value(v: any) {
    console.warn('out__0', v);
    if (v ! ==  this._value) {
      this._value = v;
      this._onChangeCallback(v);
    }
  }

  writeValue(value: any) {
    console.warn('out__1', value);
    this.selectDate(value, false);
    this.getMonth(value);
    this._value = value;
  }

  private INT_DATE(date:any) {
    return new Date(date).getTime();
  }

  selectDate(date:any, _for: boolean = false, e$: any = false) {
    let _slctD = new Date(date);
    let selector = this.elementRef.nativeElement.querySelector('._picker');
    if(this.stateSELECT == true) {
      if(e$ != false) {
        this.date2 = _slctD;
        this.date2Change.emit(_slctD);
        selector.focus();
      }
      this.dayActive2 = `${_slctD.getFullYear()}+${_slctD.getMonth()}+${_slctD.getDate()}`;
    }else {
      this.dayActive = `${_slctD.getFullYear()}+${_slctD.getMonth()}+${_slctD.getDate()}`;
      this.value = _slctD;
      this._value = _slctD;
      this._onTouchedCallback();
    }
    this.Date = `${
      new Date(date).getDate()
    }-${
      new Date(date).getMonth()+1
    }-${
      new Date(date).getFullYear()
    }`;
    this.dateINT = Date.now();
    this.dateToday = `${
      new Date().getFullYear()
    }+${new Date().getMonth()}+${
      new Date().getDate()
    }`;
  }

  /**
   * _left.
   */
  _left(_for:any, date:any) {
    if(_for == false) {
      this.days = this.Month(date._INI-60*60*24*1000);
    }else {
      this.days2 = this.Month(date._INI-60*60*24*1000);
    }
  }

  /**
   * Month prev.
   */
  _right(_for:any, date:any) {
    if(_for == false) {
      this.days = this.Month(date._INI.getTime()+(date.dateEND+2)*60*60*24*1000);
    }else{
      this.days2 = this.Month(date._INI.getTime()+(date.dateEND+2)*60*60*24*1000);
    }
  }

  ngAfterContentInit() {
    this.stateSELECT = true;
    this._handleClick();
    this._focused = false;
    this.selectDate(this.date2_INT, true);
    console.log('state___---init all', this.date2_INT);
    this.stateSELECT = false;
  }

  getMonth(_slctD:any) {
    this.days = this.Month(_slctD);
  }
  get Days() {
    return (-this.INT_DATE(this._value)+this.INT_DATE(this.date2_INT))/60/60/24/1000;
  }
  Month(date:any) {
    let _days:any = {
      data: [],
      _INI: '',
      dateEND: '',
    };
    let _slctD = new Date(date);
    let dayNow = (_slctD.getDate()-1)*60*60*24*1000;
    let dateNow = new Date(_slctD.getTime());
    let dateINI = new Date(dateNow.getTime()-dayNow);
    let dateEND:any;
    let day_left = 0;
    if(new Date(dateINI).getDay() == 0) {
      day_left = 6;
    }else{
      day_left = new Date(dateINI).getDay()-1;
    }
    for(var i = 0; i < day_left; i++) {
      _days.data.push({
        index: null,
        date: 0,
      });
    }
    let dateTemp:any;
    for(var i = 1; i < 32; i++) {
      dateTemp = new Date((dateINI.getTime())+((i-1)*60*60*24*1000));
      if(i == dateTemp.getDate()){
        dateEND = i;
        _days.data.push({
          index: i,
          date: dateTemp.getTime(),
          dateActive: `${dateTemp.getFullYear()}+${dateTemp.getMonth()}+${dateTemp.getDate()}`,
        });
      }
    }
    this.dateINI = dateINI;
    _days._INI = dateINI;
    _days.dateEND = dateEND;
    return _days;
  }
  ngOnChanges(changes: {[key: string]: SimpleChange}) {
    // ***
  }
}

@NgModule({
  imports: [CommonModule, FormsModule],
  exports: [datePicker],
  declarations: [datePicker],
})
export class MdDatePickerModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: datePicker,
      providers: []
    };
  }
}
