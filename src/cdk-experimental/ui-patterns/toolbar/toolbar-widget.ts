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

/** Represents the required inputs for a toolbar widget in a toolbar. */
export interface ToolbarWidgetInputs<V>
  extends Omit<ListItem<V>, 'searchTerm' | 'value' | 'index'> {
  /** A reference to the parent toolbar. */
  toolbar: SignalLike<ToolbarPattern<V>>;
}

export class ToolbarWidgetPattern<V> implements ListItem<V> {
  /** A unique identifier for the widget. */
  readonly id: SignalLike<string>;

  /** The html element that should receive focus. */
  readonly element: SignalLike<HTMLElement>;

  /** Whether the widget is disabled. */
  readonly disabled: SignalLike<boolean>;

  /** A reference to the parent toolbar. */
  readonly toolbar: SignalLike<ToolbarPattern<V>>;

  /** The tabindex of the widgdet. */
  readonly tabindex = computed(() => this.toolbar().listBehavior.getItemTabindex(this));

  /** The text used by the typeahead search. */
  readonly searchTerm = () => ''; // Unused because toolbar does not support typeahead.

  /** The value associated with the widget. */
  readonly value = () => '' as V; // Unused because toolbar does not support selection.

  /** The position of the widget within the toolbar. */
  readonly index = computed(() => this.toolbar().inputs.items().indexOf(this) ?? -1);

  /** Whether the widget is currently the active one (focused). */
  readonly active = computed(() => this.toolbar().inputs.activeItem() === this);

  constructor(readonly inputs: ToolbarWidgetInputs<V>) {
    this.id = inputs.id;
    this.element = inputs.element;
    this.disabled = inputs.disabled;
    this.toolbar = inputs.toolbar;
  }
}
