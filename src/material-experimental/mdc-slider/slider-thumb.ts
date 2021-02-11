/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceNumberProperty, NumberInput} from '@angular/cdk/coercion';
import {DOCUMENT} from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  Output,
} from '@angular/core';
import {Thumb} from '@material/slider';

/**
 * This is a dummy interface that just contains the properties and methods of MatSlider that are
 * used by MatSliderThumb. Rather than directly referencing MatSlider, we use this interface when
 * defining MAT_SLIDER to avoid a circular dependency between MatSlider and MatSliderThumb.
 */
interface MatSlider {
  min: number;
  max: number;
  disabled: boolean;
  _initialized: boolean;
  _getInput: (thumb: Thumb) => MatSliderThumb;
  _setValue: (value: number, thumb: Thumb) => void;
}

/**
 * Injection token that can be used to inject instances of MatSlider.
 */
export const MAT_SLIDER = new InjectionToken<MatSlider>('MatSlider');

/**
 * Represents a drag event emitted by the MatSlider component.
 */
export interface MatSliderDragEvent {
  /** The MatSliderThumb that was interacted with. */
  source: MatSliderThumb;

  /** The parent MatSlider that was interacted with. */
  parent: MatSlider;

  /** The current value of the slider. */
  value: number;

  /** The thumb that was interacted with. */
  thumb: Thumb;
}

/**
 * The native input used by the MatSlider.
 */
@Directive({
  selector: 'input[matSliderThumb], input[matSliderStartThumb], input[matSliderEndThumb]',
  host: {
    'class': 'mdc-slider__input',
    'type': 'range',
    '(blur)': '_blur.emit()',
    '(focus)': '_focus.emit()',
  },
}) export class MatSliderThumb implements AfterViewInit {

  // ** IMPORTANT NOTE **
  //
  // The way `value` is implemented for MatSliderThumb goes against our standard practice. Normally
  // we would define a private variable `_value` as the source of truth for the value of the slider
  // thumb input. The source of truth for the value of the slider inputs has already been decided
  // for us by MDC to be the value attribute on the slider thumb inputs. This is because the MDC
  // foundation and adapter expect that the value attribute is the source of truth for the slider
  // inputs.
  //
  // Also, note that the value attribute is completely disconnected from the value property.

  /** The current value of this slider input. */
  @Input()
  get value(): number {
    return coerceNumberProperty(this._elementRef.nativeElement.getAttribute('value'));
  }
  set value(v: number) {
    const value = coerceNumberProperty(v);

    // If the foundation has already been initialized, we need to
    // relay any value updates to it so that it can update the UI.
    if (this._slider._initialized) {
      this._slider._setValue(value, this.thumb);
    } else {
      // Setup for the MDC foundation.
      this._elementRef.nativeElement.setAttribute('value', `${value}`);
    }
  }

  /** Event emitted when the slider thumb starts being dragged. */
  @Output() readonly dragStart: EventEmitter<MatSliderDragEvent>
    = new EventEmitter<MatSliderDragEvent>();

  /** Event emitted when the slider thumb stops being dragged. */
  @Output() readonly dragEnd: EventEmitter<MatSliderDragEvent>
    = new EventEmitter<MatSliderDragEvent>();

  /** Event emitted every time the MatSliderThumb is blurred. */
  @Output() readonly _blur: EventEmitter<void> = new EventEmitter<void>();

  /** Event emitted every time the MatSliderThumb is focused. */
  @Output() readonly _focus: EventEmitter<void> = new EventEmitter<void>();

  /** Indicates which slider thumb this input corresponds to. */
  thumb: Thumb;

  constructor(
    @Inject(DOCUMENT) private readonly _document: Document,
    @Inject(MAT_SLIDER) private readonly _slider: MatSlider,
    readonly _elementRef: ElementRef<HTMLInputElement>,
    ) {}

  ngAfterViewInit() {
    this.thumb = this._elementRef.nativeElement.hasAttribute('matSliderStartThumb')
    ? Thumb.START
    : Thumb.END;

    const min = this._elementRef.nativeElement.hasAttribute('matSliderEndThumb')
      ? this._slider._getInput(Thumb.START).value
      : this._slider.min;
    const max = this._elementRef.nativeElement.hasAttribute('matSliderStartThumb')
      ? this._slider._getInput(Thumb.END).value
      : this._slider.max;
    this._elementRef.nativeElement.min = `${min}`;
    this._elementRef.nativeElement.max = `${max}`;

    // Only set the default value if an initial value has not already been provided.
    if (!this._elementRef.nativeElement.hasAttribute('value')) {
      this.value = this._elementRef.nativeElement.hasAttribute('matSliderEndThumb')
        ? this._slider.max
        : this._slider.min;
    }

    // Setup for the MDC foundation.
    if (this._slider.disabled) {
      this._elementRef.nativeElement.disabled = true;
    }
  }

  /** Returns true if this slider input currently has focus. */
  _isFocused(): boolean {
    return this._document.activeElement === this._elementRef.nativeElement;
  }

  static ngAcceptInputType_value: NumberInput;
}
