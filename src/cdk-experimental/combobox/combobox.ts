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
  WritableSignal,
} from '@angular/core';
import {DeferredContent, DeferredContentAware} from '@angular/cdk-experimental/deferred-content';
import {ComboboxPattern, ComboboxPopupControls} from '../ui-patterns';

@Directive({
  selector: '[cdkCombobox]',
  exportAs: 'cdkCombobox',
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
export class CdkCombobox<V> {
  /** The element that the combobox is attached to. */
  private readonly _elementRef = inject(ElementRef);

  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware, {optional: true});

  /** The combobox popup. */
  readonly popup = contentChild<CdkComboboxPopup<V>>(CdkComboboxPopup);

  /** The filter mode for the combobox. */
  filterMode = input<'manual' | 'auto-select' | 'highlight'>('manual');

  /** Whether the combobox is focused. */
  readonly isFocused = signal(false);

  /** The values of the current selected items. */
  value = model<V | undefined>(undefined);

  filter = input<(inputText: string, itemText: string) => boolean>((inputText, itemText) =>
    itemText.toLowerCase().includes(inputText.toLowerCase()),
  );

  /** The combobox ui pattern. */
  readonly pattern = new ComboboxPattern<any, V>({
    ...this,
    inputEl: signal(undefined),
    containerEl: signal(undefined),
    popupControls: () => this.popup()?.actions(),
  });

  constructor() {
    (this.pattern.inputs.containerEl as WritableSignal<HTMLElement>).set(
      this._elementRef.nativeElement,
    );

    afterRenderEffect(() => {
      this._deferredContentAware?.contentVisible.set(this.pattern.isFocused());
    });
  }
}

@Directive({
  selector: 'input[cdkComboboxInput]',
  exportAs: 'cdkComboboxInput',
  host: {
    'role': 'combobox',
    '[attr.aria-expanded]': 'combobox.pattern.expanded()',
    '[attr.aria-activedescendant]': 'combobox.pattern.activedescendant()',
  },
})
export class CdkComboboxInput {
  /** The element that the combobox is attached to. */
  private readonly _elementRef = inject(ElementRef);

  /** The combobox that the input belongs to. */
  readonly combobox = inject(CdkCombobox);

  constructor() {
    (this.combobox.pattern.inputs.inputEl as WritableSignal<HTMLInputElement>).set(
      this._elementRef.nativeElement,
    );
  }
}

@Directive({
  selector: 'ng-template[cdkComboboxPopupContent]',
  exportAs: 'cdkComboboxPopupContent',
  hostDirectives: [DeferredContent],
})
export class CdkComboboxPopupContent {}

@Directive({
  selector: '[cdkComboboxPopup]',
  exportAs: 'cdkComboboxPopup',
})
export class CdkComboboxPopup<V> {
  /** The combobox that the popup belongs to. */
  readonly combobox = inject<CdkCombobox<V>>(CdkCombobox, {optional: true});

  /** The actions that the combobox can perform on the popup. */
  readonly actions = signal<ComboboxPopupControls<any, V> | undefined>(undefined);
}
