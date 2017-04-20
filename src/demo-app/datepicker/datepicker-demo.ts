import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'datepicker-demo',
  templateUrl: 'datepicker-demo.html',
  styleUrls: ['datepicker-demo.css'],
})
export class DatepickerDemo {
  date: Date;
  touch = false;
  dateFilter =
      (date: Date) => !this._blacklistedMonths.has(date.getMonth()) && date.getDate() % 2 == 0
  private _blacklistedMonths = new Set([2, 3]);
}
