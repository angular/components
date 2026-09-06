/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SignalLike} from '../behaviors/signal-like/signal-like';
import type {ToolbarPattern} from './toolbar';
import type {ToolbarWidgetPattern} from './toolbar-widget';

/** Represents the required inputs for a toolbar widget group. */
export interface ToolbarWidgetGroupInputs {
  /** A reference to the parent toolbar. */
  toolbar: SignalLike<ToolbarPattern | undefined>;

  /** Whether the widget group is disabled. */
  disabled: SignalLike<boolean>;

  /** The list of items within the widget group. */
  items: SignalLike<ToolbarWidgetPattern[]>;
}

/** A group of widgets within a toolbar that provides nested navigation. */
export class ToolbarWidgetGroupPattern {
  /** Whether the widget is disabled. */
  readonly disabled = () => this.inputs.disabled();

  /** A reference to the parent toolbar. */
  readonly toolbar = () => this.inputs.toolbar();

  constructor(readonly inputs: ToolbarWidgetGroupInputs) {}
}
