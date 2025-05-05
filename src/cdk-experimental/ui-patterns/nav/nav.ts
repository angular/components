/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ModifierKey as Modifier} from '../behaviors/event-manager/event-manager';
import {KeyboardEventManager} from '../behaviors/event-manager/keyboard-event-manager';
import {PointerEventManager} from '../behaviors/event-manager/pointer-event-manager';
import {LinkPattern} from './link';
import {ListSelection, ListSelectionInputs} from '../behaviors/list-selection/list-selection';
import {ListTypeahead, ListTypeaheadInputs} from '../behaviors/list-typeahead/list-typeahead';
import {ListNavigation, ListNavigationInputs} from '../behaviors/list-navigation/list-navigation';
import {ListFocus, ListFocusInputs} from '../behaviors/list-focus/list-focus';
import {computed, signal} from '@angular/core';

/** The selection operations that the nav can perform. */
interface SelectOptions {
  selectOne?: boolean;
}

/** Represents the required inputs for a nav. */
export type NavInputs<V> = ListNavigationInputs<LinkPattern<V>> &
  ListSelectionInputs<LinkPattern<V>, V> &
  ListTypeaheadInputs<LinkPattern<V>> &
  ListFocusInputs<LinkPattern<V>>;

/** Controls the state of a nav. */
export class NavPattern<V> {
  /** Controls navigation for the nav. */
  navigation: ListNavigation<LinkPattern<V>>;

  /** Controls selection for the nav. */
  selection: ListSelection<LinkPattern<V>, V>;

  /** Controls typeahead for the nav. */
  typeahead: ListTypeahead<LinkPattern<V>>;

  /** Controls focus for the nav. */
  focusManager: ListFocus<LinkPattern<V>>;

  /** Whether the nav is disabled. */
  disabled = computed(() => this.focusManager.isListDisabled());

  /** The tabindex of the nav. */
  tabindex = computed(() => this.focusManager.getListTabindex());

  /** The id of the current active item. */
  activedescendant = computed(() => this.focusManager.getActiveDescendant());

  /** The number of items in the nav. */
  setsize = computed(() => this.navigation.inputs.items().length);

  /** The key used to navigate to the previous item in the list. */
  prevKey = computed(() => {
    // Nav is typically vertical, but respect orientation if provided.
    if (this.inputs.orientation() === 'horizontal') {
      return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    }
    return 'ArrowUp';
  });

  /** The key used to navigate to the next item in the list. */
  nextKey = computed(() => {
    // Nav is typically vertical, but respect orientation if provided.
    if (this.inputs.orientation() === 'horizontal') {
      return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    }
    return 'ArrowDown';
  });

  /** Represents the space key. Does nothing when the user is actively using typeahead. */
  dynamicSpaceKey = computed(() => (this.typeahead.isTyping() ? '' : ' '));

  /** The regexp used to decide if a key should trigger typeahead. */
  typeaheadRegexp = /^.$/; // TODO: Ignore spaces?

  /** The keydown event manager for the nav. */
  keydown = computed(() => {
    return new KeyboardEventManager()
      .on(this.prevKey, () => this.prev({selectOne: true}))
      .on(this.nextKey, () => this.next({selectOne: true}))
      .on('Home', () => this.first({selectOne: true}))
      .on('End', () => this.last({selectOne: true}))
      .on(this.typeaheadRegexp, e => this.search(e.key, {selectOne: true}))
      .on(this.dynamicSpaceKey, () => this.selection.selectOne()) // Activate link
      .on('Enter', () => this.selection.selectOne()); // Activate link
  });

  /** The pointerdown event manager for the nav. */
  pointerdown = computed(() => {
    const manager = new PointerEventManager();
    manager.on(e => this.goto(e, {selectOne: true}));
    return manager;
  });

  constructor(readonly inputs: NavInputs<V>) {
    this.focusManager = new ListFocus(inputs);
    // Nav always uses 'follow' selection mode and is single-select.
    this.selection = new ListSelection({
      ...inputs,
      focusManager: this.focusManager,
      multi: signal(false),
      selectionMode: signal('follow'),
    });
    this.typeahead = new ListTypeahead({...inputs, focusManager: this.focusManager});
    this.navigation = new ListNavigation({
      ...inputs,
      focusManager: this.focusManager,
      // Nav wrapping is typically desired.
      wrap: computed(() => this.inputs.wrap()),
    });
  }

  /** Handles keydown events for the nav. */
  onKeydown(event: KeyboardEvent) {
    if (!this.disabled()) {
      this.keydown().handle(event);
    }
  }

  /** Handles pointerdown events for the nav. */
  onPointerdown(event: PointerEvent) {
    if (!this.disabled()) {
      this.pointerdown().handle(event);
    }
  }

  /** Navigates to the first link in the nav. */
  first(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigation.first());
  }

  /** Navigates to the last link in the nav. */
  last(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigation.last());
  }

  /** Navigates to the next link in the nav. */
  next(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigation.next());
  }

  /** Navigates to the previous link in the nav. */
  prev(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigation.prev());
  }

  /** Navigates to the given link in the nav. */
  goto(event: PointerEvent, opts?: SelectOptions) {
    const item = this._getItem(event);
    this._navigate(opts, () => this.navigation.goto(item));
  }

  /** Handles typeahead search navigation for the nav. */
  search(char: string, opts?: SelectOptions) {
    this._navigate(opts, () => this.typeahead.search(char));
  }

  /**
   * Sets the nav to its default initial state.
   *
   * Sets the active index of the nav to the first focusable selected
   * item if one exists. Otherwise, sets focus to the first focusable item.
   *
   * This method should be called once the nav and its links are properly initialized.
   */
  setDefaultState() {
    let firstItem: LinkPattern<V> | null = null;

    for (const item of this.inputs.items()) {
      if (this.focusManager.isFocusable(item)) {
        if (!firstItem) {
          firstItem = item;
        }
        if (item.selected()) {
          this.inputs.activeIndex.set(item.index());
          return;
        }
      }
    }

    if (firstItem) {
      this.inputs.activeIndex.set(firstItem.index());
    }
  }

  /**
   * Safely performs a navigation operation.
   *
   * Handles boilerplate calling of focus & selection operations. Also ensures these
   * additional operations are only called if the navigation operation moved focus to a new link.
   */
  private _navigate(opts: SelectOptions = {}, operation: () => boolean) {
    const moved = operation();

    if (moved) {
      this._updateSelection(opts);
    }
  }

  /** Handles updating selection for the nav. */
  private _updateSelection(opts: SelectOptions = {}) {
    // In nav, navigation always implies selection (activation).
    if (opts.selectOne) {
      this.selection.selectOne();
    }
  }

  /** Gets the LinkPattern associated with a pointer event target. */
  private _getItem(e: PointerEvent) {
    if (!(e.target instanceof HTMLElement)) {
      return;
    }

    // Assuming links have a role or specific attribute to identify them.
    // Adjust selector as needed based on actual link implementation.
    const element = e.target.closest('[role="link"], [cdkLink]');
    return this.inputs.items().find(i => i.element() === element);
  }
}
