/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component, computed, signal} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {Grid, GridRow, GridCell, GridCellWidget} from '@angular/aria/grid';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {toSignal} from '@angular/core/rxjs-interop';

/** @title Grid Pill List. */
@Component({
  selector: 'grid-pill-list-example',
  exportAs: 'GridPillListExample',
  templateUrl: 'grid-pill-list-example.html',
  styleUrls: ['../grid-common.css', 'grid-pill-list-example.css'],
  standalone: true,
  imports: [
    Grid,
    GridRow,
    GridCell,
    GridCellWidget,
    MatIconModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
})
export class GridPillListExample {
  readonly sort = new FormControl(false, {nonNullable: true});
  readonly sortSignal = toSignal(this.sort.valueChanges);

  readonly items = signal([
    {label: 'Cat'},
    {label: 'Giraffe'},
    {label: 'Dog'},
    {label: 'Bird'},
    {label: 'Hamster'},
  ]);
  readonly sortedItems = computed(() => {
    if (!this.sortSignal()) return this.items();
    return this.items().sort((a, b) => a.label.localeCompare(b.label));
  });

  addItem(input: HTMLInputElement) {
    const value = input.value;
    if (value.length === 0) return;
    this.items.set([...this.items(), {label: value}]);
    input.value = '';
  }

  removeItem(index: number) {
    this.items.update(items => [...items.slice(0, index), ...items.slice(index + 1)]);
  }
}
