import {Component, Input} from '@angular/core';
import {FormControl} from '@angular/forms';
import {CalendarView, DateAdapter} from '@angular/cdk/datetime';

/** @title CDK Datepicker selected value */
@Component({
  selector: 'cdk-datepicker-value-example',
  templateUrl: 'cdk-datepicker-value-example.html',
  styleUrls: ['cdk-datepicker-value-example.css'],
})
export class CdkDatepickerValueExample {
  date = new FormControl(new Date());
  serializedDate = new FormControl((new Date()).toISOString());
  dates: Date[] = [];

  constructor(private _dateAdapter: DateAdapter<Date>) {
    this.dates.push(this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 5));
    this.dates.push(this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 10));
    this.dates.push(this._dateAdapter.addCalendarDays(this._dateAdapter.today(), 15));
  }
}


@Component({
  selector: 'my-value-calendar',
  outputs: ['selectedChange'],
  styleUrls: ['cdk-datepicker-value-example.css'],
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
  providers: [{provide: CalendarView, useExisting: MyValueCalendar}],
})
export class MyValueCalendar<D> extends CalendarView<D> {
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
