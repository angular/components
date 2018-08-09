import {Component, Input} from '@angular/core';
import {FormControl} from '@angular/forms';
import {CalendarView, DateAdapter} from '@angular/cdk/datetime';

/** @title CDK Datepicker selected value */
@Component({
  selector: 'cdk-datepicker-value-example',
  templateUrl: 'cdk-datepicker-value-example.html',
  styleUrls: ['cdk-datepicker-value-example.css'],
})
export class CdkDatepickerValueExample<D> {
  date = new FormControl(new Date());
  serializedDate = new FormControl((new Date()).toISOString());
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
  selector: 'my-value-calendar',
  outputs: ['selectedChange'],
  template: `
    <div *ngFor="let date of dates">
      <button (click)="_selected(date)">{{date}}</button>
    </div>
    <div>Date: {{this.selected}}</div>
  `,
  providers: [{provide: CalendarView, useExisting: MyValueCalendar}],
})
export class MyValueCalendar<D> extends CalendarView<D> {
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
