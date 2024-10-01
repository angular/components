import {ChangeDetectionStrategy, Component, Signal, signal} from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatTimepickerModule} from '@angular/material/timepicker';

/**
 * @title Testing with MatTimepickerInputHarness
 */
@Component({
  selector: 'timepicker-harness-example',
  templateUrl: 'timepicker-harness-example.html',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatTimepickerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimepickerHarnessExample {
  date: Signal<Date | null>;

  constructor() {
    const today = new Date();
    this.date = signal(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 45));
  }
}
