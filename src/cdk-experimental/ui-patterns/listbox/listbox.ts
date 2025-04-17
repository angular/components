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
import {computed, signal} from '@angular/core';
import {SignalLike} from '../behaviors/signal-like/signal-like';

/** The selection operations that the listbox can perform. */
interface SelectOptions {
  toggle?: boolean;
  selectOne?: boolean;
  selectRange?: boolean;
  anchor?: boolean;
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

  /** Whether the listbox should wrap. Used to disable wrapping while range selecting. */
  wrap = signal(true);

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

  /**
   * The uncommitted index for selecting a range of options.
   *
   * NOTE: This is subtly distinct from the "rangeStartIndex" in the ListSelection behavior.
   * The anchorIndex does not necessarily represent the start of a range, but represents the most
   * recent index where the user showed intent to begin a range selection. Usually, this is wherever
   * the user most recently pressed the "Shift" key, but if the user presses shift + space to select
   * from the anchor, the user is not intending to start a new range from this index.
   *
   * In other words, "rangeStartIndex" is only set when a user commits to starting a range selection
   * while "anchorIndex" is set whenever a user indicates they may be starting a range selection.
   */
  anchorIndex = signal(0);

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
        .on(Modifier.Any, 'Shift', () => this.anchorIndex.set(this.inputs.activeIndex()))
        .on(Modifier.Shift, this.prevKey, () => this.prev({selectRange: true}))
        .on(Modifier.Shift, this.nextKey, () => this.next({selectRange: true}))
        .on([Modifier.Ctrl | Modifier.Shift, Modifier.Meta | Modifier.Shift], 'Home', () =>
          this.first({selectRange: true, anchor: false}),
        )
        .on([Modifier.Ctrl | Modifier.Shift, Modifier.Meta | Modifier.Shift], 'End', () =>
          this.last({selectRange: true, anchor: false}),
        )
        .on(Modifier.Shift, 'Enter', () =>
          this._updateSelection({selectRange: true, anchor: false}),
        )
        .on(Modifier.Shift, this.dynamicSpaceKey, () =>
          this._updateSelection({selectRange: true, anchor: false}),
        );
    }

    if (!this.followFocus() && this.inputs.multi()) {
      manager
        .on(this.dynamicSpaceKey, () => this.selection.toggle())
        .on('Enter', () => this.selection.toggle())
        .on([Modifier.Ctrl, Modifier.Meta], 'A', () => this.selection.toggleAll());
    }

    if (!this.followFocus() && !this.inputs.multi()) {
      manager.on(this.dynamicSpaceKey, () => this.selection.toggleOne());
      manager.on('Enter', () => this.selection.toggleOne());
    }

    if (this.inputs.multi() && this.followFocus()) {
      manager
        .on([Modifier.Ctrl, Modifier.Meta], this.prevKey, () => this.prev())
        .on([Modifier.Ctrl, Modifier.Meta], this.nextKey, () => this.next())
        .on([Modifier.Ctrl, Modifier.Meta], ' ', () => this.selection.toggle())
        .on([Modifier.Ctrl, Modifier.Meta], 'Enter', () => this.selection.toggle())
        .on([Modifier.Ctrl, Modifier.Meta], 'Home', () => this.first())
        .on([Modifier.Ctrl, Modifier.Meta], 'End', () => this.last())
        .on([Modifier.Ctrl, Modifier.Meta], 'A', () => {
          this.selection.toggleAll();
          this.selection.select(); // Ensure the currect option remains selected.
        });
    }

    return manager;
  });

  /** The pointerdown event manager for the listbox. */
  pointerdown = computed(() => {
    const manager = new PointerEventManager();

    if (this.readonly()) {
      return manager.on(e => this.goto(e));
    }

    if (this.multi()) {
      manager.on(Modifier.Shift, e => this.goto(e, {selectRange: true}));
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
        .on(Modifier.Ctrl, e => this.goto(e, {toggle: true}));
    }

    if (this.multi() && !this.followFocus()) {
      return manager.on(e => this.goto(e, {toggle: true}));
    }

    return manager;
  });

  constructor(readonly inputs: ListboxInputs<V>) {
    this.disabled = inputs.disabled;
    this.readonly = inputs.readonly;
    this.orientation = inputs.orientation;
    this.multi = inputs.multi;

    this.navigation = new ListNavigation({
      ...inputs,
      wrap: computed(() => this.wrap() && this.inputs.wrap()),
    });
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
    this._navigate(opts, () => this.navigation.first());
  }

  /** Navigates to the last option in the listbox. */
  last(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigation.last());
  }

  /** Navigates to the next option in the listbox. */
  next(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigation.next());
  }

  /** Navigates to the previous option in the listbox. */
  prev(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigation.prev());
  }

  /** Navigates to the given item in the listbox. */
  goto(event: PointerEvent, opts?: SelectOptions) {
    const item = this._getItem(event);
    this._navigate(opts, () => this.navigation.goto(item));
  }

  /** Handles typeahead search navigation for the listbox. */
  search(char: string, opts?: SelectOptions) {
    this._navigate(opts, () => this.typeahead.search(char));
  }

  /**
   * Safely performs a navigation operation.
   *
   * Handles conditionally disabling wrapping for when a navigation
   * operation is occurring while the user is selecting a range of options.
   *
   * Handles boilerplate calling of focus & selection operations. Also ensures these
   * additional operations are only called if the navigation operation moved focus to a new option.
   */
  private _navigate(opts: SelectOptions = {}, operation: () => boolean) {
    if (opts?.selectRange) {
      this.wrap.set(false);
      this.selection.rangeStartIndex.set(this.anchorIndex());
    }

    const moved = operation();

    if (moved) {
      this.focusManager.focus();
      this._updateSelection(opts);
    }

    this.wrap.set(true);
  }

  /** Handles updating selection for the listbox. */
  private _updateSelection(opts: SelectOptions = {anchor: true}) {
    if (opts.toggle) {
      this.selection.toggle();
    }
    if (opts.selectOne) {
      this.selection.selectOne();
    }
    if (opts.selectRange) {
      this.selection.selectRange();
    }
    if (!opts.anchor) {
      this.anchorIndex.set(this.selection.rangeStartIndex());
    }
  }

  private _getItem(e: PointerEvent) {
    if (!(e.target instanceof HTMLElement)) {
      return;
    }

    const element = e.target.closest('[role="option"]');
    return this.inputs.items().find(i => i.element() === element);
  }
}
