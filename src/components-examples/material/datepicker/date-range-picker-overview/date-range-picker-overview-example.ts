import {Component} from '@angular/core';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';

/** @title Basic date range picker */
@Component({
  selector: 'date-range-picker-overview-example',
  templateUrl: 'date-range-picker-overview-example.html',
  standalone: true,
  imports: [MatFormFieldModule, MatDatepickerModule, MatNativeDateModule],
})
export class DateRangePickerOverviewExample {}
