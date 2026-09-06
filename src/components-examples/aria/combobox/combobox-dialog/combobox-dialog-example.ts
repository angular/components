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
  Component,
  computed,
  signal,
  viewChild,
  untracked,
  ElementRef,
} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {FormsModule} from '@angular/forms';
import {STATES as states} from '../states';

/** @title Combobox with a dialog popup. */
@Component({
  selector: 'combobox-dialog-example',
  templateUrl: 'combobox-dialog-example.html',
  styleUrls: ['../combobox-example.css'],
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule, FormsModule],
})
export class ComboboxDialogExample {
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
