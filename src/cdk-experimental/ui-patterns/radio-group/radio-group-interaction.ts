/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {KeyboardEventManager, PointerEventManager} from '../behaviors/event-manager';
import {SignalLike} from '../behaviors/signal-like/signal-like';

/** The type of operation to be performed on the radio group as a result of a user interaction. */
export type RadioGroupOperation = 'next' | 'prev' | 'home' | 'end' | 'trigger' | 'goto';

/** An instruction to be sent to the radio group when a user interaction occurs. */
export interface RadioGroupInstruction {
  /** The operation to be performed. */
  op: RadioGroupOperation;

  /** Additional information about the interaction. */
  metadata: {
    /** The underlying DOM event that triggered the instruction. */
    event?: KeyboardEvent | PointerEvent;
  };
}

/** A function that handles a radio group instruction. */
export type RadioGroupInstructionHandler = (instruction: RadioGroupInstruction) => void;

/** Represents the required inputs for radio group interaction. */
export interface RadioGroupInteractionInputs {
  /** Whether the list is vertically or horizontally oriented. */
  orientation: SignalLike<'vertical' | 'horizontal'>;

  /** The direction that text is read based on the users locale. */
  textDirection: SignalLike<'rtl' | 'ltr'>;

  /** The handler for radio group instructions. */
  handler: SignalLike<RadioGroupInstructionHandler>;
}

/** Manages user interactions for a radio group, translating them into radio group instructions. */
export class RadioGroupInteraction {
  /** The key used to navigate to the previous radio button. */
  private readonly _prevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key used to navigate to the next radio button. */
  private readonly _nextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The keydown event manager for the radio group. */
  private readonly _keydown = computed(() =>
    new KeyboardEventManager()
      .on(this._nextKey, e => this._handler(e, 'next'))
      .on(this._prevKey, e => this._handler(e, 'prev'))
      .on(' ', e => this._handler(e, 'trigger'))
      .on('Enter', e => this._handler(e, 'trigger'))
      .on('Home', e => this._handler(e, 'home'))
      .on('End', e => this._handler(e, 'end')),
  );

  /** The pointerdown event manager for the radio group. */
  private readonly _pointerdown = computed(() =>
    new PointerEventManager().on(e => this._handler(e, 'goto')),
  );

  constructor(readonly inputs: RadioGroupInteractionInputs) {}

  /** Handles keydown events for the radio group. */
  onKeydown(event: KeyboardEvent) {
    this._keydown().handle(event);
  }

  /** Handles pointerdown events for the radio group. */
  onPointerdown(event: PointerEvent) {
    this._pointerdown().handle(event);
  }

  /** Creates and dispatches a radio group instruction to the handler. */
  private _handler(event: KeyboardEvent | PointerEvent, op: RadioGroupOperation) {
    this.inputs.handler()({
      op,
      metadata: {
        event: event,
      },
    });
  }
}
