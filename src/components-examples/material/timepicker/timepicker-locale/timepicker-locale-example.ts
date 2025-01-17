import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatTimepickerModule} from '@angular/material/timepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {DateAdapter, provideNativeDateAdapter} from '@angular/material/core';
import {MatButtonModule} from '@angular/material/button';

/** @title Timepicker with different locale */
@Component({
  selector: 'timepicker-locale-example',
  templateUrl: 'timepicker-locale-example.html',
  providers: [provideNativeDateAdapter()],
  imports: [MatFormFieldModule, MatInputModule, MatTimepickerModule, FormsModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimepickerLocaleExample {
  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  value = new Date(2024, 0, 1, 13, 45, 0);

  protected switchLocale() {
    this._adapter.setLocale('bg-BG');
  }
}
