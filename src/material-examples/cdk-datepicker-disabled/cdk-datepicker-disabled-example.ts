import {Component, Optional} from '@angular/core';
import {DateAdapter, CdkDatepicker, CalendarView} from '@angular/cdk/datetime';

/** @title CDK Disabled datepicker */
@Component({
    selector: 'cdk-datepicker-disabled-example',
    templateUrl: 'cdk-datepicker-disabled-example.html',
    styleUrls: ['cdk-datepicker-disabled-example.css'],
})
export class CdkDatepickerDisabledExample {}

@Component( {
  selector: 'my-disabled-datepicker',
  template: `
    <div *ngIf="!this.disabled">{{this.dateAdapter.today()}}</div>
  `,
  inputs: ['startAt', 'disabled'],
  providers: [{provide: CdkDatepicker, useExisting: MyDisabledDatepicker}],
})
export class MyDisabledDatepicker<D> extends CdkDatepicker<D> {
  dateAdapter: DateAdapter<D>;

  constructor(@Optional() _dateAdapter: DateAdapter<D>) {
    super(_dateAdapter);
    this.dateAdapter = this._dateAdapter;
  }
}


@Component({
  selector: 'my-disabled-calendar',
  outputs: ['selectedChange'],
  template: '',
  providers: [{provide: CalendarView, useExisting: MyDisabledCalendar}],
})
class MyDisabledCalendar<Date> extends CalendarView<Date> {
  activeDate = null;
  minDate = null;
  maxDate = null;
  selected = null;
}
