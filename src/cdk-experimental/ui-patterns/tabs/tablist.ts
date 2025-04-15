/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {KeyboardEventManager} from '../behaviors/event-manager/keyboard-event-manager';
import {PointerEventManager} from '../behaviors/event-manager/pointer-event-manager';
import {TabPattern} from './tab';
import {ListSelection, ListSelectionInputs} from '../behaviors/list-selection/list-selection';
import {ListNavigation, ListNavigationInputs} from '../behaviors/list-navigation/list-navigation';
import {ListFocus, ListFocusInputs} from '../behaviors/list-focus/list-focus';
import {computed, signal} from '@angular/core';
import {SignalLike} from '../behaviors/signal-like/signal-like';

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
    const manager = new KeyboardEventManager();

    if (this.followFocus()) {
      manager
        .on(this.prevKey, () => this.prev({selectOne: true}))
        .on(this.nextKey, () => this.next({selectOne: true}))
        .on('Home', () => this.first({selectOne: true}))
        .on('End', () => this.last({selectOne: true}));
    } else {
      manager
        .on(this.prevKey, () => this.prev())
        .on(this.nextKey, () => this.next())
        .on('Home', () => this.first())
        .on('End', () => this.last())
        .on(' ', () => this._updateSelection({selectOne: true}))
        .on('Enter', () => this._updateSelection({selectOne: true}));
    }

    return manager;
  });

  /** The pointerdown event manager for the tablist. */
  pointerdown = computed(() => {
    const manager = new PointerEventManager();
    manager.on(e => this.goto(e, {selectOne: true}));

    return manager;
  });

  constructor(readonly inputs: TabListInputs) {
    this.disabled = inputs.disabled;
    this.orientation = inputs.orientation;

    this.navigation = new ListNavigation(inputs);
    this.selection = new ListSelection({
      ...inputs,
      navigation: this.navigation,
      multi: signal(false),
    });
    this.focusManager = new ListFocus({...inputs, navigation: this.navigation});
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
    this.focusManager.focus();
    this._updateSelection(opts);
  }

  /** Navigates to the last option in the tablist. */
  last(opts?: SelectOptions) {
    this.navigation.last();
    this.focusManager.focus();
    this._updateSelection(opts);
  }

  /** Navigates to the next option in the tablist. */
  next(opts?: SelectOptions) {
    this.navigation.next();
    this.focusManager.focus();
    this._updateSelection(opts);
  }

  /** Navigates to the previous option in the tablist. */
  prev(opts?: SelectOptions) {
    this.navigation.prev();
    this.focusManager.focus();
    this._updateSelection(opts);
  }

  /** Navigates to the given item in the tablist. */
  goto(event: PointerEvent, opts?: SelectOptions) {
    const item = this._getItem(event);

    if (item) {
      this.navigation.goto(item);
      this.focusManager.focus();
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
