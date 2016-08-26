import {
  Component,
  OnInit,
  ViewContainerRef,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  provide,
  forwardRef,
  NgModule
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule,
  NgModel
} from '@angular/forms';
import {CommonModule} from '@angular/common';


export interface CalendarDate {
  day: number;
  month: number;
  year: number;
  enabled: boolean;
}

const noop = () => { };

let nextId = 0;

export const MD_DATEPICKER_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdDatepicker),
  multi: true
};

@Component({
  moduleId: module.id,
  selector: 'md-datepicker',
  templateUrl: 'datepicker.html',
  styleUrls: ['datepicker.css'],
  providers: [MD_DATEPICKER_CONTROL_VALUE_ACCESSOR],
})
export class MdDatepicker implements ControlValueAccessor, AfterViewInit, OnInit {
  public isOpened: boolean;
  public dateValue: string;
  public viewValue: string;
  public days: Array<CalendarDate>;
  public dayNames: Array<string>;
  private el: any;
  private date: any;
  private viewContainer: ViewContainerRef;
  private onChange: Function;
  private onTouched: Function;
  private cd: any;
  private cannonical: number;

  @Input('model-format') modelFormat: string;
  @Input('view-format') viewFormat: string;
  @Input('init-date') initDate: string;
  @Input('first-week-day-sunday') firstWeekDaySunday: boolean;
  @Input('static') isStatic: boolean;

  @Output() changed: EventEmitter<Date> = new EventEmitter<Date>();

  constructor(cd: NgModel, viewContainer: ViewContainerRef) {
    cd.valueAccessor = this;
    this.cd = cd;
    this.viewContainer = viewContainer;
    this.el = viewContainer.element.nativeElement;
    this.init();
  }

  ngAfterViewInit() {
    this.initValue();
  }

  ngOnInit() {
    //this.date = moment(this.initDate);
    this.generateCalendar(this.date);
  }

  public openDatepicker(): void {
    this.isOpened = true;
  }

  public closeDatepicker(): void {
    this.isOpened = false;
  }

  public prevYear(): void {
    this.date.subtract(1, 'Y');
    this.generateCalendar(this.date);
  }

  public prevMonth(): void {
    this.date.subtract(1, 'M');
    this.generateCalendar(this.date);
  }

  public nextYear(): void {
    this.date.add(1, 'Y');
    this.generateCalendar(this.date);
  }

  public nextMonth(): void {
    this.date.add(1, 'M');
    this.generateCalendar(this.date);
  }

  public selectDate(e: MouseEvent, date: CalendarDate): void {
    //e.preventDefault();
    //if (this.isSelected(date)) return;

    //let selectedDate = moment(date.day + '.' + date.month + '.' + date.year, 'DD.MM.YYYY');
    //this.setValue(selectedDate);
    //this.closeDatepicker();
    //this.changed.emit(selectedDate.toDate());
  }

  private generateCalendar(date: Date): void {
    //let lastDayOfMonth = date.endOf('month').date();
    //let month = date.month();
    //let year = date.year();
    //let n = 1;
    //let firstWeekDay: number = null;

    //this.dateValue = date.format('MMMM YYYY');
    //this.days = [];

    //if (this.firstWeekDaySunday === true) {
    //  firstWeekDay = date.date(2).day();
    //} else {
    //  firstWeekDay = date.date(1).day();
    //}

    //if (firstWeekDay !== 1) {
    //  n -= (firstWeekDay + 6) % 7;
    //}

    //for (let i = n; i <= lastDayOfMonth; i += 1) {
    //  if (i > 0) {
    //    this.days.push({ day: i, month: month + 1, year: year, enabled: true });
    //  } else {
    //    this.days.push({ day: null, month: null, year: null, enabled: false });
    //  }
    //}
  }

  isSelected(date: CalendarDate) {
    //let selectedDate = moment(date.day + '.' + date.month + '.' + date.year, 'DD.MM.YYYY');
    //return selectedDate.toDate().getTime() === this.cannonical;
  }

  private generateDayNames(): void {
    //this.dayNames = [];
    //let date = this.firstWeekDaySunday === true ? moment('2015-06-07') : moment('2015-06-01');
    //for (let i = 0; i < 7; i += 1) {
    //  this.dayNames.push(date.format('ddd'));
    //  date.add('1', 'd');
    //}
  }

  private initMouseEvents(): void {
    let body = document.getElementsByTagName('body')[0];

    body.addEventListener('click', (e) => {
      if (!this.isOpened || !e.target) return;
      if (this.el !== e.target && !this.el.contains(e.target)) {
        this.closeDatepicker();
      }
    }, false);
  }

  private setValue(value: any): void {
    //let val = moment(value, this.modelFormat || 'YYYY-MM-DD');
    //this.viewValue = val.format(this.viewFormat || 'Do MMMM YYYY');
    //this.cd.viewToModelUpdate(val.format(this.modelFormat || 'YYYY-MM-DD'));
    //this.cannonical = val.toDate().getTime();
  }

  private initValue(): void {
    //setTimeout(() => {
    //  if (!this.initDate) {
    //    this.setValue(moment().format(this.modelFormat || 'YYYY-MM-DD'));
    //  } else {
    //    this.setValue(moment(this.initDate, this.modelFormat || 'YYYY-MM-DD'));
    //  }
    //});
  }

  writeValue(value: string): void {
    if (!value) return;
    this.setValue(value);
  }

  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: (_: any) => {}): void {
    this.onTouched = fn;
  }

  private init(): void {
    this.isOpened = false;
    this.firstWeekDaySunday = false;
    this.generateDayNames();
    this.initMouseEvents();
  }
}

export const MD_DATEPICKER_DIRECTIVES = [MdDatepicker];

@NgModule({
  declarations: MD_DATEPICKER_DIRECTIVES,
  imports: [CommonModule, FormsModule],
  exports: MD_DATEPICKER_DIRECTIVES,
})
export class MdDatepickerModule { }



//import {
//  AfterContentInit,
//  Component,
//  EventEmitter,
//  forwardRef,
//  HostListener,
//  Input,
//  Output,
//  Provider,
//  ViewEncapsulation,
//  NgModule
//} from '@angular/core';

//@Component({
//  moduleId: module.id,
//  selector: 'md-datepicker',
//  templateUrl: 'datepicker.html',
//  host: {
//    'role': 'datepicker',
//    '[id]': 'id',
//    '[class.md-datepicker]': 'true',
//    '[class.md-datepicker-disabled]': 'disabled',
//    '[attr.aria-disabled]': 'disabled'
//  },
//  providers: [MD_DATEPICKER_CONTROL_VALUE_ACCESSOR],
//  encapsulation: ViewEncapsulation.None
//})

//export class MdDatepicker implements AfterContentInit, ControlValueAccessor {

//  ngAfterContentInit() { this._isInitialized = true; }

//  @Output() change: EventEmitter<any> = new EventEmitter<any>();

//  private _value: any = '';
//  private _isInitialized: boolean = false;
//  private _onTouchedCallback: () => void = noop;
//  private _onChangeCallback: (_: any) => void = noop;

//  @Input() id: string = 'md-datepicker-' + (++nextId);
//  @Input() disabled: boolean = false;
//  @Input() tabindex: number = 0;
//  @Input() placeholder: string = '';

//  get value(): any {
//    return this._value;
//  }
//  @Input() set value(value: any) {
//    this._value = value;
//  }

//  private updateValue() {
//    this._onChangeCallback(this._value);
//    this.change.emit(this._value);
//  }

//  writeValue(value: any) { this._value = value; }

//  registerOnChange(fn: any) { this._onChangeCallback = fn; }

//  registerOnTouched(fn: any) { this._onTouchedCallback = fn; }
//}

