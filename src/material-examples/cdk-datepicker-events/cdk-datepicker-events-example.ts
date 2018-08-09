import {Component} from '@angular/core';
import {DatepickerInputEvent, CalendarView} from '@angular/cdk/datetime';

/** @title CDK Datepicker input and change events */
@Component({
  selector: 'cdk-datepicker-events-example',
  templateUrl: 'cdk-datepicker-events-example.html',
  styleUrls: ['cdk-datepicker-events-example.css'],
})
export class CdkDatepickerEventsExample {
  events: string[] = [];

  addEvent(type: string, event: DatepickerInputEvent<Date>) {
    this.events.push(`${type}: ${event.value}`);
  }
}


@Component({
  selector: 'my-events-calendar',
  template: '',
  providers: [{provide: CalendarView, useExisting: MyEventsCalendar}],
})
export class MyEventsCalendar<Date> extends CalendarView<Date> {
  activeDate = null;
  minDate = null;
  maxDate = null;
  selected = null;
  dateFilter = () => true;
}
