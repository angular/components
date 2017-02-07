import {Component} from '@angular/core';
import {SimpleDate} from '@angular/material';


@Component({
  moduleId: module.id,
  selector: 'datepicker-demo',
  templateUrl: 'datepicker-demo.html'
})
export class DatepickerDemo {
  date = SimpleDate.today();
  selected: SimpleDate;
}
