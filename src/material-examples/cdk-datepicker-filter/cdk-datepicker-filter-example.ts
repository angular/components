import {Component} from '@angular/core';

/** @title CDK Datepicker with filter validation */
@Component({
  selector: 'cdk-datepicker-filter-example',
  templateUrl: 'cdk-datepicker-filter-example.html',
  styleUrls: ['cdk-datepicker-filter-example.css'],
})
export class CdkDatepickerFilterExample {
  myFilter = (d: Date): boolean => {
    const day = d.getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  }
}
