import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatTimepickerModule} from '@angular/material/timepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';

/** @title Timepicker integration with datepicker */
@Component({
  selector: 'timepicker-datepicker-integration-example',
  templateUrl: 'timepicker-datepicker-integration-example.html',
  styleUrl: './timepicker-datepicker-integration-example.css',
  providers: [provideNativeDateAdapter()],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
    MatDatepickerModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimepickerDatepickerIntegrationExample {
  value: Date;
}
