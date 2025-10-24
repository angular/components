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
import type {RadioGroupPattern} from './radio-group';

/** Represents the required inputs for a radio button in a radio group. */
export interface RadioButtonInputs<V>
  extends Omit<ListItem<V>, 'searchTerm' | 'index' | 'selectable'> {
  /** A reference to the parent radio group. */
  group: SignalLike<RadioGroupPattern<V> | undefined>;
}

/** Represents a radio button within a radio group. */
export class RadioButtonPattern<V> {
  /** A unique identifier for the radio button. */
  readonly id: SignalLike<string>;

  /** The value associated with the radio button. */
  readonly value: SignalLike<V>;

  /** The position of the radio button within the group. */
  readonly index: SignalLike<number> = computed(
    () => this.group()?.listBehavior.inputs.items().indexOf(this) ?? -1,
  );

  /** Whether the radio button is currently the active one (focused). */
  readonly active = computed(() => this.group()?.listBehavior.inputs.activeItem() === this);

  /** Whether the radio button is selected. */
  readonly selected: SignalLike<boolean> = computed(
    () => !!this.group()?.listBehavior.inputs.value().includes(this.value()),
  );

  /** Whether the radio button is selectable. */
  readonly selectable = () => true;

  /** Whether the radio button is disabled. */
  readonly disabled: SignalLike<boolean>;

  /** A reference to the parent radio group. */
  readonly group: SignalLike<RadioGroupPattern<V> | undefined>;

  /** The tabindex of the radio button. */
  readonly tabindex = computed(() => this.group()?.listBehavior.getItemTabindex(this));

  /** The HTML element associated with the radio button. */
  readonly element: SignalLike<HTMLElement>;

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
