import {Component} from '@angular/core';
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
export class CdkDatepickerMomentExample {
  // CDK Datepicker takes `Moment` objects instead of `Date` objects.
  date = new FormControl(moment([2017, 0, 1]));
}


@Component({
  selector: 'my-moment-calendar',
  outputs: ['selectedChange'],
  template: '',
  providers: [{provide: CalendarView, useExisting: MyMomentCalendar}],
})
class MyMomentCalendar<Date> extends CalendarView<Date> {
  activeDate = null;
  minDate = null;
  maxDate = null;
  selected = null;
}
