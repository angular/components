import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {provideLuxonDateAdapter} from '@angular/material-luxon-adapter';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {DateTime} from 'luxon';

/** @title Datepicker that uses Luxon dates */
@Component({
  selector: 'datepicker-luxon-example',
  templateUrl: 'datepicker-luxon-example.html',
  providers: [
    // Luxon can be provided globally to your app by adding `provideLuxonDateAdapter`
    // to your app config. We provide it at the component level here, due to limitations
    // of our example generation script.
    provideLuxonDateAdapter(),
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
export class DatepickerLuxonExample {
  // Datepicker takes Luxon `DateTime` objects instead of `Date` objects.
  readonly date = new FormControl(DateTime.now());
}
