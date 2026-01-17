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
  numberAttribute,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {SpinButtonPattern} from '../private';
import {SPINBUTTON_GROUP} from './spinbutton-tokens';

/** Transforms an attribute value to a number, or undefined if not provided. */
function optionalNumberAttribute(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return numberAttribute(value);
}

/**
 * A spinbutton widget for selecting a value from a range.
 *
 * The spinbutton provides ARIA semantics and keyboard navigation for
 * increment/decrement operations. It handles ArrowUp/ArrowDown for stepping,
 * PageUp/PageDown for larger steps, and Home/End for min/max values.
 *
 * ```html
 * <input
 *   ngSpinButton
 *   [(value)]="quantity"
 *   [min]="1"
 *   [max]="99" />
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Spinbutton](guide/aria/spinbutton)
 */
@Directive({
  selector: '[ngSpinButton]',
  exportAs: 'ngSpinButton',
  host: {
    'role': 'spinbutton',
    '[attr.id]': 'id()',
    '[attr.aria-valuenow]': '_pattern.ariaValueNow()',
    '[attr.aria-valuetext]': '_pattern.ariaValueText()',
    '[attr.aria-valuemin]': '_pattern.ariaValueMin()',
    '[attr.aria-valuemax]': '_pattern.ariaValueMax()',
    '[attr.aria-disabled]': '_pattern.ariaDisabled()',
    '[attr.aria-readonly]': '_pattern.ariaReadonly()',
    '[attr.aria-required]': '_pattern.ariaRequired()',
    '[attr.aria-invalid]': '_pattern.invalid() || null',
    '[attr.tabindex]': '_pattern.tabIndex()',
    '[attr.disabled]': 'disabled() || null',
    '[attr.readonly]': 'readonly() || null',
    '(keydown)': '_pattern.onKeydown($event)',
  },
})
export class SpinButton implements OnInit, OnDestroy {
  private readonly _elementRef = inject(ElementRef);
  private readonly _group = inject(SPINBUTTON_GROUP, {optional: true});

  /** The host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** Unique identifier for the spinbutton. */
  readonly id = input(inject(_IdGenerator).getId('ng-spinbutton-', true));

  /** The current numeric value. */
  readonly value = model<number | undefined>(undefined);

  /** Minimum allowed value. */
  readonly min = input<number | undefined, unknown>(undefined, {
    transform: optionalNumberAttribute,
  });

  /** Maximum allowed value. */
  readonly max = input<number | undefined, unknown>(undefined, {
    transform: optionalNumberAttribute,
  });

  /** Step amount for increment/decrement. */
  readonly step = input(1, {transform: numberAttribute});

  /** Step amount for page increment/decrement (PageUp/PageDown). Defaults to step * 10. */
  readonly pageStep = input<number | undefined, unknown>(undefined, {
    transform: optionalNumberAttribute,
  });

  /** Human-readable text representation of the value (e.g., "Monday", "3 items"). */
  readonly valueText = input<string | undefined>(undefined);

  /** Whether the spinbutton is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the spinbutton is readonly. */
  readonly readonly = input(false, {transform: booleanAttribute});

  /** Whether to wrap around at min/max boundaries. */
  readonly wrap = input(false, {transform: booleanAttribute});

  /** Whether a value is required. */
  readonly required = input(false, {transform: booleanAttribute});

  /** The UI pattern instance for this spinbutton. */
  readonly _pattern: SpinButtonPattern = new SpinButtonPattern({
    ...this,
    element: () => this.element,
  });

  /** Whether the value is out of bounds (auto-invalid). */
  readonly invalid = computed(() => this._pattern.invalid());

  /** Whether increment is currently possible. */
  readonly canIncrement = computed(() => this._pattern.canIncrement());

  /** Whether decrement is currently possible. */
  readonly canDecrement = computed(() => this._pattern.canDecrement());

  /** The tabindex for the element. */
  readonly tabIndex = computed(() => this._pattern.tabIndex());

  constructor() {
    afterRenderEffect(() => {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        const violations = this._pattern.validate();
        for (const violation of violations) {
          console.error(violation);
        }
      }
    });
  }

  ngOnInit(): void {
    this._group?._registerSpinButton(this);
  }

  ngOnDestroy(): void {
    this._group?._unregisterSpinButton();
  }

  /** Performs an increment operation. */
  doIncrement(): void {
    this._pattern.doIncrement();
  }

  /** Performs a decrement operation. */
  doDecrement(): void {
    this._pattern.doDecrement();
  }

  /** Performs a page increment operation. */
  doIncrementPage(): void {
    this._pattern.doIncrementPage();
  }

  /** Performs a page decrement operation. */
  doDecrementPage(): void {
    this._pattern.doDecrementPage();
  }

  /** Sets value to maximum. */
  doIncrementToMax(): void {
    this._pattern.doIncrementToMax();
  }

  /** Sets value to minimum. */
  doDecrementToMin(): void {
    this._pattern.doDecrementToMin();
  }
}
