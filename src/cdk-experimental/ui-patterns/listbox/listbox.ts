/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OptionPattern} from './option';
import {ListSelection, ListSelectionInputs} from '../behaviors/list-selection/list-selection';
import {ListTypeahead, ListTypeaheadInputs} from '../behaviors/list-typeahead/list-typeahead';
import {ListNavigation, ListNavigationInputs} from '../behaviors/list-navigation/list-navigation';
import {ListFocus, ListFocusInputs} from '../behaviors/list-focus/list-focus';
import {computed, Signal} from '@angular/core';
import {ListboxController} from './controller';

/** The required inputs for the listbox. */
export type ListboxInputs = ListNavigationInputs<OptionPattern> &
  ListSelectionInputs<OptionPattern> &
  ListTypeaheadInputs &
  ListFocusInputs<OptionPattern> & {
    disabled: Signal<boolean>;
  };

/** Controls the state of a listbox. */
export class ListboxPattern {
  /** Controls navigation for the listbox. */
  navigation: ListNavigation<OptionPattern>;

  /** Controls selection for the listbox. */
  selection: ListSelection<OptionPattern>;

  /** Controls typeahead for the listbox. */
  typeahead: ListTypeahead<OptionPattern>;

  /** Controls focus for the listbox. */
  focus: ListFocus<OptionPattern>;

  /** Whether the list is vertically or horizontally oriented. */
  orientation: Signal<'vertical' | 'horizontal'>;

  /** Whether the listbox is disabled. */
  disabled: Signal<boolean>;

  /** The tabindex of the listbox. */
  tabindex: Signal<-1 | 0>;

  /** The id of the current active item. */
  activedescendant: Signal<string | null>;

  /** Whether multiple items in the list can be selected at once. */
  multiselectable: Signal<boolean>;

  /** The number of items in the listbox. */
  setsize = computed(() => this.navigation.inputs.items().length);

  get controller(): Promise<ListboxController> {
    if (this._controller === null) {
      return this.loadController();
    }
    return Promise.resolve(this._controller);
  }
  private _controller: ListboxController | null = null;

  constructor(readonly inputs: ListboxInputs) {
    this.disabled = inputs.disabled;
    this.orientation = inputs.orientation;
    this.multiselectable = inputs.multiselectable;

    this.navigation = new ListNavigation(inputs);
    this.selection = new ListSelection({...inputs, navigation: this.navigation});
    this.typeahead = new ListTypeahead({...inputs, navigation: this.navigation});
    this.focus = new ListFocus({...inputs, navigation: this.navigation});

    this.tabindex = this.focus.getListTabindex();
    this.activedescendant = this.focus.getActiveDescendant();
  }

  /** Loads the controller for the listbox. */
  async loadController(): Promise<ListboxController> {
    return import('./controller').then(module => {
      this._controller = new module.ListboxController(this);
      return this._controller;
    });
  }

  /** The keydown handler for the listbox. */
  async onKeydown(event: KeyboardEvent) {
    (await this.controller).onKeydown(event);
  }

  /** The mousedown handler for the listbox. */
  async onMousedown(event: MouseEvent) {
    (await this.controller).onMousedown(event);
  }

  /** The focus handler for the listbox. */
  async onFocus() {
    if (!this._controller) {
      await this.loadController();
      await this.navigation.loadController();
      await this.selection.loadController();
      await this.typeahead.loadController();
      await this.focus.loadController();
    }
  }
}
