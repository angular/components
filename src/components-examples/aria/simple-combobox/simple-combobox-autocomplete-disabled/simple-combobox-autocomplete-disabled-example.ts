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
  signal,
  viewChild,
} from '@angular/core';
import {COUNTRIES} from '../countries';
import {OverlayModule} from '@angular/cdk/overlay';
import {FormsModule} from '@angular/forms';

/** @title Disabled autocomplete. */
@Component({
  selector: 'simple-combobox-autocomplete-disabled-example',
  templateUrl: 'simple-combobox-autocomplete-disabled-example.html',
  styleUrl: '../autocomplete.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleComboboxAutocompleteDisabledExample {
  /** The selected value of the combobox. */
  readonly listbox = viewChild(Listbox);
  readonly combobox = viewChild(Combobox);

  popupExpanded = signal(false);
  searchString = signal('United States of America');
  selectedOption = signal<string[]>([]);

  /** The query string used to filter the list of countries. */
  query = computed(() => this.searchString());

  /** The list of countries filtered by the query. */
  countries = computed(() =>
    COUNTRIES.filter(country => country.toLowerCase().startsWith(this.query().toLowerCase())),
  );

  constructor() {
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });
  }
}
