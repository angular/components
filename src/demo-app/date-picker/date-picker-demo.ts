import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'date-picker-demo',
  templateUrl: 'date-picker-demo.html',
  styleUrls: ['date-picker-demo.css']
})
export class DatePickerDemo {
  date = new Date();
  selected = new Date('1/10/2017');
}
