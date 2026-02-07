/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Combobox,
  ComboboxInput,
  ComboboxPopup,
  ComboboxPopupContainer,
} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CdkConnectedOverlay} from '@angular/cdk/overlay';

/** @title Disabled combobox example. */
@Component({
  selector: 'combobox-disabled-example',
  templateUrl: 'combobox-disabled-example.html',
  styleUrl: '../combobox-examples.css',
  imports: [
    Combobox,
    ComboboxInput,
    ComboboxPopup,
    ComboboxPopupContainer,
    Listbox,
    Option,
    FormsModule,
    CdkConnectedOverlay,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxDisabledExample {
  listbox = viewChild<Listbox<any>>(Listbox);
  combobox = viewChild<Combobox<any>>(Combobox);

  panelWidth = signal<number | undefined>(undefined);

  searchString = signal('');

  options = computed(() =>
    states.filter(state => state.toLowerCase().startsWith(this.searchString().toLowerCase())),
  );

  constructor() {
    afterRenderEffect(() => {
      const combobox = this.combobox()!;
      if (combobox.expanded()) {
        const comboboxRect = combobox.inputElement()?.getBoundingClientRect();
        this.panelWidth(comboboxRect?.width);
      } else {
        this.panelWidth(undefined);
      }

      this.listbox()?.scrollActiveItemIntoView();
    });
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
