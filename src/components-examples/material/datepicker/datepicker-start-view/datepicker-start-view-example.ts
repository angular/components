import {ChangeDetectionStrategy, Component} from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

/** @title Datepicker start date */
@Component({
  selector: 'datepicker-start-view-example',
  templateUrl: 'datepicker-start-view-example.html',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerStartViewExample {
  readonly startDate = new Date(1990, 0, 1);
}
