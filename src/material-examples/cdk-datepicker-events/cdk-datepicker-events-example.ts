import {Component, Input} from '@angular/core';
import {DatepickerInputEvent, CalendarView, DateAdapter} from '@angular/cdk/datetime';

/** @title CDK Datepicker input and change events */
@Component({
  selector: 'cdk-datepicker-events-example',
  templateUrl: 'cdk-datepicker-events-example.html',
  styleUrls: ['cdk-datepicker-events-example.css'],
})
export class CdkDatepickerEventsExample {
  events: string[] = [];
  dates: Date[] = [];

  addEvent(type: string, event: DatepickerInputEvent<Date>) {
    this.events.push(`${type}: ${event.value}`);
  }

  constructor(private _dateAdapter: DateAdapter<Date>) {
    this.dates.push(this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 5));
    this.dates.push(this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 10));
    this.dates.push(this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 15));
  }
}


@Component({
  selector: 'my-events-calendar',
  outputs: ['selectedChange'],
  styles: [`
    .calendar {
      width: 400px;
      height: 150px;
      margin-top: 20px;
      margin-left: 15px;
      overflow: auto;
      background-color: #eee;
      border-radius: 5px;
      padding: 10px;
    }
  `],
  template: `
    <div class="calendar">
      <div>Date: {{selected}}</div>
      <br>
      <div>Choose an appointment date:</div>
      <div *ngFor="let date of dates">
        <button (click)="_selected(date)">{{date}}</button>
      </div>
    </div>
  `,
  providers: [{provide: CalendarView, useExisting: MyEventsCalendar}],
})
export class MyEventsCalendar<D> extends CalendarView<D> {
  @Input() dates: D[];

  activeDate: D | null = null;
  minDate = null;
  maxDate = null;
  selected: D | null = null;
  dateFilter = () => true;

  _selected(date: D) {
    this.selected = date;
    this.selectedChange.emit(date);
  }
}
