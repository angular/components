/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  CdkCombobox,
  CdkComboboxInput,
  CdkComboboxPopup,
  CdkComboboxPopupContainer,
} from '@angular/cdk-experimental/combobox';
import {CdkListbox, CdkOption} from '@angular/cdk-experimental/listbox';
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

/** @title Combobox with highlight filtering. */
@Component({
  selector: 'cdk-combobox-highlight-example',
  templateUrl: 'cdk-combobox-highlight-example.html',
  styleUrl: '../cdk-combobox-examples.css',
  imports: [
    CdkCombobox,
    CdkComboboxInput,
    CdkComboboxPopup,
    CdkComboboxPopupContainer,
    CdkListbox,
    CdkOption,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkComboboxHighlightExample {
  popover = viewChild<ElementRef>('popover');
  listbox = viewChild<CdkListbox<any>>(CdkListbox);
  combobox = viewChild<CdkCombobox<any>>(CdkCombobox);

  searchString = signal('');

  options = computed(() =>
    states.filter(state => state.toLowerCase().startsWith(this.searchString().toLowerCase())),
  );

  constructor() {
    afterRenderEffect(() => {
      const popover = this.popover()!;
      const combobox = this.combobox()!;
      combobox.pattern.expanded() ? this.showPopover() : popover.nativeElement.hidePopover();

      // TODO(wagnermaciel): Make this easier for developers to do.
      this.listbox()?.pattern.inputs.activeItem()?.element().scrollIntoView({block: 'nearest'});
    });
  }

  showPopover() {
    const popover = this.popover()!;
    const combobox = this.combobox()!;

    const comboboxRect = combobox.pattern.inputs.inputEl()?.getBoundingClientRect();
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
