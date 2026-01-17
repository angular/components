/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Directive, inject} from '@angular/core';
import {SpinButton} from './spinbutton';

/**
 * An input directive for spinbutton that handles native input value binding.
 *
 * This directive should be applied to an `<input>` element alongside `ngSpinButton`.
 * It automatically binds the spinbutton's value to the native input's value property.
 *
 * ```html
 * <input
 *   ngSpinButton
 *   ngSpinButtonInput
 *   [(value)]="quantity"
 *   [min]="1"
 *   [max]="99" />
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Spinbutton](guide/aria/spinbutton)
 */
@Directive({
  selector: 'input[ngSpinButtonInput]',
  exportAs: 'ngSpinButtonInput',
  host: {
    '[value]': '_displayValue()',
    '(input)': '_onInput($event)',
  },
})
export class SpinButtonInput {
  /** The parent spinbutton directive. */
  readonly spinButton = inject(SpinButton);

  /** Whether the spinbutton uses valueText (non-numeric display). */
  private readonly _hasValueText = computed(() => this.spinButton.valueText() !== undefined);

  /** The display value for the native input. */
  protected readonly _displayValue = computed(() => {
    const valueText = this.spinButton.valueText();
    if (valueText !== undefined) {
      return valueText;
    }
    const value = this.spinButton.value();
    return value !== undefined ? String(value) : '';
  });

  /** Handles input events to update the spinbutton value. */
  protected _onInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (this._hasValueText()) {
      input.value = this._displayValue();
      return;
    }

    const inputValue = input.value.trim();

    if (inputValue === '') {
      this.spinButton.value.set(undefined);
      return;
    }

    const parsed = parseFloat(inputValue);
    if (!Number.isNaN(parsed)) {
      this.spinButton.value.set(parsed);
    }
  }
}
