import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatTimepickerModule, MatTimepickerOption} from '@angular/material/timepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';

/** @title Timepicker options customization */
@Component({
  selector: 'timepicker-options-example',
  templateUrl: 'timepicker-options-example.html',
  providers: [provideNativeDateAdapter()],
  imports: [MatFormFieldModule, MatInputModule, MatTimepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimepickerOptionsExample {
  customOptions: MatTimepickerOption<Date>[] = [
    {label: 'Morning', value: new Date(2024, 0, 1, 9, 0, 0)},
    {label: 'Noon', value: new Date(2024, 0, 1, 12, 0, 0)},
    {label: 'Evening', value: new Date(2024, 0, 1, 22, 0, 0)},
  ];
}
