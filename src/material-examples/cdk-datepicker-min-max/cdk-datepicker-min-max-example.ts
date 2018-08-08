import {Component} from '@angular/core';
import {CalendarView} from '@angular/cdk/datetime';

/** @title CDK Datepicker with min & max validation */
@Component({
  selector: 'cdk-datepicker-min-max-example',
  templateUrl: 'cdk-datepicker-min-max-example.html',
  styleUrls: ['cdk-datepicker-min-max-example.css'],
})
export class CdkDatepickerMinMaxExample {
  minDate = new Date(2000, 0, 1);
  maxDate = new Date(2020, 0, 1);
}


@Component({
  selector: 'my-min-max-calendar',
  template: `
    <div>Min date: {{this.minDate}}</div>
    <div>Max date: {{this.maxDate}}</div>
  `,
  providers: [{provide: CalendarView, useExisting: MyMinMaxCalendar}],
})
export class MyMinMaxCalendar<Date> extends CalendarView<Date> {
  activeDate = null;
  minDate = null;
  maxDate = null;
  selected = null;
}
