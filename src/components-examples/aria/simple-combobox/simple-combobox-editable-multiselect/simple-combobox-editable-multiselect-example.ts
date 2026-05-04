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
  untracked,
  viewChild,
  ElementRef,
} from '@angular/core';
import {COUNTRIES} from '../countries';
import {OverlayModule} from '@angular/cdk/overlay';
import {FormsModule} from '@angular/forms';

/** @title Editable multiselectable combobox with a dialog layout. */
@Component({
  selector: 'simple-combobox-editable-multiselect-example',
  templateUrl: 'simple-combobox-editable-multiselect-example.html',
  styleUrl: '../simple-combobox-example.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleComboboxEditableMultiselectExample {
  readonly listbox = viewChild(Listbox);
  readonly combobox = viewChild(Combobox);
  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  popupExpanded = signal(false);
  searchString = signal('');
  selectedOptions = signal<string[]>([]);

  /** The display text for the primary readonly trigger input. */
  value = computed(() => {
    const current = this.selectedOptions();
    if (current.length === 0) return '';
    if (current.length === 1) return current[0];
    return `${current[0]} + ${current.length - 1} more`;
  });

  /** The list of countries filtered by the inner search input query. */
  countries = computed(() => {
    const currentQuery = this.searchString().toLowerCase();
    return COUNTRIES.filter(country => country.toLowerCase().startsWith(currentQuery));
  });

  constructor() {
    // Automatically auto-focus the inner search text field when the dialog expands
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

  /** Clears the search query and all selected options. */
  clear(): void {
    this.searchString.set('');
    this.selectedOptions.set([]);
  }

  /** Keeps focus inside the dialog when selection changes. */
  onCommit() {
    this.searchString.set('');
  }

  /** Dismisses the dialog overlay on Escape key. */
  onSearchEscape(event: Event) {
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
