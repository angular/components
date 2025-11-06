/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Combobox,
  ComboboxDialog,
  ComboboxInput,
  ComboboxPopupContainer,
} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {FormsModule} from '@angular/forms';

/** @title Combobox with a dialog popup. */
@Component({
  selector: 'combobox-dialog-example',
  templateUrl: 'combobox-dialog-example.html',
  styleUrl: 'combobox-dialog-example.css',
  imports: [
    ComboboxDialog,
    Combobox,
    ComboboxInput,
    ComboboxPopupContainer,
    Listbox,
    Option,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxDialogExample {
  dialog = viewChild(ComboboxDialog);
  listbox = viewChild<Listbox<string>>(Listbox);
  combobox = viewChild<Combobox<string>>(Combobox);

  value = signal('');
  searchString = signal('');

  options = computed(() =>
    states.filter(state => state.toLowerCase().startsWith(this.searchString().toLowerCase())),
  );

  selectedStates = signal<string[]>([]);

  constructor() {
    afterRenderEffect(() => {
      if (this.dialog() && this.combobox()?.expanded()) {
        this.positionDialog();
      }
    });

    afterRenderEffect(() => {
      if (this.selectedStates().length > 0) {
        untracked(() => this.dialog()?.close());
      }
    });

    afterRenderEffect(() => this.listbox()?.scrollActiveItemIntoView());
  }

  positionDialog() {
    const dialog = this.dialog()!;
    const combobox = this.combobox()!;

    const comboboxRect = combobox.inputElement()?.getBoundingClientRect();
    const dialogEl = dialog.element.nativeElement;

    const scrollY = window.scrollY;

    if (comboboxRect) {
      dialogEl.style.width = `${comboboxRect.width}px`;
      dialogEl.style.top = `${comboboxRect.bottom + scrollY + 4}px`;
      dialogEl.style.left = `${comboboxRect.left - 1}px`;
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
