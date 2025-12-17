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

/** @title Aria multiselect example. */
@Component({
  selector: 'select-multi-example',
  templateUrl: 'select-multi-example.html',
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
export class SelectMultiExample {
  /** The options available in the listbox. */
  options = viewChildren<Option<string>>(Option);

  /** The combobox listbox popup. */
  listbox = viewChild<Listbox<string>>(Listbox);

  /** The visible label displayed to the user. */
  displayValue = computed(() => {
    const values = this.listbox()?.values();

    if (!values?.length) {
      return 'Select a day';
    }

    if (values.length <= 2) {
      return values.join(', ');
    }

    return `${values[0]} + ${values.length - 1} more`;
  });

  /** The items available for selection. */
  items = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor() {
    // Scrolls to the active item when the active option changes.
    afterRenderEffect(() => {
      const option = this.options().find(opt => opt.active());
      option?.element.scrollIntoView({block: 'nearest'});
    });
  }
}
