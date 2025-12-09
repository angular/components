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
  Directive,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  signal,
  Renderer2,
} from '@angular/core';
import {
  DeferredContent,
  DeferredContentAware,
  SimpleComboboxPattern,
  SimpleComboboxPopupPattern,
} from '@angular/aria/private';

/**
 * The container element that wraps a combobox input and popup, and orchestrates its behavior.
 *
 * The `ngCombobox` directive is the main entry point for creating a combobox and customizing its
 * behavior. It coordinates the interactions between the input and the popup.
 *
 * ```html
 * <div ngCombobox [(expanded)]="expanded">
 *   <input ngComboboxInput />
 *
 *   <ng-template ngComboboxPopup>
 *     <div ngComboboxWidget>
 *       <!-- ... options ... -->
 *     </div>
 *   </ng-template>
 * </div>
 * ```
 */
@Directive({
  selector: '[ngCombobox]',
  exportAs: 'ngCombobox',
  host: {
    'role': 'combobox',
    '[attr.aria-autocomplete]': '_pattern.autocomplete()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-expanded]': '_pattern.expanded()',
    '[attr.aria-activedescendant]': '_pattern.activeDescendant()',
    '[attr.aria-controls]': '_pattern.popupId()',
    '[attr.aria-haspopup]': '_pattern.popupType()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(focusin)': '_pattern.onFocusin()',
    '(focusout)': '_pattern.onFocusout($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
    '(input)': '_pattern.onInput($event)',
  },
})
export class Combobox extends DeferredContentAware {
  private readonly _renderer = inject(Renderer2);

  /** The element that the combobox is attached to. */
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** A reference to the input element. */
  readonly element = this._elementRef.nativeElement;

  /** The popup associated with the combobox. */
  readonly _popup = signal<ComboboxPopup | undefined>(undefined);

  /** Whether the combobox is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the combobox is expanded. */
  readonly expanded = model<boolean>(false);

  /** The value of the combobox input. */
  readonly value = model<string>('');

  /** An inline suggestion to be displayed in the input. */
  readonly inlineSuggestion = input<string | undefined>(undefined);

  /** The combobox ui pattern. */
  readonly _pattern = new SimpleComboboxPattern({
    ...this,
    element: () => this.element,
    expandable: () => true,
    popup: computed(() => this._popup()?._pattern),
  });

  constructor() {
    super();

    afterRenderEffect(() => this._pattern.keyboardEventRelayEffect());
    afterRenderEffect(() => this._pattern.closePopupOnBlurEffect());
    afterRenderEffect(() => {
      this.contentVisible.set(this._pattern.expanded());
    });

    if (this._pattern.isEditable()) {
      afterRenderEffect(() => {
        this._renderer.setProperty(this.element, 'value', this.value());
      });
      afterRenderEffect(() => {
        this._pattern.highlightEffect();
      });
    }
  }

  /** Registers a popup with the combobox. */
  _registerPopup(popup: ComboboxPopup) {
    this._popup.set(popup);
  }

  /** Unregisters the popup from the combobox. */
  _unregisterPopup() {
    this._popup.set(undefined);
  }
}

/**
 * A structural directive that marks the `ng-template` to be used as the popup
 * for a combobox. This content is conditionally rendered.
 *
 * The content of the popup can be any element with the `ngComboboxWidget` directive.
 *
 * ```html
 * <ng-template ngComboboxPopup>
 *   <div ngComboboxWidget>
 *     <!-- ... options ... -->
 *   </div>
 * </ng-template>
 * ```
 */
@Directive({
  selector: 'ng-template[ngComboboxPopup]',
  exportAs: 'ngComboboxPopup',
  hostDirectives: [DeferredContent],
})
export class ComboboxPopup implements OnInit, OnDestroy {
  private readonly _deferredContent = inject(DeferredContent);

  /** The combobox that the popup belongs to. */
  readonly combobox = input.required<Combobox>();

  /** The widget contained within the popup. */
  readonly _widget = signal<ComboboxWidget | undefined>(undefined);

  /** The element that serves as the control target for the popup. */
  readonly controlTarget = computed(() => this._widget()?.element);

  /** The ID of the popup. */
  readonly popupId = computed(() => this._widget()?.popupId());

  /** The ID of the active descendant in the popup. */
  readonly activeDescendant = computed(() => this._widget()?.activeDescendant());

  /** The type of the popup (e.g., listbox, tree, grid, dialog). */
  readonly popupType = input<'listbox' | 'tree' | 'grid' | 'dialog'>('listbox');

  /** The popup pattern. */
  readonly _pattern = new SimpleComboboxPopupPattern({
    ...this,
  });

  ngOnInit() {
    this.combobox()._registerPopup(this);
    this._deferredContent.deferredContentAware.set(this.combobox());
  }

  ngOnDestroy() {
    this.combobox()._unregisterPopup();
  }

  /** Registers a widget with the popup. */
  _registerWidget(widget: ComboboxWidget) {
    this._widget.set(widget);
  }

  /** Unregisters the widget from the popup. */
  _unregisterWidget() {
    this._widget.set(undefined);
  }
}

/**
 * Identifies an element as a widget within a combobox popup.
 *
 * This directive should be applied to the element that contains the options or content
 * of the popup. It handles the communication of ID and active descendant information
 * to the combobox.
 */
@Directive({
  selector: '[ngComboboxWidget]',
  exportAs: 'ngComboboxWidget',
  host: {
    '(focusin)': 'onFocusin()',
    '(focusout)': 'onFocusout($event)',
  },
})
export class ComboboxWidget implements OnInit, OnDestroy {
  /** The element that the popup widget is attached to. */
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _popup = inject(ComboboxPopup);

  private _observer: MutationObserver | undefined;

  /** A reference to the popup widget element. */
  readonly element = this._elementRef.nativeElement;

  /** The ID of the popup widget. */
  readonly popupId = signal<string | undefined>(undefined);

  /** The ID of the active descendant in the widget. */
  readonly activeDescendant = signal<string | undefined>(undefined);

  constructor() {
    afterRenderEffect(() => {
      const controlTarget = this.element;

      this.popupId.set(controlTarget.id);

      this._observer?.disconnect();
      this._observer = new MutationObserver((mutationsList: MutationRecord[]) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'attributes' && mutation.attributeName) {
            const attributeName = mutation.attributeName;

            if (attributeName === 'aria-activedescendant') {
              const activeDescendant = controlTarget.getAttribute('aria-activedescendant');
              if (activeDescendant !== null) {
                this.activeDescendant.set(activeDescendant);
              }
            }

            if (attributeName === 'id') {
              this.popupId.set(controlTarget.id);
            }
          }
        }
      });
      this._observer.observe(controlTarget, {
        attributes: true,
        attributeFilter: ['id', 'aria-activedescendant'],
      });
    });
  }

  ngOnInit() {
    this._popup._registerWidget(this);
  }

  ngOnDestroy(): void {
    this._observer?.disconnect();
    this._popup._unregisterWidget();
  }

  /** Handles focus in events for the widget. */
  onFocusin() {
    this._popup._pattern.onFocusin();
  }

  /** Handles focus out events for the widget. */
  onFocusout(event: FocusEvent) {
    this._popup._pattern.onFocusout(event);
  }
}
