import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {provideLuxonDateAdapter} from '@angular/material-luxon-adapter';
import {MatDatepicker, MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {DateTime} from 'luxon';

// See the Luxon docs for the meaning of these formats:
// https://moment.github.io/luxon/#/formatting
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/yyyy',
  },
  display: {
    dateInput: 'MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'DD',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

/** @title Datepicker emulating a Year and month picker */
@Component({
  selector: 'datepicker-views-selection-example',
  templateUrl: 'datepicker-views-selection-example.html',
  styleUrl: 'datepicker-views-selection-example.css',
  providers: [
    // Luxon can be provided globally to your app by adding `provideLuxonDateAdapter`
    // to your app config. We provide it at the component level here, due to limitations
    // of our example generation script.
    provideLuxonDateAdapter(MY_FORMATS),
  ],
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerViewsSelectionExample {
  readonly date = new FormControl<DateTime>(DateTime.now());

  setMonthAndYear(normalizedMonthAndYear: DateTime, datepicker: MatDatepicker<DateTime>) {
    const ctrlValue = DateTime.fromObject({
      month: normalizedMonthAndYear.month,
      year: normalizedMonthAndYear.year,
    });
    this.date.setValue(ctrlValue);
    datepicker.close();
  }
}
