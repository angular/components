/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Combobox, ComboboxPopup, ComboboxWidget} from '@angular/aria/combobox';
import {Listbox, Option} from '@angular/aria/listbox';
import {afterRenderEffect, Component, computed, signal, viewChild} from '@angular/core';
import {OverlayModule} from '@angular/cdk/overlay';
import {STATES as states} from '../states';

/** @title Combobox Readonly */
@Component({
  selector: 'combobox-readonly-example',
  templateUrl: 'combobox-readonly-example.html',
  styleUrl: '../combobox-example.css',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
})
export class ComboboxReadonlyExample {
  readonly listbox = viewChild(Listbox);

  popupExpanded = signal(false);
  searchString = signal('California');
  selectedOption = signal<string[]>(['California']);

  options = computed(() =>
    states.filter(state => state.toLowerCase().startsWith(this.searchString().toLowerCase())),
  );

  constructor() {
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });
  }

  onCommit() {
    // Readonly combobox suppresses commits
  }
}
