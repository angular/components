/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {afterRenderEffect, Component, computed, signal, viewChild, untracked} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {STATES as states} from '../states';

/** @title Combobox Hard Disabled */
@Component({
  selector: 'combobox-hard-disabled-example',
  templateUrl: 'combobox-hard-disabled-example.html',
  styleUrl: '../combobox-example.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
})
export class ComboboxHardDisabledExample {
  readonly listbox = viewChild(Listbox);

  popupExpanded = signal(false);
  searchString = signal('');
  selectedOption = signal<string[]>([]);

  options = computed(() =>
    states.filter(state => state.toLowerCase().startsWith(this.searchString().toLowerCase())),
  );

  constructor() {
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });

    afterRenderEffect(() => {
      if (this.popupExpanded()) {
        untracked(() => setTimeout(() => this.listbox()?.gotoFirst()));
      }
    });
  }

  onCommit() {
    const selectedOption = this.selectedOption();
    if (selectedOption.length > 0) {
      this.searchString.set(selectedOption[0]);
      this.popupExpanded.set(false);
    }
  }
}
