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
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import {DeferredContentAware, ComboboxPattern} from '@angular/aria/private';
import {Directionality} from '@angular/cdk/bidi';
import {toSignal} from '@angular/core/rxjs-interop';
import {ComboboxPopup} from './combobox-popup';
import {COMBOBOX} from './combobox-tokens';

/**
 * The container element that wraps a combobox input and popup, and orchestrates its behavior.
 *
 * The `ngCombobox` directive is the main entry point for creating a combobox and customizing its
 * behavior. It coordinates the interactions between the `ngComboboxInput` and the popup, which
 * is defined by a `ng-template` with the `ngComboboxPopupContainer` directive. If using the
 * `CdkOverlay`, the `cdkConnectedOverlay` directive takes the place of `ngComboboxPopupContainer`.
 *
 * ```html
 * <div ngCombobox filterMode="highlight">
 *   <input
 *     ngComboboxInput
 *     placeholder="Search for a state..."
 *     [(value)]="searchString"
 *   />
 *
 *   <ng-template ngComboboxPopupContainer>
 *     <div ngListbox [(value)]="selectedValue">
 *       @for (option of filteredOptions(); track option) {
 *         <div ngOption [value]="option" [label]="option">
 *           <span>{{option}}</span>
 *         </div>
 *       }
 *     </div>
 *   </ng-template>
 * </div>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngCombobox]',
  exportAs: 'ngCombobox',
  hostDirectives: [
    {
      directive: DeferredContentAware,
      inputs: ['preserveContent'],
    },
  ],
  host: {
    '[attr.data-expanded]': 'expanded()',
    '(input)': '_pattern.onInput($event)',
    '(keydown)': '_pattern.onKeydown($event)',
    '(click)': '_pattern.onClick($event)',
    '(focusin)': '_pattern.onFocusIn()',
    '(focusout)': '_pattern.onFocusOut($event)',
  },
  providers: [{provide: COMBOBOX, useExisting: Combobox}],
})
export class Combobox<V> {
  /** The directionality (LTR / RTL) context for the application (or a subtree of it). */
  private readonly _directionality = inject(Directionality);

  /** A signal wrapper for directionality. */
  protected textDirection = toSignal(this._directionality.change, {
    initialValue: this._directionality.value,
  });

  /** The element that the combobox is attached to. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the combobox element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware, {optional: true});

  /** The combobox popup. */
  readonly popup = contentChild<ComboboxPopup<V>>(ComboboxPopup);

  /**
   * The filter mode for the combobox.
   * - `manual`: The consumer is responsible for filtering the options.
   * - `auto-select`: The combobox automatically selects the first matching option.
   * - `highlight`: The combobox highlights matching text in the options without changing selection.
   */
  filterMode = input<'manual' | 'auto-select' | 'highlight'>('manual');

  /** Whether the combobox is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the combobox is read-only. */
  readonly readonly = input(false, {transform: booleanAttribute});

  /** The value of the first matching item in the popup. */
  readonly firstMatch = input<V | undefined>(undefined);

  /** Whether the combobox is expanded. */
  readonly expanded = computed(() => this.alwaysExpanded() || this._pattern.expanded());

  // TODO: Maybe make expanded a signal that can be passed in?
  // Or an "always expanded" option?

  /** Whether the combobox popup should always be expanded, regardless of user interaction. */
  readonly alwaysExpanded = input(false, {transform: booleanAttribute});

  /** Input element connected to the combobox, if any. */
  readonly inputElement = computed(() => this._pattern.inputs.inputEl());

  /** The combobox ui pattern. */
  readonly _pattern = new ComboboxPattern<any, V>({
    ...this,
    textDirection: this.textDirection,
    disabled: this.disabled,
    readonly: this.readonly,
    inputValue: signal(''),
    inputEl: signal(undefined),
    containerEl: () => this._elementRef.nativeElement,
    popupControls: () => this.popup()?._controls(),
  });

  constructor() {
    afterRenderEffect(() => {
      if (this.alwaysExpanded()) {
        this._pattern.expanded.set(true);
      }
    });

    afterRenderEffect(() => {
      if (
        !this._deferredContentAware?.contentVisible() &&
        (this._pattern.isFocused() || this.alwaysExpanded())
      ) {
        this._deferredContentAware?.contentVisible.set(true);
      }
    });
  }

  /** Opens the combobox to the selected item. */
  open() {
    this._pattern.open({selected: true});
  }

  /** Closes the combobox. */
  close() {
    this._pattern.close();
  }
}
