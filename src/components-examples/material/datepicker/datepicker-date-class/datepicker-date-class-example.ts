import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatCalendarCellClassFunction, MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

/** @title Datepicker with custom date classes */
@Component({
  selector: 'datepicker-date-class-example',
  templateUrl: 'datepicker-date-class-example.html',
  styleUrl: 'datepicker-date-class-example.css',
  encapsulation: ViewEncapsulation.None,
  providers: [provideNativeDateAdapter()],
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerDateClassExample {
  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Only highligh dates inside the month view.
    if (view === 'month') {
      const date = cellDate.getDate();

      // Highlight the 1st and 20th day of each month.
      return date === 1 || date === 20 ? 'example-custom-date-class' : '';
    }

    return '';
  };
}
