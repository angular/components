/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NumberInput} from '@angular/cdk/coercion';
import {DOCUMENT} from '@angular/common';
import {Directive, ElementRef, EventEmitter, Inject, Input, Output} from '@angular/core';
import {Thumb} from '@material/slider';
import {MatSlider} from './slider';

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
  selector: 'input[mat-slider-thumb]',
  host: {
    'class': 'mdc-slider__input',
    'type': 'range',
    '[min]': 'min',
    '[max]': 'max',
    '[step]': 'step',
    '[attr.value]': 'value',
    '(blur)': '_blur.emit()',
    '(focus)': '_focus.emit()',
  }
}) export class MatSliderThumb {
  /** The current value of this slider input. */
  @Input()
  get value(): number { return Number(this._elementRef.nativeElement.getAttribute('value')); }
  set value(v: number) {
    this._initialized = true;

    // If the foundation has already been initialized, we need to
    // relay any value updates to it so that it can update the UI.
    if (this._slider._initialized) {
      this._slider._setValue(v, this.thumb);
    } else {
      // Setup for the MDC foundation.
      this._elementRef.nativeElement.setAttribute('value', v.toString());
    }
  }

  /** The minimum value that this slider input can have. */
  @Input()
  get min(): number {
    return (this._slider._isRange() && this.thumb === Thumb.END)
      ? this._slider._getValue(Thumb.START)
      : this._slider.min;
  }
  set min(v: number) { throw Error('Invalid attribute "min" on MatSliderThumb.'); }

  /** The maximum value that this slider input can have. */
  @Input()
  get max(): number {
    return (this._slider._isRange() && this.thumb === Thumb.START)
      ? this._slider._getValue(Thumb.END)
      : this._slider.max;
  }
  set max(v: number) { throw Error('Invalid attribute "max" on MatSliderThumb.'); }

  /** The size of each increment between the values of the slider. */
  @Input()
  get step(): number { return 1; }
  set step(v: number) { throw Error('Invalid attribute "step" on MatSliderThumb.'); }

  /** MDC Slider does not use the disabled attribute it's native inputs. */
  @Input()
  set disabled(v: boolean) { throw Error('Invalid attribute "disabled" on MatSliderThumb.'); }

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

  /** Whether the value of this slider thumb input has been set. */
  _initialized: boolean = false;

  constructor(
    @Inject(DOCUMENT) private readonly _document: Document,
    readonly _elementRef: ElementRef<HTMLInputElement>,
    private readonly _slider: MatSlider,
    ) {
      // Initializing the min and max in the constructor guarantees that they will be
      // defined by the time the value gets set. If the range is not defined before we
      // try to set the value, we can run into the issue where the value is outside of
      // the default range and get capped to the default min or max.
      this._elementRef.nativeElement.min = this._slider.min.toString();
      this._elementRef.nativeElement.max = this._slider.max.toString();
    }

  /**
   * Sets up the initial state of the slider thumb input.
   *
   * This is needed because the slider thumb input is passed in via `ng-content`,
   * and therefore has no way of knowing which slider thumb it correspond to.
   */
  _init(thumb: Thumb): void {
    this.thumb = thumb;

    // If the value has not been initialized (i.e. no value was provided from
    // the user), determine the default value for the slider based on the given thumb.
    if (!this._initialized) {
      this.value = (this._slider._isRange() && thumb === Thumb.END)
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
