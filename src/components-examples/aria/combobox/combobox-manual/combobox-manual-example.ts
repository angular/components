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

/** @title Combobox with manual selection. */
@Component({
  selector: 'combobox-manual-example',
  templateUrl: 'combobox-manual-example.html',
  styleUrl: '../combobox-examples.css',
  imports: [
    Combobox,
    ComboboxInput,
    ComboboxPopup,
    ComboboxPopupContainer,
    Listbox,
    Option,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxManualExample {
  popover = viewChild<ElementRef>('popover');
  listbox = viewChild<Listbox<any>>(Listbox);
  combobox = viewChild<Combobox<any>>(Combobox);

  searchString = signal('');

  options = computed(() =>
    states.filter(state => state.toLowerCase().startsWith(this.searchString().toLowerCase())),
  );

  constructor() {
    afterRenderEffect(() => {
      const popover = this.popover()!;
      const combobox = this.combobox()!;
      combobox.expanded() ? this.showPopover() : popover.nativeElement.hidePopover();

      this.listbox()?.scrollActiveItemIntoView();
    });
  }

  showPopover() {
    const popover = this.popover()!;
    const combobox = this.combobox()!;

    const comboboxRect = combobox.inputElement()?.getBoundingClientRect();
    const popoverEl = popover.nativeElement;

    if (comboboxRect) {
      popoverEl.style.width = `${comboboxRect.width}px`;
      popoverEl.style.top = `${comboboxRect.bottom}px`;
      popoverEl.style.left = `${comboboxRect.left - 1}px`;
    }

    popover.nativeElement.showPopover();
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
