import {ChangeDetectionStrategy, Component} from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';

/** @title Datepicker with custom icon */
@Component({
  selector: 'datepicker-custom-icon-example',
  templateUrl: 'datepicker-custom-icon-example.html',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerCustomIconExample {}
