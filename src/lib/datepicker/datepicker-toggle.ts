import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';
import {MdDatepicker} from './datepicker';


@Component({
  moduleId: module.id,
  selector: 'button[mdDatepickerToggle], button[matDatepickerToggle]',
  template: '',
  styleUrls: ['datepicker-toggle.css'],
  host: {
    '[class.mat-datepicker-toggle]': 'true',
    '(click)': '_open($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdDatepickerToggle {
  @Input('mdDatepickerToggle') datepicker: MdDatepicker;

  @Input('matDatepickerToggle')
  get _datepicker() { return this.datepicker; }
  set _datepicker(v: MdDatepicker) { this.datepicker = v; }

  _open(event: Event): void {
    if (this.datepicker) {
      this.datepicker.open();
      event.stopPropagation();
    }
  }
}
