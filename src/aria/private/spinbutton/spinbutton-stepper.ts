/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PointerEventManager} from '../behaviors/event-manager';
import {computed, SignalLike} from '../behaviors/signal-like/signal-like';

/** The operation type for a spinbutton stepper. */
export type SpinButtonStepperOperation = 'increment' | 'decrement';

/** Represents the required inputs for a spinbutton stepper. */
export interface SpinButtonStepperInputs {
  /** The operation this stepper performs. */
  operation: SpinButtonStepperOperation;

  /** Whether the operation is currently possible. */
  canOperate: SignalLike<boolean>;

  /** The ID of the associated spinbutton for aria-controls. */
  spinButtonId: SignalLike<string | null>;

  /** Function to perform the operation. */
  doOperation: () => void;

  /** Initial delay before auto-repeat starts (in ms). */
  autoRepeatDelay: SignalLike<number>;

  /** Interval between auto-repeat operations (in ms). */
  autoRepeatInterval: SignalLike<number>;
}

/** Controls the state and behavior of a spinbutton stepper button (increment/decrement). */
export class SpinButtonStepperPattern {
  /** The inputs for this pattern. */
  readonly inputs: SpinButtonStepperInputs;

  /** Timer for initial delay before auto-repeat. */
  private _delayTimer: ReturnType<typeof setTimeout> | null = null;

  /** Timer for auto-repeat interval. */
  private _repeatTimer: ReturnType<typeof setInterval> | null = null;

  /** Whether the operation was triggered via pointerdown (to prevent duplicate click trigger). */
  private _triggeredViaPointer = false;

  /** Whether the stepper is disabled. */
  readonly disabled = computed(() => !this.inputs.canOperate());

  /** The tabindex for the element (always -1, removed from tab order). */
  readonly tabIndex = () => -1;

  /** The aria-controls value. */
  readonly ariaControls = computed(() => this.inputs.spinButtonId());

  /** The pointerdown event manager for the stepper. */
  readonly pointerdown = computed(() => {
    return new PointerEventManager().on(e => this._onPointerDown(e));
  });

  constructor(inputs: SpinButtonStepperInputs) {
    this.inputs = inputs;
  }

  /** Handles click events for the stepper. */
  onClick(): void {
    if (this._triggeredViaPointer) {
      this._triggeredViaPointer = false;
      return;
    }
    if (this.disabled()) return;
    this.inputs.doOperation();
  }

  /** Handles pointerdown events for the stepper. */
  onPointerdown(event: PointerEvent): void {
    this.pointerdown().handle(event);
  }

  /** Handles pointerup, pointercancel, and pointerleave events. */
  onPointerup(): void {
    this._stopAutoRepeat();
  }

  /** Cleans up timers on destroy. */
  destroy(): void {
    this._stopAutoRepeat();
  }

  /** Handles pointerdown with auto-repeat logic. */
  private _onPointerDown(event: PointerEvent): void {
    if (this.disabled()) return;

    event.preventDefault();
    this._triggeredViaPointer = true;
    this.inputs.doOperation();

    this._delayTimer = setTimeout(() => {
      this._delayTimer = null;
      this._repeatTimer = setInterval(() => {
        if (this.disabled()) {
          this._stopAutoRepeat();
          return;
        }
        this.inputs.doOperation();
      }, this.inputs.autoRepeatInterval());
    }, this.inputs.autoRepeatDelay());
  }

  /** Stops the auto-repeat timers. */
  private _stopAutoRepeat(): void {
    if (this._delayTimer) {
      clearTimeout(this._delayTimer);
      this._delayTimer = null;
    }
    if (this._repeatTimer) {
      clearInterval(this._repeatTimer);
      this._repeatTimer = null;
    }
  }
}
