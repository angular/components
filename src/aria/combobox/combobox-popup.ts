/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, inject, signal} from '@angular/core';
import {
  ComboboxListboxControls,
  ComboboxTreeControls,
  ComboboxDialogPattern,
} from '@angular/aria/private';
import type {Combobox} from './combobox';
import {COMBOBOX} from './combobox-tokens';

/**
 * Identifies an element as a popup for an `ngCombobox`.
 *
 * This directive acts as a bridge, allowing the `ngCombobox` to discover and interact
 * with the underlying control (e.g., `ngListbox`, `ngTree`, or `ngComboboxDialog`) that
 * manages the options. It's primarily used as a host directive and is responsible for
 * exposing the popup's control pattern to the parent combobox.
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngComboboxPopup]',
  exportAs: 'ngComboboxPopup',
})
export class ComboboxPopup<V> {
  /** The combobox that the popup belongs to. */
  readonly combobox = inject<Combobox<V>>(COMBOBOX, {optional: true});

  /** The popup controls exposed to the combobox. */
  readonly _controls = signal<
    | ComboboxListboxControls<any, V>
    | ComboboxTreeControls<any, V>
    | ComboboxDialogPattern
    | undefined
  >(undefined);
}
