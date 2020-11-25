/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';

@Component({
  selector: 'mat-slider-thumb',
  templateUrl: 'slider-thumb.html',
  host: {'class': 'mdc-slider__thumb'},
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSliderThumb {
  /** The text content of the value indicator for a discrete slider. */
  @Input()
  get valueIndicatorText(): string {
    return this._valueIndicatorText;
  }
  set valueIndicatorText(value: string) {
    this._valueIndicatorText = value;
  }
  private _valueIndicatorText: string;

  /** Whether the slider is discrete. */
  @Input()
  get isDiscrete(): boolean {
    return this._isDiscrete;
  }
  set isDiscrete(value) {
    this._isDiscrete = coerceBooleanProperty(value);
  }
  private _isDiscrete = false;

  @ViewChild('knob') _knob: ElementRef<HTMLElement>;
  get knob(): Element { return this._knob.nativeElement; }

  constructor(private _elementRef: ElementRef<HTMLElement>) {}

  getRootEl() {
    return this._elementRef.nativeElement;
  }

  getKnobWidth() {
    return this.knob.getBoundingClientRect().width;
  }

  static ngAcceptInputType_isDiscrete: BooleanInput;
}
