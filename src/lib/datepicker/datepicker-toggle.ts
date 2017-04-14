import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';
import {MdDatepicker} from './datepicker';
import {CalendarLocale} from '../core/datetime/calendar-locale';


@Component({
  moduleId: module.id,
  selector: 'button[mdDatepickerToggle], button[matDatepickerToggle]',
  template: '',
  styleUrls: ['datepicker-toggle.css'],
  host: {
    '[class.mat-datepicker-toggle]': 'true',
    '[attr.aria-label]': '_locale.openCalendarLabel',
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

  constructor(public _locale: CalendarLocale) {}

  _open(event: Event): void {
    if (this.datepicker) {
      this.datepicker.open();
      event.stopPropagation();
    }
  }
}
