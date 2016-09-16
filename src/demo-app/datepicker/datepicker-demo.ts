import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'datepicker-demo',
  templateUrl: 'datepicker-demo.html',
})
export class DatepickerDemo {
  private disabled: boolean = true;
  private datetime: any = '';
  private datetime1: any = '2016-09-15 12:10';
  private date: any = '2016-09-15';
  private time: any = '12:10';
  private minDate: any = '2016-07-15';
  private maxDate: any = '2016-12-15';
  private change(value: any) {
    console.log('Changed data: ', value);
  }
}
