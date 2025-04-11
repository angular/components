/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {ListSelectionItem} from '../behaviors/list-selection/list-selection';
import {ListNavigationItem} from '../behaviors/list-navigation/list-navigation';
import {ListFocusItem} from '../behaviors/list-focus/list-focus';
import {TabPanelPattern} from './tabpanel';
import {TabListPattern} from './tablist';

/** The required inputs to tabs. */
export interface TabInputs extends ListNavigationItem, ListSelectionItem<string>, ListFocusItem {
  tablist: SignalLike<TabListPattern>;
  tabpanel: SignalLike<TabPanelPattern | undefined>;
}

/** A tab in a tablist. */
export class TabPattern {
  /** A global unique identifier for the tab. */
  id: SignalLike<string>;

  /** A local unique identifier for the tab. */
  value: SignalLike<string>;

  /** Whether the tab is selected. */
  selected = computed(() => this.tablist().selection.inputs.value().includes(this.value()));

  /** A Tabpanel Id controlled by the tab. */
  controls = computed(() => this.tabpanel()?.id());

  /** Whether the tab is disabled. */
  disabled: SignalLike<boolean>;

  /** A reference to the parent tablist. */
  tablist: SignalLike<TabListPattern>;

  /** A reference to the corresponding tabpanel. */
  tabpanel: SignalLike<TabPanelPattern | undefined>;

  /** The tabindex of the tab. */
  tabindex = computed(() => this.tablist().focusManager.getItemTabindex(this));

  /** The html element that should receive focus. */
  element: SignalLike<HTMLElement>;

  constructor(inputs: TabInputs) {
    this.id = inputs.id;
    this.value = inputs.value;
    this.tablist = inputs.tablist;
    this.tabpanel = inputs.tabpanel;
    this.element = inputs.element;
    this.disabled = inputs.disabled;
  }
}
