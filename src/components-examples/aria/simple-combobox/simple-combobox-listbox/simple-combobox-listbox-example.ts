/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/simple-combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {afterRenderEffect, Component, computed, signal, viewChild, untracked} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';

/** @title */
@Component({
  selector: 'simple-combobox-listbox-example',
  templateUrl: 'simple-combobox-listbox-example.html',
  styleUrl: '../simple-combobox-examples.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
})
export class SimpleComboboxListboxExample {
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

const states = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];
