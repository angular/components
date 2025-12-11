/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  signal,
  Component,
  ViewEncapsulation,
  viewChild,
  afterRenderEffect,
} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {Combobox, ComboboxPopupContainer, ComboboxInput} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';

const biomes = [
  {name: 'Aquatic', id: 'aqu'},
  {name: 'Forest', id: 'for'},
  {name: 'Grassland', id: 'gra'},
  {name: 'Desert', id: 'des'},
  {name: 'Tunda', id: 'tun'},
];

@Component({
  templateUrl: 'autocomplete-docs-demo.html',
  styleUrl: 'autocomplete-docs-demo.css',
  imports: [Combobox, ComboboxInput, Listbox, Option, OverlayModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteDocsDemo {
  listbox = viewChild<Listbox<any>>(Listbox);
  combobox = viewChild<Combobox<any>>(Combobox);

  initialValue = biomes[2];
  biomeOptions = signal(biomes);
  currentSelection = signal([this.initialValue.id]);

  filterBiomes(inputValue: string) {
    this.biomeOptions.set(
      biomes.filter(b => b.name.toLowerCase().includes(inputValue.toLowerCase())),
    );
  }

  resetOptions() {
    this.biomeOptions.set(biomes);
  }

  constructor() {
    afterRenderEffect(() => {
      if (this.combobox()?.expanded()) {
        this.listbox()?.scrollActiveItemIntoView();
      }
    });
    afterRenderEffect(() => {
      if (this.combobox()?.expanded()) {
        this.resetOptions();
      }
    });
  }
}
