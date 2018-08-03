import {Component} from '@angular/core';
import {CalendarView, DateAdapter} from '@angular/cdk/datetime';


/** @title Basic CDK datepicker */
@Component({
  selector: 'cdk-datepicker-overview-example',
  templateUrl: 'cdk-datepicker-overview-example.html',
  styleUrls: ['cdk-datepicker-overview-example.css'],
})
export class CdkDatepickerOverviewExample {
  messages: string[] = [];
  _dateSelected() {
    this.messages.push('Date has changed. ');
  }
}


@Component( {
  selector: 'my-calendar',
  outputs: ['selectedChange'],
  template: `
    <div *ngFor="let date of dates">
      <button (click)="_selected(date)">{{date}}}</button>
    </div>
    <div>Date: {{selected}}</div>
  `,
})
export class MyCalendar<D> extends CalendarView<D> {
  dates: D[] = [];

  activeDate: D;
  minDate = null;
  maxDate = null;
  selected: D | null = null;

  constructor(private _dateAdapter: DateAdapter<D>) {
    super();
    this.activeDate = this._dateAdapter.today();
    this.dates.push(this._dateAdapter.addCalendarDays(this.activeDate, 5));
    this.dates.push(this._dateAdapter.addCalendarDays(this.activeDate, 10));
    this.dates.push(this._dateAdapter.addCalendarDays(this.activeDate, 15));
  }

  _selected(date: D) {
    this.selected = date;
    this.selectedChange.emit(date);
  }
}
