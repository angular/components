import {Directive, ElementRef, Input} from '@angular/core';
import {MdDatepicker} from './datepicker';


@Directive({
  selector: 'input[mdDatepicker]',
})
export class MdDatepickerInput {
  @Input()
  set mdDatepicker(value: MdDatepicker) {
    if (value) {
      this._datepicker = value;
      this._datepicker.registerInput(this._elementRef);
    }
  }
  private _datepicker: MdDatepicker;

  constructor(private _elementRef: ElementRef) {}
}
