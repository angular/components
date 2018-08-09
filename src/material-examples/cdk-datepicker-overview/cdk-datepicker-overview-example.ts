import {Input, Component} from '@angular/core';
import {CalendarView, DateAdapter} from '@angular/cdk/datetime';


/** @title Basic CDK datepicker */
@Component({
  selector: 'cdk-datepicker-overview-example',
  templateUrl: 'cdk-datepicker-overview-example.html',
  styleUrls: ['cdk-datepicker-overview-example.css'],
})
export class CdkDatepickerOverviewExample<D> {
  dates: D[] = [];
  messages: string[] = [];

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
  selector: 'my-calendar',
  outputs: ['selectedChange'],
  template: `
    <div *ngFor="let date of dates">
      <button (click)="_selected(date)">{{date}}</button>
    </div>
    <div>Date: {{this.selected}}</div>
  `,
  providers: [{provide: CalendarView, useExisting: MyCalendar}],
})
export class MyCalendar<D> extends CalendarView<D> {
  @Input() dates: D[];

  activeDate: D;
  minDate = null;
  maxDate = null;
  selected: D | null = null;
  dateFilter = () => true;

  constructor(private _dateAdapter: DateAdapter<D>) {
    super();
    this.activeDate = this._dateAdapter.today();
  }

  _selected(date: D) {
    this.selected = date;
    this.selectedChange.emit(date);
  }
}
