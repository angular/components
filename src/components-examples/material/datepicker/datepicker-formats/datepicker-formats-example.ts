import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {provideLuxonDateAdapter} from '@angular/material-luxon-adapter';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {DateTime} from 'luxon';

// See the Luxon docs for the meaning of these formats:
// https://moment.github.io/luxon/#/formatting
export const MY_FORMATS = {
  parse: {
    dateInput: 'DDD',
  },
  display: {
    dateInput: 'DDD',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'DDD',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

/** @title Datepicker with custom formats */
@Component({
  selector: 'datepicker-formats-example',
  templateUrl: 'datepicker-formats-example.html',
  providers: [
    // Luxon can be provided globally to your app by adding `provideLuxonDateAdapter`
    // to your app config. We provide it at the component level here, due to limitations
    // of our example generation script.
    provideLuxonDateAdapter(MY_FORMATS),
  ],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerFormatsExample {
  readonly date = new FormControl(DateTime.now());
}
