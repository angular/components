import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';
import {MdDatepicker} from './datepicker';


@Component({
  moduleId: module.id,
  selector: 'md-datepicker-trigger, mat-datepicker-trigger',
  template: '',
  styleUrls: ['datepicker-trigger.css'],
  host: {
    '[class.mat-datepicker-trigger]': 'true',
    '(click)': '_open($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdDatepickerTrigger {
  @Input('for') datepicker: MdDatepicker;

  _open(event: Event): void {
    if (this.datepicker) {
      this.datepicker.open();
      event.stopPropagation();
    }
  }
}
