/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal, Signal} from '@angular/core';
import {ListSelectionItem} from '@angular/cdk-experimental/ui-patterns/behaviors/list-selection/list-selection';
import {ListTypeaheadItem} from '@angular/cdk-experimental/ui-patterns/behaviors/list-typeahead/list-typeahead';
import {ListNavigationItem} from '@angular/cdk-experimental/ui-patterns/behaviors/list-navigation/list-navigation';
import {ListFocusItem} from '@angular/cdk-experimental/ui-patterns/behaviors/list-focus/list-focus';
import {ListboxPattern} from './listbox';

/** The required inputs to options. */
export interface OptionInputs
  extends ListNavigationItem,
    ListSelectionItem,
    ListTypeaheadItem,
    ListFocusItem {
  listbox: Signal<ListboxPattern>;
}

let count = 0;

/** An option in a listbox. */
export class OptionPattern {
  /** A unique identifier for the option. */
  id = signal(`${count++}`);

  /** The position of the option in the list. */
  index = computed(
    () =>
      this.listbox()
        .navigation.inputs.items()
        .findIndex(i => i.id() === this.id()) ?? -1,
  );

  /** Whether the option is selected. */
  selected = computed(() => this.listbox().inputs.selectedIds().includes(this.id()));

  /** Whether the option is disabled. */
  disabled: Signal<boolean>;

  /** The text used by the typeahead search. */
  searchTerm: Signal<string>;

  /** A reference to the parent listbox. */
  listbox: Signal<ListboxPattern>;

  /** The tabindex of the option. */
  tabindex: Signal<-1 | 0>;

  /** The html element that should receive focus. */
  element: Signal<HTMLElement>;

  constructor(args: Omit<OptionInputs, 'id'>) {
    this.listbox = args.listbox;
    this.element = args.element;
    this.disabled = args.disabled;
    this.searchTerm = args.searchTerm;
    this.tabindex = this.listbox().focus.getItemTabindex(this);
  }
}
