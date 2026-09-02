/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SignalLike, computed} from '../behaviors/signal-like/signal-like';
import {ListFocusItem} from '../behaviors/list-focus/list-focus';
import {ListNavigationItem} from '../behaviors/list-navigation/list-navigation';
import type {ToolbarPattern} from './toolbar';
import {ToolbarWidgetGroupPattern} from './toolbar-widget-group';

/** Represents the required inputs for a toolbar widget in a toolbar. */
export interface ToolbarWidgetInputs {
  /** A unique identifier for the widget. */
  id: SignalLike<string>;

  /** The html element that should receive focus. */
  element: SignalLike<HTMLElement | undefined>;

  /** Whether the widget is disabled. */
  disabled: SignalLike<boolean>;

  /** A reference to the parent toolbar. */
  toolbar: SignalLike<ToolbarPattern>;

  /** A reference to the parent widget group. */
  group: SignalLike<ToolbarWidgetGroupPattern | undefined>;
}

export class ToolbarWidgetPattern implements ListFocusItem, ListNavigationItem {
  /** A unique identifier for the widget. */
  readonly id = () => this.inputs.id();

  /** The html element that should receive focus. */
  readonly element = () => this.inputs.element();

  /** Whether the widget is disabled. */
  readonly disabled = () => this.inputs.disabled() || this.group()?.disabled() || false;

  /** A reference to the parent toolbar. */
  readonly group = () => this.inputs.group();

  /** A reference to the toolbar containing the widget. */
  readonly toolbar = () => this.inputs.toolbar();

  /** The tabindex of the widget. */
  readonly tabIndex = computed(() => this.toolbar().focusManager.getItemTabIndex(this));

  /** The position of the widget within the toolbar. */
  readonly index = computed(() => this.toolbar().inputs.items().indexOf(this) ?? -1);

  /** Whether the widget is currently the active one (focused). */
  readonly active: SignalLike<boolean> = computed(() => this.toolbar().activeItem() === this);

  constructor(readonly inputs: ToolbarWidgetInputs) {}
}
