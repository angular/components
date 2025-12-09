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
  viewChild,
  viewChildren,
} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';

/** @title Aria select example. */
@Component({
  selector: 'select-example',
  templateUrl: 'select-example.html',
  styleUrl: '../select.css',
  imports: [
    Combobox,
    ComboboxInput,
    ComboboxPopup,
    ComboboxPopupContainer,
    Listbox,
    Option,
    OverlayModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectExample {
  /** The options available in the listbox. */
  options = viewChildren<Option<{label: string; icon: string}>>(Option);

  /** The combobox listbox popup. */
  listbox = viewChild<Listbox<{label: string; icon: string}>>(Listbox);

  /** The current value of the select. */
  value = computed(() => this.listbox()?.values()[0] ?? this.items[1]);

  /** The items available for selection. */
  items = [
    {label: 'Light Mode', icon: 'light_mode'},
    {label: 'Dark Mode', icon: 'dark_mode'},
    {label: 'System Default', icon: 'settings'},
  ];

  constructor() {
    // Scrolls to the active item when the active option changes.
    afterRenderEffect(() => {
      const option = this.options().find(opt => opt.active());
      option?.element.scrollIntoView({block: 'nearest'});
    });
  }
}
