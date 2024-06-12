import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

/** @title Datepicker open method */
@Component({
  selector: 'datepicker-api-example',
  templateUrl: 'datepicker-api-example.html',
  styleUrl: 'datepicker-api-example.css',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerApiExample {}
