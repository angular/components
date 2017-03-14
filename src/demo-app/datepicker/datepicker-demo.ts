import {Component} from '@angular/core';
import {SimpleDate} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'datepicker-demo',
  templateUrl: 'datepicker-demo.html',
  styleUrls: ['datepicker-demo.css'],
})
export class DatepickerDemo {
  date: SimpleDate;
  touch = false;
  dateFilter = (date: SimpleDate) => !this._blacklistedMonths.has(date.month) && date.date % 2 == 0;
  private _blacklistedMonths = new Set([2, 3]);
}
