/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ListItem} from '../behaviors/list/list';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import type {ToolbarPattern} from './toolbar';

/** Represents the required inputs for a toolbar widget group. */
export interface ToolbarWidgetGroupInputs<T extends ListItem<V>, V> {
  /** A reference to the parent toolbar. */
  toolbar: SignalLike<ToolbarPattern<V> | undefined>;

  /** Whether the widget group is disabled. */
  disabled: SignalLike<boolean>;

  /** The list of items within the widget group. */
  items: SignalLike<T[]>;

  /** Whether the group allows multiple widgets to be selected. */
  multi: SignalLike<boolean>;
}

/** A group of widgets within a toolbar that provides nested navigation. */
export class ToolbarWidgetGroupPattern<T extends ListItem<V>, V> {
  /** Whether the widget is disabled. */
  readonly disabled = () => this.inputs.disabled();

  /** A reference to the parent toolbar. */
  readonly toolbar = () => this.inputs.toolbar();

  /** Whether the group allows multiple widgets to be selected. */
  readonly multi = () => this.inputs.multi();

  readonly searchTerm = () => ''; // Unused because toolbar does not support typeahead.
  readonly value = () => '' as V; // Unused because toolbar does not support selection.
  readonly selectable = () => true; // Unused because toolbar does not support selection.
  readonly element = () => undefined; // Unused because toolbar does not focus the group element.

  constructor(readonly inputs: ToolbarWidgetGroupInputs<T, V>) {}
}
