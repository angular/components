/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, signal} from '@angular/core';
import {SignalLike} from '../behaviors/signal-like/signal-like';
import {KeyboardEventManager, PointerEventManager, Modifier} from '../behaviors/event-manager';
import {Grid, GridInputs as GridBehaviorInputs} from '../behaviors/grid';
import type {GridRowPattern} from './row';
import type {GridCellPattern} from './cell';

/** Represents the required inputs for the grid pattern. */
export interface GridInputs extends Omit<GridBehaviorInputs<GridCellPattern>, 'cells'> {
  /** The rows that make up the grid. */
  rows: SignalLike<GridRowPattern[]>;

  /** A function that returns the grid cell associated with a given element. */
  getCell: (e: Element) => GridCellPattern | undefined;
}

/** The UI pattern for a grid, handling keyboard navigation, focus, and selection. */
export class GridPattern {
  /** The underlying grid behavior that this pattern is built on. */
  readonly gridBehavior: Grid<GridCellPattern>;

  /** The cells in the grid. */
  readonly cells = computed(() => this.gridBehavior.data.cells());

  /** The tab index for the grid. */
  readonly tabIndex = computed(() => this.gridBehavior.gridTabIndex());

  /** Whether the grid is disabled. */
  readonly disabled = computed(() => this.gridBehavior.gridDisabled());

  /** The ID of the currently active descendant cell. */
  readonly activeDescendant = computed(() => this.gridBehavior.activeDescendant());

  /** The currently active cell. */
  readonly activeCell = computed(() => this.gridBehavior.focusBehavior.activeCell());

  /** Whether grid navigation is currently paused by a cell (e.g. an input field). */
  readonly pauseGridNavigation = computed(() =>
    this.gridBehavior.data.flattenCells().some(c => c.pauseGridNavigation()),
  );

  /** Whether the user is currently dragging to select a range of cells. */
  readonly dragging = signal<boolean>(false);

  /** The keydown event manager for the grid. */
  readonly keydown = computed(() => {
    const manager = new KeyboardEventManager();

    if (this.pauseGridNavigation()) {
      return manager;
    }

    manager
      .on('ArrowUp', () => this.gridBehavior.up())
      .on('ArrowDown', () => this.gridBehavior.down())
      .on('ArrowLeft', () => this.gridBehavior.left())
      .on('ArrowRight', () => this.gridBehavior.right())
      .on('Home', () => this.gridBehavior.firstInRow())
      .on('End', () => this.gridBehavior.lastInRow())
      .on([Modifier.Ctrl], 'Home', () => this.gridBehavior.first())
      .on([Modifier.Ctrl], 'End', () => this.gridBehavior.last());

    if (this.inputs.enableSelection()) {
      manager
        .on(Modifier.Shift, 'ArrowUp', () => this.gridBehavior.rangeSelectUp())
        .on(Modifier.Shift, 'ArrowDown', () => this.gridBehavior.rangeSelectDown())
        .on(Modifier.Shift, 'ArrowLeft', () => this.gridBehavior.rangeSelectLeft())
        .on(Modifier.Shift, 'ArrowRight', () => this.gridBehavior.rangeSelectRight())
        .on([Modifier.Ctrl, Modifier.Meta], 'A', () => this.gridBehavior.selectAll())
        .on([Modifier.Shift], ' ', () => this.gridBehavior.selectRow())
        .on([Modifier.Ctrl, Modifier.Meta], ' ', () => this.gridBehavior.selectCol());
    }

    return manager;
  });

  /** The pointerdown event manager for the grid. */
  readonly pointerdown = computed(() => {
    const manager = new PointerEventManager();

    manager.on(e => {
      const cell = this.inputs.getCell(e.target as Element);
      if (!cell) return;

      this.gridBehavior.gotoCell(cell);

      if (this.inputs.enableSelection()) {
        this.dragging.set(true);
      }
    });

    if (this.inputs.enableSelection()) {
      manager
        .on([Modifier.Ctrl, Modifier.Meta], e => {
          const cell = this.inputs.getCell(e.target as Element);
          if (!cell) return;

          this.gridBehavior.toggleSelect(cell);
        })
        .on(Modifier.Shift, e => {
          const cell = this.inputs.getCell(e.target as Element);
          if (!cell) return;

          this.gridBehavior.rangeSelect(cell);
          this.dragging.set(true);
        });
    }

    return manager;
  });

  /** The pointerup event manager for the grid. */
  readonly pointerup = computed(() => {
    const manager = new PointerEventManager();

    if (this.inputs.enableSelection()) {
      manager.on([Modifier.Shift, Modifier.None], () => {
        this.dragging.set(false);
      });
    }

    return manager;
  });

  constructor(readonly inputs: GridInputs) {
    this.gridBehavior = new Grid({
      ...inputs,
      cells: computed(() => this.inputs.rows().map(row => row.inputs.cells())),
    });
  }

  /** Resets the active state of the grid if it is empty or stale. */
  resetState(): boolean {
    return this.gridBehavior.resetState();
  }

  /** Handles keydown events on the grid. */
  onKeydown(event: KeyboardEvent) {
    if (!this.disabled()) {
      this.keydown().handle(event);
    }
  }

  /** Handles pointerdown events on the grid. */
  onPointerdown(event: PointerEvent) {
    if (!this.disabled()) {
      this.pointerdown().handle(event);
    }
  }

  /** Handles pointermove events on the grid. */
  onPointermove(event: PointerEvent) {
    if (this.disabled()) return;
    if (!this.inputs.enableSelection()) return;
    if (!this.dragging()) return;

    const cell = this.inputs.getCell(event.target as Element);
    if (!cell) return;

    this.gridBehavior.rangeSelect(cell);
  }

  /** Handles pointerup events on the grid. */
  onPointerup(event: PointerEvent) {
    if (!this.disabled()) {
      this.pointerup().handle(event);
    }
  }
}
