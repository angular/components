import {Component} from '@angular/core';

/** @title CDK Datepicker with min & max validation */
@Component({
  selector: 'cdk-datepicker-min-max-example',
  templateUrl: 'cdk-datepicker-min-max-example.html',
  styleUrls: ['cdk-datepicker-min-max-example.css'],
})
export class CdkDatepickerMinMaxExample {
  minDate = new Date(2000, 0, 1);
  maxDate = new Date(2020, 0, 1);
}
