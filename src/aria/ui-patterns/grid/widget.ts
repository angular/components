/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed} from '@angular/core';
import {SignalLike, WritableSignalLike} from '../behaviors/signal-like/signal-like';
import type {GridCellPattern} from './cell';

/** The inputs for the `GridCellWidgetPattern`. */
export interface GridCellWidgetInputs {
  /** The `GridCellPattern` that this widget belongs to. */
  cell: SignalLike<GridCellPattern>;

  /** The html element that should receive focus. */
  element: SignalLike<HTMLElement>;

  /**
   * Whether grid navigation should be paused.
   * Usually because the widget in a cell supports different interactions.
   */
  pauseGridNavigation: WritableSignalLike<boolean>;
}

/** The UI pattern for a widget inside a grid cell. */
export class GridCellWidgetPattern {
  /** The html element that should receive focus. */
  readonly element: SignalLike<HTMLElement>;

  /**
   * Whether grid navigation should be paused.
   * Usually because the widget in a cell supports different interactions.
   */
  readonly pauseGridNavigation: WritableSignalLike<boolean>;

  /** The `tabindex` for the widget. */
  readonly tabIndex: SignalLike<-1 | 0> = computed(() => this.inputs.cell().widgetTabIndex());

  /** Whether the widget is in an active state (i.e. its containing cell is active). */
  readonly active: SignalLike<boolean> = computed(() => this.inputs.cell().active());

  constructor(readonly inputs: GridCellWidgetInputs) {
    this.element = inputs.element;
    this.pauseGridNavigation = inputs.pauseGridNavigation;
  }
}
