import {Component} from '@angular/core';
import {CalendarView} from '@angular/cdk/datetime';

/** @title CDK Disabled datepicker */
@Component({
  selector: 'cdk-datepicker-disabled-example',
  templateUrl: 'cdk-datepicker-disabled-example.html',
  styleUrls: ['cdk-datepicker-disabled-example.css'],
})
export class CdkDatepickerDisabledExample {}


@Component({
  selector: 'my-disabled-calendar',
  template: '',
  providers: [{provide: CalendarView, useExisting: MyDisabledCalendar}],
})
export class MyDisabledCalendar<Date> extends CalendarView<Date> {
  activeDate = null;
  minDate = null;
  maxDate = null;
  selected = null;
}
