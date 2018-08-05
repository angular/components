import {Component} from '@angular/core';
import {DateAdapter} from '@angular/cdk/datetime';

/** @title CDK Datepicker with views */
@Component({
  selector: 'cdk-datepicker-views-example',
  templateUrl: 'cdk-datepicker-views-example.html',
  styleUrls: ['cdk-datepicker-views-example.css'],
})
export class CdkDatepickerViewsExample<D> {
  selected: D;
  activeDate: D;
  minDate: D;
  maxDate: D;
  constructor(_dateAdapter: DateAdapter<D>) {
    this.selected = _dateAdapter.addCalendarDays(_dateAdapter.today(), 5);
    this.activeDate = _dateAdapter.today();
  }
}
