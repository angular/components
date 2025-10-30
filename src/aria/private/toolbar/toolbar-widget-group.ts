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

/** An interface that allows sub patterns to expose the necessary controls for the toolbar. */
export interface ToolbarWidgetGroupControls {
  /** Whether the widget group is currently on the first item. */
  isOnFirstItem(): boolean;

  /** Whether the widget group is currently on the last item. */
  isOnLastItem(): boolean;

  /** Navigates to the next widget in the group. */
  next(wrap: boolean): void;

  /** Navigates to the previous widget in the group. */
  prev(wrap: boolean): void;

  /** Navigates to the first widget in the group. */
  first(): void;

  /** Navigates to the last widget in the group. */
  last(): void;

  /** Removes focus from the widget group. */
  unfocus(): void;

  /** Triggers the action of the currently active widget in the group. */
  trigger(): void;

  /** Navigates to the widget targeted by a pointer event. */
  goto(event: PointerEvent): void;

  /** Sets the widget group to its default initial state. */
  setDefaultState(): void;
}

/** Represents the required inputs for a toolbar widget group. */
export interface ToolbarWidgetGroupInputs<V>
  extends Omit<ListItem<V>, 'searchTerm' | 'value' | 'index' | 'selectable'> {
  /** A reference to the parent toolbar. */
  toolbar: SignalLike<ToolbarPattern<V> | undefined>;

  /** The controls for the sub patterns associated with the toolbar. */
  controls: SignalLike<ToolbarWidgetGroupControls | undefined>;
}

/** A group of widgets within a toolbar that provides nested navigation. */
export class ToolbarWidgetGroupPattern<V> implements ListItem<V> {
  /** A unique identifier for the widget. */
  readonly id: SignalLike<string>;

  /** The html element that should receive focus. */
  readonly element: SignalLike<HTMLElement | undefined>;

  /** Whether the widget is disabled. */
  readonly disabled: SignalLike<boolean>;

  /** A reference to the parent toolbar. */
  readonly toolbar: SignalLike<ToolbarPattern<V> | undefined>;

  /** The text used by the typeahead search. */
  readonly searchTerm = () => ''; // Unused because toolbar does not support typeahead.

  /** The value associated with the widget. */
  readonly value = () => '' as V; // Unused because toolbar does not support selection.

  /** Whether the widget is selectable. */
  readonly selectable = () => true; // Unused because toolbar does not support selection.

  /** The position of the widget within the toolbar. */
  readonly index = computed(() => this.toolbar()?.inputs.items().indexOf(this) ?? -1);

  /** The actions that can be performed on the widget group. */
  readonly controls: SignalLike<ToolbarWidgetGroupControls> = computed(
    () => this.inputs.controls() ?? this._defaultControls,
  );

  /** Default toolbar widget group controls when no controls provided. */
  private readonly _defaultControls: ToolbarWidgetGroupControls = {
    isOnFirstItem: () => true,
    isOnLastItem: () => true,
    next: () => {},
    prev: () => {},
    first: () => {},
    last: () => {},
    unfocus: () => {},
    trigger: () => {},
    goto: () => {},
    setDefaultState: () => {},
  };

  constructor(readonly inputs: ToolbarWidgetGroupInputs<V>) {
    this.id = inputs.id;
    this.element = inputs.element;
    this.disabled = inputs.disabled;
    this.toolbar = inputs.toolbar;
  }
}
