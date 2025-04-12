import {Component, ViewEncapsulation} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-datepicker-scene',
  templateUrl: './datepicker-scene.html',
  styleUrls: ['./datepicker-scene.scss'],
  imports: [MatDatepickerModule],
})
export class DatepickerScene {
  minDate = new Date(2024, 3, 2);
  selectedDate = new Date(2024, 3, 3);
  maxDate = new Date(2024, 3, 5);
}
