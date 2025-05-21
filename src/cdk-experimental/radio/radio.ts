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
  isDevMode,
  linkedSignal,
  model,
  signal,
  WritableSignal,
} from '@angular/core';
import {RadioButtonPattern, RadioGroupPattern} from '../ui-patterns';
import {Directionality} from '@angular/cdk/bidi';
import {_IdGenerator} from '@angular/cdk/a11y';

// TODO: Move mapSignal to it's own file so it can be reused across components.

/**
 * Creates a new writable signal (signal V) whose value is connected to the given original
 * writable signal (signal T) such that updating signal V updates signal T and vice-versa.
 *
 * This function establishes a two-way synchronization between the source signal and the new mapped
 * signal. When the source signal changes, the mapped signal updates by applying the `transform`
 * function. When the mapped signal is explicitly set or updated, the change is propagated back to
 * the source signal by applying the `reverse` function.
 */
export function mapSignal<T, V>(
  originalSignal: WritableSignal<T>,
  operations: {
    transform: (value: T) => V;
    reverse: (value: V) => T;
  },
) {
  const mappedSignal = linkedSignal(() => operations.transform(originalSignal()));
  const updateMappedSignal = mappedSignal.update;
  const setMappedSignal = mappedSignal.set;

  mappedSignal.set = (newValue: V) => {
    setMappedSignal(newValue);
    originalSignal.set(operations.reverse(newValue));
  };

  mappedSignal.update = (updateFn: (value: V) => V) => {
    updateMappedSignal(oldValue => updateFn(oldValue));
    originalSignal.update(oldValue => operations.reverse(updateFn(operations.transform(oldValue))));
  };

  return mappedSignal;
}

/**
 * A radio button group container.
 *
 * Radio groups are used to group multiple radio buttons or radio group labels so they function as
 * a single form control. The CdkRadioGroup is meant to be used in conjunction with CdkRadioButton
 * as follows:
 *
 * ```html
 * <div cdkRadioGroup>
 *   <label cdkRadioButton value="1">Option 1</label>
 *   <label cdkRadioButton value="2">Option 2</label>
 *   <label cdkRadioButton value="3">Option 3</label>
 * </div>
 * ```
 */
@Directive({
  selector: '[cdkRadioGroup]',
  exportAs: 'cdkRadioGroup',
  host: {
    'role': 'radiogroup',
    'class': 'cdk-radio-group',
    '[attr.tabindex]': 'pattern.tabindex()',
    '[attr.aria-readonly]': 'pattern.readonly()',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[attr.aria-orientation]': 'pattern.orientation()',
    '[attr.aria-activedescendant]': 'pattern.activedescendant()',
    '(keydown)': 'pattern.onKeydown($event)',
    '(pointerdown)': 'pattern.onPointerdown($event)',
    '(focusin)': 'onFocus()',
  },
})
export class CdkRadioGroup<V> {
  /** The CdkRadioButtons nested inside of the CdkRadioGroup. */
  private readonly _cdkRadioButtons = contentChildren(CdkRadioButton, {descendants: true});

  /** A signal wrapper for directionality. */
  protected textDirection = inject(Directionality).valueSignal;

  /** The RadioButton UIPatterns of the child CdkRadioButtons. */
  protected items = computed(() => this._cdkRadioButtons().map(radio => radio.pattern));

  /** Whether the radio group is vertically or horizontally oriented. */
  orientation = input<'vertical' | 'horizontal'>('horizontal');

  /** Whether disabled items in the group should be skipped when navigating. */
  skipDisabled = input(true, {transform: booleanAttribute});

  /** The focus strategy used by the radio group. */
  focusMode = input<'roving' | 'activedescendant'>('roving');

  /** Whether the radio group is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** Whether the radio group is readonly. */
  readonly = input(false, {transform: booleanAttribute});

  /** The value of the currently selected radio button. */
  value = model<V | null>(null);

  /** The internal selection state for the radio group. */
  private readonly _value = mapSignal<V | null, V[]>(this.value, {
    transform: value => (value !== null ? [value] : []),
    reverse: values => (values.length === 0 ? null : values[0]),
  });

  /** The RadioGroup UIPattern. */
  pattern: RadioGroupPattern<V> = new RadioGroupPattern<V>({
    ...this,
    items: this.items,
    value: this._value,
    activeIndex: signal(0),
    textDirection: this.textDirection,
  });

  /** Whether the radio group has received focus yet. */
  private _hasFocused = signal(false);

  constructor() {
    afterRenderEffect(() => {
      if (isDevMode()) {
        const violations = this.pattern.validate();
        for (const violation of violations) {
          console.error(violation);
        }
      }
    });

    afterRenderEffect(() => {
      if (!this._hasFocused()) {
        this.pattern.setDefaultState();
      }
    });
  }

  onFocus() {
    this._hasFocused.set(true);
  }
}

/** A selectable radio button in a CdkRadioGroup. */
@Directive({
  selector: '[cdkRadioButton]',
  exportAs: 'cdkRadioButton',
  host: {
    'role': 'radio',
    'class': 'cdk-radio-button',
    '[class.cdk-active]': 'pattern.active()',
    '[attr.tabindex]': 'pattern.tabindex()',
    '[attr.aria-checked]': 'pattern.selected()',
    '[attr.aria-disabled]': 'pattern.disabled()',
    '[id]': 'pattern.id()',
  },
})
export class CdkRadioButton<V> {
  /** A reference to the radio button element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent CdkRadioGroup. */
  private readonly _cdkRadioGroup = inject(CdkRadioGroup);

  /** A unique identifier for the radio button. */
  private readonly _generatedId = inject(_IdGenerator).getId('cdk-radio-button-');

  /** A unique identifier for the radio button. */
  protected id = computed(() => this._generatedId);

  /** The value associated with the radio button. */
  protected value = input.required<V>();

  /** The parent RadioGroup UIPattern. */
  protected group = computed(() => this._cdkRadioGroup.pattern);

  /** A reference to the radio button element to be focused on navigation. */
  protected element = computed(() => this._elementRef.nativeElement);

  /** Whether the radio button is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** The RadioButton UIPattern. */
  pattern = new RadioButtonPattern<V>({
    ...this,
    id: this.id,
    value: this.value,
    group: this.group,
    element: this.element,
  });
}
