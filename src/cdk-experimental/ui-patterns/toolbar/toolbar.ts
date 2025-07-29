/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {KeyboardEventManager, PointerEventManager} from '../behaviors/event-manager';
import {ListFocus, ListFocusInputs, ListFocusItem} from '../behaviors/list-focus/list-focus';
import {
  ListNavigation,
  ListNavigationInputs,
  ListNavigationItem,
} from '../behaviors/list-navigation/list-navigation';
import {SignalLike} from '../behaviors/signal-like/signal-like';

import {RadioButtonPatternType, RadioButtonPattern} from '../radio-group/radio-button';

export type ToolbarInputs<V> = ListNavigationInputs<
  RadioButtonPatternType<V> | ToolbarWidgetPattern
> &
  ListFocusInputs<RadioButtonPatternType<V> | ToolbarWidgetPattern> & {
    /** Whether the toolbar is disabled. */
    disabled: SignalLike<boolean>;
  };

export class ToolbarPattern<V> {
  /** Controls navigation for the toolbar. */
  navigation: ListNavigation<RadioButtonPatternType<V> | ToolbarWidgetPattern>;

  /** Controls focus for the toolbar. */
  focusManager: ListFocus<RadioButtonPatternType<V> | ToolbarWidgetPattern>;

  /** Whether the tablist is vertically or horizontally oriented. */
  readonly orientation: SignalLike<'vertical' | 'horizontal'>;

  /** Whether the toolbar is disabled. */
  disabled = computed(() => this.inputs.disabled() || this.focusManager.isListDisabled());

  /** The tabindex of the toolbar (if using activedescendant). */
  tabindex = computed(() => this.focusManager.getListTabindex());

  /** The id of the current active widget (if using activedescendant). */
  activedescendant = computed(() => this.focusManager.getActiveDescendant());

  /** The key used to navigate to the previous widget. */
  prevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key used to navigate to the next widget. */
  nextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The keydown event manager for the toolbar. */
  keydown = computed(() => {
    const manager = new KeyboardEventManager();

    /** When a toolbar widget is active and disabled, prevent selection */
    if (
      this.focusManager.activeItem().disabled() &&
      this.focusManager.activeItem() instanceof ToolbarWidgetPattern
    ) {
      return manager
        .on(' ', () => {})
        .on('Enter', () => {})
        .on(this.prevKey, () => this.navigation.prev())
        .on(this.nextKey, () => this.navigation.next())
        .on('Home', () => this.navigation.first())
        .on('End', () => this.navigation.last());
    }

    /** When in Active Descendant mode, Toolbar controls which group receives selection */
    if (this.inputs.focusMode() === 'activedescendant') {
      manager
        .on(' ', () => this.toolbarSelectOverride())
        .on('Enter', () => this.toolbarSelectOverride());
    }

    return manager
      .on(this.prevKey, () => this.navigation.prev())
      .on(this.nextKey, () => this.navigation.next())
      .on('Home', () => this.navigation.first())
      .on('End', () => this.navigation.last());
  });

  toolbarSelectOverride() {
    const activeItem = this.focusManager.activeItem();

    /** If the active item is a Radio Button, indicate to the group the selection */
    if (activeItem instanceof RadioButtonPattern) {
      if (activeItem.group()) {
        activeItem.group()!!.selection.selectOne();
      }
    } else {
      /** Item is a Toolbar Widget, manually select it */
      activeItem.element().click();
    }
  }

  /** The pointerdown event manager for the toolbar. */
  pointerdown = computed(() => {
    const manager = new PointerEventManager();

    // Default behavior: navigate and select on click.
    return manager.on(e => this.goto(e));
  });

  /** Navigates to the radio button associated with the given pointer event. */
  goto(event: PointerEvent) {
    const item = this._getItem(event);

    this.navigation.goto(item);
  }

  /** Handles keydown events for the toolbar. */
  onKeydown(event: KeyboardEvent) {
    if (!this.disabled()) {
      this.keydown().handle(event);
    }
  }

  /** Handles pointerdown events for the toolbar. */
  onPointerdown(event: PointerEvent) {
    if (!this.disabled()) {
      this.pointerdown().handle(event);
    }
  }

  /** Finds the Toolbar Widget associated with a pointer event target. */
  private _getItem(e: PointerEvent): RadioButtonPatternType<V> | ToolbarWidgetPattern | undefined {
    if (!(e.target instanceof HTMLElement)) {
      return undefined;
    }

    // Assumes the target or its ancestor has role="radio" or button
    const element = e.target.closest('[role="button"], [role="radio"]');
    return this.inputs.items().find(i => i.element() === element);
  }

  constructor(readonly inputs: ToolbarInputs<V>) {
    this.orientation = inputs.orientation;

    this.focusManager = new ListFocus(inputs);
    this.navigation = new ListNavigation({
      ...inputs,
      focusManager: this.focusManager,
    });
  }

  /**
   * Sets the toolbar to its default initial state.
   *
   * Sets the active index to the selected widget if one exists and is focusable.
   * Otherwise, sets the active index to the first focusable widget.
   */
  setDefaultState() {
    let firstItem: RadioButtonPatternType<V> | ToolbarWidgetPattern | null = null;

    for (const item of this.inputs.items()) {
      if (this.focusManager.isFocusable(item)) {
        if (!firstItem) {
          firstItem = item;
        }
        if (item instanceof RadioButtonPattern && item.selected()) {
          this.inputs.activeIndex.set(item.index());
          return;
        }
      }
    }

    if (firstItem) {
      this.inputs.activeIndex.set(firstItem.index());
    }
  }
}

export type ToolbarWidget = {
  id: SignalLike<string>;
  element: SignalLike<HTMLElement>;
  disabled: SignalLike<boolean>;
};

/** Represents the required inputs for a radio button in a radio group. */
export interface ToolbarWidgetInputs extends ListNavigationItem, ListFocusItem {
  /** A reference to the parent radio group. */
  parentToolbar: SignalLike<ToolbarPattern<null> | undefined>;
}

export class ToolbarWidgetPattern {
  /** A unique identifier for the radio button. */
  id: SignalLike<string>;
  /** The html element that should receive focus. */ // might not be needed
  readonly element: SignalLike<HTMLElement>;
  /** Whether the widget is disabled. */
  disabled: SignalLike<boolean>;

  /** A reference to the parent toolbar. */
  parentToolbar: SignalLike<ToolbarPattern<null> | undefined>;

  // expose tab index have tabindex -1 if roving manage 1/0
  /** The tabindex of the radio button. */
  tabindex = computed(() => this.parentToolbar()?.focusManager.getItemTabindex(this));

  /** The position of the widget within the group. */
  index = computed(
    () =>
      this.parentToolbar()
        ?.navigation.inputs.items()
        .findIndex(i => i.id() === this.id()) ?? -1,
  );

  /** Whether the radio button is currently the active one (focused). */
  active = computed(() => this.parentToolbar()?.focusManager.activeItem() === this);

  constructor(readonly inputs: ToolbarWidgetInputs) {
    this.id = inputs.id;
    this.element = inputs.element;
    this.disabled = inputs.disabled;
    this.parentToolbar = inputs.parentToolbar;
  }
}

export type ToolbarPatternType<V> = InstanceType<typeof ToolbarPattern<V>>;
