/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component, model, afterRenderEffect, computed} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {Grid, GridRow, GridCell} from '@angular/aria/grid';

interface Cell {
  rowSpan?: number;
  colSpan?: number;
  disabled?: boolean;
}

function randomSpan(): number {
  const spanChanceTable = [...Array(20).fill(1), ...Array(2).fill(2), ...Array(1).fill(3)];
  const randomIndex = Math.floor(Math.random() * spanChanceTable.length);
  return spanChanceTable[randomIndex];
}

function randomDisabled(): boolean {
  const disabledChanceTable = [...Array(15).fill(false), ...Array(4).fill(true)];
  const randomIndex = Math.floor(Math.random() * disabledChanceTable.length);
  return disabledChanceTable[randomIndex];
}

function generateValidGrid(
  rowCount: number,
  colCount: number,
  randomRowSpan: boolean = true,
  randomColSpan: boolean = true,
  randomDisable: boolean = true,
): Cell[][] {
  const grid: Cell[][] = [];
  const visitedCoords = new Set<string>();
  for (let r = 0; r < rowCount; r++) {
    const row = [];
    for (let c = 0; c < colCount; c++) {
      if (visitedCoords.has(`${r},${c}`)) {
        continue;
      }

      const rowSpan = randomRowSpan ? Math.min(randomSpan(), rowCount - r) : 1;
      const maxColSpan = randomColSpan ? Math.min(randomSpan(), colCount - c) : 1;
      let colSpan = 1;
      while (colSpan < maxColSpan) {
        if (visitedCoords.has(`${r},${c + colSpan}`)) break;
        colSpan += 1;
      }
      const disabled = randomDisable ? randomDisabled() : false;

      row.push({
        rowSpan,
        colSpan,
        disabled,
      });

      for (let rs = 0; rs < rowSpan; rs++) {
        for (let cs = 0; cs < colSpan; cs++) {
          visitedCoords.add(`${r + rs},${c + cs}`);
        }
      }
    }
    grid.push(row);
  }
  return grid;
}

/** @title Configurable Grid. */
@Component({
  selector: 'grid-configurable-example',
  exportAs: 'GridConfigurableExample',
  templateUrl: 'grid-configurable-example.html',
  styleUrls: ['../grid-common.css', 'grid-configurable-example.css'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    Grid,
    GridRow,
    GridCell,
  ],
})
export class GridConfigurableExample {
  rowWrap: 'continuous' | 'loop' | 'nowrap' = 'loop';
  colWrap: 'continuous' | 'loop' | 'nowrap' = 'continuous';
  focusMode: 'roving' | 'activedescendant' = 'roving';
  selectionMode: 'explicit' | 'follow' = 'follow';
  exampleOptions = model<string[]>(['rowSpan', 'colSpan', 'disable']);

  randomRowSpan = computed(() => this.exampleOptions().includes('rowSpan'));
  randomColSpan = computed(() => this.exampleOptions().includes('colSpan'));
  randomDisable = computed(() => this.exampleOptions().includes('disable'));

  disabled = new FormControl(false, {nonNullable: true});
  softDisabled = new FormControl(false, {nonNullable: true});
  enableSelection = new FormControl(false, {nonNullable: true});
  multi = new FormControl(false, {nonNullable: true});
  enableRangeSelection = new FormControl(false, {nonNullable: true});

  gridData: Cell[][] = generateValidGrid(
    10,
    10,
    this.randomRowSpan(),
    this.randomColSpan(),
    this.randomDisable(),
  );

  constructor() {
    afterRenderEffect(() => {
      this.gridData = generateValidGrid(
        10,
        10,
        this.randomRowSpan(),
        this.randomColSpan(),
        this.randomDisable(),
      );
    });
  }
}
