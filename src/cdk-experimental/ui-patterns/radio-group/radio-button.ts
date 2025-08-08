/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {List, ListItem} from '../behaviors/list/list';

/**
 * Represents the properties exposed by a toolbar widget that need to be accessed by a radio group.
 * This exists to avoid circular dependency errors between the toolbar and radio button.
 */
type ToolbarWidgetLike = {
  id: SignalLike<string>;
  index: SignalLike<number>;
  element: SignalLike<HTMLElement>;
  disabled: SignalLike<boolean>;
  searchTerm: SignalLike<any>;
  value: SignalLike<any>;
};

/**
 * Represents the properties exposed by a radio group that need to be accessed by a radio button.
 * This exists to avoid circular dependency errors between the radio group and radio button.
 */
interface RadioGroupLike<V> {
  /** The list behavior for the radio group. */
  listBehavior: List<RadioButtonPattern<V> | ToolbarWidgetLike, V>;
  /** Whether the list is readonly */
  readonly: SignalLike<boolean>;
  /** Whether the radio group is disabled. */
  disabled: SignalLike<boolean>;
}

/** Represents the required inputs for a radio button in a radio group. */
export interface RadioButtonInputs<V> extends Omit<ListItem<V>, 'searchTerm' | 'index'> {
  /** A reference to the parent radio group. */
  group: SignalLike<RadioGroupLike<V> | undefined>;
}

/** Represents a radio button within a radio group. */
export class RadioButtonPattern<V> {
  /** A unique identifier for the radio button. */
  id: SignalLike<string>;

  /** The value associated with the radio button. */
  value: SignalLike<V>;

  /** The position of the radio button within the group. */
  index: SignalLike<number> = computed(
    () => this.group()?.listBehavior.inputs.items().indexOf(this) ?? -1,
  );

  /** Whether the radio button is currently the active one (focused). */
  active = computed(() => this.group()?.listBehavior.inputs.activeItem() === this);

  /** Whether the radio button is selected. */
  selected: SignalLike<boolean> = computed(
    () => !!this.group()?.listBehavior.inputs.value().includes(this.value()),
  );

  /** Whether the radio button is disabled. */
  disabled: SignalLike<boolean>;

  /** A reference to the parent radio group. */
  group: SignalLike<RadioGroupLike<V> | undefined>;

  /** The tabindex of the radio button. */
  tabindex = computed(() => this.group()?.listBehavior.getItemTabindex(this));

  /** The HTML element associated with the radio button. */
  element: SignalLike<HTMLElement>;

  /** The search term for typeahead. */
  readonly searchTerm = () => ''; // Radio groups do not support typeahead.

  constructor(readonly inputs: RadioButtonInputs<V>) {
    this.id = inputs.id;
    this.value = inputs.value;
    this.group = inputs.group;
    this.element = inputs.element;
    this.disabled = inputs.disabled;
  }
}
