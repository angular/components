import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatTimepickerModule} from '@angular/material/timepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';

/** @title Timepicker forms integration */
@Component({
  selector: 'timepicker-forms-example',
  templateUrl: 'timepicker-forms-example.html',
  providers: [provideNativeDateAdapter()],
  imports: [MatFormFieldModule, MatInputModule, MatTimepickerModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimepickerFormsExample {
  formControl: FormControl<Date | null>;

  constructor() {
    const initialValue = new Date();
    initialValue.setHours(12, 30, 0);
    this.formControl = new FormControl(initialValue);
  }
}
