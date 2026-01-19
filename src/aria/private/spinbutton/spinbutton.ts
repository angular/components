/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {KeyboardEventManager} from '../behaviors/event-manager';
import {SignalLike, WritableSignalLike, computed} from '../behaviors/signal-like/signal-like';

/** Represents the required inputs for a spinbutton. */
export interface SpinButtonInputs {
  /** A unique identifier for the spinbutton input element. */
  id: SignalLike<string>;

  /** The current numeric value of the spinbutton. */
  value: WritableSignalLike<number>;

  /** The minimum allowed value. */
  min: SignalLike<number | undefined>;

  /** The maximum allowed value. */
  max: SignalLike<number | undefined>;

  /** The amount to increment or decrement by. */
  step: SignalLike<number>;

  /** The amount to increment or decrement by for page up/down. */
  pageStep: SignalLike<number | undefined>;

  /** Whether the spinbutton is disabled. */
  disabled: SignalLike<boolean>;

  /** Whether the spinbutton is readonly. */
  readonly: SignalLike<boolean>;

  /** Whether to wrap the value at boundaries. */
  wrap: SignalLike<boolean>;

  /** Human-readable value text for aria-valuetext. */
  valueText: SignalLike<string | undefined>;

  /** Reference to the input element. */
  inputElement: SignalLike<HTMLElement | undefined>;
}

/** Controls the state of a spinbutton. */
export class SpinButtonPattern {
  /** The inputs for this spinbutton pattern. */
  readonly inputs: SpinButtonInputs;

  /** The tab index of the spinbutton input. */
  readonly tabIndex = computed(() => (this.inputs.disabled() ? -1 : 0));

  /** The current numeric value for aria-valuenow. */
  readonly ariaValueNow = computed(() => this.inputs.value());

  /** Whether the current value is invalid (outside min/max bounds). */
  readonly invalid = computed(() => {
    const value = this.inputs.value();
    const min = this.inputs.min();
    const max = this.inputs.max();
    return (min !== undefined && value < min) || (max !== undefined && value > max);
  });

  /** Whether the value is at the minimum. */
  readonly atMin = computed(() => {
    const min = this.inputs.min();
    return min !== undefined && this.inputs.value() <= min;
  });

  /** Whether the value is at the maximum. */
  readonly atMax = computed(() => {
    const max = this.inputs.max();
    return max !== undefined && this.inputs.value() >= max;
  });

  /** The keydown event manager for the spinbutton. */
  readonly keydown = computed(() => {
    return new KeyboardEventManager()
      .on('ArrowUp', () => this.increment())
      .on('ArrowDown', () => this.decrement())
      .on('Home', () => this.goToMin())
      .on('End', () => this.goToMax())
      .on('PageUp', () => this.incrementByPage())
      .on('PageDown', () => this.decrementByPage());
  });

  constructor(inputs: SpinButtonInputs) {
    this.inputs = inputs;
  }

  /** Whether the spinbutton value can be modified. */
  private _canModify(): boolean {
    return !this.inputs.disabled() && !this.inputs.readonly();
  }

  /** Validates the spinbutton configuration and returns a list of violations. */
  validate(): string[] {
    const min = this.inputs.min();
    const max = this.inputs.max();
    if (min !== undefined && max !== undefined && min > max) {
      return [`Spinbutton has invalid bounds: min (${min}) is greater than max (${max}).`];
    }
    return [];
  }

  /** Sets the spinbutton to its default initial state. */
  setDefaultState(): void {}

  /** Handles keydown events for the spinbutton. */
  onKeydown(event: KeyboardEvent): void {
    if (this._canModify()) {
      this.keydown().handle(event);
    }
  }

  /** Handles pointerdown events for the spinbutton. */
  onPointerdown(_event: PointerEvent): void {
    const element = this.inputs.inputElement();
    if (element && !this.inputs.disabled()) {
      element.focus();
    }
  }

  /** Increments the value by the step amount. */
  increment(): void {
    if (this._canModify()) {
      this._adjustValue(this.inputs.step());
    }
  }

  /** Decrements the value by the step amount. */
  decrement(): void {
    if (this._canModify()) {
      this._adjustValue(-this.inputs.step());
    }
  }

  /** Increments the value by the page step amount. */
  incrementByPage(): void {
    if (this._canModify()) {
      this._adjustValue(this.inputs.pageStep() ?? this.inputs.step() * 10);
    }
  }

  /** Decrements the value by the page step amount. */
  decrementByPage(): void {
    if (this._canModify()) {
      this._adjustValue(-(this.inputs.pageStep() ?? this.inputs.step() * 10));
    }
  }

  /** Sets the value to the minimum. */
  goToMin(): void {
    const min = this.inputs.min();
    if (this._canModify() && min !== undefined) {
      this.inputs.value.set(min);
    }
  }

  /** Sets the value to the maximum. */
  goToMax(): void {
    const max = this.inputs.max();
    if (this._canModify() && max !== undefined) {
      this.inputs.value.set(max);
    }
  }

  /** Adjusts the value by the given delta, respecting bounds and wrap behavior. */
  private _adjustValue(delta: number): void {
    const min = this.inputs.min();
    const max = this.inputs.max();
    let newValue = this.inputs.value() + delta;

    if (this.inputs.wrap() && min !== undefined && max !== undefined) {
      const range = max - min + 1;
      newValue = min + ((((newValue - min) % range) + range) % range);
    } else {
      if (min !== undefined) newValue = Math.max(min, newValue);
      if (max !== undefined) newValue = Math.min(max, newValue);
    }

    this.inputs.value.set(newValue);
  }
}
