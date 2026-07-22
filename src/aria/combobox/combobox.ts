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
import {DeferredContentAware, ComboboxPattern, tabIndexTransform} from '@angular/aria/private';
import type {ComboboxPopup} from './combobox-popup';

/**
 * A directive that coordinates a combobox trigger element and its associated popup widget.
 *
 * The `ngCombobox` directive is applied directly to the interactive trigger element, which can be
 * either an editable `<input>` (for search/autocomplete behaviors) or a non-editable element like
 * a `<div>` (for custom select dropdowns). It manages focus and expansion states, coordinates autocomplete
 * suggestions (if editable), and forwards navigation keys down into the active popup.
 *
 * ### Example 1: Editable Autocomplete Input
 * ```html
 * <input ngCombobox #combobox="ngCombobox" [(value)]="searchQuery" [(expanded)]="isExpanded" />
 *
 * <ng-template ngComboboxPopup [combobox]="combobox">
 *   <div ngComboboxWidget #listbox="ngListbox" ngListbox [(value)]="selectedValues" [activeDescendant]="listbox.activeDescendant()">
 *     <div ngOption value="first">First Option</div>
 *     <div ngOption value="second">Second Option</div>
 *   </div>
 * </ng-template>
 * ```
 *
 * ### Example 2: Non-Editable Custom Select Dropdown
 * ```html
 * <div ngCombobox #combobox="ngCombobox" [(expanded)]="isExpanded" class="select-trigger">
 *   {{selectedValue}}
 * </div>
 *
 * <ng-template ngComboboxPopup [combobox]="combobox">
 *   <div ngComboboxWidget #listbox="ngListbox" ngListbox [(value)]="selectedValues" [activeDescendant]="listbox.activeDescendant()">
 *     <div ngOption value="first">First Option</div>
 *     <div ngOption value="second">Second Option</div>
 *   </div>
 * </ng-template>
 * ```
 */
@Directive({
  selector: '[ngCombobox]',
  exportAs: 'ngCombobox',
  host: {
    'role': 'combobox',
    '[attr.aria-autocomplete]': '_pattern.autocomplete()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-readonly]': '_pattern.ariaReadonly()',
    '[attr.aria-expanded]': '_pattern.isExpanded()',
    '[attr.aria-activedescendant]': '_pattern.activeDescendant()',
    '[attr.aria-controls]': '_pattern.popupId()',
    '[attr.aria-haspopup]': '_pattern.popupType()',
    '[attr.tabindex]':
      'disabled() && !softDisabled() ? -1 : (tabIndex() !== undefined ? tabIndex() : 0)',
    '[attr.disabled]': '_pattern.nativeDisabled()',
    '[attr.readonly]': '_pattern.nativeReadonly()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(focusin)': '_pattern.onFocusin()',
    '(focusout)': '_pattern.onFocusout()',
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

  /** Whether the combobox is readonly. */
  readonly readonly = input(false, {transform: booleanAttribute});

  /** Whether the combobox is soft disabled (remains focusable). */
  readonly softDisabled = input(true, {transform: booleanAttribute});

  /** Whether the combobox should always remain expanded. */
  readonly alwaysExpanded = input(false, {transform: booleanAttribute});

  /** The tabindex of the combobox. */
  readonly tabIndex = input(undefined, {
    alias: 'tabindex',
    transform: tabIndexTransform,
  });

  /** Whether the combobox is expanded. */
  readonly expanded = model<boolean>(false);

  /** The value of the combobox input. */
  readonly value = model<string>('');

  /** An inline suggestion to be displayed in the input. */
  readonly inlineSuggestion = input<string | undefined>(undefined);

  /** The combobox ui pattern. */
  readonly _pattern = new ComboboxPattern({
    ...this,
    readonly: () => this.readonly(),
    element: () => this.element,
    expandable: () => true,
    popup: computed(() => this._popup()?._pattern),
  });

  constructor() {
    super();

    afterRenderEffect({write: () => this._pattern.keyboardEventRelayEffect()});
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
