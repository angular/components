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
import {Directionality} from '@angular/cdk/bidi';
import {_IdGenerator} from '@angular/cdk/a11y';
import {ComboboxListboxPattern, ListboxPattern} from '../private';
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
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.aria-readonly]': '_pattern.readonly()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-orientation]': '_pattern.orientation()',
    '[attr.aria-multiselectable]': '_pattern.multi()',
    '[attr.aria-activedescendant]': '_pattern.activeDescendant()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
    '(focusin)': '_onFocus()',
  },
  hostDirectives: [ComboboxPopup],
  providers: [{provide: LISTBOX, useExisting: Listbox}],
})
export class Listbox<V> {
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

  /** The Options nested inside of the Listbox. */
  private readonly _options = contentChildren(Option, {descendants: true});

  /** A signal wrapper for directionality. */
  protected textDirection = inject(Directionality).valueSignal.asReadonly();

  /** The Option UIPatterns of the child Options. */
  protected items = computed(() => this._options().map(option => option._pattern));

  /** Whether the list is vertically or horizontally oriented. */
  orientation = input<'vertical' | 'horizontal'>('vertical');

  /** Whether multiple items in the list can be selected at once. */
  multi = input(false, {transform: booleanAttribute});

  /** Whether focus should wrap when navigating. */
  wrap = input(true, {transform: booleanAttribute});

  /**
   * Whether to allow disabled items to receive focus. When `true`, disabled items are
   * focusable but not interactive. When `false`, disabled items are skipped during navigation.
   */
  softDisabled = input(true, {transform: booleanAttribute});

  /**
   * The focus strategy used by the list.
   * - `roving`: Focus is moved to the active item using `tabindex`.
   * - `activedescendant`: Focus remains on the listbox container, and `aria-activedescendant` is used to indicate the active item.
   */
  focusMode = input<'roving' | 'activedescendant'>('roving');

  /**
   * The selection strategy used by the list.
   * - `follow`: The focused item is automatically selected.
   * - `explicit`: Items are selected explicitly by the user (e.g., via click or spacebar).
   */
  selectionMode = input<'follow' | 'explicit'>('follow');

  /** The amount of time before the typeahead search is reset. */
  typeaheadDelay = input<number>(500); // Picked arbitrarily.

  /** Whether the listbox is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** Whether the listbox is readonly. */
  readonly = input(false, {transform: booleanAttribute});

  /** The values of the currently selected items. */
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
      this._popup._controls.set(this._pattern as ComboboxListboxPattern<V>);
    }

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      afterRenderEffect(() => {
        const violations = this._pattern.validate();
        for (const violation of violations) {
          console.error(violation);
        }
      });
    }

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

  _onFocus() {
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
