import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatTimepickerModule} from '@angular/material/timepicker';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {DateAdapter, provideNativeDateAdapter} from '@angular/material/core';

/** @title Timepicker with option template. */
@Component({
  selector: 'timepicker-option-template-example',
  templateUrl: 'timepicker-option-template-example.html',
  providers: [provideNativeDateAdapter()],
  imports: [MatFormFieldModule, MatIcon, MatInputModule, MatTimepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimepickerOptionTemplateExample {
  readonly dateAdapter = inject<DateAdapter<Date>>(DateAdapter);
  readonly sunrise: Date;
  readonly sunset: Date;

  constructor() {
    this.sunrise = new Date();
    this.sunrise.setHours(7, 0, 0);
    this.sunset = new Date();
    this.sunset.setHours(17, 30, 0);
  }
}
