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
  ViewChild,
  ViewContainerRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    Overlay,
    OverlayModule,
    OverlayState,
    OverlayOrigin,
    Portal,
    PortalModule,
    TemplatePortalDirective,
} from '../core';

const noop = () => {};

export const MD_PICKER_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatePicker),
  multi: true
};

@Component({
  moduleId: module.id,
  selector: 'md-date-picker',
  styleUrls: ['date-picker.css'],
  templateUrl: 'date-picker.html',
  host: {
    '[class]': '_color'
  },
  providers: [MD_PICKER_CONTROL_VALUE_ACCESSOR],
})
export class DatePicker implements ControlValueAccessor, AfterContentInit, OnChanges {
  public _Date: string = `${new Date()}`;
  stateSELECT: boolean = false;
  dateNow: any = new Date();
  dayActive: any;
  dayActive2: any;
  days: any = [];
  days2: any = [];
  date2INT: any = Date.now();
  dateINI: any;
  dateEND: any;
  dateINT: any;
  dateToday: any;
  _focused: boolean = false;
  _mode: boolean = false;
  _color: string = 'primary';
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
  @ViewChildren(TemplatePortalDirective) templatePortals: QueryList<Portal<any>>;
  @ViewChild(OverlayOrigin) _overlayOrigin: OverlayOrigin;
  openPanelWithBackdrop() {
    let config = new OverlayState();

    config.positionStrategy = this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically();
    config.hasBackdrop = true;

    let overlayRef = this.overlay.create(config);
    overlayRef.attach(this.templatePortals.first);
    overlayRef.backdropClick().subscribe(() => overlayRef.detach());
  }
  @Input()
  set mode(v: string) {
    if (v == 'dual') {
      this._mode = true;
    }else {
      this._mode = false;
    }
  }
  @Input()
  set date2(v: any) {
    if (v !== this.days2) {
      this.days2 = this.Month(v);
      this.date2INT = new Date(v).getTime();
    }
  }
  @Output() date2Change: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  get color(): string {
    return this._color;
  }

  set color(value: string) {
    this._updateColor(value);
  }
  _updateColor(newColor: string) {
    this._color = newColor;
  }
  constructor(
    private elementRef: ElementRef,
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef
  ) {

  }

  _handleClick() {
    let selector: any = this.elementRef.nativeElement.querySelector('._picker');
    let _DatePicker = this.elementRef.nativeElement.querySelector('._datePicker');
    if (_DatePicker != null) {
      _DatePicker.setAttribute('style', `
      top: ${selector.offsetHeight}px
      `);
      this._focused = true;

    }
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
    return this._value;
  };

  @Input() set value(v: any) {
    if (v !== this._value) {
      this._value = v;
      this._onChangeCallback(v);
    }
  }

  writeValue(value: any) {
    this.selectDate(value, false);
    this.getMonth(value);
    this._value = value;
  }

  private INT_DATE(date: any) {
    return new Date(date).getTime();
  }

  selectDate(date: any, _for: any = false, e$: any = false) {
    let dateSelected = new Date(date);
    let selector = this.elementRef.nativeElement.querySelector('._picker');
    if (this.stateSELECT == true) {
      if (e$ != false) {
        this.date2 = dateSelected;
        this.date2Change.emit(dateSelected);
        selector.focus();
      }
      this.dayActive2 = `${
        dateSelected.getFullYear()
      }+${
        dateSelected.getMonth()
      }+${
        dateSelected.getDate()
      }`;
    }else {
      this.dayActive = `${
        dateSelected.getFullYear()
      }+${
        dateSelected.getMonth()
      }+${
        dateSelected.getDate()
      }`;
      this.value = dateSelected;
      this._value = dateSelected;
      this._onTouchedCallback();
    }
    this._Date = `${
      new Date(date).getDate()
    }-${
      new Date(date).getMonth() + 1
    }-${
      new Date(date).getFullYear()
    }`;
    this.dateINT = Date.now();
    this.dateToday = `${
      new Date().getFullYear()
    }+${
      new Date().getMonth()
    }+${
      new Date().getDate()
    }`;
  }

  /**
   * _left.
   */
  _left(_for: boolean, date: any) {
    if (_for == false) {
      this.days = this.Month(date._INI - 60 * 60 * 24 * 1000);
    }else {
      this.days2 = this.Month(date._INI - 60 * 60 * 24 * 1000);
    }
  }

  /**
   * Month prev.
   */
  _right(_for: boolean, date: any) {
    if (_for == false) {
      this.days = this.Month(date._INI.getTime() + (date.dateEND + 2) * 60 * 60 * 24 * 1000);
    }else {
      this.days2 = this.Month(date._INI.getTime() + (date.dateEND + 2) * 60 * 60 * 24 * 1000);
    }
  }

  ngAfterContentInit() {
    this.stateSELECT = true;
    this._handleClick();
    this._focused = false;
    this.selectDate(this.date2INT, true);
    this.stateSELECT = false;
  }

  getMonth(dateSelected: any) {
    this.days = this.Month(dateSelected);
  }
  get Days() {
    return ((-this.INT_DATE(this._value) + this.INT_DATE(this.date2INT)) / 60 / 60 / 24 / 1000) + 1;
  }
  Month(date: any) {
    let _days: any = {
      data: [],
      _INI: '',
      dateEND: '',
    };
    let dateSelected = new Date(date);
    let dayNow = (dateSelected.getDate() - 1) * 60 * 60 * 24 * 1000;
    let dateNow = new Date(dateSelected.getTime());
    let dateINI = new Date(dateNow.getTime() - dayNow);
    let dateEND: any;
    let dayLeft = 0;
    if (new Date(dateINI).getDay() == 0) {
      dayLeft = 6;
    }else {
      dayLeft = new Date(dateINI).getDay() - 1;
    }
    for (var i = 0; i < dayLeft; i++) {
      _days.data.push({
        index: null,
        date: 0,
      });
    }
    let dateTemp: any;
    for (var _i = 1; _i < 32; _i++) {
      dateTemp = new Date((dateINI.getTime()) + ((_i - 1) * 60 * 60 * 24 * 1000));
      if (_i == dateTemp.getDate()) {
        dateEND = _i;
        _days.data.push({
          index: _i,
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
  imports: [OverlayModule, PortalModule, CommonModule, FormsModule],
  exports: [DatePicker],
  declarations: [DatePicker],
})
export class MdDatePickerModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdDatePickerModule,
      providers: [],
    };
  }
}
