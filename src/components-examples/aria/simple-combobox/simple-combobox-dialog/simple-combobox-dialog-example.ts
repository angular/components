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
  ChangeDetectionStrategy,
  Component,
  computed,
  linkedSignal,
  signal,
  viewChild,
  untracked,
  ElementRef,
} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {FormsModule} from '@angular/forms';

/** @title Combobox with a dialog popup. */
@Component({
  selector: 'simple-combobox-dialog-example',
  templateUrl: 'simple-combobox-dialog-example.html',
  styleUrls: ['../simple-combobox-examples.css'],
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleComboboxDialogExample {
  listbox = viewChild<Listbox<string>>(Listbox);
  combobox = viewChild(Combobox);
  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  value = signal('');
  searchString = signal('');

  options = computed(() =>
    states.filter(state => state.toLowerCase().startsWith(this.searchString().toLowerCase())),
  );

  selectedStates = signal<string[]>([]);
  popupExpanded = signal(false);

  constructor() {
    afterRenderEffect(() => {
      if (this.popupExpanded()) {
        untracked(() => {
          setTimeout(() => {
            this.searchInput()?.nativeElement.focus();
          });
        });
      }
    });

    afterRenderEffect(() => {
      if (this.popupExpanded()) {
        this.listbox()?.scrollActiveItemIntoView();
      }
    });
  }

  onCommit() {
    const selected = this.selectedStates();
    if (selected.length > 0) {
      this.value.set(selected[0]);
      this.searchString.set('');
      this.popupExpanded.set(false);
      this.combobox()?.element.focus();
    }
  }

  onSearchEscape(event: Event) {
    this.popupExpanded.set(false);
    this.combobox()?.element.focus(); // Focus back to main trigger!
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
