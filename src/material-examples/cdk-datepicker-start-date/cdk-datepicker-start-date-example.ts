import {Component} from '@angular/core';

/** @title CDK Datepicker start date */
@Component({
  selector: 'cdk-datepicker-start-date-example',
  templateUrl: 'cdk-datepicker-start-date-example.html',
  styleUrls: ['cdk-datepicker-start-date-example.css'],
})
export class CdkDatepickerStartDateExample {
  startDate = new Date(1990, 0, 1);
}
