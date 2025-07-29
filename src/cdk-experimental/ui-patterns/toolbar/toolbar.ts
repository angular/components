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

    return manager
      .on(' ', () => this.toolbarSelectOverride())
      .on('Enter', () => this.toolbarSelectOverride())
      .on(this.prevKey, () => this.navigation.prev())
      .on(this.nextKey, () => this.navigation.next())
      .on('Home', () => this.navigation.first())
      .on('End', () => this.navigation.last());
  });

  toolbarSelectOverride() {
    const activeItem = this.focusManager.activeItem();

    /** If the active item is a Radio Button, indicate to the group the selection */
    if (activeItem instanceof RadioButtonPattern) {
      const group = activeItem.group();
      if (group && !group.readonly()) {
        group.selection.selectOne();
      }
    } else {
      /** Item is a Toolbar Widget, manually select it */
      if (activeItem.element()) activeItem.element().click();
    }
  }

  /** The pointerdown event manager for the toolbar. */
  pointerdown = computed(() => {
    const manager = new PointerEventManager();

    // Default behavior: navigate and select on click.
    return manager.on(e => this.goto(e));
  });

  /** Navigates to the widget associated with the given pointer event. */
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

    // Assumes the target or its ancestor has role="radio" or role="button"
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
  /** Validates the state of the toolbar and returns a list of accessibility violations. */
  validate(): string[] {
    const violations: string[] = [];

    if (this.inputs.skipDisabled()) {
      for (const item of this.inputs.items()) {
        if (item instanceof RadioButtonPattern && item.selected() && item.disabled()) {
          violations.push(
            "Accessibility Violation: A selected radio button inside the toolbar is disabled while 'skipDisabled' is true, making the selection unreachable via keyboard.",
          );
        }
      }
    }
    return violations;
  }
}

export type ToolbarWidget = {
  id: SignalLike<string>;
  element: SignalLike<HTMLElement>;
  disabled: SignalLike<boolean>;
};

/** Represents the required inputs for a toolbar widget in a toolbar. */
export interface ToolbarWidgetInputs extends ListNavigationItem, ListFocusItem {
  /** A reference to the parent toolbar. */
  parentToolbar: SignalLike<ToolbarPattern<null>>;
}

export class ToolbarWidgetPattern {
  /** A unique identifier for the widget. */
  id: SignalLike<string>;
  /** The html element that should receive focus. */ // might not be needed
  readonly element: SignalLike<HTMLElement>;
  /** Whether the widget is disabled. */
  disabled: SignalLike<boolean>;

  /** A reference to the parent toolbar. */
  parentToolbar: SignalLike<ToolbarPattern<null> | undefined>;

  /** The tabindex of the widgdet. */
  tabindex = computed(() => this.inputs.parentToolbar().focusManager.getItemTabindex(this));

  /** The position of the widget within the group. */
  index = computed(
    () =>
      this.parentToolbar()
        ?.navigation.inputs.items()
        .findIndex(i => i.id() === this.id()) ?? -1,
  );

  /** Whether the widhet is currently the active one (focused). */
  active = computed(() => this.inputs.parentToolbar().focusManager.activeItem() === this);

  constructor(readonly inputs: ToolbarWidgetInputs) {
    this.id = inputs.id;
    this.element = inputs.element;
    this.disabled = inputs.disabled;
    this.parentToolbar = inputs.parentToolbar;
  }
}

export type ToolbarPatternType<V> = InstanceType<typeof ToolbarPattern<V>>;
