/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  Directive,
  ElementRef,
  inject,
  model,
  untracked,
  WritableSignal,
} from '@angular/core';
import {ComboboxDialogPattern} from '../private';
import {Combobox} from './combobox';

/**
 * An input that is part of a combobox. It is responsible for displaying the
 * current value and handling user input for filtering and selection.
 *
 * This directive should be applied to an `<input>` element within an `ngCombobox`
 * container. It automatically handles keyboard interactions, such as opening the
 * popup and navigating through the options.
 *
 * ```html
 * <input
 *   ngComboboxInput
 *   placeholder="Search..."
 *   [(value)]="searchString"
 * />
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Combobox](guide/aria/combobox)
 * @see [Select](guide/aria/select)
 * @see [Multiselect](guide/aria/multiselect)
 * @see [Autocomplete](guide/aria/autocomplete)
 */
@Directive({
  selector: 'input[ngComboboxInput]',
  exportAs: 'ngComboboxInput',
  host: {
    'role': 'combobox',
    '[value]': 'value()',
    '[attr.aria-disabled]': 'combobox._pattern.disabled()',
    '[attr.aria-expanded]': 'combobox._pattern.expanded()',
    '[attr.aria-activedescendant]': 'combobox._pattern.activeDescendant()',
    '[attr.aria-controls]': 'combobox._pattern.popupId()',
    '[attr.aria-haspopup]': 'combobox._pattern.hasPopup()',
    '[attr.aria-autocomplete]': 'combobox._pattern.autocomplete()',
    '[attr.readonly]': 'combobox._pattern.readonly()',
  },
})
export class ComboboxInput {
  /** The element that the combobox is attached to. */
  private readonly _elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

  /** A reference to the input element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The combobox that the input belongs to. */
  readonly combobox = inject(Combobox);

  /** The value of the input. */
  value = model<string>('');

  constructor() {
    (this.combobox._pattern.inputs.inputEl as WritableSignal<HTMLInputElement>).set(
      this._elementRef.nativeElement,
    );
    this.combobox._pattern.inputs.inputValue = this.value;

    const controls = this.combobox.popup()?._controls();
    if (controls instanceof ComboboxDialogPattern) {
      return;
    }

    /** Focuses & selects the first item in the combobox if the user changes the input value. */
    afterRenderEffect(() => {
      this.value();
      controls?.items();
      untracked(() => this.combobox._pattern.onFilter());
    });
  }
}
