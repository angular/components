/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  OnInit,
  signal,
  Renderer2,
} from '@angular/core';
import {DeferredContentAware, SimpleComboboxPattern} from '@angular/aria/private';
import type {ComboboxPopup} from './simple-combobox-popup';

/**
 * The container element that wraps a combobox input and popup, and orchestrates its behavior.
 *
 * The `ngCombobox` directive is the main entry point for creating a combobox and customizing its
 * behavior. It coordinates the interactions between the input and the popup.
 *
 * ```html
 * <div ngCombobox [(expanded)]="expanded">
 *   <input ngComboboxInput />
 *
 *   <ng-template ngComboboxPopup>
 *     <div ngComboboxWidget>
 *       <!-- ... options ... -->
 *     </div>
 *   </ng-template>
 * </div>
 * ```
 */
@Directive({
  selector: '[ngCombobox]',
  exportAs: 'ngCombobox',
  host: {
    'role': 'combobox',
    '[attr.aria-autocomplete]': '_pattern.autocomplete()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-expanded]': '_pattern.isExpanded()',
    '[attr.aria-activedescendant]': '_pattern.activeDescendant()',
    '[attr.aria-controls]': '_pattern.popupId()',
    '[attr.aria-haspopup]': '_pattern.popupType()',
    '[attr.tabindex]':
      'disabled() && !softDisabled() ? -1 : (tabIndex() !== undefined ? tabIndex() : 0)',
    '[attr.disabled]': 'disabled() && !softDisabled() ? "" : null',
    '(keydown)': '_pattern.onKeydown($event)',
    '(focusin)': '_pattern.onFocusin()',
    '(focusout)': '_pattern.onFocusout($event)',
    '(click)': '_pattern.onClick($event)',
    '(input)': '_pattern.onInput($event)',
  },
})
export class Combobox extends DeferredContentAware implements OnInit {
  private readonly _renderer = inject(Renderer2);

  /** The element that the combobox is attached to. */
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** A reference to the input element. */
  readonly element = this._elementRef.nativeElement;

  /** The popup associated with the combobox. */
  readonly _popup = signal<ComboboxPopup | undefined>(undefined);

  /** Whether the combobox is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the combobox is soft disabled (remains focusable). */
  readonly softDisabled = input(true, {transform: booleanAttribute});

  /** Whether the combobox should always remain expanded. */
  readonly alwaysExpanded = input(false, {transform: booleanAttribute});

  /** The tabindex of the combobox. */
  readonly tabIndex = input<number | string | null | undefined>(undefined);

  /** Whether the combobox is expanded. */
  readonly expanded = model<boolean>(false);

  /** The value of the combobox input. */
  readonly value = model<string>('');

  /** An inline suggestion to be displayed in the input. */
  readonly inlineSuggestion = input<string | undefined>(undefined);

  /** The combobox ui pattern. */
  readonly _pattern = new SimpleComboboxPattern({
    ...this,
    element: () => this.element,
    expandable: () => true,
    popup: computed(() => this._popup()?._pattern),
  });

  constructor() {
    super();

    afterRenderEffect(() => this._pattern.keyboardEventRelayEffect());
    afterRenderEffect(() => this._pattern.closePopupOnBlurEffect());
    afterRenderEffect(() => {
      this.contentVisible.set(this._pattern.isExpanded());
    });

    if (this._pattern.isEditable()) {
      afterRenderEffect(() => {
        this._renderer.setProperty(this.element, 'value', this.value());
      });
      afterRenderEffect(() => {
        this._pattern.highlightEffect();
      });
    }
  }

  ngOnInit() {
    if (this.alwaysExpanded()) {
      this.expanded.set(true);
    }
  }

  /** Registers a popup with the combobox. */
  _registerPopup(popup: ComboboxPopup) {
    this._popup.set(popup);
  }

  /** Unregisters the popup from the combobox. */
  _unregisterPopup() {
    this._popup.set(undefined);
  }
}
