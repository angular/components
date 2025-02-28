/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Signal} from '@angular/core';
import {ListSelection, ListSelectionItem} from '../behaviors/list-selection/list-selection';
import {ListNavigation, ListNavigationItem} from '../behaviors/list-navigation/list-navigation';
import {ListFocus, ListFocusItem} from '../behaviors/list-focus/list-focus';
import {TabpanelPattern} from './tabpanel';

interface TablistPattern {
  focusManager: ListFocus<TabPattern>;
  selection: ListSelection<TabPattern>;
  navigation: ListNavigation<TabPattern>;
}

/** The required inputs to tabs. */
export interface TabInputs extends ListNavigationItem, ListSelectionItem, ListFocusItem {
  tablist: Signal<TablistPattern>;
  tabpanel: Signal<TabpanelPattern>;
}

/** A tab in a tablist. */
export class TabPattern {
  /** A unique identifier for the tab. */
  id: Signal<string>;

  /** The position of the tab in the list. */
  index = computed(
    () =>
      this.tablist()
        .navigation.inputs.items()
        .findIndex(i => i.id() === this.id()) ?? -1,
  );

  /** Whether the tab is selected. */
  selected = computed(() => this.tablist().selection.inputs.selectedIds().includes(this.id()));

  /** A Tabpanel Id controlled by the tab. */
  controls = computed(() => this.tabpanel().id());

  /** Whether the tab is disabled. */
  disabled: Signal<boolean>;

  /** A reference to the parent tablist. */
  tablist: Signal<TablistPattern>;

  /** A reference to the corresponding tabpanel. */
  tabpanel: Signal<TabpanelPattern>;

  /** The tabindex of the tab. */
  tabindex = computed(() => this.tablist().focusManager.getItemTabindex(this));

  /** The html element that should receive focus. */
  element: Signal<HTMLElement>;

  constructor(args: TabInputs) {
    this.id = args.id;
    this.tablist = args.tablist;
    this.tabpanel = args.tabpanel;
    this.element = args.element;
    this.disabled = args.disabled;
  }
}
