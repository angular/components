/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {KeyboardEventManager, PointerEventManager} from '../behaviors/event-manager';
import {List, ListInputs} from '../behaviors/list/list';
import {ToolbarWidgetPattern} from './toolbar-widget';
import {ToolbarWidgetGroupPattern} from './toolbar-widget-group';

/** Represents the required inputs for a toolbar. */
export type ToolbarInputs<V> = Omit<
  ListInputs<ToolbarWidgetPattern<V> | ToolbarWidgetGroupPattern<V>, V>,
  'multi' | 'typeaheadDelay' | 'value' | 'selectionMode' | 'focusMode'
> & {
  /** A function that returns the toolbar item associated with a given element. */
  getItem: (e: Element) => ToolbarWidgetPattern<V> | ToolbarWidgetGroupPattern<V> | undefined;
};

/** Controls the state of a toolbar. */
export class ToolbarPattern<V> {
  /** The list behavior for the toolbar. */
  readonly listBehavior: List<ToolbarWidgetPattern<V> | ToolbarWidgetGroupPattern<V>, V>;

  /** Whether the tablist is vertically or horizontally oriented. */
  readonly orientation: SignalLike<'vertical' | 'horizontal'>;

  /** Whether disabled items in the group should be skipped when navigating. */
  readonly skipDisabled: SignalLike<boolean>;

  /** Whether the toolbar is disabled. */
  readonly disabled = computed(() => this.listBehavior.disabled());

  /** The tabindex of the toolbar (if using activedescendant). */
  readonly tabindex = computed(() => this.listBehavior.tabindex());

  /** The id of the current active widget (if using activedescendant). */
  readonly activedescendant = computed(() => this.listBehavior.activedescendant());

  /** The key used to navigate to the previous widget. */
  private readonly _prevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key used to navigate to the next widget. */
  private readonly _nextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The alternate key used to navigate to the previous widget. */
  private readonly _altPrevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    }
    return 'ArrowUp';
  });

  /** The alternate key used to navigate to the next widget. */
  private readonly _altNextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    }
    return 'ArrowDown';
  });

  /** The keydown event manager for the toolbar. */
  private readonly _keydown = computed(() => {
    const manager = new KeyboardEventManager();

    return manager
      .on(this._nextKey, () => this._next())
      .on(this._prevKey, () => this._prev())
      .on(this._altNextKey, () => this._groupNext())
      .on(this._altPrevKey, () => this._groupPrev())
      .on(' ', () => this._trigger())
      .on('Enter', () => this._trigger())
      .on('Home', () => this._first())
      .on('End', () => this._last());
  });

  /** The pointerdown event manager for the toolbar. */
  private readonly _pointerdown = computed(() => new PointerEventManager().on(e => this._goto(e)));

  /** Navigates to the next widget in the toolbar. */
  private _next() {
    const item = this.inputs.activeItem();
    if (item instanceof ToolbarWidgetGroupPattern) {
      if (!item.disabled() && !item.controls().isOnLastItem()) {
        item.controls().next(false);
        return;
      }
      item.controls().unfocus();
    }

    this.listBehavior.next();
    const newItem = this.inputs.activeItem();
    if (newItem instanceof ToolbarWidgetGroupPattern) {
      newItem.controls().first();
    }
  }

  /** Navigates to the previous widget in the toolbar. */
  private _prev() {
    const item = this.inputs.activeItem();
    if (item instanceof ToolbarWidgetGroupPattern) {
      if (!item.disabled() && !item.controls().isOnFirstItem()) {
        item.controls().prev(false);
        return;
      }
      item.controls().unfocus();
    }

    this.listBehavior.prev();
    const newItem = this.inputs.activeItem();
    if (newItem instanceof ToolbarWidgetGroupPattern) {
      newItem.controls().last();
    }
  }

  private _groupNext() {
    const item = this.inputs.activeItem();
    if (item instanceof ToolbarWidgetPattern) return;
    item?.controls().next(true);
  }

  private _groupPrev() {
    const item = this.inputs.activeItem();
    if (item instanceof ToolbarWidgetPattern) return;
    item?.controls().prev(true);
  }

  /** Triggers the action of the currently active widget. */
  private _trigger() {
    const item = this.inputs.activeItem();
    if (item instanceof ToolbarWidgetGroupPattern) {
      item.controls().trigger();
    }
  }

  /** Navigates to the first widget in the toolbar. */
  private _first() {
    const item = this.inputs.activeItem();
    if (item instanceof ToolbarWidgetGroupPattern) {
      item.controls().unfocus();
    }

    this.listBehavior.first();
    const newItem = this.inputs.activeItem();
    if (newItem instanceof ToolbarWidgetGroupPattern) {
      newItem.controls().first();
    }
  }

  /** Navigates to the last widget in the toolbar. */
  private _last() {
    const item = this.inputs.activeItem();
    if (item instanceof ToolbarWidgetGroupPattern) {
      item.controls().unfocus();
    }

    this.listBehavior.last();
    const newItem = this.inputs.activeItem();
    if (newItem instanceof ToolbarWidgetGroupPattern) {
      newItem.controls().last();
    }
  }

  /** Navigates to the widget targeted by a pointer event. */
  private _goto(e: PointerEvent) {
    const item = this.inputs.getItem(e.target as Element);
    if (!item) return;

    this.listBehavior.goto(item);
    if (item instanceof ToolbarWidgetGroupPattern) {
      item.controls().goto(e);
    }
  }

  constructor(readonly inputs: ToolbarInputs<V>) {
    this.orientation = inputs.orientation;
    this.skipDisabled = inputs.skipDisabled;

    this.listBehavior = new List({
      ...inputs,
      multi: () => false,
      focusMode: () => 'roving',
      selectionMode: () => 'explicit',
      value: signal([] as V[]),
      typeaheadDelay: () => 0, // Toolbar widgets do not support typeahead.
    });
  }

  /** Handles keydown events for the toolbar. */
  onKeydown(event: KeyboardEvent) {
    if (this.disabled()) return;
    this._keydown().handle(event);
  }

  /** Handles pointerdown events for the toolbar. */
  onPointerdown(event: PointerEvent) {
    if (this.disabled()) return;
    this._pointerdown().handle(event);
  }

  /**
   * Sets the toolbar to its default initial state.
   *
   * Sets the active index to the selected widget if one exists and is focusable.
   * Otherwise, sets the active index to the first focusable widget.
   */
  setDefaultState() {
    let firstItem: ToolbarWidgetPattern<V> | ToolbarWidgetGroupPattern<V> | null = null;

    for (const item of this.inputs.items()) {
      if (this.listBehavior.isFocusable(item)) {
        if (!firstItem) {
          firstItem = item;
        }
      }
    }

    if (firstItem) {
      this.inputs.activeItem.set(firstItem);
    }
    if (firstItem instanceof ToolbarWidgetGroupPattern) {
      firstItem.controls().setDefaultState();
    }
  }

  /** Validates the state of the toolbar and returns a list of accessibility violations. */
  validate(): string[] {
    const violations: string[] = [];

    return violations;
  }
}
