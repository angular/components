/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import {DeferredContent, DeferredContentAware} from '@angular/aria/deferred-content';
import {
  ComboboxPattern,
  ComboboxListboxControls,
  ComboboxTreeControls,
} from '@angular/aria/ui-patterns';

@Directive({
  selector: '[combobox]',
  exportAs: 'combobox',
  hostDirectives: [
    {
      directive: DeferredContentAware,
      inputs: ['preserveContent'],
    },
  ],
  host: {
    '[attr.data-expanded]': 'pattern.expanded()',
    '(input)': 'pattern.onInput($event)',
    '(keydown)': 'pattern.onKeydown($event)',
    '(pointerup)': 'pattern.onPointerup($event)',
    '(focusin)': 'pattern.onFocusIn()',
    '(focusout)': 'pattern.onFocusOut($event)',
  },
})
export class Combobox<V> {
  /** The element that the combobox is attached to. */
  private readonly _elementRef = inject(ElementRef);

  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware, {optional: true});

  /** The combobox popup. */
  readonly popup = contentChild<ComboboxPopup<V>>(ComboboxPopup);

  /** The filter mode for the combobox. */
  filterMode = input<'manual' | 'auto-select' | 'highlight'>('manual');

  /** Whether the combobox is focused. */
  readonly isFocused = signal(false);

  /** The value of the first matching item in the popup. */
  firstMatch = input<V | undefined>(undefined);

  /** Whether the listbox has received focus yet. */
  private _hasBeenFocused = signal(false);

  /** The combobox ui pattern. */
  readonly pattern = new ComboboxPattern<any, V>({
    ...this,
    inputValue: signal(''),
    inputEl: signal(undefined),
    containerEl: () => this._elementRef.nativeElement,
    popupControls: () => this.popup()?.controls(),
  });

  constructor() {
    afterRenderEffect(() => {
      if (!this._deferredContentAware?.contentVisible() && this.pattern.isFocused()) {
        this._deferredContentAware?.contentVisible.set(true);
      }
    });

    afterRenderEffect(() => {
      if (!this._hasBeenFocused() && this.pattern.isFocused()) {
        this._hasBeenFocused.set(true);
      }
    });
  }
}

@Directive({
  selector: 'input[comboboxInput]',
  exportAs: 'comboboxInput',
  host: {
    'role': 'combobox',
    '[value]': 'value()',
    '[attr.aria-expanded]': 'combobox.pattern.expanded()',
    '[attr.aria-activedescendant]': 'combobox.pattern.activedescendant()',
    '[attr.aria-controls]': 'combobox.pattern.popupId()',
    '[attr.aria-haspopup]': 'combobox.pattern.hasPopup()',
    '[attr.aria-autocomplete]': 'combobox.pattern.autocomplete()',
  },
})
export class ComboboxInput {
  /** The element that the combobox is attached to. */
  private readonly _elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

  /** The combobox that the input belongs to. */
  readonly combobox = inject(Combobox);

  /** The value of the input. */
  value = model<string>('');

  constructor() {
    (this.combobox.pattern.inputs.inputEl as WritableSignal<HTMLInputElement>).set(
      this._elementRef.nativeElement,
    );
    this.combobox.pattern.inputs.inputValue = this.value;

    /** Focuses & selects the first item in the combobox if the user changes the input value. */
    afterRenderEffect(() => {
      this.combobox.popup()?.controls()?.items();
      untracked(() => this.combobox.pattern.onFilter());
    });
  }
}

@Directive({
  selector: 'ng-template[comboboxPopupContainer]',
  exportAs: 'comboboxPopupContainer',
  hostDirectives: [DeferredContent],
})
export class ComboboxPopupContainer {}

@Directive({
  selector: '[comboboxPopup]',
  exportAs: 'comboboxPopup',
})
export class ComboboxPopup<V> {
  /** The combobox that the popup belongs to. */
  readonly combobox = inject<Combobox<V>>(Combobox, {optional: true});

  /** The controls the popup exposes to the combobox. */
  readonly controls = signal<
    ComboboxListboxControls<any, V> | ComboboxTreeControls<any, V> | undefined
  >(undefined);
}
