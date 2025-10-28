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
  linkedSignal,
  model,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  RadioButtonPattern,
  RadioGroupInputs,
  RadioGroupPattern,
  ToolbarRadioGroupInputs,
  ToolbarRadioGroupPattern,
} from '@angular/aria/private';
import {Directionality} from '@angular/cdk/bidi';
import {_IdGenerator} from '@angular/cdk/a11y';
import {ToolbarWidgetGroup} from '@angular/aria/toolbar';

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
 * a single form control. The RadioGroup is meant to be used in conjunction with RadioButton
 * as follows:
 *
 * ```html
 * <div ngRadioGroup>
 *   <div ngRadioButton value="1">Option 1</div>
 *   <div ngRadioButton value="2">Option 2</div>
 *   <div ngRadioButton value="3">Option 3</div>
 * </div>
 * ```
 */
@Directive({
  selector: '[ngRadioGroup]',
  exportAs: 'ngRadioGroup',
  host: {
    'role': 'radiogroup',
    'class': 'ng-radio-group',
    '[attr.tabindex]': '_pattern.tabindex()',
    '[attr.aria-readonly]': '_pattern.readonly()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[attr.aria-orientation]': '_pattern.orientation()',
    '[attr.aria-activedescendant]': '_pattern.activedescendant()',
    '(keydown)': '_pattern.onKeydown($event)',
    '(pointerdown)': '_pattern.onPointerdown($event)',
    '(focusin)': 'onFocus()',
  },
  hostDirectives: [
    {
      directive: ToolbarWidgetGroup,
      inputs: ['disabled'],
    },
  ],
})
export class RadioGroup<V> {
  /** A reference to the radio group element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the ToolbarWidgetGroup, if the radio group is in a toolbar. */
  private readonly _toolbarWidgetGroup = inject(ToolbarWidgetGroup);

  /** Whether the radio group is inside of a Toolbar. */
  private readonly _hasToolbar = computed(() => !!this._toolbarWidgetGroup.toolbar());

  /** The RadioButtons nested inside of the RadioGroup. */
  private readonly _radioButtons = contentChildren(RadioButton, {descendants: true});

  /** A signal wrapper for directionality. */
  protected textDirection = inject(Directionality).valueSignal;

  /** The RadioButton UIPatterns of the child RadioButtons. */
  protected items = computed(() => this._radioButtons().map(radio => radio._pattern));

  /** Whether the radio group is vertically or horizontally oriented. */
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');

  /** Whether disabled items in the group should be skipped when navigating. */
  readonly skipDisabled = input(true, {transform: booleanAttribute});

  /** The focus strategy used by the radio group. */
  readonly focusMode = input<'roving' | 'activedescendant'>('roving');

  /** Whether the radio group is disabled. */
  readonly disabled = input(false, {transform: booleanAttribute});

  /** Whether the radio group is readonly. */
  readonly readonly = input(false, {transform: booleanAttribute});

  /** The value of the currently selected radio button. */
  readonly value = model<V | null>(null);

  /** The internal selection state for the radio group. */
  private readonly _value = mapSignal<V | null, V[]>(this.value, {
    transform: value => (value !== null ? [value] : []),
    reverse: values => (values.length === 0 ? null : values[0]),
  });

  /** The RadioGroup UIPattern. */
  readonly _pattern: RadioGroupPattern<V>;

  /** Whether the radio group has received focus yet. */
  private _hasFocused = signal(false);

  constructor() {
    const inputs: RadioGroupInputs<V> | ToolbarRadioGroupInputs<V> = {
      ...this,
      items: this.items,
      value: this._value,
      activeItem: signal(undefined),
      textDirection: this.textDirection,
      element: () => this._elementRef.nativeElement,
      getItem: e => {
        if (!(e.target instanceof HTMLElement)) {
          return undefined;
        }
        const element = e.target.closest('[role="radio"]');
        return this.items().find(i => i.element() === element);
      },
      toolbar: this._toolbarWidgetGroup.toolbar,
    };

    this._pattern = this._hasToolbar()
      ? new ToolbarRadioGroupPattern<V>(inputs as ToolbarRadioGroupInputs<V>)
      : new RadioGroupPattern<V>(inputs as RadioGroupInputs<V>);

    if (this._hasToolbar()) {
      this._toolbarWidgetGroup.controls.set(this._pattern as ToolbarRadioGroupPattern<V>);
    }

    afterRenderEffect(() => {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        const violations = this._pattern.validate();
        for (const violation of violations) {
          console.error(violation);
        }
      }
    });

    afterRenderEffect(() => {
      if (!this._hasFocused() && !this._hasToolbar()) {
        this._pattern.setDefaultState();
      }
    });
  }

  onFocus() {
    this._hasFocused.set(true);
  }
}

/** A selectable radio button in a RadioGroup. */
@Directive({
  selector: '[ngRadioButton]',
  exportAs: 'ngRadioButton',
  host: {
    'role': 'radio',
    'class': 'ng-radio-button',
    '[attr.data-active]': '_pattern.active()',
    '[attr.tabindex]': '_pattern.tabindex()',
    '[attr.aria-checked]': '_pattern.selected()',
    '[attr.aria-disabled]': '_pattern.disabled()',
    '[id]': '_pattern.id()',
  },
})
export class RadioButton<V> {
  /** A reference to the radio button element. */
  private readonly _elementRef = inject(ElementRef);

  /** The parent RadioGroup. */
  private readonly _radioGroup = inject(RadioGroup);

  /** A unique identifier for the radio button. */
  private readonly _generatedId = inject(_IdGenerator).getId('ng-radio-button-', true);

  /** A unique identifier for the radio button. */
  readonly id = computed(() => this._generatedId);

  /** The value associated with the radio button. */
  readonly value = input.required<V>();

  /** The parent RadioGroup UIPattern. */
  readonly group = computed(() => this._radioGroup._pattern);

  /** A reference to the radio button element to be focused on navigation. */
  element = computed(() => this._elementRef.nativeElement);

  /** Whether the radio button is disabled. */
  disabled = input(false, {transform: booleanAttribute});

  /** Whether the radio button is selected. */
  readonly selected = computed(() => this._pattern.selected());

  /** The RadioButton UIPattern. */
  readonly _pattern = new RadioButtonPattern<V>({
    ...this,
    id: this.id,
    value: this.value,
    group: this.group,
    element: this.element,
  });
}
