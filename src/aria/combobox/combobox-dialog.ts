/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {afterRenderEffect, Directive, ElementRef, inject} from '@angular/core';
import {ComboboxDialogPattern} from '../private';
import {Combobox} from './combobox';
import {ComboboxPopup} from './combobox-popup';

/**
 * Integrates a native `<dialog>` element with the combobox, allowing for
 * a modal or non-modal popup experience. It handles the opening and closing of the dialog
 * based on the combobox's expanded state.
 *
 * ```html
 * <ng-template ngComboboxPopupContainer>
 *   <dialog ngComboboxDialog class="example-dialog">
 *     <!-- ... dialog content ... -->
 *   </dialog>
 * </ng-template>
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
  selector: 'dialog[ngComboboxDialog]',
  exportAs: 'ngComboboxDialog',
  host: {
    '[attr.data-open]': 'combobox._pattern.expanded()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(click)': '_pattern.onClick($event)',
  },
  hostDirectives: [ComboboxPopup],
})
export class ComboboxDialog {
  /** The dialog element. */
  private readonly _elementRef = inject(ElementRef<HTMLDialogElement>);

  /** A reference to the dialog element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The combobox that the dialog belongs to. */
  readonly combobox = inject(Combobox);

  /** A reference to the parent combobox popup, if one exists. */
  private readonly _popup = inject<ComboboxPopup<unknown>>(ComboboxPopup, {
    optional: true,
  });

  _pattern: ComboboxDialogPattern;

  constructor() {
    this._pattern = new ComboboxDialogPattern({
      id: () => '',
      element: () => this._elementRef.nativeElement,
      combobox: this.combobox._pattern,
    });

    if (this._popup) {
      this._popup._controls.set(this._pattern);
    }

    afterRenderEffect(() => {
      if (this._elementRef) {
        this.combobox._pattern.expanded()
          ? this._elementRef.nativeElement.showModal()
          : this._elementRef.nativeElement.close();
      }
    });
  }

  close() {
    this._popup?.combobox?._pattern.close();
  }
}
