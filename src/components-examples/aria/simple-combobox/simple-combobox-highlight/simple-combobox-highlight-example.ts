/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/simple-combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {
  afterRenderEffect,
  Component,
  computed,
  signal,
  viewChild,
  untracked,
  effect,
} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';

/** @title Simple Combobox Highlight */
@Component({
  selector: 'simple-combobox-highlight-example',
  templateUrl: 'simple-combobox-highlight-example.html',
  styleUrl: '../simple-combobox-example.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
})
export class SimpleComboboxHighlightExample {
  readonly listbox = viewChild(Listbox);

  popupExpanded = signal(false);
  searchString = signal('');
  selectedOption = signal<string[]>([]);

  options = computed(() =>
    states.filter(state => state.name.toLowerCase().startsWith(this.searchString().toLowerCase())),
  );

  constructor() {
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });
  }

  onCommit() {
    const selectedOption = this.selectedOption();
    if (selectedOption.length > 0) {
      const matchedState = states.find(s => s.name === selectedOption[0]);
      if (matchedState?.disabled) {
        return;
      }
      this.searchString.set(selectedOption[0]);
    } else {
      this.searchString.set('');
    }
    this.popupExpanded.set(false);
  }
}

const states = [
  {name: 'Alabama', disabled: false},
  {name: 'Alaska', disabled: true},
  {name: 'Arizona', disabled: false},
  {name: 'Arkansas', disabled: true},
  {name: 'California', disabled: true},
  {name: 'Colorado', disabled: false},
  {name: 'Connecticut', disabled: false},
  {name: 'Delaware', disabled: false},
  {name: 'Florida', disabled: false},
  {name: 'Georgia', disabled: false},
  {name: 'Hawaii', disabled: false},
  {name: 'Idaho', disabled: false},
  {name: 'Illinois', disabled: false},
  {name: 'Indiana', disabled: false},
  {name: 'Iowa', disabled: false},
  {name: 'Kansas', disabled: false},
  {name: 'Kentucky', disabled: false},
  {name: 'Louisiana', disabled: false},
  {name: 'Maine', disabled: false},
  {name: 'Maryland', disabled: false},
  {name: 'Massachusetts', disabled: false},
  {name: 'Michigan', disabled: false},
  {name: 'Minnesota', disabled: false},
  {name: 'Mississippi', disabled: false},
  {name: 'Missouri', disabled: false},
  {name: 'Montana', disabled: false},
  {name: 'Nebraska', disabled: false},
  {name: 'Nevada', disabled: false},
  {name: 'New Hampshire', disabled: false},
  {name: 'New Jersey', disabled: false},
  {name: 'New Mexico', disabled: false},
  {name: 'New York', disabled: false},
  {name: 'North Carolina', disabled: false},
  {name: 'North Dakota', disabled: false},
  {name: 'Ohio', disabled: false},
  {name: 'Oklahoma', disabled: false},
  {name: 'Oregon', disabled: false},
  {name: 'Pennsylvania', disabled: false},
  {name: 'Rhode Island', disabled: false},
  {name: 'South Carolina', disabled: false},
  {name: 'South Dakota', disabled: false},
  {name: 'Tennessee', disabled: false},
  {name: 'Texas', disabled: false},
  {name: 'Utah', disabled: false},
  {name: 'Vermont', disabled: false},
  {name: 'Virginia', disabled: false},
  {name: 'Washington', disabled: false},
  {name: 'West Virginia', disabled: false},
  {name: 'Wisconsin', disabled: false},
  {name: 'Wyoming', disabled: false},
];
