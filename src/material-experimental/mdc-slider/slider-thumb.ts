/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
  /** Whether the slider is discrete. */
  @Input()
  get isDiscrete(): boolean { return this._isDiscrete; }
  set isDiscrete(v) { this._isDiscrete = coerceBooleanProperty(v); }
  private _isDiscrete = false;

  /** The text content of the value indicator for a discrete slider. */
  @Input()
  get valueIndicatorText(): string { return this._valueIndicatorText; }
  set valueIndicatorText(v: string) {
    this._valueIndicatorText = v;
    this._cdr.detectChanges();
  }
  private _valueIndicatorText: string;

  @ViewChild('knob') private _knob: ElementRef<HTMLElement>;
  private get knob(): Element { return this._knob.nativeElement; }

  constructor(private _cdr: ChangeDetectorRef, private _elementRef: ElementRef<HTMLElement>) {}

  getRootEl() {
    return this._elementRef.nativeElement;
  }

  getKnobWidth() {
    return this.knob.getBoundingClientRect().width;
  }

  static ngAcceptInputType_isDiscrete: BooleanInput;
}
