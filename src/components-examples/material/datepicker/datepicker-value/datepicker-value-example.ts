import {Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatNativeDateModule} from '@angular/material/core';

/** @title Datepicker selected value */
@Component({
  selector: 'datepicker-value-example',
  templateUrl: 'datepicker-value-example.html',
  styleUrls: ['datepicker-value-example.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class DatepickerValueExample {
  date = new FormControl(new Date());
  serializedDate = new FormControl(new Date().toISOString());
}
