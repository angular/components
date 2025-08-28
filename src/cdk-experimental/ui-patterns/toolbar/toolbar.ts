/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {List, ListInputs} from '../behaviors/list/list';
import {
  ToolbarInstruction,
  ToolbarInstructionHandler,
  ToolbarOperation,
} from './toolbar-interaction';
import {ToolbarWidgetPattern} from './toolbar-widget';
import {ToolbarWidgetGroupPattern} from './toolbar-widget-group';

/** Represents the required inputs for a toolbar. */
export type ToolbarInputs<V> = Omit<
  ListInputs<ToolbarWidgetPattern<V> | ToolbarWidgetGroupPattern<V>, V>,
  'multi' | 'typeaheadDelay' | 'value' | 'selectionMode'
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

  /** A map of toolbar operations to their corresponding instruction handlers. */
  private readonly _actionMap: Record<ToolbarOperation, ToolbarInstructionHandler> = {
    next: i => {
      const item = this.inputs.activeItem();
      if (item instanceof ToolbarWidgetGroupPattern) {
        const {leaveGroup} = item.execute(i) ?? {};
        if (!leaveGroup) return;
      }

      this.listBehavior.next();
      const newItem = this.inputs.activeItem();
      if (newItem instanceof ToolbarWidgetGroupPattern) {
        newItem.execute({
          op: 'enterFromStart',
          metadata: i.metadata,
        });
      }
    },
    prev: i => {
      const item = this.inputs.activeItem();
      if (item instanceof ToolbarWidgetGroupPattern) {
        const {leaveGroup} = item.execute(i) ?? {};
        if (!leaveGroup) return;
      }

      this.listBehavior.prev();
      const newItem = this.inputs.activeItem();
      if (newItem instanceof ToolbarWidgetGroupPattern) {
        newItem.execute({
          op: 'enterFromEnd',
          metadata: i.metadata,
        });
      }
    },
    groupNextWrap: i => {
      const item = this.inputs.activeItem();
      if (item instanceof ToolbarWidgetPattern) return;
      item?.execute(i);
    },
    groupPrevWrap: i => {
      const item = this.inputs.activeItem();
      if (item instanceof ToolbarWidgetPattern) return;
      item?.execute(i);
    },
    home: i => {
      const item = this.inputs.activeItem();
      if (item instanceof ToolbarWidgetGroupPattern) {
        item.execute(i);
      }

      this.listBehavior.first();
      const newItem = this.inputs.activeItem();
      if (newItem instanceof ToolbarWidgetGroupPattern) {
        newItem.execute({
          op: 'enterFromStart',
          metadata: i.metadata,
        });
      }
    },
    end: i => {
      const item = this.inputs.activeItem();
      if (item instanceof ToolbarWidgetGroupPattern) {
        item.execute(i);
      }

      this.listBehavior.last();
      const newItem = this.inputs.activeItem();
      if (newItem instanceof ToolbarWidgetGroupPattern) {
        newItem.execute({
          op: 'enterFromEnd',
          metadata: i.metadata,
        });
      }
    },
    trigger: i => {
      const item = this.inputs.activeItem();
      if (item instanceof ToolbarWidgetGroupPattern) {
        item.execute(i);
        return;
      }
      return {
        stopPropagation: false,
        preventDefault: false,
      };
    },
    goto: i => {
      const item = this.inputs.getItem(i.metadata.event!.target as Element);
      if (!item) return;

      this.listBehavior.goto(item);
      if (item instanceof ToolbarWidgetGroupPattern) {
        item.execute(i);
      }
    },
  };

  constructor(readonly inputs: ToolbarInputs<V>) {
    this.orientation = inputs.orientation;
    this.skipDisabled = inputs.skipDisabled;

    this.listBehavior = new List({
      ...inputs,
      multi: () => false,
      selectionMode: () => 'explicit',
      value: signal([] as V[]),
      typeaheadDelay: () => 0, // Toolbar widgets do not support typeahead.
    });
  }

  /** Executes an instruction on the toolbar. */
  execute(instruction: ToolbarInstruction) {
    if (this.disabled()) return;

    return this._actionMap[instruction.op](instruction);
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
      firstItem.execute({
        op: 'asEntryPoint',
        metadata: {},
      });
    }
  }

  /** Validates the state of the toolbar and returns a list of accessibility violations. */
  validate(): string[] {
    const violations: string[] = [];

    return violations;
  }
}
