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
import {ListFocus, ListFocusInputs} from '../behaviors/list-focus/list-focus';
import {ListNavigation, ListNavigationInputs} from '../behaviors/list-navigation/list-navigation';
import {ListSelection, ListSelectionInputs} from '../behaviors/list-selection/list-selection';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {RadioButtonPattern} from './radio';

/** The selection operations that the radio group can perform. */
interface SelectOptions {
  selectOne?: boolean;
}

/** Represents the required inputs for a radio group. */
export type RadioGroupInputs<V> = Omit<ListNavigationInputs<RadioButtonPattern<V>>, 'wrap'> &
  // Radio groups are always single-select.
  Omit<ListSelectionInputs<RadioButtonPattern<V>, V>, 'multi' | 'selectionMode'> &
  ListFocusInputs<RadioButtonPattern<V>> & {
    /** Whether the radio group is disabled. */
    disabled: SignalLike<boolean>;
    /** Whether the radio group is readonly. */
    readonly: SignalLike<boolean>;
  };

/** Controls the state of a radio group. */
export class RadioGroupPattern<V> {
  /** Controls navigation for the radio group. */
  navigation: ListNavigation<RadioButtonPattern<V>>;

  /** Controls selection for the radio group. */
  selection: ListSelection<RadioButtonPattern<V>, V>;

  /** Controls focus for the radio group. */
  focusManager: ListFocus<RadioButtonPattern<V>>;

  /** Whether the radio group is vertically or horizontally oriented. */
  orientation: SignalLike<'vertical' | 'horizontal'>;

  /** Whether the radio group is disabled. */
  disabled = computed(() => this.inputs.disabled() || this.focusManager.isListDisabled());

  /** The currently selected radio button. */
  selectedItem = computed(() => this.selection.selectedItems()[0]);

  /** Whether the radio group is readonly. */
  readonly = computed(() => this.selectedItem()?.disabled() || this.inputs.readonly());

  /** The tabindex of the radio group (if using activedescendant). */
  tabindex = computed(() => this.focusManager.getListTabindex());

  /** The id of the current active radio button (if using activedescendant). */
  activedescendant = computed(() => this.focusManager.getActiveDescendant());

  /** The key used to navigate to the previous radio button. */
  prevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key used to navigate to the next radio button. */
  nextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The keydown event manager for the radio group. */
  keydown = computed(() => {
    const manager = new KeyboardEventManager();

    // Readonly mode allows navigation but not selection changes.
    if (this.readonly()) {
      return manager
        .on(this.prevKey, () => this.prev())
        .on(this.nextKey, () => this.next())
        .on('Home', () => this.first())
        .on('End', () => this.last());
    }

    // Default behavior: navigate and select on arrow keys, home, end.
    // Space/Enter also select the focused item.
    return manager
      .on(this.prevKey, () => this.prev({selectOne: true}))
      .on(this.nextKey, () => this.next({selectOne: true}))
      .on('Home', () => this.first({selectOne: true}))
      .on('End', () => this.last({selectOne: true}))
      .on(' ', () => this.selection.selectOne())
      .on('Enter', () => this.selection.selectOne());
  });

  /** The pointerdown event manager for the radio group. */
  pointerdown = computed(() => {
    const manager = new PointerEventManager();

    if (this.readonly()) {
      // Navigate focus only in readonly mode.
      return manager.on(e => this.goto(e));
    }

    // Default behavior: navigate and select on click.
    return manager.on(e => this.goto(e, {selectOne: true}));
  });

  constructor(readonly inputs: RadioGroupInputs<V>) {
    this.orientation = inputs.orientation;

    this.focusManager = new ListFocus(inputs);
    this.navigation = new ListNavigation({
      ...inputs,
      wrap: () => false,
      focusManager: this.focusManager,
    });
    this.selection = new ListSelection({
      ...inputs,
      multi: () => false,
      selectionMode: () => 'follow',
      focusManager: this.focusManager,
    });
  }

  /** Handles keydown events for the radio group. */
  onKeydown(event: KeyboardEvent) {
    if (!this.disabled()) {
      this.keydown().handle(event);
    }
  }

  /** Handles pointerdown events for the radio group. */
  onPointerdown(event: PointerEvent) {
    if (!this.disabled()) {
      this.pointerdown().handle(event);
    }
  }

  /** Navigates to the first enabled radio button in the group. */
  first(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigation.first());
  }

  /** Navigates to the last enabled radio button in the group. */
  last(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigation.last());
  }

  /** Navigates to the next enabled radio button in the group. */
  next(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigation.next());
  }

  /** Navigates to the previous enabled radio button in the group. */
  prev(opts?: SelectOptions) {
    this._navigate(opts, () => this.navigation.prev());
  }

  /** Navigates to the radio button associated with the given pointer event. */
  goto(event: PointerEvent, opts?: SelectOptions) {
    const item = this._getItem(event);
    this._navigate(opts, () => this.navigation.goto(item));
  }

  /**
   * Sets the radio group to its default initial state.
   *
   * Sets the active index to the selected radio button if one exists and is focusable.
   * Otherwise, sets the active index to the first focusable radio button.
   */
  setDefaultState() {
    let firstItem: RadioButtonPattern<V> | null = null;

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

  /** Validates the state of the radio group and returns a list of accessibility violations. */
  validate(): string[] {
    const violations: string[] = [];

    if (this.selectedItem()?.disabled() && this.inputs.skipDisabled()) {
      violations.push(
        "Accessibility Violation: The selected radio button is disabled while 'skipDisabled' is true, making the selection unreachable via keyboard.",
      );
    }

    return violations;
  }

  /** Safely performs a navigation operation and updates selection if needed. */
  private _navigate(opts: SelectOptions = {}, operation: () => boolean) {
    const moved = operation();
    if (moved && opts.selectOne) {
      this.selection.selectOne();
    }
  }

  /** Finds the RadioButtonPattern associated with a pointer event target. */
  private _getItem(e: PointerEvent): RadioButtonPattern<V> | undefined {
    if (!(e.target instanceof HTMLElement)) {
      return undefined;
    }

    // Assumes the target or its ancestor has role="radio"
    const element = e.target.closest('[role="radio"]');
    return this.inputs.items().find(i => i.element() === element);
  }
}
