import {ChangeDetectionStrategy, Component, model, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';

/**
 * @title Testing with MatDatepickerInputHarness
 */
@Component({
  selector: 'datepicker-harness-example',
  templateUrl: 'datepicker-harness-example.html',
  providers: [provideNativeDateAdapter()],
  imports: [MatInputModule, MatDatepickerModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerHarnessExample {
  date = model<Date | null>(null);
  minDate = signal<null | Date>(null);
}
