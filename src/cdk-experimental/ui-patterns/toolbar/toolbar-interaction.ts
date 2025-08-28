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

/** The type of operation to be performed on the toolbar as a result of a user interaction. */
export type ToolbarOperation =
  | 'next'
  | 'prev'
  | 'groupNextWrap'
  | 'groupPrevWrap'
  | 'home'
  | 'end'
  | 'trigger'
  | 'goto';

/** An instruction to be sent to the toolbar when a user interaction occurs. */
export interface ToolbarInstruction {
  /** The operation to be performed. */
  op: ToolbarOperation;

  /** Additional information about the interaction. */
  metadata: {
    /** The underlying DOM event that triggered the instruction. */
    event?: KeyboardEvent | PointerEvent;
  };
}

/** A function that handles a toolbar instruction, with the ability to control event behavior. */
export type ToolbarInstructionHandler = (instruction: ToolbarInstruction) => {
  stopPropagation?: boolean;
  preventDefault?: boolean;
} | void;

/** Represents the required inputs for toolbar interaction. */
export interface ToolbarInteractionInputs {
  /** Whether the toolbar is vertically or horizontally oriented. */
  orientation: SignalLike<'vertical' | 'horizontal'>;

  /** The direction that text is read based on the users locale. */
  textDirection: SignalLike<'rtl' | 'ltr'>;

  /** The handler for toolbar instructions. */
  handler: SignalLike<ToolbarInstructionHandler>;
}

/** Manages user interactions for a toolbar, translating them into toolbar instructions. */
export class ToolbarInteraction {
  /** The key used to navigate to the previous widget. */
  private readonly _prevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key used to navigate to the next widget. */
  private readonly _nextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The alternate key used to navigate to the previous widget. */
  private readonly _altPrevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    }
    return 'ArrowUp';
  });

  /** The alternate key used to navigate to the next widget. */
  private readonly _altNextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    }
    return 'ArrowDown';
  });

  /** The keydown event manager for the toolbar. */
  private readonly _keydown = computed(() => {
    const manager = new KeyboardEventManager();
    manager.options = {
      stopPropagation: false,
      preventDefault: false,
    };

    return manager
      .on(this._nextKey, e => this._handler(e, 'next'))
      .on(this._prevKey, e => this._handler(e, 'prev'))
      .on(this._altNextKey, e => this._handler(e, 'groupNextWrap'))
      .on(this._altPrevKey, e => this._handler(e, 'groupPrevWrap'))
      .on(' ', e => this._handler(e, 'trigger'))
      .on('Enter', e => this._handler(e, 'trigger'))
      .on('Home', e => this._handler(e, 'home'))
      .on('End', e => this._handler(e, 'end'));
  });

  /** The pointerdown event manager for the toolbar. */
  private readonly _pointerdown = computed(() =>
    new PointerEventManager().on(e => this._handler(e, 'goto')),
  );

  constructor(readonly inputs: ToolbarInteractionInputs) {}

  /** Handles keydown events for the toolbar. */
  onKeydown(event: KeyboardEvent) {
    this._keydown().handle(event);
  }

  /** Handles pointerdown events for the toolbar. */
  onPointerdown(event: PointerEvent) {
    this._pointerdown().handle(event);
  }

  /** Creates and dispatches a toolbar instruction to the handler. */
  private _handler(event: KeyboardEvent | PointerEvent, op: ToolbarOperation) {
    const {stopPropagation = true, preventDefault = true} =
      this.inputs.handler()({
        op,
        metadata: {
          event: event,
        },
      }) ?? {};
    if (stopPropagation) event.stopPropagation();
    if (preventDefault) event.preventDefault();
  }
}
