import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'datepicker-demo',
  templateUrl: 'datepicker-demo.html',
})
export class DatepickerDemo {
  private disabled: boolean = false;
  private date: any = '2015-12-25';
  private minDate: any = '';
  private maxDate: any = '';
  private change(value: any) {
    console.log('Changed data: ', value);
  }
}
