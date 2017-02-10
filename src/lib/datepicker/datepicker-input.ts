import {Directive, ElementRef, Input} from '@angular/core';
import {MdDatepicker} from './datepicker';


/** Directive used to connect an input to a MdDatepicker. */
@Directive({
  selector: 'input[mdDatepicker], input[matDatepicker]',
})
export class MdDatepickerInput {
  @Input()
  set mdDatepicker(value: MdDatepicker) {
    if (value) {
      this._datepicker = value;
      this._datepicker._registerInput(this._elementRef);
    }
  }
  private _datepicker: MdDatepicker;

  @Input()
  set matDatepicker(value: MdDatepicker) { this.mdDatepicker = value; }

  constructor(private _elementRef: ElementRef) {}
}
