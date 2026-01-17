/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, ElementRef, signal, viewChildren} from '@angular/core';
import {SpinButton} from '@angular/aria/spinbutton';

/**
 * @title Time field with spinbutton segments
 */
@Component({
  selector: 'spinbutton-time-field-example',
  templateUrl: 'spinbutton-time-field-example.html',
  styleUrl: '../spinbutton-examples.css',
  imports: [SpinButton],
})
export class SpinbuttonTimeFieldExample {
  hour = signal(10);
  minute = signal(30);
  period = signal(0);

  readonly segments = viewChildren(SpinButton, {read: ElementRef});

  hourDisplay = computed(() => this.hour().toString().padStart(2, '0'));
  minuteDisplay = computed(() => this.minute().toString().padStart(2, '0'));
  periodDisplay = computed(() => (this.period() === 0 ? 'AM' : 'PM'));

  formattedTime = computed(
    () => `${this.hourDisplay()}:${this.minuteDisplay()} ${this.periodDisplay()}`,
  );

  private _hourDigits = '';
  private _minuteDigits = '';

  onGroupKeydown(event: KeyboardEvent): void {
    const els = this.segments();
    const idx = els.findIndex(el => el.nativeElement === document.activeElement);

    if (event.key === 'ArrowRight' && idx < els.length - 1) {
      els[idx + 1].nativeElement.focus();
      event.preventDefault();
    } else if (event.key === 'ArrowLeft' && idx > 0) {
      els[idx - 1].nativeElement.focus();
      event.preventDefault();
    }
  }

  onHourInput(event: InputEvent): void {
    event.preventDefault();
    const char = event.data;
    if (!char || !/[0-9]/.test(char)) return;

    this._hourDigits += char;
    const num = parseInt(this._hourDigits, 10);
    this.hour.set(Math.min(Math.max(num, 1), 12));

    if (this._hourDigits.length >= 2 || num > 1) {
      this._hourDigits = '';
      this._focusNext();
    }
  }

  onMinuteInput(event: InputEvent): void {
    event.preventDefault();
    const char = event.data;
    if (!char || !/[0-9]/.test(char)) return;

    this._minuteDigits += char;
    const num = parseInt(this._minuteDigits, 10);
    this.minute.set(Math.min(Math.max(num, 0), 59));

    if (this._minuteDigits.length >= 2 || num > 5) {
      this._minuteDigits = '';
      this._focusNext();
    }
  }

  onPeriodKeydown(event: KeyboardEvent): void {
    if (event.key.toLowerCase() === 'a') {
      this.period.set(0);
      event.preventDefault();
    } else if (event.key.toLowerCase() === 'p') {
      this.period.set(1);
      event.preventDefault();
    }
  }

  private _focusNext(): void {
    const els = this.segments();
    const idx = els.findIndex(el => el.nativeElement === document.activeElement);
    els[idx + 1]?.nativeElement.focus();
  }
}
