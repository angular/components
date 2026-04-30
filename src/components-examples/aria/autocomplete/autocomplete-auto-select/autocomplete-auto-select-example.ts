/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/combobox';
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

/** @title Autocomplete with auto-select filtering. */
@Component({
  selector: 'autocomplete-auto-select-example',
  templateUrl: 'autocomplete-auto-select-example.html',
  styleUrl: '../autocomplete.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteAutoSelectExample {
  /** The selected value of the combobox. */
  readonly listbox = viewChild(Listbox);
  readonly combobox = viewChild(Combobox);

  popupExpanded = signal(false);
  searchString = signal('');
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

  /** Clears the query and the listbox value. */
  clear(): void {
    this.searchString.set('');
    this.selectedOption.set([]);
  }

  onCommit() {
    const selectedOption = this.selectedOption();
    if (selectedOption.length > 0) {
      this.searchString.set(selectedOption[0]);
    }
    this.popupExpanded.set(false);
    this.combobox()?.element.focus();
  }

  /** Handles keydown events on the clear button. */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.clear();
      this.popupExpanded.set(false);
      event.stopPropagation();
    }
  }
}
