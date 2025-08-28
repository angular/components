/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {List, ListInputs} from '../behaviors/list/list';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {RadioButtonPattern} from './radio-button';
import {
  RadioGroupInstruction,
  RadioGroupInstructionHandler,
  RadioGroupOperation,
} from './radio-group-interaction';
import {
  ToolbarWidgetGroupOperation,
  ToolbarWidgetGroupInteractionHandler,
  ToolbarWidgetGroupInstruction,
} from '../toolbar/toolbar-widget-group';

/** Represents the required inputs for a radio group. */
export type RadioGroupInputs<V> = Omit<
  ListInputs<RadioButtonPattern<V>, V>,
  'multi' | 'selectionMode' | 'wrap' | 'typeaheadDelay'
> & {
  /** Whether the radio group is disabled. */
  disabled: SignalLike<boolean>;

  /** Whether the radio group is readonly. */
  readonly: SignalLike<boolean>;
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

  /** A map of radio group operations to their corresponding instruction handlers. */
  private readonly _actionMap: Record<RadioGroupOperation, RadioGroupInstructionHandler> = {
    next: () => this.listBehavior.next({selectOne: !this.readonly()}),
    prev: () => this.listBehavior.prev({selectOne: !this.readonly()}),
    home: () => this.listBehavior.first({selectOne: !this.readonly()}),
    end: () => this.listBehavior.last({selectOne: !this.readonly()}),
    trigger: () => !this.readonly() && this.listBehavior.selectOne(),
    goto: i =>
      this.listBehavior.goto(this._getItem(i.metadata.event as PointerEvent)!, {
        selectOne: !this.readonly(),
      }),
  };

  /** A map of toolbar widget group operations to their corresponding instruction handlers. */
  private readonly _toolbarActionMap: Record<
    ToolbarWidgetGroupOperation,
    ToolbarWidgetGroupInteractionHandler<V>
  > = {
    enterFromStart: () => this.listBehavior.first(),
    enterFromEnd: () => this.listBehavior.last(),
    next: () => {
      const item = this.inputs.activeItem();
      this.listBehavior.next();

      const leaveGroup = item === this.inputs.activeItem();
      if (leaveGroup) {
        this.inputs.activeItem.set(undefined);
      }
      return {
        leaveGroup,
      };
    },
    prev: () => {
      const item = this.inputs.activeItem();
      this.listBehavior.prev();

      const leaveGroup = item === this.inputs.activeItem();
      if (leaveGroup) {
        this.inputs.activeItem.set(undefined);
      }
      return {
        leaveGroup,
      };
    },
    groupNextWrap: () => {
      this.wrap.set(true);
      this.listBehavior.next();
      this.wrap.set(false);
    },
    groupPrevWrap: () => {
      this.wrap.set(true);
      this.listBehavior.prev();
      this.wrap.set(false);
    },
    home: () => this.inputs.activeItem.set(undefined),
    end: () => this.inputs.activeItem.set(undefined),
    trigger: i => this.execute({op: 'trigger', metadata: i.metadata}),
    goto: i => this.execute({op: 'goto', metadata: i.metadata}),
    asEntryPoint: () => this.setDefaultState(),
  };

  constructor(readonly inputs: RadioGroupInputs<V>) {
    this.orientation = inputs.orientation;

    this.listBehavior = new List({
      ...inputs,
      wrap: this.wrap,
      multi: () => false,
      selectionMode: () => 'follow',
      typeaheadDelay: () => 0, // Radio groups do not support typeahead.
    });
  }

  /** Executes an instruction on the radio group. */
  execute(instruction: RadioGroupInstruction) {
    if (this.disabled()) return;

    return this._actionMap[instruction.op](instruction);
  }

  /** Executes an instruction on the radio group as a toolbar widget group. */
  toolbarExecute(instruction: ToolbarWidgetGroupInstruction<V>) {
    if (this.disabled()) return;

    return this._toolbarActionMap[instruction.op](instruction);
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
