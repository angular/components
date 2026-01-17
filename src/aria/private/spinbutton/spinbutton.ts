/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {KeyboardEventManager} from '../behaviors/event-manager';
import {computed, SignalLike, WritableSignalLike} from '../behaviors/signal-like/signal-like';

/** Represents the required inputs for a spinbutton. */
export interface SpinButtonInputs {
  /** A unique identifier for the spinbutton. */
  id: SignalLike<string>;

  /** The current numeric value. */
  value: WritableSignalLike<number | undefined>;

  /** Minimum allowed value. */
  min: SignalLike<number | undefined>;

  /** Maximum allowed value. */
  max: SignalLike<number | undefined>;

  /** Step amount for increment/decrement. */
  step: SignalLike<number>;

  /** Step amount for page increment/decrement (PageUp/PageDown). */
  pageStep: SignalLike<number | undefined>;

  /** Whether the spinbutton is disabled. */
  disabled: SignalLike<boolean>;

  /** Whether the spinbutton is readonly. */
  readonly: SignalLike<boolean>;

  /** Whether to wrap around at min/max boundaries. */
  wrap: SignalLike<boolean>;

  /** Whether a value is required. */
  required: SignalLike<boolean>;

  /** Human-readable text representation of the value. */
  valueText: SignalLike<string | undefined>;

  /** A reference to the host element. */
  element: () => HTMLElement;
}

/** Controls the state and behavior of a spinbutton. */
export class SpinButtonPattern {
  /** The inputs for this pattern. */
  readonly inputs: SpinButtonInputs;

  /** Whether the current value is below the minimum. */
  private readonly _isBelowMin = computed(() => {
    const v = this.inputs.value();
    const minVal = this.inputs.min();
    return v !== undefined && minVal !== undefined && v < minVal;
  });

  /** Whether the current value is above the maximum. */
  private readonly _isAboveMax = computed(() => {
    const v = this.inputs.value();
    const maxVal = this.inputs.max();
    return v !== undefined && maxVal !== undefined && v > maxVal;
  });

  /** Whether the current value is at the minimum. */
  private readonly _isAtMin = computed(() => {
    const v = this.inputs.value();
    const minVal = this.inputs.min();
    return v !== undefined && minVal !== undefined && v === minVal;
  });

  /** Whether the current value is at the maximum. */
  private readonly _isAtMax = computed(() => {
    const v = this.inputs.value();
    const maxVal = this.inputs.max();
    return v !== undefined && maxVal !== undefined && v === maxVal;
  });

  /** The aria-valuenow attribute value. */
  readonly ariaValueNow = computed(() => this.inputs.value() ?? null);

  /** The aria-valuetext attribute value. */
  readonly ariaValueText = computed(() => this.inputs.valueText() || null);

  /** The aria-valuemin attribute value. */
  readonly ariaValueMin = computed(() => this.inputs.min() ?? null);

  /** The aria-valuemax attribute value. */
  readonly ariaValueMax = computed(() => this.inputs.max() ?? null);

  /** The aria-disabled attribute value. */
  readonly ariaDisabled = computed(() => this.inputs.disabled() || null);

  /** The aria-readonly attribute value. */
  readonly ariaReadonly = computed(() => this.inputs.readonly() || null);

  /** The aria-required attribute value. */
  readonly ariaRequired = computed(() => this.inputs.required() || null);

  /** Whether the value is out of bounds (aria-invalid). */
  readonly invalid = computed(() => this._isBelowMin() || this._isAboveMax());

  /** The tabindex for the element. */
  readonly tabIndex = computed(() => (this.inputs.disabled() ? -1 : 0));

  /** Whether increment is currently possible. */
  readonly canIncrement = computed(() => {
    if (this.inputs.disabled() || this.inputs.readonly()) return false;
    if (this.inputs.wrap()) return true;
    return this._isBelowMin() || (!this._isAtMax() && !this._isAboveMax());
  });

  /** Whether decrement is currently possible. */
  readonly canDecrement = computed(() => {
    if (this.inputs.disabled() || this.inputs.readonly()) return false;
    if (this.inputs.wrap()) return true;
    return this._isAboveMax() || (!this._isAtMin() && !this._isBelowMin());
  });

  /** The effective page step (defaults to step * 10). */
  readonly effectivePageStep = computed(() => {
    return this.inputs.pageStep() ?? this.inputs.step() * 10;
  });

  /** The keydown event manager for the spinbutton. */
  readonly keydown = computed(() => {
    return new KeyboardEventManager()
      .on('ArrowUp', () => this.doIncrement())
      .on('Up', () => this.doIncrement())
      .on('ArrowDown', () => this.doDecrement())
      .on('Down', () => this.doDecrement())
      .on('PageUp', () => this.doIncrementPage())
      .on('PageDown', () => this.doDecrementPage())
      .on('Home', () => this.doDecrementToMin())
      .on('End', () => this.doIncrementToMax());
  });

  constructor(inputs: SpinButtonInputs) {
    this.inputs = inputs;
  }

  /** Returns a set of violations for dev mode warnings. */
  validate(): string[] {
    const violations: string[] = [];

    const min = this.inputs.min();
    const max = this.inputs.max();
    const step = this.inputs.step();
    const pageStep = this.inputs.pageStep();
    const wrap = this.inputs.wrap();

    if (wrap && (min === undefined || max === undefined)) {
      violations.push(
        'SpinButton: When `wrap` is enabled, both `min` and `max` should be defined ' +
          'to allow wrapping between boundaries.',
      );
    }

    if (min !== undefined && max !== undefined && min > max) {
      violations.push(`SpinButton: \`min\` (${min}) should not be greater than \`max\` (${max}).`);
    }

    if (step <= 0) {
      violations.push(`SpinButton: \`step\` (${step}) should be a positive number.`);
    }

    if (pageStep !== undefined && pageStep <= 0) {
      violations.push(`SpinButton: \`pageStep\` (${pageStep}) should be a positive number.`);
    }

    return violations;
  }

  /** Sets the spinbutton to its default initial state. */
  setDefaultState(): void {}

  /** Handles keydown events for the spinbutton. */
  onKeydown(event: KeyboardEvent): void {
    if (this.inputs.disabled() || this.inputs.readonly()) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    this.keydown().handle(event);
  }

  /** Performs an increment operation. */
  doIncrement(): void {
    if (this.inputs.disabled() || this.inputs.readonly()) return;

    const current = this.inputs.value();
    const minVal = this.inputs.min();
    const maxVal = this.inputs.max();
    const stepVal = this.inputs.step();

    if (current === undefined) {
      const next = minVal ?? 0;
      this.inputs.value.set(next);
      return;
    }

    if (minVal !== undefined && current < minVal) {
      this.inputs.value.set(minVal);
      return;
    }

    if (maxVal !== undefined && current >= maxVal) {
      if (this.inputs.wrap() && minVal !== undefined) {
        this.inputs.value.set(minVal);
      }
      return;
    }

    let next = current + stepVal;
    if (maxVal !== undefined && next > maxVal) {
      next = maxVal;
    }
    this.inputs.value.set(next);
  }

  /** Performs a decrement operation. */
  doDecrement(): void {
    if (this.inputs.disabled() || this.inputs.readonly()) return;

    const current = this.inputs.value();
    const minVal = this.inputs.min();
    const maxVal = this.inputs.max();
    const stepVal = this.inputs.step();

    if (current === undefined) {
      const next = maxVal ?? 0;
      this.inputs.value.set(next);
      return;
    }

    if (maxVal !== undefined && current > maxVal) {
      this.inputs.value.set(maxVal);
      return;
    }

    if (minVal !== undefined && current <= minVal) {
      if (this.inputs.wrap() && maxVal !== undefined) {
        this.inputs.value.set(maxVal);
      }
      return;
    }

    let next = current - stepVal;
    if (minVal !== undefined && next < minVal) {
      next = minVal;
    }
    this.inputs.value.set(next);
  }

  /** Performs a page increment operation. */
  doIncrementPage(): void {
    if (this.inputs.disabled() || this.inputs.readonly()) return;

    const current = this.inputs.value() ?? this.inputs.min() ?? 0;
    const maxVal = this.inputs.max();
    const stepVal = this.effectivePageStep();
    const minVal = this.inputs.min();

    if (minVal !== undefined && current < minVal) {
      this.inputs.value.set(minVal);
      return;
    }

    if (maxVal !== undefined && current >= maxVal) return;

    let next = current + stepVal;
    if (maxVal !== undefined && next > maxVal) {
      next = maxVal;
    }
    this.inputs.value.set(next);
  }

  /** Performs a page decrement operation. */
  doDecrementPage(): void {
    if (this.inputs.disabled() || this.inputs.readonly()) return;

    const current = this.inputs.value() ?? this.inputs.max() ?? 0;
    const minVal = this.inputs.min();
    const stepVal = this.effectivePageStep();
    const maxVal = this.inputs.max();

    if (maxVal !== undefined && current > maxVal) {
      this.inputs.value.set(maxVal);
      return;
    }

    if (minVal !== undefined && current <= minVal) return;

    let next = current - stepVal;
    if (minVal !== undefined && next < minVal) {
      next = minVal;
    }
    this.inputs.value.set(next);
  }

  /** Sets value to maximum. */
  doIncrementToMax(): void {
    const maxVal = this.inputs.max();
    if (maxVal !== undefined && !this.inputs.disabled() && !this.inputs.readonly()) {
      this.inputs.value.set(maxVal);
    }
  }

  /** Sets value to minimum. */
  doDecrementToMin(): void {
    const minVal = this.inputs.min();
    if (minVal !== undefined && !this.inputs.disabled() && !this.inputs.readonly()) {
      this.inputs.value.set(minVal);
    }
  }
}
