/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, SignalLike} from '../behaviors/signal-like/signal-like';
import {KeyboardEventManager} from '../behaviors/event-manager';
import {List, ListInputs} from '../behaviors/list/list';
import {ToolbarWidgetPattern} from './toolbar-widget';

/** Represents the required inputs for a toolbar. */
export type ToolbarInputs<V> = Omit<
  ListInputs<ToolbarWidgetPattern<V>, V>,
  'multi' | 'typeaheadDelay' | 'selectionMode' | 'focusMode'
> & {
  /** A function that returns the toolbar item associated with a given element. */
  getItem: (e: Element) => ToolbarWidgetPattern<V> | undefined;
};

/** Controls the state of a toolbar. */
export class ToolbarPattern<V> {
  /** The list behavior for the toolbar. */
  readonly listBehavior: List<ToolbarWidgetPattern<V>, V>;

  /** Whether the tablist is vertically or horizontally oriented. */
  readonly orientation: SignalLike<'vertical' | 'horizontal'>;

  /** Whether disabled items in the group should be focusable. */
  readonly softDisabled: SignalLike<boolean>;

  /** Whether the toolbar is disabled. */
  readonly disabled = computed(() => this.listBehavior.disabled());

  /** The tab index of the toolbar (if using activedescendant). */
  readonly tabIndex = computed(() => this.listBehavior.tabIndex());

  /** The id of the current active widget (if using activedescendant). */
  readonly activeDescendant = computed(() => this.listBehavior.activeDescendant());

  /** The currently active item in the toolbar. */
  readonly activeItem = () => this.listBehavior.inputs.activeItem();

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
      .on(this._nextKey, () => this.listBehavior.next())
      .on(this._prevKey, () => this.listBehavior.prev())
      .on(this._altNextKey, () => this._groupNext())
      .on(this._altPrevKey, () => this._groupPrev())
      .on(' ', () => this.select())
      .on('Enter', () => this.select())
      .on('Home', () => this.listBehavior.first())
      .on('End', () => this.listBehavior.last());
  });

  /** Navigates to the next widget in a widget group. */
  private _groupNext() {
    const currGroup = this.inputs.activeItem()?.group();
    const nextGroup = this.listBehavior.navigationBehavior.peekNext()?.group();

    if (!currGroup) {
      return;
    }

    if (currGroup !== nextGroup) {
      this.listBehavior.goto(
        this.listBehavior.navigationBehavior.peekFirst({
          items: currGroup.inputs.items(),
        })!,
      );

      return;
    }

    this.listBehavior.next();
  }

  /** Navigates to the previous widget in a widget group. */
  private _groupPrev() {
    const currGroup = this.inputs.activeItem()?.group();
    const nextGroup = this.listBehavior.navigationBehavior.peekPrev()?.group();

    if (!currGroup) {
      return;
    }

    if (currGroup !== nextGroup) {
      this.listBehavior.goto(
        this.listBehavior.navigationBehavior.peekLast({
          items: currGroup.inputs.items(),
        })!,
      );

      return;
    }

    this.listBehavior.prev();
  }

  /** Navigates to the widget targeted by a pointer event. */
  private _goto(e: MouseEvent) {
    const item = this.inputs.getItem(e.target as Element);

    if (item) {
      this.listBehavior.goto(item);
      this.select();
    }
  }

  select() {
    const group = this.inputs.activeItem()?.group();

    if (!group?.multi()) {
      group?.inputs.items().forEach(i => this.listBehavior.deselect(i));
    }

    this.listBehavior.toggle();
  }

  constructor(readonly inputs: ToolbarInputs<V>) {
    this.orientation = inputs.orientation;
    this.softDisabled = inputs.softDisabled;

    this.listBehavior = new List({
      ...inputs,
      multi: () => true,
      focusMode: () => 'roving',
      selectionMode: () => 'explicit',
      typeaheadDelay: () => 0, // Toolbar widgets do not support typeahead.
    });
  }

  /** Handles keydown events for the toolbar. */
  onKeydown(event: KeyboardEvent) {
    if (this.disabled()) return;
    this._keydown().handle(event);
  }

  onPointerdown(event: PointerEvent) {
    event.preventDefault();
  }

  /** Handles click events for the toolbar. */
  onClick(event: MouseEvent) {
    if (this.disabled()) return;
    this._goto(event);
  }

  /**
   * Sets the toolbar to its default initial state.
   *
   * Sets the active index to the selected widget if one exists and is focusable.
   * Otherwise, sets the active index to the first focusable widget.
   */
  setDefaultState() {
    const firstItem = this.listBehavior.navigationBehavior.peekFirst({
      items: this.inputs.items(),
    });

    if (firstItem) {
      this.inputs.activeItem.set(firstItem);
    }
  }
}
