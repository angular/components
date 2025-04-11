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
import {OptionPattern} from './option';
import {ListSelection, ListSelectionInputs} from '../behaviors/list-selection/list-selection';
import {ListTypeahead, ListTypeaheadInputs} from '../behaviors/list-typeahead/list-typeahead';
import {ListNavigation, ListNavigationInputs} from '../behaviors/list-navigation/list-navigation';
import {ListFocus, ListFocusInputs} from '../behaviors/list-focus/list-focus';
import {computed} from '@angular/core';
import {SignalLike} from '../behaviors/signal-like/signal-like';

/** The selection operations that the listbox can perform. */
interface SelectOptions {
  select?: boolean;
  toggle?: boolean;
  toggleOne?: boolean;
  selectOne?: boolean;
  selectAll?: boolean;
  selectFromAnchor?: boolean;
  selectFromActive?: boolean;
  toggleFromAnchor?: boolean;
}

/** Represents the required inputs for a listbox. */
export type ListboxInputs<V> = ListNavigationInputs<OptionPattern<V>> &
  ListSelectionInputs<OptionPattern<V>, V> &
  ListTypeaheadInputs &
  ListFocusInputs<OptionPattern<V>> & {
    disabled: SignalLike<boolean>;
    readonly: SignalLike<boolean>;
  };

/** Controls the state of a listbox. */
export class ListboxPattern<V> {
  /** Controls navigation for the listbox. */
  navigation: ListNavigation<OptionPattern<V>>;

  /** Controls selection for the listbox. */
  selection: ListSelection<OptionPattern<V>, V>;

  /** Controls typeahead for the listbox. */
  typeahead: ListTypeahead<OptionPattern<V>>;

  /** Controls focus for the listbox. */
  focusManager: ListFocus<OptionPattern<V>>;

  /** Whether the list is vertically or horizontally oriented. */
  orientation: SignalLike<'vertical' | 'horizontal'>;

  /** Whether the listbox is disabled. */
  disabled: SignalLike<boolean>;

  /** Whether the listbox is readonly. */
  readonly: SignalLike<boolean>;

  /** The tabindex of the listbox. */
  tabindex = computed(() => this.focusManager.getListTabindex());

  /** The id of the current active item. */
  activedescendant = computed(() => this.focusManager.getActiveDescendant());

  /** Whether multiple items in the list can be selected at once. */
  multi: SignalLike<boolean>;

  /** The number of items in the listbox. */
  setsize = computed(() => this.navigation.inputs.items().length);

  /** Whether the listbox selection follows focus. */
  followFocus = computed(() => this.inputs.selectionMode() === 'follow');

  /** The key used to navigate to the previous item in the list. */
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

  /** Represents the space key. Does nothing when the user is actively using typeahead. */
  dynamicSpaceKey = computed(() => (this.typeahead.isTyping() ? '' : ' '));

  /** The regexp used to decide if a key should trigger typeahead. */
  typeaheadRegexp = /^.$/; // TODO: Ignore spaces?

  /** The keydown event manager for the listbox. */
  keydown = computed(() => {
    const manager = new KeyboardEventManager();

    if (this.readonly()) {
      return manager
        .on(this.prevKey, () => this.prev())
        .on(this.nextKey, () => this.next())
        .on('Home', () => this.first())
        .on('End', () => this.last())
        .on(this.typeaheadRegexp, e => this.search(e.key));
    }

    if (!this.followFocus()) {
      manager
        .on(this.prevKey, () => this.prev())
        .on(this.nextKey, () => this.next())
        .on('Home', () => this.first())
        .on('End', () => this.last())
        .on(this.typeaheadRegexp, e => this.search(e.key));
    }

    if (this.followFocus()) {
      manager
        .on(this.prevKey, () => this.prev({selectOne: true}))
        .on(this.nextKey, () => this.next({selectOne: true}))
        .on('Home', () => this.first({selectOne: true}))
        .on('End', () => this.last({selectOne: true}))
        .on(this.typeaheadRegexp, e => this.search(e.key, {selectOne: true}));
    }

    if (this.inputs.multi()) {
      manager
        .on(Modifier.Shift, 'Enter', () => this._updateSelection({selectFromAnchor: true}))
        .on(Modifier.Shift, this.prevKey, () => this.prev({toggle: true}))
        .on(Modifier.Shift, this.nextKey, () => this.next({toggle: true}))
        .on([Modifier.Ctrl, Modifier.Meta], 'A', () => this._updateSelection({selectAll: true}))
        .on([Modifier.Ctrl | Modifier.Shift, Modifier.Meta | Modifier.Shift], 'Home', () =>
          this.first({selectFromActive: true}),
        )
        .on([Modifier.Ctrl | Modifier.Shift, Modifier.Meta | Modifier.Shift], 'End', () =>
          this.last({selectFromActive: true}),
        )
        .on(Modifier.Shift, this.dynamicSpaceKey, () =>
          this._updateSelection({selectFromAnchor: true}),
        );
    }

    if (!this.followFocus() && this.inputs.multi()) {
      manager.on(this.dynamicSpaceKey, () => this._updateSelection({toggle: true}));
      manager.on('Enter', () => this._updateSelection({toggle: true}));
    }

    if (!this.followFocus() && !this.inputs.multi()) {
      manager.on(this.dynamicSpaceKey, () => this._updateSelection({toggleOne: true}));
      manager.on('Enter', () => this._updateSelection({toggleOne: true}));
    }

    if (this.inputs.multi() && this.followFocus()) {
      manager
        .on([Modifier.Ctrl, Modifier.Meta], this.prevKey, () => this.prev())
        .on([Modifier.Ctrl, Modifier.Meta], this.nextKey, () => this.next())
        .on([Modifier.Ctrl, Modifier.Meta], ' ', () => this._updateSelection({toggle: true}))
        .on([Modifier.Ctrl, Modifier.Meta], 'Enter', () => this._updateSelection({toggle: true}))
        .on([Modifier.Ctrl, Modifier.Meta], 'Home', () => this.first()) // TODO: Not in spec but prob should be.
        .on([Modifier.Ctrl, Modifier.Meta], 'End', () => this.last()); // TODO: Not in spec but prob should be.
    }

    return manager;
  });

  /** The pointerdown event manager for the listbox. */
  pointerdown = computed(() => {
    const manager = new PointerEventManager();

    if (this.readonly()) {
      return manager.on(e => this.goto(e));
    }

    if (!this.multi() && this.followFocus()) {
      return manager.on(e => this.goto(e, {selectOne: true}));
    }

    if (!this.multi() && !this.followFocus()) {
      return manager.on(e => this.goto(e, {toggle: true}));
    }

    if (this.multi() && this.followFocus()) {
      return manager
        .on(e => this.goto(e, {selectOne: true}))
        .on(Modifier.Ctrl, e => this.goto(e, {toggle: true}))
        .on(Modifier.Shift, e => this.goto(e, {toggleFromAnchor: true}));
    }

    if (this.multi() && !this.followFocus()) {
      return manager
        .on(e => this.goto(e, {toggle: true}))
        .on(Modifier.Shift, e => this.goto(e, {toggleFromAnchor: true}));
    }

    return manager;
  });

  constructor(readonly inputs: ListboxInputs<V>) {
    this.disabled = inputs.disabled;
    this.readonly = inputs.readonly;
    this.orientation = inputs.orientation;
    this.multi = inputs.multi;

    this.navigation = new ListNavigation(inputs);
    this.selection = new ListSelection({...inputs, navigation: this.navigation});
    this.typeahead = new ListTypeahead({...inputs, navigation: this.navigation});
    this.focusManager = new ListFocus({...inputs, navigation: this.navigation});
  }

  /** Handles keydown events for the listbox. */
  onKeydown(event: KeyboardEvent) {
    if (!this.disabled()) {
      this.keydown().handle(event);
    }
  }

  onPointerdown(event: PointerEvent) {
    if (!this.disabled()) {
      this.pointerdown().handle(event);
    }
  }

  /** Navigates to the first option in the listbox. */
  first(opts?: SelectOptions) {
    this.navigation.first();
    this.focusManager.focus();
    this._updateSelection(opts);
  }

  /** Navigates to the last option in the listbox. */
  last(opts?: SelectOptions) {
    this.navigation.last();
    this.focusManager.focus();
    this._updateSelection(opts);
  }

  /** Navigates to the next option in the listbox. */
  next(opts?: SelectOptions) {
    this.navigation.next();
    this.focusManager.focus();
    this._updateSelection(opts);
  }

  /** Navigates to the previous option in the listbox. */
  prev(opts?: SelectOptions) {
    this.navigation.prev();
    this.focusManager.focus();
    this._updateSelection(opts);
  }

  /** Navigates to the given item in the listbox. */
  goto(event: PointerEvent, opts?: SelectOptions) {
    const item = this._getItem(event);

    if (item) {
      this.navigation.goto(item);
      this.focusManager.focus();
      this._updateSelection(opts);
    }
  }

  /** Handles typeahead search navigation for the listbox. */
  search(char: string, opts?: SelectOptions) {
    this.typeahead.search(char);
    this.focusManager.focus();
    this._updateSelection(opts);
  }

  /** Handles updating selection for the listbox. */
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
    if (opts?.selectAll) {
      this.selection.selectAll();
    }
    if (opts?.selectFromAnchor) {
      this.selection.selectFromPrevSelectedItem();
    }
    if (opts?.selectFromActive) {
      this.selection.selectFromActive();
    }
    if (opts?.toggleFromAnchor) {
      this.selection.toggleFromPrevSelectedItem();
    }
  }

  private _getItem(e: PointerEvent) {
    if (!(e.target instanceof HTMLElement)) {
      return;
    }

    const element = e.target.closest('[role="option"]'); // TODO: Use a different identifier.
    return this.inputs.items().find(i => i.element() === element);
  }
}
