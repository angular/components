import {Component, Input} from '@angular/core';
import {FormControl} from '@angular/forms';
import {
  MomentDateAdapter,
  CDK_MOMENT_DATE_FORMATS,
} from '@angular/material-moment-adapter';
import {DateAdapter, CDK_DATE_FORMATS, CDK_DATE_LOCALE, CalendarView} from '@angular/cdk/datetime';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';

const moment = _rollupMoment || _moment;

/** @title CDK Datepicker that uses Moment.js dates */
@Component({
  selector: 'cdk-datepicker-moment-example',
  templateUrl: 'cdk-datepicker-moment-example.html',
  styleUrls: ['cdk-datepicker-moment-example.css'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [CDK_DATE_LOCALE]},
    {provide: CDK_DATE_FORMATS, useValue: CDK_MOMENT_DATE_FORMATS},
  ],
})
export class CdkDatepickerMomentExample<D> {
  // CDK Datepicker takes `Moment` objects instead of `Date` objects.
  date = new FormControl(moment([2017, 0, 1]));
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
  selector: 'my-moment-calendar',
  outputs: ['selectedChange'],
  template: `
    <div *ngFor="let date of dates">
      <button (click)="_selected(date)">{{date}}</button>
    </div>
    <div>Date: {{this.selected}}</div>
  `,
  providers: [{provide: CalendarView, useExisting: MyMomentCalendar}],
})
export class MyMomentCalendar<D> extends CalendarView<D> {
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
