/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import type {SpinButton} from './spinbutton';
import {SPINBUTTON_GROUP} from './spinbutton-tokens';

/**
 * A container for a spinbutton and its associated increment/decrement buttons.
 *
 * Provides `role="group"` and allows child directives to coordinate via injection.
 * The increment and decrement button directives require this group to access the spinbutton.
 *
 * ```html
 * <div ngSpinButtonGroup aria-labelledby="quantity-label">
 *   <button ngSpinButtonDecrement>−</button>
 *   <input ngSpinButton [(value)]="quantity" [min]="1" [max]="10" />
 *   <button ngSpinButtonIncrement>+</button>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngSpinButtonGroup]',
  exportAs: 'ngSpinButtonGroup',
  host: {
    'role': 'group',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.aria-label]': 'label() || null',
  },
  providers: [{provide: SPINBUTTON_GROUP, useExisting: SpinButtonGroup}],
})
export class SpinButtonGroup {
  private readonly _elementRef = inject(ElementRef);

  /** The host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The spinbutton within this group. Set by SpinButton on init. */
  readonly spinButton = signal<SpinButton | null>(null);

  /** Whether the entire group is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** An accessible label for the group. */
  readonly label = input<string | undefined>(undefined);

  /** Whether the group is effectively disabled (group or spinbutton disabled). */
  readonly isDisabled = computed(() => {
    return this.disabled() || (this.spinButton()?.disabled() ?? false);
  });

  /** @docs-private Called by SpinButton to register itself. */
  _registerSpinButton(spinButton: SpinButton): void {
    this.spinButton.set(spinButton);
  }

  /** @docs-private Called by SpinButton on destroy. */
  _unregisterSpinButton(): void {
    this.spinButton.set(null);
  }
}
