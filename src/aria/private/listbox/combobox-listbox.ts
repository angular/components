/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {ListboxInputs, ListboxPattern} from './listbox';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {OptionPattern} from './option';
import {ComboboxPattern, ComboboxListboxControls} from '../combobox/combobox';

export type ComboboxListboxInputs<V> = ListboxInputs<V> & {
  /** The combobox controlling the listbox. */
  combobox: SignalLike<ComboboxPattern<OptionPattern<V>, V> | undefined>;
};

export class ComboboxListboxPattern<V>
  extends ListboxPattern<V>
  implements ComboboxListboxControls<OptionPattern<V>, V>
{
  /** A unique identifier for the popup. */
  id = computed(() => this.inputs.id());

  /** The ARIA role for the listbox. */
  role = computed(() => 'listbox' as const);

  /** The id of the active (focused) item in the listbox. */
  activeId = computed(() => this.listBehavior.activeDescendant());

  /** The list of options in the listbox. */
  items: SignalLike<OptionPattern<V>[]> = computed(() => this.inputs.items());

  /** The tab index for the listbox. Always -1 because the combobox handles focus. */
  override tabIndex: SignalLike<-1 | 0> = () => -1;

  /** Whether multiple items in the list can be selected at once. */
  override multi = computed(() => {
    return this.inputs.combobox()?.readonly() ? this.inputs.multi() : false;
  });

  constructor(override readonly inputs: ComboboxListboxInputs<V>) {
    if (inputs.combobox()) {
      inputs.focusMode = () => 'activedescendant';
      inputs.element = inputs.combobox()!.inputs.inputEl;
    }

    super(inputs);
  }

  /** Noop. The combobox handles keydown events. */
  override onKeydown(_: KeyboardEvent): void {}

  /** Noop. The combobox handles pointerdown events. */
  override onPointerdown(_: PointerEvent): void {}

  /** Noop. The combobox controls the open state. */
  override setDefaultState(): void {}

  /** Navigates to the specified item in the listbox. */
  focus = (item: OptionPattern<V>, opts?: {focusElement?: boolean}) => {
    this.listBehavior.goto(item, opts);
  };

  /** Navigates to the previous focusable item in the listbox. */
  getActiveItem = () => this.inputs.activeItem();

  /** Navigates to the next focusable item in the listbox. */
  next = () => this.listBehavior.next();

  /** Navigates to the previous focusable item in the listbox. */
  prev = () => this.listBehavior.prev();

  /** Navigates to the last focusable item in the listbox. */
  last = () => this.listBehavior.last();

  /** Navigates to the first focusable item in the listbox. */
  first = () => this.listBehavior.first();

  /** Unfocuses the currently focused item in the listbox. */
  unfocus = () => this.listBehavior.unfocus();

  /** Selects the specified item in the listbox. */
  select = (item?: OptionPattern<V>) => this.listBehavior.select(item);

  /** Toggles the selection state of the given item in the listbox. */
  toggle = (item?: OptionPattern<V>) => this.listBehavior.toggle(item);

  /** Clears the selection in the listbox. */
  clearSelection = () => this.listBehavior.deselectAll();

  /** Retrieves the OptionPattern associated with a pointer event. */
  getItem = (e: PointerEvent) => this._getItem(e);

  /** Retrieves the currently selected items in the listbox. */
  getSelectedItems = () => {
    // NOTE: We need to do this funky for loop to preserve the order of the selected values.
    const items = [];
    for (const value of this.inputs.values()) {
      const item = this.items().find(i => i.value() === value);
      if (item) {
        items.push(item);
      }
    }
    return items;
  };

  /** Sets the value of the combobox listbox. */
  setValue = (value: V | undefined) => this.inputs.values.set(value ? [value] : []);
}
