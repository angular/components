/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {KeyboardEventManager, PointerEventManager} from '../behaviors/event-manager';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {RadioButtonPattern} from '../radio-group/radio-button';
import {List, ListInputs, ListItem} from '../behaviors/list/list';

/** Represents the required inputs for a toolbar. */
export type ToolbarInputs<V> = Omit<
  ListInputs<ToolbarWidgetPattern | RadioButtonPattern<V>, V>,
  'multi' | 'typeaheadDelay' | 'value' | 'selectionMode'
>;

/** Controls the state of a toolbar. */
export class ToolbarPattern<V> {
  /** The list behavior for the toolbar. */
  listBehavior: List<ToolbarWidgetPattern | RadioButtonPattern<V>, V>;

  /** Whether the tablist is vertically or horizontally oriented. */
  readonly orientation: SignalLike<'vertical' | 'horizontal'>;

  /** Whether the toolbar is disabled. */
  disabled = computed(() => this.listBehavior.disabled());

  /** The tabindex of the toolbar (if using activedescendant). */
  tabindex = computed(() => this.listBehavior.tabindex());

  /** The id of the current active widget (if using activedescendant). */
  activedescendant = computed(() => this.listBehavior.activedescendant());

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

  /** The alternate key used to navigate to the previous widget */
  altPrevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    }
    return 'ArrowUp';
  });

  /** The alternate key used to navigate to the next widget. */
  altNextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    }
    return 'ArrowDown';
  });

  /** The keydown event manager for the toolbar. */
  keydown = computed(() => {
    const manager = new KeyboardEventManager();

    const activeItem = this.inputs.activeItem();
    const isRadioButton = activeItem instanceof RadioButtonPattern;

    if (isRadioButton) {
      manager
        .on(' ', () => this.selectRadioButton())
        .on('Enter', () => this.selectRadioButton())
        .on(this.altNextKey, () => activeItem?.group()?.listBehavior.next())
        .on(this.altPrevKey, () => activeItem?.group()?.listBehavior.prev());
    } else {
      manager.on(this.altNextKey, () => this.listBehavior.next());
      manager.on(this.altPrevKey, () => this.listBehavior.prev());
    }

    return manager
      .on(this.prevKey, () => this.listBehavior.prev())
      .on(this.nextKey, () => this.listBehavior.next())
      .on('Home', () => this.listBehavior.first())
      .on('End', () => this.listBehavior.last());
  });

  selectRadioButton() {
    const activeItem = this.inputs.activeItem() as RadioButtonPattern<V>;

    // activeItem must be a radio button
    const group = activeItem!.group();
    if (group && !group.readonly() && !group.disabled()) {
      group.listBehavior.selectOne();
    }
  }

  /** The pointerdown event manager for the toolbar. */
  pointerdown = computed(() => new PointerEventManager().on(e => this.goto(e)));

  /** Navigates to the widget associated with the given pointer event. */
  goto(event: PointerEvent) {
    const item = this._getItem(event);
    if (!item) return;

    if (item instanceof RadioButtonPattern) {
      const group = item.group();
      if (group && !group.disabled()) {
        group.listBehavior.goto(item, {selectOne: !group.readonly()});
      }
    } else {
      this.listBehavior.goto(item);
    }
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
  private _getItem(e: PointerEvent): RadioButtonPattern<V> | ToolbarWidgetPattern | undefined {
    if (!(e.target instanceof HTMLElement)) {
      return undefined;
    }

    // Assumes the target or its ancestor has role="radio" or role="button"
    const element = e.target.closest('[role="button"], [role="radio"]');
    return this.inputs.items().find(i => i.element() === element);
  }

  constructor(readonly inputs: ToolbarInputs<V>) {
    this.orientation = inputs.orientation;

    this.listBehavior = new List({
      ...inputs,
      multi: () => false,
      selectionMode: () => 'explicit',
      value: signal([] as any),
      typeaheadDelay: () => 0, // Toolbar widgets do not support typeahead.
    });
  }

  /**
   * Sets the toolbar to its default initial state.
   *
   * Sets the active index to the selected widget if one exists and is focusable.
   * Otherwise, sets the active index to the first focusable widget.
   */
  setDefaultState() {
    let firstItem: RadioButtonPattern<V> | ToolbarWidgetPattern | null = null;

    for (const item of this.inputs.items()) {
      if (this.listBehavior.isFocusable(item)) {
        if (!firstItem) {
          firstItem = item;
        }
        if (item instanceof RadioButtonPattern && item.selected()) {
          this.inputs.activeItem.set(item);
          return;
        }
      }
    }

    if (firstItem) {
      this.inputs.activeItem.set(firstItem);
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

/** Represents the required inputs for a toolbar widget in a toolbar. */
export interface ToolbarWidgetInputs extends Omit<ListItem<any>, 'searchTerm' | 'value' | 'index'> {
  /** A reference to the parent toolbar. */
  parentToolbar: SignalLike<ToolbarPattern<null>>;
}

export class ToolbarWidgetPattern {
  /** A unique identifier for the widget. */
  id: SignalLike<string>;

  /** The html element that should receive focus. */
  readonly element: SignalLike<HTMLElement>;

  /** Whether the widget is disabled. */
  disabled: SignalLike<boolean>;

  /** A reference to the parent toolbar. */
  parentToolbar: SignalLike<ToolbarPattern<null> | undefined>;

  /** The tabindex of the widgdet. */
  tabindex = computed(() => this.inputs.parentToolbar().listBehavior.getItemTabindex(this));

  /** The text used by the typeahead search. */
  readonly searchTerm = () => ''; // Unused because toolbar does not support typeahead.

  /** The value associated with the widget. */
  readonly value = () => '' as any; // Unused because toolbar does not support selection.

  /** The position of the widget within the toolbar. */
  index = computed(() => this.parentToolbar()?.inputs.items().indexOf(this) ?? -1);

  /** Whether the widget is currently the active one (focused). */
  active = computed(() => this.parentToolbar()?.inputs.activeItem() === this);

  constructor(readonly inputs: ToolbarWidgetInputs) {
    this.id = inputs.id;
    this.element = inputs.element;
    this.disabled = inputs.disabled;
    this.parentToolbar = inputs.parentToolbar;
  }
}
