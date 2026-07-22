/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {booleanAttribute, computed, Directive, ElementRef, inject, input} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {OptionPattern} from '../private';
import {LISTBOX} from './tokens';

/**
 * A selectable option in an `ngListbox`.
 *
 * This directive should be applied to an element (e.g., `<li>`, `<div>`) within an
 * `ngListbox`. The `value` input is used to identify the option, and the `label` input provides
 * the accessible name for the option.
 *
 * ```html
 * <li ngOption value="item-id" label="Item Name">
 *   Item Name
 * </li>
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Listbox](guide/aria/listbox)
 * @see [Autocomplete](guide/aria/autocomplete)
 * @see [Select](guide/aria/select)
 * @see [Multiselect](guide/aria/multiselect)
 */
@Directive({
  selector: '[ngOption]',
  exportAs: 'ngOption',
  host: {
    'role': 'option',
    '[attr.data-active]': 'active()',
    '[attr.id]': '_pattern.id()',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.aria-selected]': '_pattern.selected()',
    '[attr.aria-disabled]': '_pattern.disabled()',
  },
})
export class Option<V> {
  /** A reference to the host element. */
  readonly element = inject(ElementRef).nativeElement as HTMLElement;

  /** Whether the option is currently active (focused). */
  active = computed(() => this._pattern.active());

  /** The parent Listbox. */
  private readonly _listbox = inject(LISTBOX);

  /** A unique identifier for the option. */
  readonly id = input(inject(_IdGenerator).getId('ng-option-', true));

  // TODO(wagnermaciel): See if we want to change how we handle this since textContent is not
  // reactive. See https://github.com/angular/components/pull/30495#discussion_r1961260216.
  /** The text used by the typeahead search. */
  protected searchTerm = computed(() => this.label() ?? this.element.textContent);

  /** The parent Listbox UIPattern. */
  private readonly _listboxPattern = computed(() => this._listbox._pattern);

  /** The value of the option. */
  value = input.required<V>();

  /** Whether an item is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** The text used by the typeahead search. */
  label = input<string>();

  /** Whether the option is selected. */
  readonly selected = computed(() => this._pattern.selected());

  /** The Option UIPattern. */
  readonly _pattern = new OptionPattern<V>({
    ...this,
    id: this.id,
    value: this.value,
    listbox: this._listboxPattern,
    element: () => this.element,
    searchTerm: () => this.searchTerm() ?? '',
  });
}
