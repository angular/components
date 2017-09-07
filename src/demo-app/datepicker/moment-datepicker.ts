import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {DateAdapter, MAT_DATE_LOCALE_PROVIDER, MD_DATE_FORMATS} from '@angular/material';
import {MomentDateAdapter, MD_MOMENT_DATE_FORMATS} from '@angular/material-moment-adapter';
import * as moment from 'moment';


@Component({
  moduleId: module.id,
  selector: 'demo-moment-datepicker',
  templateUrl: 'moment-datepicker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    MAT_DATE_LOCALE_PROVIDER,
    {provide: DateAdapter, useClass: MomentDateAdapter},
    {provide: MD_DATE_FORMATS, useValue: MD_MOMENT_DATE_FORMATS},
  ],
})
export class DemoMomentDatepicker {
  @Input()
  set locale(value: string) {
    this._dateAdapter.setLocale(value);
  }

  date = moment();

  constructor(private _dateAdapter: DateAdapter<any>) {}
}
