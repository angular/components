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
import {ListboxPattern, OptionPattern} from '../ui-patterns';
import {Directionality} from '@angular/cdk/bidi';
import {toSignal} from '@angular/core/rxjs-interop';
import {_IdGenerator} from '@angular/cdk/a11y';

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
    '[attr.aria-multiselectable]': 'pattern.multi()',
    '[attr.aria-activedescendant]': 'pattern.activedescendant()',
    '(keydown)': 'pattern.onKeydown($event)',
    '(pointerdown)': 'pattern.onPointerdown($event)',
  },
})
export class CdkListbox<V> {
  /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
  private readonly _directionality = inject(Directionality);

  /** The CdkOptions nested inside of the CdkListbox. */
  private readonly _cdkOptions = contentChildren(CdkOption, {descendants: true});

  /** A signal wrapper for directionality. */
  protected textDirection = toSignal(this._directionality.change, {
    initialValue: this._directionality.value,
  });

  /** The Option UIPatterns of the child CdkOptions. */
  protected items = computed(() => this._cdkOptions().map(option => option.pattern));

  /** Whether the list is vertically or horizontally oriented. */
  orientation = input<'vertical' | 'horizontal'>('vertical');

  /** Whether multiple items in the list can be selected at once. */
  multi = input(false, {transform: booleanAttribute});

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

  /** The values of the current selected items. */
  value = model<V[]>([]);

  /** The current index that has been navigated to. */
  activeIndex = model<number>(0);

  /** The Listbox UIPattern. */
  pattern: ListboxPattern<V> = new ListboxPattern<V>({
    ...this,
    items: this.items,
    textDirection: this.textDirection,
  });
}

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
export class CdkOption<V> {
  /** A reference to the option element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent CdkListbox. */
  private readonly _cdkListbox = inject(CdkListbox);

  /** A unique identifier for the option. */
  private readonly _generatedId = inject(_IdGenerator).getId('cdk-option-');

  // TODO(wagnermaciel): https://github.com/angular/components/pull/30495#discussion_r1972601144.
  /** A unique identifier for the option. */
  protected id = computed(() => this._generatedId);

  protected value = input.required<V>();

  // TODO(wagnermaciel): See if we want to change how we handle this since textContent is not
  // reactive. See https://github.com/angular/components/pull/30495#discussion_r1961260216.
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
  pattern = new OptionPattern<V>({
    ...this,
    id: this.id,
    value: this.value,
    listbox: this.listbox,
    element: this.element,
    searchTerm: this.searchTerm,
  });
}
