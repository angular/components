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
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {Thumb} from '@material/slider';

/**
 * Handles displaying the slider knobs and their value indicators.
 */
@Component({
  selector: 'mat-slider-start-thumb-decorator, mat-slider-end-thumb-decorator',
  templateUrl: 'slider-thumb-decorator.html',
  host: {
    'class': 'mdc-slider__thumb',
    '(mouseenter)': '_mouseenter.emit()',
    '(mouseleave)': '_mouseleave.emit()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSliderThumbDecorator {
  /** Whether the slider is discrete. */
  @Input() isDiscrete: boolean;

  /** The text content of the value indicator for a discrete slider. */
  @Input()
  get valueIndicatorText(): string { return this._valueIndicatorText; }
  set valueIndicatorText(v: string) {
    this._valueIndicatorText = v;
    this._cdr.detectChanges();
  }
  private _valueIndicatorText: string;

  /** Event emitted every time the cursor moves onto the MatSliderThumbDecorator. */
  @Output() mouseenter: EventEmitter<void> = new EventEmitter<void>();

  /** Event emitted every time the cursor moves away from the MatSliderThumbDecorator. */
  @Output() mouseleave: EventEmitter<void> = new EventEmitter<void>();

  /** The visible circle for the slider thumb. This reference is used by the SliderAdapter. */
  @ViewChild('knob') _knob: ElementRef<HTMLElement>;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _elementRef: ElementRef<HTMLElement>,
    ) {}

  /** Returns the thumb that this decorator corresponds to. */
  _getThumb(): Thumb {
    return this._getHostElement().tagName === 'MAT-SLIDER-END-THUMB-DECORATOR'
    ? Thumb.END
    : Thumb.START;
  }

  /** Returns the hosts native HTML element. */
  _getHostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }
}
