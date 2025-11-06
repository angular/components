/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterRenderEffect,
  computed,
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
import {
  DeferredContent,
  DeferredContentAware,
  ComboboxPattern,
  ComboboxListboxControls,
  ComboboxTreeControls,
  ComboboxDialogPattern,
} from '@angular/aria/private';
import {Directionality} from '@angular/cdk/bidi';
import {toSignal} from '@angular/core/rxjs-interop';

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
    '(pointerup)': '_pattern.onPointerup($event)',
    '(focusin)': '_pattern.onFocusIn()',
    '(focusout)': '_pattern.onFocusOut($event)',
  },
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

  /** The DeferredContentAware host directive. */
  private readonly _deferredContentAware = inject(DeferredContentAware, {optional: true});

  /** The combobox popup. */
  readonly popup = contentChild<ComboboxPopup<V>>(ComboboxPopup);

  /** The filter mode for the combobox. */
  filterMode = input<'manual' | 'auto-select' | 'highlight'>('manual');

  /** Whether the combobox is focused. */
  readonly isFocused = signal(false);

  /** Whether the combobox has received focus yet. */
  private _hasBeenFocused = signal(false);

  /** Whether the combobox is disabled. */
  readonly disabled = input(false);

  /** Whether the combobox is read-only. */
  readonly readonly = input(false);

  /** The value of the first matching item in the popup. */
  readonly firstMatch = input<V | undefined>(undefined);

  /** Whether the combobox is expanded. */
  readonly expanded = computed(() => this.alwaysExpanded() || this._pattern.expanded());

  // TODO: Maybe make expanded a signal that can be passed in?
  // Or an "always expanded" option?

  readonly alwaysExpanded = input(false);

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
    popupControls: () => this.popup()?.controls(),
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

    afterRenderEffect(() => {
      if (!this._hasBeenFocused() && this._pattern.isFocused()) {
        this._hasBeenFocused.set(true);
      }
    });
  }
}

@Directive({
  selector: 'input[ngComboboxInput]',
  exportAs: 'ngComboboxInput',
  host: {
    'role': 'combobox',
    '[value]': 'value()',
    '[attr.aria-expanded]': 'combobox._pattern.expanded()',
    '[attr.aria-activedescendant]': 'combobox._pattern.activeDescendant()',
    '[attr.aria-controls]': 'combobox._pattern.popupId()',
    '[attr.aria-haspopup]': 'combobox._pattern.hasPopup()',
    '[attr.aria-autocomplete]': 'combobox._pattern.autocomplete()',
    '[attr.readonly]': 'combobox._pattern.readonly()',
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
    (this.combobox._pattern.inputs.inputEl as WritableSignal<HTMLInputElement>).set(
      this._elementRef.nativeElement,
    );
    this.combobox._pattern.inputs.inputValue = this.value;

    const controls = this.combobox.popup()?.controls();
    if (controls instanceof ComboboxDialogPattern) {
      return;
    }

    /** Focuses & selects the first item in the combobox if the user changes the input value. */
    afterRenderEffect(() => {
      this.value();
      controls?.items();
      untracked(() => this.combobox._pattern.onFilter());
    });
  }
}

@Directive({
  selector: 'ng-template[ngComboboxPopupContainer]',
  exportAs: 'ngComboboxPopupContainer',
  hostDirectives: [DeferredContent],
})
export class ComboboxPopupContainer {}

@Directive({
  selector: '[ngComboboxPopup]',
  exportAs: 'ngComboboxPopup',
})
export class ComboboxPopup<V> {
  /** The combobox that the popup belongs to. */
  readonly combobox = inject<Combobox<V>>(Combobox);

  /** The controls the popup exposes to the combobox. */
  readonly controls = signal<
    | ComboboxListboxControls<any, V>
    | ComboboxTreeControls<any, V>
    | ComboboxDialogPattern
    | undefined
  >(undefined);
}

@Directive({
  selector: 'dialog[ngComboboxDialog]',
  exportAs: 'ngComboboxDialog',
  host: {
    '[attr.data-open]': 'combobox._pattern.expanded()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(click)': '_pattern.onClick($event)',
  },
  hostDirectives: [{directive: ComboboxPopup}],
})
export class ComboboxDialog {
  /** The dialog element. */
  readonly element = inject(ElementRef<HTMLDialogElement>);

  /** The combobox that the dialog belongs to. */
  readonly combobox = inject(Combobox);

  /** A reference to the parent combobox popup, if one exists. */
  private readonly _popup = inject<ComboboxPopup<any>>(ComboboxPopup, {
    optional: true,
  });

  _pattern: ComboboxDialogPattern;

  constructor() {
    this._pattern = new ComboboxDialogPattern({
      id: () => '',
      element: () => this.element.nativeElement,
      combobox: this.combobox._pattern,
    });

    if (this._popup) {
      this._popup.controls.set(this._pattern);
    }

    afterRenderEffect(() => {
      if (this.element) {
        this.combobox._pattern.expanded()
          ? this.element.nativeElement.showModal()
          : this.element.nativeElement.close();
      }
    });
  }

  close() {
    this._popup?.combobox._pattern.close();
  }
}
