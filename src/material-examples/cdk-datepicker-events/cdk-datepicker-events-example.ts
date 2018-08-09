import {Component, Input} from '@angular/core';
import {DatepickerInputEvent, CalendarView, DateAdapter} from '@angular/cdk/datetime';

/** @title CDK Datepicker input and change events */
@Component({
  selector: 'cdk-datepicker-events-example',
  templateUrl: 'cdk-datepicker-events-example.html',
  styleUrls: ['cdk-datepicker-events-example.css'],
})
export class CdkDatepickerEventsExample<D> {
  events: string[] = [];
  dates: D[] = [];
  messages: string[] = [];

  addEvent(type: string, event: DatepickerInputEvent<Date>) {
    this.events.push(`${type}: ${event.value}`);
  }

  constructor(private _dateAdapter: DateAdapter<D>) {
    this.dates.push(this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 5));
    this.dates.push(this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 10));
    this.dates.push(this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 15));
  }
  _dateSelected() {
    this.messages.push('Date has changed. ');
  }
}


@Component({
  selector: 'my-events-calendar',
  outputs: ['selectedChange'],
  template: `
    <div *ngFor="let date of dates">
      <button (click)="_selected(date)">{{date}}</button>
    </div>
    <div>Date: {{this.selected}}</div>
  `,
  providers: [{provide: CalendarView, useExisting: MyEventsCalendar}],
})
export class MyEventsCalendar<D> extends CalendarView<D> {
  @Input() dates: D[];

  activeDate: D;
  minDate = null;
  maxDate = null;
  selected: D | null = null;
  dateFilter = () => true;

  constructor(private _dateAdapter: DateAdapter<D>) {
    super();
    this.activeDate = this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 5);
  }

  _selected(date: D) {
    this.selected = date;
    this.selectedChange.emit(date);
  }
}
