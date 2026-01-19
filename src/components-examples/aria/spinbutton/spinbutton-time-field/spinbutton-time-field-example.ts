import {Component, signal, computed, viewChild, ElementRef} from '@angular/core';
import {SpinButton, SpinButtonInput} from '@angular/aria/spinbutton';

/** @title Time Field */
@Component({
  selector: 'spinbutton-time-field-example',
  templateUrl: 'spinbutton-time-field-example.html',
  styleUrl: 'spinbutton-time-field-example.css',
  imports: [SpinButton, SpinButtonInput],
})
export class SpinButtonTimeFieldExample {
  hours = signal(12);
  minutes = signal(0);
  period = signal(0);

  hoursDisplay = computed(() => this.hours().toString().padStart(2, '0'));
  minutesDisplay = computed(() => this.minutes().toString().padStart(2, '0'));
  periodDisplay = computed(() => (this.period() === 0 ? 'AM' : 'PM'));

  formattedTime = computed(
    () => `${this.hoursDisplay()}:${this.minutesDisplay()} ${this.periodDisplay()}`,
  );

  private _hoursInput = viewChild<ElementRef<HTMLElement>>('hoursInput');
  private _minutesInput = viewChild<ElementRef<HTMLElement>>('minutesInput');
  private _periodInput = viewChild<ElementRef<HTMLElement>>('periodInput');

  onHoursKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this._advanceToMinutes();
      return;
    }

    // Prevent all character input from contenteditable
    if (event.key.length === 1) {
      event.preventDefault();
    }

    if (!/^[0-9]$/.test(event.key)) return;

    const digit = parseInt(event.key, 10);
    const current = this.hours();
    const appended = current * 10 + digit;

    if (appended >= 1 && appended <= 12) {
      this.hours.set(appended);
      this._advanceToMinutes();
    } else if (digit >= 1 && digit <= 9) {
      this.hours.set(digit);
      if (digit > 1) {
        this._advanceToMinutes();
      }
    }
  }

  onMinutesKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this._hoursInput()?.nativeElement.focus();
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this._advanceToPeriod();
      return;
    }

    // Prevent all character input from contenteditable
    if (event.key.length === 1) {
      event.preventDefault();
    }

    if (!/^[0-9]$/.test(event.key)) return;

    const digit = parseInt(event.key, 10);
    const current = this.minutes();
    const appended = current * 10 + digit;

    if (appended <= 59) {
      this.minutes.set(appended);
      if (appended > 5) {
        this._advanceToPeriod();
      }
    } else {
      this.minutes.set(digit);
      if (digit > 5) {
        this._advanceToPeriod();
      }
    }
  }

  onPeriodKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this._minutesInput()?.nativeElement.focus();
      return;
    }

    const key = event.key.toLowerCase();
    if (key === 'a') {
      this.period.set(0);
      event.preventDefault();
    } else if (key === 'p') {
      this.period.set(1);
      event.preventDefault();
    } else if (event.key.length === 1) {
      // Prevent any other character input (numbers, letters, etc.)
      event.preventDefault();
    }
  }

  private _advanceToMinutes(): void {
    this._minutesInput()?.nativeElement.focus();
  }

  private _advanceToPeriod(): void {
    this._periodInput()?.nativeElement.focus();
  }
}
