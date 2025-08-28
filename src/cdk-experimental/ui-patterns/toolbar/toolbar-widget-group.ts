/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {ListItem} from '../behaviors/list/list';
import {ToolbarOperation} from './toolbar-interaction';
import type {ToolbarPattern} from './toolbar';

/** The type of operation to be performed on a toolbar widget group. */
export type ToolbarWidgetGroupOperation =
  | 'enterFromStart'
  | 'enterFromEnd'
  | 'asEntryPoint'
  | ToolbarOperation;

/** An instruction to be sent to the toolbar widget group when an interaction occurs. */
export type ToolbarWidgetGroupInstruction<V> = {
  /** The operation to be performed. */
  op: ToolbarWidgetGroupOperation;

  /** Additional information about the interaction. */
  metadata: {
    /** The underlying DOM event that triggered the instruction. */
    event?: KeyboardEvent | PointerEvent;
  };
};

/**
 * A function that handles a toolbar widget group instruction.
 * Can indicate whether focus should leave the group.
 */
export type ToolbarWidgetGroupInteractionHandler<V> = (
  instruction: ToolbarWidgetGroupInstruction<V>,
) => {
  leaveGroup?: boolean;
} | void;

/** Represents the required inputs for a toolbar widget group. */
export interface ToolbarWidgetGroupInputs<V>
  extends Omit<ListItem<V>, 'searchTerm' | 'value' | 'index'> {
  /** A reference to the parent toolbar. */
  toolbar: SignalLike<ToolbarPattern<V> | undefined>;

  /** The handler for toolbar widget group instructions. */
  handler: SignalLike<ToolbarWidgetGroupInteractionHandler<V>>;
}

/** A group of widgets within a toolbar that provides nested navigation. */
export class ToolbarWidgetGroupPattern<V> implements ListItem<V> {
  /** A unique identifier for the widget. */
  readonly id: SignalLike<string>;

  /** The html element that should receive focus. */
  readonly element: SignalLike<HTMLElement>;

  /** Whether the widget is disabled. */
  readonly disabled: SignalLike<boolean>;

  /** A reference to the parent toolbar. */
  readonly toolbar: SignalLike<ToolbarPattern<V> | undefined>;

  /** The text used by the typeahead search. */
  readonly searchTerm = () => ''; // Unused because toolbar does not support typeahead.

  /** The value associated with the widget. */
  readonly value = () => '' as V; // Unused because toolbar does not support selection.

  /** The position of the widget within the toolbar. */
  readonly index = computed(() => this.toolbar()?.inputs.items().indexOf(this) ?? -1);

  constructor(readonly inputs: ToolbarWidgetGroupInputs<V>) {
    this.id = inputs.id;
    this.element = inputs.element;
    this.disabled = inputs.disabled;
    this.toolbar = inputs.toolbar;
  }

  /** Executes an instruction on the widget group. */
  execute(instruction: ToolbarWidgetGroupInstruction<V>) {
    return this.inputs.handler()(instruction);
  }
}
