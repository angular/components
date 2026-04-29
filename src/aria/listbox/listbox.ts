/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  afterNextRender,
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  OnDestroy,
  signal,
  Signal,
  untracked,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {_IdGenerator} from '@angular/cdk/a11y';
import {ComboboxListboxPattern, ListboxPattern} from '../private';
import {SortedCollection} from '../private/utils/collection';
import {ComboboxPopup} from '../combobox';
import {Option} from './option';
import {LISTBOX} from './tokens';

/**
 * Represents a container used to display a list of items for a user to select from.
 *
 * The `ngListbox` is meant to be used in conjunction with `ngOption` directives to create a
 * selectable list. It supports single and multiple selection modes, as well as various focus and
 * orientation strategies.
 *
 * ```html
 * <ul ngListbox [(value)]="selectedItems" [multi]="true" orientation="vertical">
 *   @for (item of items; track item.id) {
 *     <li ngOption [value]="item.id" [label]="item.name" [disabled]="item.disabled">
 *       {{item.name}}
 *     </li>
 *   }
 * </ul>
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
  selector: '[ngListbox]',
  exportAs: 'ngListbox',
  host: {
    'role': 'listbox',
    '[attr.id]': 'id()',
    '[attr.tabindex]': 'tabIndex() !== undefined ? tabIndex() : _pattern.tabIndex()',
    '[attr.aria-readonly]': '_pattern.readonly()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-orientation]': '_pattern.orientation()',
    '[attr.aria-multiselectable]': '_pattern.multi()',
    '[attr.aria-activedescendant]': '_pattern.activeDescendant()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(click)': '_pattern.onClick($event)',
    '(focusin)': '_pattern.onFocusIn()',
  },
  hostDirectives: [ComboboxPopup],
  providers: [{provide: LISTBOX, useExisting: Listbox}],
})
export class Listbox<V> implements OnDestroy {
  /** A unique identifier for the listbox. */
  readonly id = input(inject(_IdGenerator).getId('ng-listbox-', true));

  /** A reference to the parent combobox popup, if one exists. */
  private readonly _popup = inject<ComboboxPopup<V>>(ComboboxPopup, {
    optional: true,
  });

  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The collection of Options. */
  readonly _collection = new SortedCollection<Option<V>>();

  /** A signal wrapper for directionality. */
  protected readonly textDirection = inject(Directionality).valueSignal.asReadonly();

  /** Whether the list is vertically or horizontally oriented. */
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');

  /** Whether multiple items in the list can be selected at once. */
  readonly multi = input(false, {transform: booleanAttribute});

  /** Whether focus should wrap when navigating. */
  readonly wrap = input(true, {transform: booleanAttribute});

  /**
   * Whether to allow disabled items to receive focus. When `true`, disabled items are
   * focusable but not interactive. When `false`, disabled items are skipped during navigation.
   */
  readonly softDisabled = input(true, {transform: booleanAttribute});

  /**
   * The focus strategy used by the list.
   * - `roving`: Focus is moved to the active item using `tabindex`.
   * - `activedescendant`: Focus remains on the listbox container, and `aria-activedescendant` is used to indicate the active item.
   */
  readonly focusMode = input<'roving' | 'activedescendant'>('roving');

  /**
   * The selection strategy used by the list.
   * - `follow`: The focused item is automatically selected.
   * - `explicit`: Items are selected explicitly by the user (e.g., via click or spacebar).
   */
  readonly selectionMode = input<'follow' | 'explicit'>('follow');

  /** The amount of time before the typeahead search is reset. */
  readonly typeaheadDelay = input<number>(500); // Picked arbitrarily.

  /** Whether the listbox is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the listbox is readonly. */
  readonly readonly = input(false, {transform: booleanAttribute});

  /** The tabindex of the listbox. */
  readonly tabIndex = input(undefined, {
    transform: (v: string | number | undefined) =>
      v === undefined ? undefined : numberAttribute(v),
  });

  /** The values of the currently selected items. */
  readonly value = model<V[]>([]);

  /** The Listbox UIPattern. */
  readonly _pattern: ListboxPattern<V>;

  /** The ID of the active descendant in the listbox. */
  readonly activeDescendant: Signal<string | undefined>;

  constructor() {
    // Map directives to their patterns for the ListboxPattern
    const orderedItemPatterns = computed(() =>
      this._collection.orderedItems().map(option => option._pattern),
    );

    const inputs = {
      ...this,
      id: this.id,
      items: orderedItemPatterns,
      activeItem: signal(undefined),
      textDirection: this.textDirection,
      element: () => this._elementRef.nativeElement,
      combobox: () => this._popup?.combobox?._pattern,
    };

    this._pattern = this._popup?.combobox
      ? new ComboboxListboxPattern<V>(inputs)
      : new ListboxPattern<V>(inputs);

    this.activeDescendant = computed(() => this._pattern.activeDescendant());

    afterNextRender(() => {
      this._collection.startObserving(this.element);
    });

    if (this._popup) {
      this._popup._controls.set(this._pattern as ComboboxListboxPattern<V>);
    }

    // Check for any violationns after the DOM has been updated.
    afterRenderEffect({
      read: () => {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          const violations = this._pattern.validate();
          for (const violation of violations) {
            console.error(violation);
          }
        }
      },
    });

    afterRenderEffect({write: () => this._pattern.setDefaultStateEffect()});

    // Ensure that if the active item is removed from
    // the list, the listbox updates it's focus state.
    afterRenderEffect({
      write: () => {
        const items = inputs.items();
        const activeItem = untracked(() => inputs.activeItem());

        if (!items.some(i => i === activeItem) && activeItem) {
          this._pattern.listBehavior.unfocus();
        }
      },
    });

    // Ensure that the value is always in sync with the available options.
    // This needs to be after the render for the value to always be available.
    afterRenderEffect({
      write: () => {
        const items = inputs.items();
        const value = untracked(() => this.value());

        if (items && value.some(v => !items.some(i => i.value() === v))) {
          this.value.set(value.filter(v => items.some(i => i.value() === v)));
        }
      },
    });
  }

  ngOnDestroy() {
    this._collection.stopObserving();
  }

  scrollActiveItemIntoView(options: ScrollIntoViewOptions = {block: 'nearest'}) {
    this._pattern.inputs.activeItem()?.element()?.scrollIntoView(options);
  }

  /** Navigates to the first item in the listbox. */
  gotoFirst() {
    this._pattern.listBehavior.first();
  }
}
