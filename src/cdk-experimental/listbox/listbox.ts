/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  booleanAttribute,
  computed,
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';
import {ListboxPattern, OptionPattern} from '@angular/cdk-experimental/ui-patterns';
import {Directionality} from '@angular/cdk/bidi';
import {toSignal} from '@angular/core/rxjs-interop';

/**
 * A listbox container.
 *
 * Listboxes are used to display a list of items for a user to select from. The CdkListbox is meant
 * to be used in conjunction with CdkOption as follows:
 *
 * ```html
 * <ul cdkListbox>
 *   <li cdkOption>Item 1</li>
 *   <li cdkOption>Item 2</li>
 *   <li cdkOption>Item 3</li>
 * </ul>
 * ```
 */
@Directive({
  selector: '[cdkListbox]',
  exportAs: 'cdkListbox',
  host: {
    'role': 'listbox',
    'class': 'cdk-listbox',
    '[attr.tabindex]': 'pattern.tabindex()',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[attr.aria-orientation]': 'pattern.orientation()',
    '[attr.aria-multiselectable]': 'pattern.multiselectable()',
    '[attr.aria-activedescendant]': 'pattern.activedescendant()',
    '(keydown)': 'pattern.onKeydown($event)',
    '(pointerdown)': 'pattern.onPointerdown($event)',
  },
})
export class CdkListbox {
  /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
  private _directionality = inject(Directionality);

  /** The CdkOptions nested inside of the CdkListbox. */
  private _cdkOptions = contentChildren(CdkOption, {descendants: true});

  /** A signal wrapper for directionality. */
  protected textDirection = toSignal(this._directionality.change, {
    initialValue: this._directionality.value,
  });

  /** The Option UIPatterns of the child CdkOptions. */
  protected items = computed(() => this._cdkOptions().map(option => option.pattern));

  /** Whether the list is vertically or horizontally oriented. */
  orientation = input<'vertical' | 'horizontal'>('vertical');

  /** Whether multiple items in the list can be selected at once. */
  multiselectable = input(false, {transform: booleanAttribute});

  /** Whether focus should wrap when navigating. */
  wrap = input(true, {transform: booleanAttribute});

  /** Whether disabled items in the list should be skipped when navigating. */
  skipDisabled = input(true, {transform: booleanAttribute});

  /** The focus strategy used by the list. */
  focusMode = input<'roving' | 'activedescendant'>('roving');

  /** The selection strategy used by the list. */
  selectionMode = input<'follow' | 'explicit'>('follow');

  /** The amount of time before the typeahead search is reset. */
  typeaheadDelay = input<number>(0.5); // Picked arbitrarily.

  /** Whether the listbox is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  // TODO(wagnermaciel): Figure out how we want to expose control over the current listbox value.
  /** The ids of the current selected items. */
  selectedIds = model<string[]>([]);

  /** The current index that has been navigated to. */
  activeIndex = model<number>(0);

  /** The Listbox UIPattern. */
  pattern: ListboxPattern = new ListboxPattern({
    ...this,
    items: this.items,
    textDirection: this.textDirection,
  });
}

// TODO(wagnermaciel): Figure out how we want to generate IDs.
let count = 0;

/** A selectable option in a CdkListbox. */
@Directive({
  selector: '[cdkOption]',
  exportAs: 'cdkOption',
  host: {
    'role': 'option',
    'class': 'cdk-option',
    '[attr.tabindex]': 'pattern.tabindex()',
    '[attr.aria-selected]': 'pattern.selected()',
    '[attr.aria-disabled]': 'pattern.disabled()',
  },
})
export class CdkOption {
  /** A reference to the option element. */
  private _elementRef = inject(ElementRef);

  /** The parent CdkListbox. */
  private _cdkListbox = inject(CdkListbox);

  // TODO(wagnermaciel): Figure out how we want to generate IDs.
  /** A unique identifier for the option. */
  protected id = computed(() => `${count++}`);

  /** The text used by the typeahead search. */
  protected searchTerm = computed(() => this.label() ?? this.element().textContent);

  /** The parent Listbox UIPattern. */
  protected listbox = computed(() => this._cdkListbox.pattern);

  /** A reference to the option element to be focused on navigation. */
  protected element = computed(() => this._elementRef.nativeElement);

  /** Whether an item is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** The text used by the typeahead search. */
  label = input<string>();

  /** The Option UIPattern. */
  pattern = new OptionPattern({
    ...this,
    id: this.id,
    listbox: this.listbox,
    element: this.element,
    searchTerm: this.searchTerm,
  });
}
