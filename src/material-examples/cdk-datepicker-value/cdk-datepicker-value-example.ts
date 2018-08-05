import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

/** @title CDK Datepicker selected value */
@Component({
  selector: 'cdk-datepicker-value-example',
  templateUrl: 'cdk-datepicker-value-example.html',
  styleUrls: ['cdk-datepicker-value-example.css'],
})
export class CdkDatepickerValueExample {
  date = new FormControl(new Date());
  serializedDate = new FormControl((new Date()).toISOString());
}
