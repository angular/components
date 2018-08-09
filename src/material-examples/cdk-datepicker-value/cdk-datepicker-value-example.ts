import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {CalendarView} from '@angular/cdk/datetime';

/** @title CDK Datepicker selected value */
@Component({
  selector: 'cdk-datepicker-value-example',
  templateUrl: 'cdk-datepicker-value-example.html',
  styleUrls: ['cdk-datepicker-value-example.css'],
})
export class CdkDatepickerValueExample {
  date = new FormControl(new Date());
  serializedDate = new FormControl((new Date()).toISOString());
}


@Component({
  selector: 'my-value-calendar',
  template: '',
  providers: [{provide: CalendarView, useExisting: MyValueCalendar}],
})
export class MyValueCalendar<Date> extends CalendarView<Date> {
  activeDate = null;
  minDate = null;
  maxDate = null;
  selected = null;
  dateFilter = () => true;
}
