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
  get value(): number { return this._value; }
  set value(v: number) { this._value = v; }
  private _value: number;

  /** The minimum value that this slider input can have. */
  @Input()
  get min(): number { return 0; }
  set min(v: number) { throw Error('Invalid attribute "min" on MatSliderThumb.'); }

  /** The maximum value that this slider input can have. */
  @Input()
  get max(): number { return 100; }
  set max(v: number) { throw Error('Invalid attribute "max" on MatSliderThumb.'); }

  /** The size of each increment between the values of the slider. */
  @Input()
  get step(): number { return 1; }
  set step(v: number) { throw Error('Invalid attribute "step" on MatSliderThumb.'); }

  /** MDC Slider does not use the disabled attribute it's native inputs. */
  @Input()
  set disabled(v: boolean) { throw Error('Invalid attribute "disabled" on MatSliderThumb.'); }

  /** Event emitted every time the MatSliderThumb is blurred. */
  @Output() readonly _blur: EventEmitter<void> = new EventEmitter<void>();

  /** Event emitted every time the MatSliderThumb is focused. */
  @Output() readonly _focus: EventEmitter<void> = new EventEmitter<void>();

  /** Indicates which slider thumb this input corresponds to. */
  thumb: Thumb;

  /** The hosts native HTML element. */
  _hostElement: HTMLInputElement;

  constructor(
    @Inject(DOCUMENT) private readonly _document: Document,
    private readonly _elementRef: ElementRef<HTMLInputElement>,
    ) {
      this._hostElement = this._elementRef.nativeElement;
    }

  /** Returns true if this slider input currently has focus. */
  _isFocused(): boolean {
    return this._document.activeElement === this._hostElement;
  }

  static ngAcceptInputType_value: NumberInput;
}
