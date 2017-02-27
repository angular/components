import {Directive, ElementRef, forwardRef, Input, Renderer} from '@angular/core';
import {MdDatepicker} from './datepicker';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {SimpleDate} from '../core/datetime/simple-date';
import {CalendarLocale} from '../core/datetime/calendar-locale';


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
export class MdDatepickerInput implements ControlValueAccessor {
  @Input()
  set mdDatepicker(value: MdDatepicker) {
    if (value) {
      this._datepicker = value;
      this._datepicker._registerInput(this);
    }
  }
  private _datepicker: MdDatepicker;

  @Input()
  set matDatepicker(value: MdDatepicker) { this.mdDatepicker = value; }

  _onChange = (value: any) => {};

  _onTouched = () => {};

  constructor(private _elementRef: ElementRef, private _renderer: Renderer,
              private _locale: CalendarLocale) {}

  getPopupConnectionElementRef(): ElementRef {
    return this._elementRef;
  }

  @Input()
  get value() {
    return this._locale.parseDate(this._elementRef.nativeElement.value);
  }
  set value(value: SimpleDate) {
    let stringValue = value == null ? '' : this._locale.formatDate(value);
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'value', stringValue);
  }

  // Implemented as part of ControlValueAccessor
  writeValue(value: SimpleDate) {
    this.value = value;
  }

  // Implemented as part of ControlValueAccessor
  registerOnChange(fn: (value: any) => void) {
    this._onChange = value => fn(this._locale.parseDate(value));
  }

  // Implemented as part of ControlValueAccessor
  registerOnTouched(fn: () => void) {
    this._onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor
  setDisabledState(disabled: boolean) {
    this._renderer.setElementProperty(this._elementRef.nativeElement, 'disabled', disabled);
  }
}
