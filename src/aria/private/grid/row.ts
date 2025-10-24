/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SignalLike} from '../behaviors/signal-like/signal-like';
import type {GridPattern} from './grid';
import type {GridCellPattern} from './cell';

/** The inputs for the `GridRowPattern`. */
export interface GridRowInputs {
  /** The `GridPattern` that this row belongs to. */
  grid: SignalLike<GridPattern>;

  /** The cells that make up this row. */
  cells: SignalLike<GridCellPattern[]>;

  /** The index of this row within the grid. */
  rowIndex: SignalLike<number | undefined>;
}

/** The UI pattern for a grid row. */
export class GridRowPattern {
  /** The index of this row within the grid. */
  rowIndex: SignalLike<number | undefined>;

  constructor(readonly inputs: GridRowInputs) {
    this.rowIndex = inputs.rowIndex;
  }
}
