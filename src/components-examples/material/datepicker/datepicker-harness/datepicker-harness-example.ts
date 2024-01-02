import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';

/**
 * @title Testing with MatDatepickerInputHarness
 */
@Component({
  selector: 'datepicker-harness-example',
  templateUrl: 'datepicker-harness-example.html',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatInputModule, MatDatepickerModule, FormsModule],
})
export class DatepickerHarnessExample {
  date: Date | null = null;
  minDate: Date | null = null;
}
