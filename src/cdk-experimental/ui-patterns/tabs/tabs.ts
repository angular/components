/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {KeyboardEventManager} from '../behaviors/event-manager/keyboard-event-manager';
import {PointerEventManager} from '../behaviors/event-manager/pointer-event-manager';
import {ListFocus, ListFocusInputs, ListFocusItem} from '../behaviors/list-focus/list-focus';
import {
  ListNavigation,
  ListNavigationInputs,
  ListNavigationItem,
} from '../behaviors/list-navigation/list-navigation';
import {
  ListSelection,
  ListSelectionInputs,
  ListSelectionItem,
} from '../behaviors/list-selection/list-selection';
import {ExpansionControl, ExpansionPanel} from '../behaviors/expansion/expansion';
import {SignalLike} from '../behaviors/signal-like/signal-like';

/** The required inputs to tabs. */
export interface TabInputs extends ListNavigationItem, ListSelectionItem<string>, ListFocusItem {
  /** The parent tablist that controls the tab. */
  tablist: SignalLike<TabListPattern>;

  /** The remote tabpanel controlled by the tab. */
  tabpanel: SignalLike<TabPanelPattern | undefined>;
}

/** A tab in a tablist. */
export class TabPattern {
  /** A global unique identifier for the tab. */
  id: SignalLike<string>;

  /** A local unique identifier for the tab. */
  value: SignalLike<string>;

  /** Whether the tab is disabled. */
  disabled: SignalLike<boolean>;

  /** The html element that should receive focus. */
  element: SignalLike<HTMLElement>;

  /** Controls the expansion state for the tab.  */
  expansionControl: ExpansionControl;

  /** Whether the tab is active. */
  active = computed(() => this.inputs.tablist().focusManager.activeItem() === this);

  /** Whether the tab is selected. */
  selected = computed(
    () => !!this.inputs.tablist().selection.inputs.value().includes(this.value()),
  );

  /** A tabpanel Id controlled by the tab. */
  controls = computed(() => this.expansionControl.controls());

  /** The tabindex of the tab. */
  tabindex = computed(() => this.inputs.tablist().focusManager.getItemTabindex(this));

  constructor(readonly inputs: TabInputs) {
    this.id = inputs.id;
    this.value = inputs.value;
    this.disabled = inputs.disabled;
    this.element = inputs.element;
    this.expansionControl = new ExpansionControl({
      visible: this.selected,
      expansionPanel: computed(() => inputs.tabpanel()?.expansionPanel),
    });
  }
}

/** The required inputs for the tabpanel. */
export interface TabPanelInputs {
  id: SignalLike<string>;
  tab: SignalLike<TabPattern | undefined>;
  value: SignalLike<string>;
}

/** A tabpanel associated with a tab. */
export class TabPanelPattern {
  /** A global unique identifier for the tabpanel. */
  id: SignalLike<string>;

  /** A local unique identifier for the tabpanel. */
  value: SignalLike<string>;

  /** Represents the expansion state for the tabpanel.  */
  expansionPanel: ExpansionPanel;

  /** Whether the tabpanel is hidden. */
  hidden = computed(() => this.expansionPanel.hidden());

  constructor(inputs: TabPanelInputs) {
    this.id = inputs.id;
    this.value = inputs.value;
    this.expansionPanel = new ExpansionPanel({
      id: inputs.id,
      expansionControl: computed(() => inputs.tab()?.expansionControl),
    });
  }
}

/** The selection operations that the tablist can perform. */
interface SelectOptions {
  select?: boolean;
  toggle?: boolean;
  toggleOne?: boolean;
  selectOne?: boolean;
}

/** The required inputs for the tablist. */
export type TabListInputs = ListNavigationInputs<TabPattern> &
  Omit<ListSelectionInputs<TabPattern, string>, 'multi'> &
  ListFocusInputs<TabPattern> & {
    disabled: SignalLike<boolean>;
  };

/** Controls the state of a tablist. */
export class TabListPattern {
  /** Controls navigation for the tablist. */
  navigation: ListNavigation<TabPattern>;

  /** Controls selection for the tablist. */
  selection: ListSelection<TabPattern, string>;

  /** Controls focus for the tablist. */
  focusManager: ListFocus<TabPattern>;

  /** Whether the tablist is vertically or horizontally oriented. */
  orientation: SignalLike<'vertical' | 'horizontal'>;

  /** Whether the tablist is disabled. */
  disabled: SignalLike<boolean>;

  /** The tabindex of the tablist. */
  tabindex = computed(() => this.focusManager.getListTabindex());

  /** The id of the current active tab. */
  activedescendant = computed(() => this.focusManager.getActiveDescendant());

  /** Whether selection should follow focus. */
  followFocus = computed(() => this.inputs.selectionMode() === 'follow');

  /** The key used to navigate to the previous tab in the tablist. */
  prevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key used to navigate to the next item in the list. */
  nextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The keydown event manager for the tablist. */
  keydown = computed(() => {
    const manager = new KeyboardEventManager()
      .on(this.prevKey, () => this.prev({selectOne: this.followFocus()}))
      .on(this.nextKey, () => this.next({selectOne: this.followFocus()}))
      .on('Home', () => this.first({selectOne: this.followFocus()}))
      .on('End', () => this.last({selectOne: this.followFocus()}))
      .on(' ', () => this.selection.selectOne())
      .on('Enter', () => this.selection.selectOne());

    return manager;
  });

  /** The pointerdown event manager for the tablist. */
  pointerdown = computed(() => {
    return new PointerEventManager().on(e => this.goto(e, {selectOne: true}));
  });

  constructor(readonly inputs: TabListInputs) {
    this.disabled = inputs.disabled;
    this.orientation = inputs.orientation;

    this.focusManager = new ListFocus(inputs);
    this.navigation = new ListNavigation({...inputs, focusManager: this.focusManager});
    this.selection = new ListSelection({
      ...inputs,
      multi: () => false,
      focusManager: this.focusManager,
    });
  }

  /** Handles keydown events for the tablist. */
  onKeydown(event: KeyboardEvent) {
    if (!this.disabled()) {
      this.keydown().handle(event);
    }
  }

  /** The pointerdown event manager for the tablist. */
  onPointerdown(event: PointerEvent) {
    if (!this.disabled()) {
      this.pointerdown().handle(event);
    }
  }

  /** Navigates to the first option in the tablist. */
  first(opts?: SelectOptions) {
    this.navigation.first();
    this._updateSelection(opts);
  }

  /** Navigates to the last option in the tablist. */
  last(opts?: SelectOptions) {
    this.navigation.last();
    this._updateSelection(opts);
  }

  /** Navigates to the next option in the tablist. */
  next(opts?: SelectOptions) {
    this.navigation.next();
    this._updateSelection(opts);
  }

  /** Navigates to the previous option in the tablist. */
  prev(opts?: SelectOptions) {
    this.navigation.prev();
    this._updateSelection(opts);
  }

  /** Navigates to the given item in the tablist. */
  goto(event: PointerEvent, opts?: SelectOptions) {
    const item = this._getItem(event);

    if (item) {
      this.navigation.goto(item);
      this._updateSelection(opts);
    }
  }

  /** Handles updating selection for the tablist. */
  private _updateSelection(opts?: SelectOptions) {
    if (opts?.select) {
      this.selection.select();
    }
    if (opts?.toggle) {
      this.selection.toggle();
    }
    if (opts?.toggleOne) {
      this.selection.toggleOne();
    }
    if (opts?.selectOne) {
      this.selection.selectOne();
    }
  }

  private _getItem(e: PointerEvent) {
    if (!(e.target instanceof HTMLElement)) {
      return;
    }

    const element = e.target.closest('[role="tab"]');
    return this.inputs.items().find(i => i.element() === element);
  }
}
