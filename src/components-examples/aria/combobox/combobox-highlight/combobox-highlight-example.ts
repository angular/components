/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {afterRenderEffect, Component, computed, effect, signal, viewChild} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {STATES} from '../states';

/** @title Combobox Highlight */
@Component({
  selector: 'combobox-highlight-example',
  templateUrl: 'combobox-highlight-example.html',
  styleUrl: '../combobox-example.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
})
export class ComboboxHighlightExample {
  readonly listbox = viewChild(Listbox);

  popupExpanded = signal(false);
  searchString = signal('');
  selectedOption = signal<string[]>([]);
  navigated = signal(false);

  options = computed(() =>
    states.filter(state => state.name.toLowerCase().startsWith(this.searchString().toLowerCase())),
  );

  constructor() {
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });

    effect(() => {
      if (!this.popupExpanded()) {
        this.navigated.set(false);
      }
    });
  }

  onCommit() {
    const selectedOption = this.selectedOption();
    if (selectedOption.length > 0) {
      const matchedState = states.find(s => s.name === selectedOption[0]);
      if (matchedState?.disabled) {
        return;
      }
      this.searchString.set(selectedOption[0]);
    } else {
      this.searchString.set('');
    }
    this.popupExpanded.set(false);
  }
}

interface StateOption {
  name: string;
  disabled: boolean;
}

const states: StateOption[] = STATES.map((name: string, index: number) => ({
  name,
  disabled: index === 1 || index === 3 || index === 4,
}));
