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
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import {ComboboxListboxPattern, ListboxPattern, OptionPattern} from '@angular/aria/private';
import {Directionality} from '@angular/cdk/bidi';
import {toSignal} from '@angular/core/rxjs-interop';
import {_IdGenerator} from '@angular/cdk/a11y';
import {ComboboxPopup} from '../combobox';

/**
 * A listbox container.
 *
 * Listboxes are used to display a list of items for a user to select from. The Listbox is meant
 * to be used in conjunction with Option as follows:
 *
 * ```html
 * <ul ngListbox>
 *   <li [value]="1" ngOption>Item 1</li>
 *   <li [value]="2" ngOption>Item 2</li>
 *   <li [value]="3" ngOption>Item 3</li>
 * </ul>
 * ```
 */
@Directive({
  selector: '[ngListbox]',
  exportAs: 'ngListbox',
  host: {
    'role': 'listbox',
    'class': 'ng-listbox',
    '[attr.id]': 'id()',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.aria-readonly]': '_pattern.readonly()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-orientation]': '_pattern.orientation()',
    '[attr.aria-multiselectable]': '_pattern.multi()',
    '[attr.aria-activedescendant]': '_pattern.activeDescendant()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
    '(focusin)': 'onFocus()',
  },
  hostDirectives: [ComboboxPopup],
})
export class Listbox<V> {
  /** A unique identifier for the listbox. */
  private readonly _generatedId = inject(_IdGenerator).getId('ng-listbox-', true);

  // TODO(wagnermaciel): https://github.com/angular/components/pull/30495#discussion_r1972601144.
  /** A unique identifier for the listbox. */
  protected id = computed(() => this._generatedId);

  /** A reference to the parent combobox popup, if one exists. */
  private readonly _popup = inject<ComboboxPopup<V>>(ComboboxPopup, {
    optional: true,
  });

  /** A reference to the listbox element. */
  private readonly _elementRef = inject(ElementRef);

  /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
  private readonly _directionality = inject(Directionality);

  /** The Options nested inside of the Listbox. */
  private readonly _options = contentChildren(Option, {descendants: true});

  /** A signal wrapper for directionality. */
  protected textDirection = toSignal(this._directionality.change, {
    initialValue: this._directionality.value,
  });

  /** The Option UIPatterns of the child Options. */
  protected items = computed(() => this._options().map(option => option._pattern));

  /** Whether the list is vertically or horizontally oriented. */
  orientation = input<'vertical' | 'horizontal'>('vertical');

  /** Whether multiple items in the list can be selected at once. */
  multi = input(false, {transform: booleanAttribute});

  /** Whether focus should wrap when navigating. */
  wrap = input(true, {transform: booleanAttribute});

  /** Whether to allow disabled items in the list to receive focus. */
  softDisabled = input(true, {transform: booleanAttribute});

  /** The focus strategy used by the list. */
  focusMode = input<'roving' | 'activedescendant'>('roving');

  /** The selection strategy used by the list. */
  selectionMode = input<'follow' | 'explicit'>('follow');

  /** The amount of time before the typeahead search is reset. */
  typeaheadDelay = input<number>(0.5); // Picked arbitrarily.

  /** Whether the listbox is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** Whether the listbox is readonly. */
  readonly = input(false, {transform: booleanAttribute});

  /** The values of the current selected items. */
  values = model<V[]>([]);

  /** The Listbox UIPattern. */
  readonly _pattern: ListboxPattern<V>;

  /** Whether the listbox has received focus yet. */
  private _hasFocused = signal(false);

  constructor() {
    const inputs = {
      ...this,
      id: this.id,
      items: this.items,
      activeItem: signal(undefined),
      textDirection: this.textDirection,
      element: () => this._elementRef.nativeElement,
      combobox: () => this._popup?.combobox?._pattern,
    };

    this._pattern = this._popup?.combobox
      ? new ComboboxListboxPattern<V>(inputs)
      : new ListboxPattern<V>(inputs);

    if (this._popup) {
      this._popup.controls.set(this._pattern as ComboboxListboxPattern<V>);
    }

    afterRenderEffect(() => {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        const violations = this._pattern.validate();
        for (const violation of violations) {
          console.error(violation);
        }
      }
    });

    afterRenderEffect(() => {
      if (!this._hasFocused()) {
        this._pattern.setDefaultState();
      }
    });

    // Ensure that if the active item is removed from
    // the list, the listbox updates it's focus state.
    afterRenderEffect(() => {
      const items = inputs.items();
      const activeItem = untracked(() => inputs.activeItem());

      if (!items.some(i => i === activeItem) && activeItem) {
        this._pattern.listBehavior.unfocus();
      }
    });

    // Ensure that the values are always in sync with the available options.
    afterRenderEffect(() => {
      const items = inputs.items();
      const values = untracked(() => this.values());

      if (items && values.some(v => !items.some(i => i.value() === v))) {
        this.values.set(values.filter(v => items.some(i => i.value() === v)));
      }
    });
  }

  onFocus() {
    this._hasFocused.set(true);
  }

  scrollActiveItemIntoView(options: ScrollIntoViewOptions = {block: 'nearest'}) {
    this._pattern.inputs.activeItem()?.element()?.scrollIntoView(options);
  }

  /** Navigates to the first item in the listbox. */
  gotoFirst() {
    this._pattern.listBehavior.first();
  }
}

/** A selectable option in a Listbox. */
@Directive({
  selector: '[ngOption]',
  exportAs: 'ngOption',
  host: {
    'role': 'option',
    'class': 'ng-option',
    '[attr.data-active]': '_pattern.active()',
    '[attr.id]': '_pattern.id()',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.aria-selected]': '_pattern.selected()',
    '[attr.aria-disabled]': '_pattern.disabled()',
  },
})
export class Option<V> {
  /** A reference to the option element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent Listbox. */
  private readonly _listbox = inject(Listbox);

  /** A unique identifier for the option. */
  private readonly _generatedId = inject(_IdGenerator).getId('ng-option-', true);

  // TODO(wagnermaciel): https://github.com/angular/components/pull/30495#discussion_r1972601144.
  /** A unique identifier for the option. */
  protected id = computed(() => this._generatedId);

  // TODO(wagnermaciel): See if we want to change how we handle this since textContent is not
  // reactive. See https://github.com/angular/components/pull/30495#discussion_r1961260216.
  /** The text used by the typeahead search. */
  protected searchTerm = computed(() => this.label() ?? this.element().textContent);

  /** The parent Listbox UIPattern. */
  protected listbox = computed(() => this._listbox._pattern);

  /** A reference to the option element to be focused on navigation. */
  protected element = computed(() => this._elementRef.nativeElement);

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
    listbox: this.listbox,
    element: this.element,
    searchTerm: this.searchTerm,
  });
}
