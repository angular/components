import {Component} from '@angular/core';

@Component({
  selector: 'datepicker-filter-example',
  templateUrl: 'datepicker-filter-example.html',
  styleUrls: ['datepicker-filter-example.css'],
})
export class DatepickerFilterExample {
  myFilter = (d: Date): boolean => {
    const day = d.getDay();
    return day !== 0 && day !== 6;
  };
}
