/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject, OnDestroy} from '@angular/core';
import {DateAdapter} from '@angular/material/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatTimepickerModule} from '@angular/material/timepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {JsonPipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {Subscription} from 'rxjs';
import {MatCardModule} from '@angular/material/card';
import {MatDatepickerModule} from '@angular/material/datepicker';

@Component({
  selector: 'timepicker-demo',
  templateUrl: 'timepicker-demo.html',
  styleUrl: 'timepicker-demo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTimepickerModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    JsonPipe,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
  ],
})
export class TimepickerDemo implements OnDestroy {
  private _dateAdapter = inject(DateAdapter);
  private _localeSubscription: Subscription;
  locales = ['en-US', 'da-DK', 'bg-BG', 'zh-TW'];
  control: FormControl<Date | null>;
  localeControl = new FormControl('en-US', {nonNullable: true});
  intervalControl = new FormControl('1h', {nonNullable: true});
  minControl = new FormControl<Date | null>(null);
  maxControl = new FormControl<Date | null>(null);
  combinedValue: Date | null = null;

  constructor() {
    const value = new Date();
    value.setHours(15, 0, 0);
    this.control = new FormControl(value);

    this._localeSubscription = this.localeControl.valueChanges.subscribe(locale => {
      if (locale) {
        this._dateAdapter.setLocale(locale);
      }
    });
  }

  randomizeValue() {
    const value = new Date();
    value.setHours(Math.floor(Math.random() * 23), Math.floor(Math.random() * 59), 0);
    this.control.setValue(value);
  }

  ngOnDestroy(): void {
    this._localeSubscription.unsubscribe();
  }
}
