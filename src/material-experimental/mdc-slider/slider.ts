/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  BooleanInput,
  coerceBooleanProperty,
  coerceNumberProperty,
  NumberInput
} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {MDCSliderFoundation, Thumb, TickMark} from '@material/slider';
import {SliderAdapter} from './slider-adapter';
import {MatSliderThumb} from './slider-thumb';

/**
 * Allows users to select from a range of values by moving the slider thumb. It is similar in
 * behavior to the native `<input type="range">` element.
 */
@Component({
  selector: 'mat-slider',
  templateUrl: 'slider.html',
  styleUrls: ['slider.css'],
  host: {
    'class': 'mat-mdc-slider mdc-slider',
    '[class.mdc-slider--range]': '_isRange()',
    '[class.mdc-slider--disabled]': 'disabled',
    '[class.mdc-slider--discrete]': 'discrete',
    '[class.mdc-slider--tick-marks]': 'showTickMarks',
  },
  exportAs: 'matSlider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatSlider implements AfterViewInit, OnDestroy {
  /** The slider thumb(s). */
  @ViewChildren('thumb') _thumbs: QueryList<ElementRef<HTMLElement>>;

  /** The slider thumb knob(s) */
  @ViewChildren('knob') _knobs: QueryList<ElementRef<HTMLElement>>;

  /** The active section of the slider track. */
  @ViewChild('trackActive') _trackActive: ElementRef<HTMLElement>;

  /** The sliders hidden range input(s). */
  @ContentChildren(MatSliderThumb, {descendants: false}) _inputs: QueryList<MatSliderThumb>;

  /** Whether the slider is disabled. */
  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(v: boolean) {
    this._disabled = coerceBooleanProperty(v);

    // If we want to disable the slider after the foundation has been initialized,
    // we need to inform the foundation by calling `setDisabled`. Also, we can't call
    // this before initializing the foundation because it will throw errors.
    if (this._initialized) {
      this._foundation.setDisabled(v);
    }
  }
  private _disabled: boolean = false;

  /** Whether the slider displays a numeric value label upon pressing the thumb. */
  @Input()
  get discrete(): boolean { return this._discrete; }
  set discrete(v: boolean) { this._discrete = coerceBooleanProperty(v); }
  private _discrete: boolean = false;

  /** Whether the slider displays tick marks along the slider track. */
  @Input()
  get showTickMarks(): boolean { return this._showTickMarks; }
  set showTickMarks(v: boolean) {
    this._showTickMarks = coerceBooleanProperty(v);
  }
  private _showTickMarks: boolean = false;

  /** The minimum value that the slider can have. */
  @Input()
  get min(): number { return this._min; }
  set min(v: number) { this._min = coerceNumberProperty(v, this._min); }
  private _min = 0;

  /** The maximum value that the slider can have. */
  @Input()
  get max(): number { return this._max; }
  set max(v: number) { this._max = coerceNumberProperty(v, this._max); }
  private _max = 100;

  /** The values at which the thumb will snap. */
  @Input()
  get step(): number { return this._step; }
  set step(v: number) { this._step = coerceNumberProperty(v, this._step); }
  private _step: number = 1;

  /**
   * Function that will be used to format the value before it is displayed
   * in the thumb label. Can be used to format very large number in order
   * for them to fit into the slider thumb.
   */
  @Input() displayWith: ((value: number) => string) | null;

  /** Instance of the MDC slider foundation for this slider. */
  private _foundation = new MDCSliderFoundation(new SliderAdapter());

  /** Whether the foundation has been initialized. */
  _initialized: boolean = false;

  /** The string representation of the start thumbs value. */
  _startValueIndicatorText: string;

  /** The string representation of the end thumbs value. */
  _endValueIndicatorText: string;

  /** The injected document if available or fallback to the global document reference. */
  _document: Document;

  /**
   * The defaultView of the injected document if
   * available or fallback to global window reference.
   */
  _window: Window;

  /** The hosts native HTML element. */
  _hostElement: HTMLElement;

  /** Used to keep track of & render the active & inactive tick marks on the slider track. */
  _tickMarks: TickMark[];

  constructor(
    readonly _cdr: ChangeDetectorRef,
    private readonly _elementRef: ElementRef<HTMLElement>,
    private readonly _platform: Platform,
    @Inject(DOCUMENT) document: any) {
      this._document = document;
      this._window = this._document.defaultView || window;
      this._hostElement = this._elementRef.nativeElement;
    }

  ngAfterViewInit() {
    this._foundation.init();
    if (this._platform.isBrowser) {
      this._foundation.layout();
    }
    this._initialized = true;
  }

  ngOnDestroy() {
    if (this._platform.isBrowser) {
      this._foundation.destroy();
    }
  }

  /** Gets the current value of given slider thumb. */
  _getValue(thumb: Thumb): number {
    return thumb === Thumb.START
      ? this._foundation.getValueStart()
      : this._foundation.getValue();
  }

  /** Sets the value of a slider thumb. */
  _setValue(value: number, thumb: Thumb): void {
    thumb === Thumb.START
      ? this._foundation.setValueStart(value)
      : this._foundation.setValue(value);
  }

  /** Whether this is a ranged slider. */
  _isRange(): boolean {
    return this._inputs.length === 2;
  }

  /** Gets the slider thumb input of the given thumb. */
  _getInput(thumb: Thumb): MatSliderThumb {
    return thumb === Thumb.END ? this._inputs.get(this._inputs.length - 1)! : this._inputs.get(0)!;
  }

  /** Gets the slider thumb HTML input element of the given thumb. */
  _getInputElement(thumb: Thumb): HTMLInputElement {
    return this._getInput(thumb)._elementRef.nativeElement;
  }

  /** Gets the slider thumb HTML element of the given thumb. */
  _getThumbElement(thumb: Thumb): HTMLElement {
    const thumbs = this._thumbs.toArray().map(e => e.nativeElement);
    return thumb === Thumb.END ? thumbs[thumbs.length - 1] : thumbs[0];
  }

  /** Gets the slider knob HTML element of the given thumb. */
  _getKnobElement(thumb: Thumb): HTMLElement {
    const knobs = this._knobs.toArray().map(e => e.nativeElement);
    return thumb === Thumb.END ? knobs[knobs.length - 1] : knobs[0];
  }

  /**
   * Gets the text representation of the given value.
   *
   * Uses the `displayWith` function if one has been provided. Otherwise, it just returns the
   * current numeric value as a string.
   */
  _getValueIndicatorText(value: number): string {
    return this.displayWith ? this.displayWith(value) : value.toString();
  }

  /** Gets the text representation of the current value of the given thumb. */
  _getValueIndicatorTextByThumb(thumb: Thumb): string {
    return this._getValueIndicatorText(this._getValue(thumb));
  }

  /** Determines the class name for a HTML element. */
  _getTickMarkClass(tickMark: TickMark): string {
    return tickMark === TickMark.ACTIVE
      ? 'mdc-slider__tick-mark--active'
      : 'mdc-slider__tick-mark--inactive';
  }

  /** Returns an array of the thumb types that exist on the current slider instance. */
  _getThumbTypes(): Thumb[] {
    return this._isRange() ? [Thumb.START, Thumb.END] : [Thumb.END];
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_discrete: BooleanInput;
  static ngAcceptInputType_showTickMarks: BooleanInput;
  static ngAcceptInputType_min: NumberInput;
  static ngAcceptInputType_max: NumberInput;
  static ngAcceptInputType_step: NumberInput;
}
