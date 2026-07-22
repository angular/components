/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {KeyboardEventManager, Modifier} from '../behaviors/event-manager';
import {ListNavigationItem} from '../behaviors/list-navigation/list-navigation';
import {
  SignalLike,
  computed,
  signal,
  WritableSignalLike,
} from '../behaviors/signal-like/signal-like';
import type {GridCellPattern} from './cell';

/** The inputs for the `GridCellWidgetPattern`. */
export interface GridCellWidgetInputs extends Omit<ListNavigationItem, 'index'> {
  /** The `GridCellPattern` that this widget belongs to. */
  cell: SignalLike<GridCellPattern>;

  /** The html element that should receive focus. */
  element: SignalLike<HTMLElement>;

  /** The type of widget, which determines how it is activated. */
  widgetType: SignalLike<'simple' | 'complex' | 'editable'>;

  /** The element that will receive focus when the widget is activated. */
  focusTarget: SignalLike<HTMLElement | undefined>;
}

/** The UI pattern for a widget inside a grid cell. */
export class GridCellWidgetPattern implements ListNavigationItem {
  /** A unique identifier for the widget. */
  readonly id: SignalLike<string> = () => this.inputs.id();

  /** The html element that should receive focus. */
  readonly element: SignalLike<HTMLElement> = () => this.inputs.element();

  /** The element that should receive focus. */
  readonly widgetHost: SignalLike<HTMLElement> = computed(
    () => this.inputs.focusTarget() ?? this.element(),
  );

  /** The index of the widget within the cell. */
  readonly index: SignalLike<number> = computed(() =>
    this.inputs.cell().inputs.widgets().indexOf(this),
  );

  /** Whether the widget is disabled. */
  readonly disabled: SignalLike<boolean> = computed(
    () => this.inputs.disabled() || this.inputs.cell().disabled(),
  );

  /** The tab index for the widget. */
  readonly tabIndex: SignalLike<-1 | 0> = computed(() => this.inputs.cell().widgetTabIndex());

  /** Whether the widget is the active item in the widget list. */
  readonly active: SignalLike<boolean> = computed(() => this.inputs.cell().activeWidget() === this);

  /** Whether the widget is currently activated. */
  readonly isActivated: WritableSignalLike<boolean> = signal(false);

  /** The last event that caused the widget to be activated. */
  readonly lastActivateEvent: WritableSignalLike<KeyboardEvent | FocusEvent | undefined> =
    signal(undefined);

  /** The last event that caused the widget to be deactivated. */
  readonly lastDeactivateEvent: WritableSignalLike<KeyboardEvent | FocusEvent | undefined> =
    signal(undefined);

  /** The keyboard event manager for the widget. */
  readonly keydown = computed(() => {
    const manager = new KeyboardEventManager();

    // Simple widget does not need to pause default grid behaviors.
    if (this.inputs.widgetType() === 'simple') {
      return manager;
    }

    // If a widget is activated, only listen to events that exits activate state.
    if (this.isActivated()) {
      manager.on('Escape', e => {
        this.deactivate(e);
        this.focus();
      });

      if (this.inputs.widgetType() === 'editable') {
        manager.on('Enter', e => {
          this.deactivate(e);
          this.focus();
        });
      }

      return manager;
    }

    // Enter key is used to activate widget for both complex and editable type.
    manager.on('Enter', e => this.activate(e));

    if (this.inputs.widgetType() === 'editable') {
      manager.on([Modifier.Shift, Modifier.None], /^[a-zA-Z0-9]$/, e => this.activate(e), {
        preventDefault: false,
      });
    }

    return manager;
  });

  constructor(readonly inputs: GridCellWidgetInputs) {}

  /** Handles keydown events for the widget. */
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    this.keydown().handle(event);
  }

  /** Handles focusin events for the widget. */
  onFocusIn(event: FocusEvent): void {
    // Simple widget does not have activate state.
    if (this.inputs.widgetType() === 'simple') return;

    // Set activate state if the focus is inside of widget.
    const focusTarget = event.target as Element;
    if (this.widgetHost().contains(focusTarget) && this.widgetHost() !== focusTarget) {
      this.activate(event);
    }
  }

  /** Handles focusout events for the widget. */
  onFocusOut(event: FocusEvent): void {
    const focusTarget = event.relatedTarget as Element;
    if (this.widgetHost().contains(focusTarget)) return;

    // Reset states when focus leaving widget.
    this.deactivate(event);
  }

  /** Focuses the widget's host element. */
  focus(): void {
    this.widgetHost().focus();
  }

  /** Activates the widget. */
  activate(event?: KeyboardEvent | FocusEvent): void {
    if (this.isActivated()) return;
    if (this.inputs.widgetType() === 'simple') return;

    this.isActivated.set(true);
    this.lastActivateEvent.set(event);
  }

  /** Deactivates the widget and restores focus to the widget's host element. */
  deactivate(event?: KeyboardEvent | FocusEvent): void {
    if (!this.isActivated()) return;

    this.isActivated.set(false);
    this.lastDeactivateEvent.set(event);
  }
}
