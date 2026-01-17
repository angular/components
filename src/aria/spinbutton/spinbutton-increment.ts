/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  numberAttribute,
  OnDestroy,
} from '@angular/core';
import {SpinButtonStepperPattern} from '../private';
import {SPINBUTTON_GROUP} from './spinbutton-tokens';

/** Default initial delay before auto-repeat starts (in ms). */
const DEFAULT_AUTO_REPEAT_DELAY = 400;

/** Default interval between auto-repeat increments (in ms). */
const DEFAULT_AUTO_REPEAT_INTERVAL = 60;

/**
 * An increment button for a spinbutton.
 *
 * Must be used within an `ngSpinButtonGroup`. Automatically binds to the
 * spinbutton in the group and handles disabled state when at maximum value.
 * Supports press-and-hold auto-repeat.
 *
 * ```html
 * <div ngSpinButtonGroup>
 *   <button ngSpinButtonIncrement>+</button>
 *   <input ngSpinButton [(value)]="quantity" />
 *   <button ngSpinButtonDecrement>−</button>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Spinbutton](guide/aria/spinbutton)
 */
@Directive({
  selector: '[ngSpinButtonIncrement]',
  exportAs: 'ngSpinButtonIncrement',
  host: {
    '[attr.aria-controls]': '_pattern.ariaControls()',
    '[attr.aria-disabled]': '_pattern.disabled() || null',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '(click)': '_pattern.onClick()',
    '(pointerdown)': '_pattern.onPointerdown($event)',
    '(pointerup)': '_pattern.onPointerup()',
    '(pointercancel)': '_pattern.onPointerup()',
    '(pointerleave)': '_pattern.onPointerup()',
  },
})
export class SpinButtonIncrement implements OnDestroy {
  private readonly _group = inject(SPINBUTTON_GROUP);
  private readonly _elementRef = inject(ElementRef);

  /** The host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** Initial delay before auto-repeat starts (in ms). */
  readonly autoRepeatDelay = input(DEFAULT_AUTO_REPEAT_DELAY, {transform: numberAttribute});

  /** Interval between auto-repeat increments (in ms). */
  readonly autoRepeatInterval = input(DEFAULT_AUTO_REPEAT_INTERVAL, {transform: numberAttribute});

  /** Whether the increment button can operate (not disabled and can increment). */
  private readonly _canOperate = computed(() => {
    const spinButton = this._group.spinButton();
    return spinButton ? spinButton.canIncrement() : false;
  });

  /** The ID of the associated spinbutton. */
  private readonly _spinButtonId = computed(() => this._group.spinButton()?.id() ?? null);

  /** The UI pattern instance for this increment button. */
  readonly _pattern: SpinButtonStepperPattern = new SpinButtonStepperPattern({
    operation: 'increment',
    canOperate: this._canOperate,
    spinButtonId: this._spinButtonId,
    doOperation: () => this._group.spinButton()?.doIncrement(),
    autoRepeatDelay: this.autoRepeatDelay,
    autoRepeatInterval: this.autoRepeatInterval,
  });

  ngOnDestroy(): void {
    this._pattern.destroy();
  }
}
