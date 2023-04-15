import {Component, ViewEncapsulation} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-datepicker-scene',
  templateUrl: './datepicker-scene.html',
  styleUrls: ['./datepicker-scene.scss'],
  standalone: true,
  imports: [MatDatepickerModule]
})
export class DatepickerScene {}
