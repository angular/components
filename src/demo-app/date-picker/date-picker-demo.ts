import {Component} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'date-picker-demo',
    templateUrl: 'date-picker-demo.html',
    styleUrls: ['date-picker-demo.css'],
})
export class DatePickerDemo {
  date: any = new Date(Date.now() + 60 * 60 * 24 * 15 * 1000);
  date01: any = new Date(Date.now() + 60 * 60 * 24 * 15 * 1000);
  date02: any = new Date(Date.now() + 60 * 60 * 24 * 18 * 1000);
  ini: any = new Date(Date.now() + 60 * 60 * 24 * 9 * 1000);
  end: any = new Date(Date.now() + 60 * 60 * 24 * 18 * 1000);
}
