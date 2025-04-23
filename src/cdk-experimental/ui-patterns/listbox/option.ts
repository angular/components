/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {ListSelection, ListSelectionItem} from '../behaviors/list-selection/list-selection';
import {ListTypeaheadItem} from '../behaviors/list-typeahead/list-typeahead';
import {ListNavigation, ListNavigationItem} from '../behaviors/list-navigation/list-navigation';
import {ListFocus, ListFocusItem} from '../behaviors/list-focus/list-focus';
import {SignalLike} from '../behaviors/signal-like/signal-like';

/**
 * Represents the properties exposed by a listbox that need to be accessed by an option.
 * This exists to avoid circular dependency errors between the listbox and option.
 */
interface ListboxPattern<V> {
  focusManager: ListFocus<OptionPattern<V>>;
  selection: ListSelection<OptionPattern<V>, V>;
  navigation: ListNavigation<OptionPattern<V>>;
}

/** Represents the required inputs for an option in a listbox. */
export interface OptionInputs<V>
  extends ListNavigationItem,
    ListSelectionItem<V>,
    ListTypeaheadItem,
    ListFocusItem {
  listbox: SignalLike<ListboxPattern<V> | undefined>;
}

/** Represents an option in a listbox. */
export class OptionPattern<V> {
  /** A unique identifier for the option. */
  id: SignalLike<string>;

  /** The value of the option. */
  value: SignalLike<V>;

  /** The position of the option in the list. */
  index = computed(
    () =>
      this.listbox()
        ?.navigation.inputs.items()
        .findIndex(i => i.id() === this.id()) ?? -1,
  );

  /** Whether the option is active. */
  active = computed(() => this.listbox()?.focusManager.activeItem() === this);

  /** Whether the option is selected. */
  selected = computed(() => this.listbox()?.selection.inputs.value().includes(this.value()));

  /** Whether the option is disabled. */
  disabled: SignalLike<boolean>;

  /** The text used by the typeahead search. */
  searchTerm: SignalLike<string>;

  /** A reference to the parent listbox. */
  listbox: SignalLike<ListboxPattern<V> | undefined>;

  /** The tabindex of the option. */
  tabindex = computed(() => this.listbox()?.focusManager.getItemTabindex(this));

  /** The html element that should receive focus. */
  element: SignalLike<HTMLElement>;

  constructor(args: OptionInputs<V>) {
    this.id = args.id;
    this.value = args.value;
    this.listbox = args.listbox;
    this.element = args.element;
    this.disabled = args.disabled;
    this.searchTerm = args.searchTerm;
  }
}
