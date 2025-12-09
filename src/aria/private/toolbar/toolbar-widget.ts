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
import {ToolbarWidgetGroupPattern} from './toolbar-widget-group';

/** Represents the required inputs for a toolbar widget in a toolbar. */
export interface ToolbarWidgetInputs<V> extends Omit<
  ListItem<V>,
  'searchTerm' | 'index' | 'selectable'
> {
  /** A reference to the parent toolbar. */
  toolbar: SignalLike<ToolbarPattern<V>>;

  /** A reference to the parent widget group. */
  group: SignalLike<ToolbarWidgetGroupPattern<ToolbarWidgetPattern<V>, V> | undefined>;
}

export class ToolbarWidgetPattern<V> implements ListItem<V> {
  /** A unique identifier for the widget. */
  readonly id = () => this.inputs.id();

  /** The html element that should receive focus. */
  readonly element = () => this.inputs.element();

  /** Whether the widget is disabled. */
  readonly disabled = () => this.inputs.disabled() || this.group()?.disabled() || false;

  /** A reference to the parent toolbar. */
  readonly group = () => this.inputs.group();

  /** A reference to the toolbar containing the widget. */
  readonly toolbar = () => this.inputs.toolbar();

  /** The tabindex of the widget. */
  readonly tabIndex = computed(() => this.toolbar().listBehavior.getItemTabindex(this));

  /** The text used by the typeahead search. */
  readonly searchTerm = () => ''; // Unused because toolbar does not support typeahead.

  /** The value associated with the widget. */
  readonly value = () => this.inputs.value();

  /** Whether the widget is selectable. */
  readonly selectable = () => true; // Unused because toolbar does not support selection.

  /** The position of the widget within the toolbar. */
  readonly index = computed(() => this.toolbar().inputs.items().indexOf(this) ?? -1);

  /** Whether the widget is selected (only relevant in a selection group). */
  readonly selected = computed(() =>
    this.toolbar().listBehavior.inputs.values().includes(this.value()),
  );

  /** Whether the widget is currently the active one (focused). */
  readonly active: SignalLike<boolean> = computed(() => this.toolbar().activeItem() === this);

  constructor(readonly inputs: ToolbarWidgetInputs<V>) {}
}
