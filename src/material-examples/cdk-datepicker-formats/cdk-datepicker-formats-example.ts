import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, CDK_DATE_FORMATS, CDK_DATE_LOCALE, CalendarView} from '@angular/cdk/datetime';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment} from 'moment';

const moment = _rollupMoment || _moment;

export const MY_CDK_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
  },
};

/** @title CDK Datepicker with custom formats */
@Component({
  selector: 'cdk-datepicker-formats-example',
  templateUrl: 'cdk-datepicker-formats-example.html',
  styleUrls: ['cdk-datepicker-formats-example.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [CDK_DATE_LOCALE]},

    {provide: CDK_DATE_FORMATS, useValue: MY_CDK_FORMATS},
  ],
})
export class CdkDatepickerFormatsExample {
  date = new FormControl(moment());
}


@Component({
  selector: 'my-formats-calendar',
  template: '',
  providers: [{provide: CalendarView, useExisting: MyFormatsCalendar}],
})
export class MyFormatsCalendar<Date> extends CalendarView<Date> {
  activeDate = null;
  minDate = null;
  maxDate = null;
  selected = null;
  dateFilter = () => true;
}
