import {Component} from '@angular/core';
import {CalendarView} from '@angular/cdk/datetime';

/** @title CDK Datepicker start date */
@Component({
  selector: 'cdk-datepicker-start-date-example',
  templateUrl: 'cdk-datepicker-start-date-example.html',
  styleUrls: ['cdk-datepicker-start-date-example.css'],
})
export class CdkDatepickerStartDateExample {
  startDate = new Date(1990, 0, 1);
}


@Component({
  selector: 'my-start-date-calendar',
  template: `
    <div>Start date: {{this.activeDate}}</div>
  `,
  providers: [{provide: CalendarView, useExisting: MyStartDateCalendar}],
})
export class MyStartDateCalendar<Date> extends CalendarView<Date> {
  activeDate = null;
  minDate = null;
  maxDate = null;
  selected = null;
  dateFilter = () => true;
}
