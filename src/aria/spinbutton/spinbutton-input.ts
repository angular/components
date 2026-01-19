/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {afterRenderEffect, Directive, ElementRef, inject, input} from '@angular/core';
import {SPINBUTTON, SPINBUTTON_INPUT} from './spinbutton-tokens';

/**
 * The input element for a spinbutton widget.
 *
 * This directive should be applied to an input or span element within an `ngSpinButton` container.
 * It handles the ARIA attributes, keyboard interactions, and value synchronization.
 *
 * ```html
 * <input ngSpinButtonInput type="text" aria-label="Quantity" />
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngSpinButtonInput]',
  exportAs: 'ngSpinButtonInput',
  providers: [{provide: SPINBUTTON_INPUT, useExisting: SpinButtonInput}],
  host: {
    'role': 'spinbutton',
    '[attr.id]': 'spinButton.inputId()',
    '[tabindex]': 'spinButton._pattern.tabIndex()',
    '[attr.aria-valuenow]': 'spinButton._pattern.ariaValueNow()',
    '[attr.aria-valuemin]': 'spinButton.min()',
    '[attr.aria-valuemax]': 'spinButton.max()',
    '[attr.aria-valuetext]': 'spinButton.valueText() || null',
    '[attr.aria-disabled]': 'spinButton.disabled() || null',
    '[attr.aria-readonly]': 'spinButton.readonly() || null',
    '[attr.aria-invalid]': 'spinButton._pattern.invalid() || null',
    '(keydown)': '_onKeydown($event)',
    '(focusin)': 'spinButton._onFocus()',
    '(input)': '_onInput($event)',
    '(change)': '_onChange($event)',
    '[attr.autocomplete]': '_isNativeInput ? "off" : null',
    '[attr.autocorrect]': '_isNativeInput ? "off" : null',
    '[attr.spellcheck]': '_isNativeInput ? "false" : null',
    '[attr.inputmode]': '_isNativeInput ? inputmode() : null',
  },
})
export class SpinButtonInput {
  readonly element = inject(ElementRef).nativeElement as HTMLElement;
  readonly spinButton = inject(SPINBUTTON);
  readonly _isNativeInput = this.element.tagName === 'INPUT';
  readonly inputmode = input<string | null>('numeric');

  constructor() {
    if (this._isNativeInput) {
      afterRenderEffect(() => {
        const value = this.spinButton.value();
        const input = this.element as HTMLInputElement;
        if (input.value !== String(value)) {
          input.value = String(value);
        }
      });
    }
  }

  _onKeydown(event: KeyboardEvent): void {
    if (this._isNativeInput && this._isNumericKey(event)) {
      return;
    }
    this.spinButton._pattern.onKeydown(event);
  }

  _onInput(event: Event): void {
    if (!this._isNativeInput) return;
    const input = event.target as HTMLInputElement;
    const filtered = input.value.replace(/[^0-9\-]/g, '');
    if (filtered !== input.value) {
      input.value = filtered;
    }
  }

  _onChange(event: Event): void {
    if (!this._isNativeInput) return;
    const input = event.target as HTMLInputElement;
    const parsed = parseInt(input.value, 10);
    if (!isNaN(parsed)) {
      this.spinButton.value.set(parsed);
    } else {
      input.value = String(this.spinButton.value());
    }
  }

  private _isNumericKey(event: KeyboardEvent): boolean {
    if (event.ctrlKey || event.metaKey || event.altKey) return false;
    return /^[0-9\-]$/.test(event.key) || ['Backspace', 'Delete', 'Tab'].includes(event.key);
  }
}
