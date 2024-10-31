import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatTimepickerModule} from '@angular/material/timepicker';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';

/** @title Timepicker with custom toggle icon */
@Component({
  selector: 'timepicker-custom-icon-example',
  templateUrl: 'timepicker-custom-icon-example.html',
  providers: [provideNativeDateAdapter()],
  imports: [MatFormFieldModule, MatInputModule, MatTimepickerModule, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimepickerCustomIconExample {}
