import {Component} from '@angular/core';
import {CdkDatepicker} from '@angular/cdk/datetime';

/** @title CDK Datepicker start date */
@Component({
  selector: 'cdk-datepicker-start-date-example',
  templateUrl: 'cdk-datepicker-start-date-example.html',
  styleUrls: ['cdk-datepicker-start-date-example.css'],
})
export class CdkDatepickerStartDateExample {
  startDate = new Date(1990, 0, 1);
}

@Component({
  selector: 'my-start-date-datepicker',
  template: `
    <div>Start at: {{this.startAt}}</div>
  `
})
export class MyStartDateDatepicker<D> extends CdkDatepicker<D> {}
