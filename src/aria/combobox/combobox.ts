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
  readonly readonly = input(false);

  /** The value of the first matching item in the popup. */
  readonly firstMatch = input<V | undefined>(undefined);

  /** Whether the combobox is expanded. */
  readonly expanded = computed(() => this.alwaysExpanded() || this._pattern.expanded());

  // TODO: Maybe make expanded a signal that can be passed in?
  // Or an "always expanded" option?

  /** Whether the combobox popup should always be expanded, regardless of user interaction. */
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
  }

  /** Opens the combobox to the selected item. */
  open() {
    this._pattern.open({selected: true});
  }

  /** Closes the combobox. */
  close() {
    this._pattern.close();
  }

  /** Expands the combobox popup. */
  expand() {
    this._pattern.open();
  }

  /** Collapses the combobox popup. */
  collapse() {
    this._pattern.close();
  }
}

/**
 * An input that is part of a combobox. It is responsible for displaying the
 * current value and handling user input for filtering and selection.
 *
 * This directive should be applied to an `<input>` element within an `ngCombobox`
 * container. It automatically handles keyboard interactions, such as opening the
 * popup and navigating through the options.
 *
 * ```html
 * <input
 *   ngComboboxInput
 *   placeholder="Search..."
 *   [(value)]="searchString"
 * />
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: 'input[ngComboboxInput]',
  exportAs: 'ngComboboxInput',
  host: {
    'role': 'combobox',
    '[value]': 'value()',
    '[attr.aria-disabled]': 'combobox._pattern.disabled()',
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

/**
 * A structural directive that marks the `ng-template` to be used as the popup
 * for a combobox. This content is conditionally rendered.
 *
 * The content of the popup can be a `ngListbox`, `ngTree`, or `role="dialog"`, allowing for
 * flexible and complex combobox implementations. The consumer is responsible for
 * implementing the filtering logic based on the `ngComboboxInput`'s value.
 *
 * ```html
 * <ng-template ngComboboxPopupContainer>
 *   <div ngListbox [(value)]="selectedValue">
 *     <!-- ... options ... -->
 *   </div>
 * </ng-template>
 * ```
 *
 * When using the CdkOverlay, this directive can be replaced by `cdkConnectedOverlay.
 *
 * ```html
 * <ng-template
 *     [cdkConnectedOverlay]="{origin: inputElement, usePopover: 'inline' matchWidth: true}"
 *     [cdkConnectedOverlayOpen]="combobox.expanded()">
 *   <div ngListbox [(value)]="selectedValue">
 *     <!-- ... options ... -->
 *   </div>
 * </ng-template>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: 'ng-template[ngComboboxPopupContainer]',
  exportAs: 'ngComboboxPopupContainer',
  hostDirectives: [DeferredContent],
})
export class ComboboxPopupContainer {}

/**
 * Identifies an element as a popup for an `ngCombobox`.
 *
 * This directive acts as a bridge, allowing the `ngCombobox` to discover and interact
 * with the underlying control (e.g., `ngListbox`, `ngTree`, or `ngComboboxDialog`) that
 * manages the options. It's primarily used as a host directive and is responsible for
 * exposing the popup's control pattern to the parent combobox.
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: '[ngComboboxPopup]',
  exportAs: 'ngComboboxPopup',
})
export class ComboboxPopup<V> {
  /** The combobox that the popup belongs to. */
  readonly combobox = inject<Combobox<V>>(Combobox, {optional: true});

  /** The popup controls exposed to the combobox. */
  readonly controls = signal<
    | ComboboxListboxControls<any, V>
    | ComboboxTreeControls<any, V>
    | ComboboxDialogPattern
    | undefined
  >(undefined);
}

/**
 * Integrates a native `<dialog>` element with the combobox, allowing for
 * a modal or non-modal popup experience. It handles the opening and closing of the dialog
 * based on the combobox's expanded state.
 *
 * ```html
 * <ng-template ngComboboxPopupContainer>
 *   <dialog ngComboboxDialog class="example-dialog">
 *     <!-- ... dialog content ... -->
 *   </dialog>
 * </ng-template>
 * ```
 *
 * @developerPreview 21.0
 */
@Directive({
  selector: 'dialog[ngComboboxDialog]',
  exportAs: 'ngComboboxDialog',
  host: {
    '[attr.data-open]': 'combobox._pattern.expanded()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(click)': '_pattern.onClick($event)',
  },
  hostDirectives: [ComboboxPopup],
})
export class ComboboxDialog {
  /** The dialog element. */
  readonly element = inject(ElementRef<HTMLDialogElement>);

  /** The combobox that the dialog belongs to. */
  readonly combobox = inject(Combobox);

  /** A reference to the parent combobox popup, if one exists. */
  private readonly _popup = inject<ComboboxPopup<unknown>>(ComboboxPopup, {
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
    this._popup?.combobox?._pattern.close();
  }
}
