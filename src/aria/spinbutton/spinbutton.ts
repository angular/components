/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {SpinButtonPattern} from '../private';
import {SPINBUTTON, SPINBUTTON_INPUT} from './spinbutton-tokens';
import type {SpinButtonInput} from './spinbutton-input';

/**
 * A spinbutton container that manages the value state and provides it to child elements.
 *
 * The `ngSpinButton` directive serves as the parent container for a spinbutton widget,
 * coordinating the behavior of the `ngSpinButtonInput`, `ngSpinButtonIncrement`, and
 * `ngSpinButtonDecrement` elements within it.
 *
 * ```html
 * <div ngSpinButton [(value)]="quantity" [min]="0" [max]="10">
 *   <button ngSpinButtonDecrement>-</button>
 *   <input ngSpinButtonInput />
 *   <button ngSpinButtonIncrement>+</button>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngSpinButton]',
  exportAs: 'ngSpinButton',
  providers: [{provide: SPINBUTTON, useExisting: SpinButton}],
})
export class SpinButton {
  /** A reference to the container element. */
  readonly element = inject(ElementRef).nativeElement as HTMLElement;

  /** A unique identifier for the spinbutton input element. */
  readonly inputId = input(inject(_IdGenerator).getId('ng-spinbutton-', true));

  /** The current numeric value of the spinbutton. */
  readonly value = model<number>(0);

  /** The minimum allowed value. */
  readonly min = input<number | undefined>(undefined);

  /** The maximum allowed value. */
  readonly max = input<number | undefined>(undefined);

  /** The amount to increment or decrement by. */
  readonly step = input(1);

  /** The amount to increment or decrement by for PageUp/PageDown. */
  readonly pageStep = input<number | undefined>(undefined);

  /** Whether the spinbutton is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the spinbutton is readonly. */
  readonly readonly = input(false, {transform: booleanAttribute});

  /** Whether to wrap the value at boundaries. */
  readonly wrap = input(false, {transform: booleanAttribute});

  /** Human-readable value text for aria-valuetext. */
  readonly valueText = input<string | undefined>(undefined);

  /** The spinbutton input element within this container. */
  private readonly _inputChild = contentChild<SpinButtonInput>(SPINBUTTON_INPUT);

  /** Signal for the input element reference. */
  private readonly _inputElement = computed(() => this._inputChild()?.element);

  /** The UI pattern instance for this spinbutton. */
  readonly _pattern: SpinButtonPattern = new SpinButtonPattern({
    id: this.inputId,
    value: this.value,
    min: this.min,
    max: this.max,
    step: this.step,
    pageStep: this.pageStep,
    disabled: this.disabled,
    readonly: this.readonly,
    wrap: this.wrap,
    valueText: this.valueText,
    inputElement: this._inputElement,
  });

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      afterRenderEffect(() => {
        const violations = this._pattern.validate();
        for (const violation of violations) {
          console.error(violation);
        }
      });
    }
  }

  /** Increments the value by the step amount. */
  increment(): void {
    this._pattern.increment();
  }

  /** Decrements the value by the step amount. */
  decrement(): void {
    this._pattern.decrement();
  }

  /** Increments the value by the page step amount. */
  incrementByPage(): void {
    this._pattern.incrementByPage();
  }

  /** Decrements the value by the page step amount. */
  decrementByPage(): void {
    this._pattern.decrementByPage();
  }

  /** Sets the value to the minimum. */
  goToMin(): void {
    this._pattern.goToMin();
  }

  /** Sets the value to the maximum. */
  goToMax(): void {
    this._pattern.goToMax();
  }
}
