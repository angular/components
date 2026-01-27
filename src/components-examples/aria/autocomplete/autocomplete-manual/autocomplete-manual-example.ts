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
import {COUNTRIES} from '../countries';
import {OverlayModule} from '@angular/cdk/overlay';
import {FormsModule} from '@angular/forms';

/** @title Autocomplete with manual filtering. */
@Component({
  selector: 'autocomplete-manual-example',
  templateUrl: 'autocomplete-manual-example.html',
  styleUrl: '../autocomplete.css',
  imports: [
    Combobox,
    ComboboxInput,
    ComboboxPopup,
    ComboboxPopupContainer,
    Listbox,
    Option,
    OverlayModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteManualExample {
  /** The selected value of the combobox. */
  listbox = viewChild<Listbox<string>>(Listbox);

  /** The options available in the listbox. */
  options = viewChildren<Option<string>>(Option);

  /** A reference to the ng aria combobox. */
  combobox = viewChild<Combobox<string>>(Combobox);

  /** A reference to the ng aria combobox input. */
  comboboxInput = viewChild<ComboboxInput>(ComboboxInput);

  /** The query string used to filter the list of countries. */
  query = computed(() => this.comboboxInput()?.value() || '');

  /** The list of countries filtered by the query. */
  countries = computed(() =>
    COUNTRIES.filter(country => country.toLowerCase().startsWith(this.query().toLowerCase())),
  );

  constructor() {
    // Scrolls to the active item when the active option changes.
    afterRenderEffect(() => {
      if (this.combobox()?.expanded()) {
        const option = this.options().find(opt => opt.active());
        option?.element.scrollIntoView({block: 'nearest'});
      }
    });
  }

  /** Clears the query and the listbox value. */
  clear(): void {
    this.comboboxInput()?.value.set('');
    this.listbox?.()?.values.set([]);
  }

  /** Handles keydown events on the clear button. */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.clear();
      this.combobox?.()?.close();
      event.stopPropagation();
    }
  }
}
