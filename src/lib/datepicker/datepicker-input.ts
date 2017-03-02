import {
  AfterContentInit, Directive, ElementRef, forwardRef, Input, OnDestroy,
  Renderer
} from '@angular/core';
import {MdDatepicker} from './datepicker';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {SimpleDate} from '../core/datetime/simple-date';
import {CalendarLocale} from '../core/datetime/calendar-locale';
import {Subscription} from 'rxjs';


export const MD_DATEPICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdDatepickerInput),
  multi: true
};


/** Directive used to connect an input to a MdDatepicker. */
@Directive({
  selector: 'input[mdDatepicker], input[matDatepicker]',
  providers: [MD_DATEPICKER_VALUE_ACCESSOR],
  host: {
    '(input)': '_onChange($event.target.value)',
    '(blur)': '_onTouched()',
  }
})
export class MdDatepickerInput implements AfterContentInit, ControlValueAccessor, OnDestroy {
  @Input()
  set mdDatepicker(value: MdDatepicker) {
    if (value) {
      this._datepicker = value;
      this._datepicker._registerInput(this);
    }
  }
  private _datepicker: MdDatepicker;

  @Input()
  get value(): SimpleDate {
    return this._value;
  }
  set value(value: SimpleDate) {
    this._value = this._locale.parseDate(value);
    const stringValue = this._value == null ? '' : this._locale.formatDate(this._value);
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', stringValue);
  }
  private _value: SimpleDate;

  @Input()
  set matDatepicker(value: MdDatepicker) { this.mdDatepicker = value; }

  _onChange = (value: any) => {};

  _onTouched = () => {};

  private _datepickerSubscription: Subscription;

  constructor(private _elementRef: ElementRef, private _renderer: Renderer,
              private _locale: CalendarLocale) {}

  ngAfterContentInit() {
    if (this._datepicker) {
      this._datepickerSubscription =
          this._datepicker.selectedChanged.subscribe((selected: SimpleDate) => {
            this.value = selected;
            this._onChange(selected);
          });
    }
  }

  ngOnDestroy() {
    if (this._datepickerSubscription) {
      this._datepickerSubscription.unsubscribe();
    }
  }

  getPopupConnectionElementRef(): ElementRef {
    return this._elementRef;
  }

  // Implemented as part of ControlValueAccessor
  writeValue(value: SimpleDate): void {
    this.value = value;
  }

  // Implemented as part of ControlValueAccessor
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = value => fn(this._locale.parseDate(value));
  }

  // Implemented as part of ControlValueAccessor
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor
  setDisabledState(disabled: boolean): void {
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'disabled', disabled);
  }
}
