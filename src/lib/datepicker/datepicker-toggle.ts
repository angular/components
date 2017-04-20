import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';
import {MdDatepicker} from './datepicker';
import {MdDatepickerL10n} from './datepicker-l10n';


@Component({
  moduleId: module.id,
  selector: 'button[mdDatepickerToggle], button[matDatepickerToggle]',
  template: '',
  styleUrls: ['datepicker-toggle.css'],
  host: {
    '[class.mat-datepicker-toggle]': 'true',
    '[attr.aria-label]': '_l10n.openCalendarLabel',
    '(click)': '_open($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdDatepickerToggle<D> {
  @Input('mdDatepickerToggle') datepicker: MdDatepicker<D>;

  @Input('matDatepickerToggle')
  get _datepicker() { return this.datepicker; }
  set _datepicker(v: MdDatepicker<D>) { this.datepicker = v; }

  constructor(public _l10n: MdDatepickerL10n) {}

  _open(event: Event): void {
    if (this.datepicker) {
      this.datepicker.open();
      event.stopPropagation();
    }
  }
}
