import {Component, effect, inject, signal} from '@angular/core';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {
  SpinButton,
  SpinButtonInput,
  SpinButtonIncrement,
  SpinButtonDecrement,
} from '@angular/aria/spinbutton';

/** @title APG Hotel Guest Counter Spinbutton Example */
@Component({
  selector: 'spinbutton-guest-counter-example',
  templateUrl: 'spinbutton-guest-counter-example.html',
  styleUrl: 'spinbutton-guest-counter-example.css',
  imports: [SpinButton, SpinButtonInput, SpinButtonIncrement, SpinButtonDecrement],
})
export class SpinButtonGuestCounterExample {
  adults = signal(1);
  kids = signal(0);
  animals = signal(0);

  private _liveAnnouncer = inject(LiveAnnouncer);

  constructor() {
    effect(() => this._liveAnnouncer.announce(String(this.adults())));
    effect(() => this._liveAnnouncer.announce(String(this.kids())));
    effect(() => this._liveAnnouncer.announce(String(this.animals())));
  }

  /** Restore min value if input is empty on blur */
  onBlur(spinButton: SpinButton, minValue: number): void {
    const input = spinButton._pattern.inputs.inputElement?.() as HTMLInputElement | undefined;
    if (input && input.value === '') {
      spinButton.value.set(minValue);
    }
  }
}
