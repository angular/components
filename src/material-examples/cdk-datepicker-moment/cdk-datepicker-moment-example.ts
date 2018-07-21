import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, CDK_DATE_FORMATS, CDK_DATE_LOCALE} from '@angular/cdk/datetime';

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
    // `MomentDateAdapter` and `MAT_MOMENT_DATE_FORMATS` can be automatically provided by importing
    // `MatMomentDateModule` in your applications root module. We provide it at the component level
    // here, due to limitations of our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [CDK_DATE_LOCALE]},
    {provide: CDK_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
})
export class CdkDatepickerMomentExample {
  // Datepicker takes `Moment` objects instead of `Date` objects.
  date = new FormControl(moment([2017, 0, 1]));
}
