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
import type {ToolbarPattern} from './toolbar';

/** The actions that can be performed on a toolbar widget group. */
export interface ToolbarWidgetGroupActions {
  next(wrap: boolean): {leaveGroup: boolean} | undefined;
  prev(wrap: boolean): {leaveGroup: boolean} | undefined;
  first(): void;
  last(): void;
  unfocus(): void;
  trigger(): void;
  goto(event: PointerEvent): void;
  // Set up the roving index state to receive tabbing in focus.
  asEntryPoint(): void;
}

/** Represents the required inputs for a toolbar widget group. */
export interface ToolbarWidgetGroupInputs<V>
  extends Omit<ListItem<V>, 'searchTerm' | 'value' | 'index'> {
  /** A reference to the parent toolbar. */
  toolbar: SignalLike<ToolbarPattern<V> | undefined>;

  /** The actions that can be performed on the widget group. */
  actions: SignalLike<ToolbarWidgetGroupActions | undefined>;
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

  /** The actions that can be performed on the widget group. */
  readonly actions: SignalLike<ToolbarWidgetGroupActions> = computed(
    () => this.inputs.actions() ?? this._defaultActions,
  );

  /** A default map of toolbar widget group actions when no hanlder provided. */
  private readonly _defaultActions: ToolbarWidgetGroupActions = {
    next: wrap => ({leaveGroup: !wrap}),
    prev: wrap => ({leaveGroup: !wrap}),
    first: () => {},
    last: () => {},
    unfocus: () => {},
    trigger: () => {},
    goto: () => {},
    asEntryPoint: () => {},
  };

  constructor(readonly inputs: ToolbarWidgetGroupInputs<V>) {
    this.id = inputs.id;
    this.element = inputs.element;
    this.disabled = inputs.disabled;
    this.toolbar = inputs.toolbar;
  }
}
