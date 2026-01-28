/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Directive, inject} from '@angular/core';
import {SPINBUTTON} from './spinbutton-tokens';

/**
 * A button that increments the value of a spinbutton.
 *
 * This directive should be applied to a button element within an `ngSpinButton` container.
 * It automatically manages the `aria-controls` attribute and disables the button when
 * the value is at the maximum (unless wrap is enabled).
 *
 * ```html
 * <button ngSpinButtonIncrement>+</button>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngSpinButtonIncrement]',
  exportAs: 'ngSpinButtonIncrement',
  host: {
    '[attr.aria-controls]': 'spinButton.inputId()',
    '[attr.aria-disabled]': '_isDisabled() || null',
    '[attr.tabindex]': '-1',
    '(click)': '_onClick()',
  },
})
export class SpinButtonIncrement {
  /** The parent spinbutton container. */
  readonly spinButton = inject(SPINBUTTON);

  /** Whether the increment button should be disabled. */
  protected readonly _isDisabled = computed(() => {
    if (this.spinButton.disabled() || this.spinButton.readonly()) return true;
    if (this.spinButton.wrap()) return false;
    return this.spinButton._pattern.atMax();
  });

  /** Handles click events on the increment button. */
  protected _onClick(): void {
    if (!this._isDisabled()) {
      this.spinButton.increment();
    }
  }
}
