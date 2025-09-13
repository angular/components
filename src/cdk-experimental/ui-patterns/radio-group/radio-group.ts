/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {KeyboardEventManager, PointerEventManager} from '../behaviors/event-manager';
import {List, ListInputs} from '../behaviors/list/list';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {RadioButtonPattern} from './radio-button';
import type {ToolbarPattern} from '../toolbar/toolbar';
import type {ToolbarWidgetGroupActions} from '../toolbar/toolbar-widget-group';

/** Represents the required inputs for a radio group. */
export type RadioGroupInputs<V> = Omit<
  ListInputs<RadioButtonPattern<V>, V>,
  'multi' | 'selectionMode' | 'wrap' | 'typeaheadDelay'
> & {
  /** Whether the radio group is disabled. */
  disabled: SignalLike<boolean>;

  /** Whether the radio group is readonly. */
  readonly: SignalLike<boolean>;

  /** Parent toolbar of radio group */
  toolbar: SignalLike<ToolbarPattern<V> | undefined>;
};

/** Controls the state of a radio group. */
export class RadioGroupPattern<V> {
  /** The list behavior for the radio group. */
  readonly listBehavior: List<RadioButtonPattern<V>, V>;

  /** Whether the radio group is vertically or horizontally oriented. */
  readonly orientation: SignalLike<'vertical' | 'horizontal'>;

  /** Whether focus should wrap when navigating. */
  readonly wrap = signal(false);

  /** Whether the radio group is disabled. */
  readonly disabled = computed(() => this.inputs.disabled() || this.listBehavior.disabled());

  /** The currently selected radio button. */
  readonly selectedItem = computed(() => this.listBehavior.selectionBehavior.selectedItems()[0]);

  /** Whether the radio group is readonly. */
  readonly readonly = computed(() => this.selectedItem()?.disabled() || this.inputs.readonly());

  /** The tabindex of the radio group. */
  readonly tabindex = computed(() => this.listBehavior.tabindex());

  /** The id of the current active radio button (if using activedescendant). */
  readonly activedescendant = computed(() => this.listBehavior.activedescendant());

  /** The key used to navigate to the previous radio button. */
  private readonly _prevKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowUp';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  });

  /** The key used to navigate to the next radio button. */
  private readonly _nextKey = computed(() => {
    if (this.inputs.orientation() === 'vertical') {
      return 'ArrowDown';
    }
    return this.inputs.textDirection() === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  });

  /** The keydown event manager for the radio group. */
  readonly keydown = computed(() => {
    const manager = new KeyboardEventManager();

    // When within a toolbar relinquish keyboard control
    if (this.inputs.toolbar()) {
      return manager;
    }

    // Readonly mode allows navigation but not selection changes.
    if (this.readonly()) {
      return manager
        .on(this._prevKey, () => this.listBehavior.prev())
        .on(this._nextKey, () => this.listBehavior.next())
        .on('Home', () => this.listBehavior.first())
        .on('End', () => this.listBehavior.last());
    }

    // Default behavior: navigate and select on arrow keys, home, end.
    // Space/Enter also select the focused item.
    return manager
      .on(this._prevKey, () => this.listBehavior.prev({selectOne: true}))
      .on(this._nextKey, () => this.listBehavior.next({selectOne: true}))
      .on('Home', () => this.listBehavior.first({selectOne: true}))
      .on('End', () => this.listBehavior.last({selectOne: true}))
      .on(' ', () => this.listBehavior.selectOne())
      .on('Enter', () => this.listBehavior.selectOne());
  });

  /** The pointerdown event manager for the radio group. */
  readonly pointerdown = computed(() => {
    const manager = new PointerEventManager();

    // When within a toolbar relinquish pointer control
    if (this.inputs.toolbar()) {
      return manager;
    }

    if (this.readonly()) {
      // Navigate focus only in readonly mode.
      return manager.on(e => this.listBehavior.goto(this._getItem(e)!));
    }

    // Default behavior: navigate and select on click.
    return manager.on(e => this.listBehavior.goto(this._getItem(e)!, {selectOne: true}));
  });

  /** The actions that can be performed on the radio group when it's a widget in a toolbar. */
  readonly toolbarWidgetGroupActions: ToolbarWidgetGroupActions = {
    next: wrap => {
      this.wrap.set(wrap);
      const item = this.inputs.activeItem();
      this.listBehavior.next();

      const leaveGroup = item === this.inputs.activeItem();
      if (leaveGroup) {
        this.inputs.activeItem.set(undefined);
      }
      this.wrap.set(false);
      return {
        leaveGroup,
      };
    },
    prev: wrap => {
      this.wrap.set(wrap);
      const item = this.inputs.activeItem();
      this.listBehavior.prev();

      const leaveGroup = item === this.inputs.activeItem();
      if (leaveGroup) {
        this.inputs.activeItem.set(undefined);
      }
      this.wrap.set(false);
      return {
        leaveGroup,
      };
    },
    first: () => {
      this.listBehavior.first();
    },
    last: () => {
      this.listBehavior.last();
    },
    unfocus: () => {
      this.inputs.activeItem.set(undefined);
    },
    trigger: () => {
      if (this.readonly()) return;
      this.listBehavior.selectOne();
    },
    goto: e => {
      this.listBehavior.goto(this._getItem(e)!, {
        selectOne: !this.readonly(),
      });
    },
    asEntryPoint: () => this.setDefaultState(),
  };

  constructor(readonly inputs: RadioGroupInputs<V>) {
    this.orientation = inputs.toolbar() ? inputs.toolbar()!.orientation : inputs.orientation;

    this.listBehavior = new List({
      ...inputs,
      wrap: this.wrap,
      multi: () => false,
      skipDisabled: inputs.toolbar()?.skipDisabled ?? inputs.skipDisabled,
      selectionMode: () => (inputs.toolbar() ? 'explicit' : 'follow'),
      typeaheadDelay: () => 0, // Radio groups do not support typeahead.
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

  /**
   * Sets the radio group to its default initial state.
   *
   * Sets the active index to the selected radio button if one exists and is focusable.
   * Otherwise, sets the active index to the first focusable radio button.
   */
  setDefaultState() {
    let firstItem: RadioButtonPattern<V> | null = null;

    for (const item of this.inputs.items()) {
      if (this.listBehavior.isFocusable(item)) {
        if (!firstItem) {
          firstItem = item;
        }
        if (item.selected()) {
          this.inputs.activeItem.set(item);
          return;
        }
      }
    }

    if (firstItem) {
      this.inputs.activeItem.set(firstItem);
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
