/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/simple-combobox';
import {afterRenderEffect, Component, computed, signal, viewChild} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {Grid, GridRow, GridCell, GridCellWidget} from '@angular/aria/grid';
import {MatIconModule} from '@angular/material/icon';

/** @title */
@Component({
  selector: 'simple-combobox-grid-example',
  templateUrl: 'simple-combobox-grid-example.html',
  styleUrl: '../simple-combobox-example.css',
  imports: [
    Combobox,
    ComboboxPopup,
    ComboboxWidget,
    OverlayModule,
    Grid,
    GridRow,
    GridCell,
    GridCellWidget,
    MatIconModule,
  ],
})
export class SimpleComboboxGridExample {
  readonly grid = viewChild(Grid);

  popupExpanded = signal(true);
  searchString = signal('');
  readonly selectedItem = signal<{label: string} | null>(null);

  constructor() {
    afterRenderEffect(() => {
      this.grid()?.scrollActiveCellIntoView({block: 'nearest'});
    });
  }

  readonly items = signal([
    {label: 'Antelope'},
    {label: 'Bird'},
    {label: 'Cat'},
    {label: 'Dog'},
    {label: 'Elephant'},
    {label: 'Fox'},
    {label: 'Giraffe'},
    {label: 'Hamster'},
    {label: 'Hippo'},
    {label: 'Iguana'},
    {label: 'Jaguar'},
    {label: 'Koala'},
    {label: 'Lion'},
    {label: 'Monkey'},
    {label: 'Nightingale'},
    {label: 'Owl'},
    {label: 'Panda'},
    {label: 'Quokka'},
    {label: 'Rabbit'},
    {label: 'Snake'},
    {label: 'Tiger'},
    {label: 'Umbrella Bird'},
    {label: 'Vulture'},
    {label: 'Whale'},
    {label: 'X-ray Tetra'},
    {label: 'Yak'},
    {label: 'Zebra'},
  ]);

  readonly filteredItems = computed(() => {
    const search = this.searchString().toLowerCase();
    return [...this.items()].filter(item => item.label.toLowerCase().includes(search));
  });

  removeItem(itemToRemove: {label: string}) {
    this.items.update(items => items.filter(item => item !== itemToRemove));
  }

  selectItem(item: {label: string}) {
    this.selectedItem.set(item);
    this.searchString.set(item.label);
    this.popupExpanded.set(false);
  }

  onBlur() {
    const selectedItem = this.selectedItem();
    if (
      this.searchString() === '' ||
      (selectedItem !== null && this.searchString() === selectedItem.label)
    ) {
      this.selectedItem.set(null);
    }
  }
}
