/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Directive, inject, input, OnDestroy, OnInit, signal} from '@angular/core';
import {DeferredContent, SimpleComboboxPopupPattern} from '@angular/aria/private';
import type {Combobox} from './simple-combobox';
import type {ComboboxWidget} from './simple-combobox-widget';
import {SIMPLE_COMBOBOX_POPUP} from './simple-combobox-tokens';

/**
 * A structural directive that marks the `ng-template` to be used as the popup
 * for a combobox. This content is conditionally rendered.
 *
 * The content of the popup can be any element with the `ngComboboxWidget` directive.
 *
 * ```html
 * <ng-template ngComboboxPopup>
 *   <div ngComboboxWidget>
 *     <!-- ... options ... -->
 *   </div>
 * </ng-template>
 * ```
 */
@Directive({
  selector: 'ng-template[ngComboboxPopup]',
  exportAs: 'ngComboboxPopup',
  hostDirectives: [DeferredContent],
  providers: [{provide: SIMPLE_COMBOBOX_POPUP, useExisting: ComboboxPopup}],
})
export class ComboboxPopup implements OnInit, OnDestroy {
  private readonly _deferredContent = inject(DeferredContent);

  /** The combobox that the popup belongs to. */
  readonly combobox = input.required<Combobox>();

  /** The widget contained within the popup. */
  readonly _widget = signal<ComboboxWidget | undefined>(undefined);

  /** The element that serves as the control target for the popup. */
  readonly controlTarget = computed(() => this._widget()?.element);

  /** The ID of the popup. */
  readonly popupId = computed(() => this._widget()?.popupId());

  /** The ID of the active descendant in the popup. */
  readonly activeDescendant = computed(() => this._widget()?.activeDescendant());

  /** The type of the popup (e.g., listbox, tree, grid, dialog). */
  readonly popupType = input<'listbox' | 'tree' | 'grid' | 'dialog'>('listbox');

  /** The popup pattern. */
  readonly _pattern = new SimpleComboboxPopupPattern({
    ...this,
  });

  ngOnInit() {
    this.combobox()._registerPopup(this);
    this._deferredContent.deferredContentAware.set(this.combobox());
  }

  ngOnDestroy() {
    this.combobox()._unregisterPopup();
  }

  /** Registers a widget with the popup. */
  _registerWidget(widget: ComboboxWidget) {
    this._widget.set(widget);
  }

  /** Unregisters the widget from the popup. */
  _unregisterWidget() {
    this._widget.set(undefined);
  }
}
