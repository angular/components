/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {_getEventTarget} from '@angular/cdk/platform';
import {
  computed,
  signal,
  SignalLike,
  WritableSignalLike,
} from '../behaviors/signal-like/signal-like';
import {KeyboardEventManager} from '../behaviors/event-manager';
import {ListFocus} from '../behaviors/list-focus/list-focus';
import {ListNavigation} from '../behaviors/list-navigation/list-navigation';
import {ToolbarWidgetPattern} from './toolbar-widget';

/** Represents the required inputs for a toolbar. */
export type ToolbarInputs = {
  /** The html element that should receive focus. */
  element: SignalLike<HTMLElement | undefined>;

  /** The active item. */
  activeItem: WritableSignalLike<ToolbarWidgetPattern | undefined>;

  /** The items in the toolbar. */
  items: SignalLike<ToolbarWidgetPattern[]>;

  /** Whether disabled items in the toolbar should be focusable. */
  softDisabled: SignalLike<boolean>;

  /** Whether the toolbar is disabled. */
  disabled: SignalLike<boolean>;

  /** Whether the toolbar is vertically or horizontally oriented. */
  orientation: SignalLike<'vertical' | 'horizontal'>;

  /** The direction that text is read based on the users locale. */
  textDirection: SignalLike<'rtl' | 'ltr'>;

  /** Whether focus should wrap when navigating. */
  wrap: SignalLike<boolean>;

  /** A function that returns the toolbar item associated with a given element. */
  getItem: (e: Element) => ToolbarWidgetPattern | undefined;
};

/** Controls the state of a toolbar. */
export class ToolbarPattern {
  /** Controls focus for the toolbar. */
  readonly focusManager: ListFocus<ToolbarWidgetPattern>;

  /** Controls navigation for the toolbar. */
  readonly navigationBehavior: ListNavigation<ToolbarWidgetPattern>;

  /** Whether the toolbar has been interacted with. */
  readonly hasBeenInteracted = signal(false);

  /** Whether the toolbar is vertically or horizontally oriented. */
  readonly orientation: SignalLike<'vertical' | 'horizontal'>;

  /** Whether disabled items in the group should be focusable. */
  readonly softDisabled: SignalLike<boolean>;

  /** Whether the toolbar is disabled. */
  readonly disabled = computed(() => this.focusManager.isListDisabled());

  /** The tab index of the toolbar. */
  readonly tabIndex = computed(() => this.focusManager.getListTabIndex());

  /** The id of the current active widget. */
  readonly activeDescendant = computed(() => this.focusManager.getActiveDescendant());

  /** The currently active item in the toolbar. */
  readonly activeItem = () => this.inputs.activeItem();

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
    const activeItem = this.inputs.activeItem();

    manager
      .on(this._nextKey, () => this.navigationBehavior.next(), {ignoreRepeat: false})
      .on(this._prevKey, () => this.navigationBehavior.prev(), {ignoreRepeat: false})
      .on('Home', () => this.navigationBehavior.first())
      .on('End', () => this.navigationBehavior.last());

    if (activeItem?.group()) {
      manager
        .on(this._altNextKey, () => this._groupNext(), {ignoreRepeat: false})
        .on(this._altPrevKey, () => this._groupPrev(), {ignoreRepeat: false});
    }

    return manager;
  });

  /** Navigates to the next widget in a widget group. */
  private _groupNext() {
    const currGroup = this.inputs.activeItem()?.group();
    const nextGroup = this.navigationBehavior.peekNext()?.group();

    if (!currGroup) {
      return;
    }

    if (currGroup !== nextGroup) {
      this.navigationBehavior.goto(
        this.navigationBehavior.peekFirst({
          items: currGroup.inputs.items(),
        })!,
      );

      return;
    }

    this.navigationBehavior.next();
  }

  /** Navigates to the previous widget in a widget group. */
  private _groupPrev() {
    const currGroup = this.inputs.activeItem()?.group();
    const nextGroup = this.navigationBehavior.peekPrev()?.group();

    if (!currGroup) {
      return;
    }

    if (currGroup !== nextGroup) {
      this.navigationBehavior.goto(
        this.navigationBehavior.peekLast({
          items: currGroup.inputs.items(),
        })!,
      );

      return;
    }

    this.navigationBehavior.prev();
  }

  /** Navigates to the widget targeted by a pointer event. */
  private _goto(e: MouseEvent) {
    const item = this.inputs.getItem(_getEventTarget(e) as Element);

    if (item) {
      this.navigationBehavior.goto(item);
    }
  }

  constructor(readonly inputs: ToolbarInputs) {
    this.orientation = inputs.orientation;
    this.softDisabled = inputs.softDisabled;

    this.focusManager = new ListFocus({
      ...inputs,
      focusMode: () => 'roving',
    });

    this.navigationBehavior = new ListNavigation({
      ...inputs,
      focusMode: () => 'roving',
      focusManager: this.focusManager,
    });
  }

  /** Handles keydown events for the toolbar. */
  onKeydown(event: KeyboardEvent) {
    if (this.disabled()) return;
    this.hasBeenInteracted.set(true);
    this._keydown().handle(event);
  }

  onPointerdown(event: PointerEvent) {
    this.hasBeenInteracted.set(true);
  }

  onFocusIn() {
    this.hasBeenInteracted.set(true);
  }

  /** Handles click events for the toolbar. */
  onClick(event: MouseEvent) {
    if (this.disabled() || (event as PointerEvent).pointerType === '') return;
    this._goto(event);
  }

  /**
   * Sets the toolbar to its default initial state.
   *
   * Sets the active index to the first focusable widget.
   */
  setDefaultState() {
    const firstItem = this.navigationBehavior.peekFirst({
      items: this.inputs.items(),
    });

    if (firstItem) {
      this.inputs.activeItem.set(firstItem);
    }
  }

  /** Sets the default active state of the toolbar before receiving interaction for the first time. */
  setDefaultStateEffect(): void {
    if (this.hasBeenInteracted()) return;

    if (this.inputs.items().length > 0) {
      this.setDefaultState();
    }
  }
}
