/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {
  BooleanInput,
  coerceBooleanProperty,
  coerceNumberProperty,
  NumberInput,
} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  inject,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {
  CanDisableRipple,
  MAT_RIPPLE_GLOBAL_OPTIONS,
  mixinColor,
  mixinDisableRipple,
  RippleGlobalOptions,
} from '@angular/material/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {Subscription} from 'rxjs';
import {
  _MatThumb,
  _MatTickMark,
  _MatSlider,
  _MatSliderRangeThumb,
  _MatSliderThumb,
  _MatSliderVisualThumb,
  MAT_SLIDER_RANGE_THUMB,
  MAT_SLIDER_THUMB,
  MAT_SLIDER,
  MAT_SLIDER_VISUAL_THUMB,
} from './slider-interface';

// TODO(wagnermaciel): maybe handle the following edge case:
// 1. start dragging discrete slider
// 2. tab to disable checkbox
// 3. without ending drag, disable the slider

// Boilerplate for applying mixins to MatSlider.
const _MatSliderMixinBase = mixinColor(
  mixinDisableRipple(
    class {
      constructor(public _elementRef: ElementRef<HTMLElement>) {}
    },
  ),
  'primary',
);

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
    '[class.mdc-slider--range]': '_isRange',
    '[class.mdc-slider--disabled]': 'disabled',
    '[class.mdc-slider--discrete]': 'discrete',
    '[class.mdc-slider--tick-marks]': 'showTickMarks',
    '[class._mat-animation-noopable]': '_noopAnimations',
  },
  exportAs: 'matSlider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  inputs: ['color', 'disableRipple'],
  providers: [{provide: MAT_SLIDER, useExisting: MatSlider}],
})
export class MatSlider
  extends _MatSliderMixinBase
  implements AfterViewInit, CanDisableRipple, OnDestroy, _MatSlider
{
  /** The active portion of the slider track. */
  @ViewChild('trackActive') _trackActive: ElementRef<HTMLElement>;

  /** The slider thumb(s). */
  @ViewChildren(MAT_SLIDER_VISUAL_THUMB) _thumbs: QueryList<_MatSliderVisualThumb>;

  /** The sliders hidden range input(s). */
  @ContentChild(MAT_SLIDER_THUMB) _input: _MatSliderThumb;

  /** The sliders hidden range input(s). */
  @ContentChildren(MAT_SLIDER_RANGE_THUMB, {descendants: false})
  _inputs: QueryList<_MatSliderRangeThumb>;

  /** Whether the slider is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(v: BooleanInput) {
    this._disabled = coerceBooleanProperty(v);
    const endInput = this._getInput(_MatThumb.END);
    const startInput = this._getInput(_MatThumb.START);

    if (endInput) {
      endInput.disabled = this._disabled;
    }
    if (startInput) {
      startInput.disabled = this._disabled;
    }
  }
  private _disabled: boolean = false;

  /** Whether the slider displays a numeric value label upon pressing the thumb. */
  @Input()
  get discrete(): boolean {
    return this._discrete;
  }
  set discrete(v: BooleanInput) {
    this._discrete = coerceBooleanProperty(v);
    this._updateValueIndicatorUIs();
  }
  private _discrete: boolean = false;

  /** Whether the slider displays tick marks along the slider track. */
  @Input()
  get showTickMarks(): boolean {
    return this._showTickMarks;
  }
  set showTickMarks(v: BooleanInput) {
    this._showTickMarks = coerceBooleanProperty(v);
  }
  private _showTickMarks: boolean = false;

  /** The minimum value that the slider can have. */
  @Input()
  get min(): number {
    return this._min;
  }
  set min(v: NumberInput) {
    const min = coerceNumberProperty(v, this._min);
    if (this._min !== min) {
      this._updateMin(min);
    }
  }
  private _min: number = 0;

  private _updateMin(min: number): void {
    const prevMin = this._min;
    this._min = min;
    this._isRange ? this._updateMinRange({old: prevMin, new: min}) : this._updateMinNonRange(min);
    this._onMinMaxOrStepChange();
  }

  private _updateMinRange(min: {old: number; new: number}): void {
    const endInput = this._getInput(_MatThumb.END) as _MatSliderRangeThumb;
    const startInput = this._getInput(_MatThumb.START) as _MatSliderRangeThumb;

    const oldEndValue = endInput.value;
    const oldStartValue = startInput.value;

    startInput.min = min.new;
    endInput.min = Math.max(min.new, startInput.value);
    startInput.max = Math.min(endInput.max, endInput.value);

    startInput._updateWidthInactive();
    endInput._updateWidthInactive();

    min.new < min.old
      ? this._onTranslateXChangeBySideEffect(endInput, startInput)
      : this._onTranslateXChangeBySideEffect(startInput, endInput);

    if (oldEndValue !== endInput.value) {
      this._onValueChange(endInput);
    }

    if (oldStartValue !== startInput.value) {
      this._onValueChange(startInput);
    }
  }

  private _updateMinNonRange(min: number): void {
    const input = this._getInput(_MatThumb.END);
    if (input) {
      const oldValue = input.value;

      input.min = min;
      input._updateThumbUIByValue();
      this._updateTrackUI(input);

      if (oldValue !== input.value) {
        this._onValueChange(input);
      }
    }
  }

  /** The maximum value that the slider can have. */
  @Input()
  get max(): number {
    return this._max;
  }
  set max(v: NumberInput) {
    const max = coerceNumberProperty(v, this._max);
    if (this._max !== max) {
      this._updateMax(max);
    }
  }
  private _max: number = 100;

  private _updateMax(max: number): void {
    const prevMax = this._max;
    this._max = max;
    this._isRange ? this._updateMaxRange({old: prevMax, new: max}) : this._updateMaxNonRange(max);
    this._onMinMaxOrStepChange();
  }

  private _updateMaxRange(max: {old: number; new: number}): void {
    const endInput = this._getInput(_MatThumb.END) as _MatSliderRangeThumb;
    const startInput = this._getInput(_MatThumb.START) as _MatSliderRangeThumb;

    const oldEndValue = endInput.value;
    const oldStartValue = startInput.value;

    endInput.max = max.new;
    startInput.max = Math.min(max.new, endInput.value);
    endInput.min = startInput.value;

    endInput._updateWidthInactive();
    startInput._updateWidthInactive();

    max.new > max.old
      ? this._onTranslateXChangeBySideEffect(startInput, endInput)
      : this._onTranslateXChangeBySideEffect(endInput, startInput);

    if (oldEndValue !== endInput.value) {
      this._onValueChange(endInput);
    }

    if (oldStartValue !== startInput.value) {
      this._onValueChange(startInput);
    }
  }

  private _updateMaxNonRange(max: number): void {
    const input = this._getInput(_MatThumb.END);
    if (input) {
      const oldValue = input.value;

      input.max = max;
      input._updateThumbUIByValue();
      this._updateTrackUI(input);

      if (oldValue !== input.value) {
        this._onValueChange(input);
      }
    }
  }

  /** The values at which the thumb will snap. */
  @Input()
  get step(): number {
    return this._step;
  }
  set step(v: NumberInput) {
    const step = coerceNumberProperty(v, this._step);
    if (this._step !== step) {
      this._updateStep(step);
    }
  }
  private _step: number = 1;

  private _updateStep(step: number): void {
    this._step = step;
    this._isRange ? this._updateStepRange() : this._updateStepNonRange();
    this._onMinMaxOrStepChange();
  }

  private _updateStepRange(): void {
    const endInput = this._getInput(_MatThumb.END) as _MatSliderRangeThumb;
    const startInput = this._getInput(_MatThumb.START) as _MatSliderRangeThumb;

    const oldEndValue = endInput.value;
    const oldStartValue = startInput.value;

    const prevStartValue = startInput.value;

    endInput.min = this._min;
    startInput.max = this._max;

    endInput.step = this._step;
    startInput.step = this._step;

    if (this._platform.SAFARI) {
      endInput.value = endInput.value;
      startInput.value = startInput.value;
    }

    endInput.min = Math.max(this._min, startInput.value);
    startInput.max = Math.min(this._max, endInput.value);

    startInput._updateWidthInactive();
    endInput._updateWidthInactive();

    endInput.value < prevStartValue
      ? this._onTranslateXChangeBySideEffect(startInput, endInput)
      : this._onTranslateXChangeBySideEffect(endInput, startInput);

    if (oldEndValue !== endInput.value) {
      this._onValueChange(endInput);
    }

    if (oldStartValue !== startInput.value) {
      this._onValueChange(startInput);
    }
  }

  private _updateStepNonRange(): void {
    const input = this._getInput(_MatThumb.END);
    if (input) {
      const oldValue = input.value;

      input.step = this._step;
      if (this._platform.SAFARI) {
        input.value = input.value;
      }

      input._updateThumbUIByValue();

      if (oldValue !== input.value) {
        this._onValueChange(input);
      }
    }
  }

  /**
   * Function that will be used to format the value before it is displayed
   * in the thumb label. Can be used to format very large number in order
   * for them to fit into the slider thumb.
   */
  @Input() displayWith: (value: number) => string = (value: number) => `${value}`;

  /** Used to keep track of & render the active & inactive tick marks on the slider track. */
  _tickMarks: _MatTickMark[];

  /** Whether animations have been disabled. */
  _noopAnimations: boolean;

  /** Subscription to changes to the directionality (LTR / RTL) context for the application. */
  private _dirChangeSubscription: Subscription;

  /** Observer used to monitor size changes in the slider. */
  private _resizeObserver: ResizeObserver | null;

  // Stored dimensions to avoid calling getBoundingClientRect redundantly.

  _cachedWidth: number;
  _cachedLeft: number;

  _rippleRadius: number = 24;

  // The value indicator tooltip text for the visual slider thumb(s).

  /** @docs-private */
  protected startValueIndicatorText: string = '';

  /** @docs-private */
  protected endValueIndicatorText: string = '';

  // Used to control the translateX of the visual slider thumb(s).

  _endThumbTransform: string;
  _startThumbTransform: string;

  _isRange: boolean = false;

  /** Whether the slider is rtl. */
  _isRtl: boolean = false;

  private _hasViewInitialized: boolean = false;

  /**
   * The width of the tick mark track.
   * The tick mark track width is different from full track width
   */
  _tickMarkTrackWidth: number = 0;

  _hasAnimation: boolean = false;

  private _resizeTimer: null | ReturnType<typeof setTimeout> = null;

  private _platform = inject(Platform);

  constructor(
    readonly _ngZone: NgZone,
    readonly _cdr: ChangeDetectorRef,
    elementRef: ElementRef<HTMLElement>,
    @Optional() readonly _dir: Directionality,
    @Optional()
    @Inject(MAT_RIPPLE_GLOBAL_OPTIONS)
    readonly _globalRippleOptions?: RippleGlobalOptions,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    super(elementRef);
    this._noopAnimations = animationMode === 'NoopAnimations';
    this._dirChangeSubscription = this._dir.change.subscribe(() => this._onDirChange());
    this._isRtl = this._dir.value === 'rtl';
  }

  /** The radius of the native slider's knob. AFAIK there is no way to avoid hardcoding this. */
  _knobRadius: number = 8;

  _inputPadding: number;
  _inputOffset: number;

  ngAfterViewInit(): void {
    if (this._platform.isBrowser) {
      this._updateDimensions();
    }

    const eInput = this._getInput(_MatThumb.END);
    const sInput = this._getInput(_MatThumb.START);
    this._isRange = !!eInput && !!sInput;
    this._cdr.detectChanges();

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      _validateInputs(
        this._isRange,
        this._getInput(_MatThumb.END)!,
        this._getInput(_MatThumb.START),
      );
    }

    const thumb = this._getThumb(_MatThumb.END);
    this._rippleRadius = thumb._ripple.radius;
    this._inputPadding = this._rippleRadius - this._knobRadius;
    this._inputOffset = this._knobRadius;

    this._isRange
      ? this._initUIRange(eInput as _MatSliderRangeThumb, sInput as _MatSliderRangeThumb)
      : this._initUINonRange(eInput!);

    this._updateTrackUI(eInput!);
    this._updateTickMarkUI();
    this._updateTickMarkTrackUI();

    this._observeHostResize();
    this._cdr.detectChanges();
  }

  private _initUINonRange(eInput: _MatSliderThumb): void {
    eInput.initProps();
    eInput.initUI();

    this._updateValueIndicatorUI(eInput);

    this._hasViewInitialized = true;
    eInput._updateThumbUIByValue();
  }

  private _initUIRange(eInput: _MatSliderRangeThumb, sInput: _MatSliderRangeThumb): void {
    eInput.initProps();
    eInput.initUI();

    sInput.initProps();
    sInput.initUI();

    eInput._updateMinMax();
    sInput._updateMinMax();

    eInput._updateStaticStyles();
    sInput._updateStaticStyles();

    this._updateValueIndicatorUIs();

    this._hasViewInitialized = true;

    eInput._updateThumbUIByValue();
    sInput._updateThumbUIByValue();
  }

  ngOnDestroy(): void {
    this._dirChangeSubscription.unsubscribe();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  /** Handles updating the slider ui after a dir change. */
  private _onDirChange(): void {
    this._isRtl = this._dir.value === 'rtl';
    this._isRange ? this._onDirChangeRange() : this._onDirChangeNonRange();
    this._updateTickMarkUI();
  }

  private _onDirChangeRange(): void {
    const endInput = this._getInput(_MatThumb.END) as _MatSliderRangeThumb;
    const startInput = this._getInput(_MatThumb.START) as _MatSliderRangeThumb;

    endInput._setIsLeftThumb();
    startInput._setIsLeftThumb();

    endInput.translateX = endInput._calcTranslateXByValue();
    startInput.translateX = startInput._calcTranslateXByValue();

    endInput._updateStaticStyles();
    startInput._updateStaticStyles();

    endInput._updateWidthInactive();
    startInput._updateWidthInactive();

    endInput._updateThumbUIByValue();
    startInput._updateThumbUIByValue();
  }

  private _onDirChangeNonRange(): void {
    const input = this._getInput(_MatThumb.END)!;
    input._updateThumbUIByValue();
  }

  /** Starts observing and updating the slider if the host changes its size. */
  private _observeHostResize() {
    if (typeof ResizeObserver === 'undefined' || !ResizeObserver) {
      return;
    }

    this._ngZone.runOutsideAngular(() => {
      this._resizeObserver = new ResizeObserver(() => {
        if (this._isActive()) {
          return;
        }
        if (this._resizeTimer) {
          clearTimeout(this._resizeTimer);
        }
        this._onResize();
      });
      this._resizeObserver.observe(this._elementRef.nativeElement);
    });
  }

  /** Whether any of the thumbs are currently active. */
  private _isActive(): boolean {
    return this._getThumb(_MatThumb.START)._isActive || this._getThumb(_MatThumb.END)._isActive;
  }

  private _getValue(thumbPosition: _MatThumb = _MatThumb.END): number {
    const input = this._getInput(thumbPosition);
    if (!input) {
      return this.min;
    }
    return input.value;
  }

  private _skipUpdate(): boolean {
    return !!(
      this._getInput(_MatThumb.START)?._skipUIUpdate || this._getInput(_MatThumb.END)?._skipUIUpdate
    );
  }

  /** Stores the slider dimensions. */
  _updateDimensions(): void {
    this._cachedWidth = this._elementRef.nativeElement.offsetWidth;
    this._cachedLeft = this._elementRef.nativeElement.getBoundingClientRect().left;
  }

  /** Sets the styles for the active portion of the track. */
  _setTrackActiveStyles(styles: {
    left: string;
    right: string;
    transform: string;
    transformOrigin: string;
  }): void {
    const trackStyle = this._trackActive.nativeElement.style;

    trackStyle.left = styles.left;
    trackStyle.right = styles.right;
    trackStyle.transformOrigin = styles.transformOrigin;
    trackStyle.transform = styles.transform;
  }

  /** Returns the translateX positioning for a tick mark based on it's index. */
  _calcTickMarkTransform(index: number): string {
    // TODO(wagnermaciel): See if we can avoid doing this and just using flex to position these.
    const translateX = index * (this._tickMarkTrackWidth / (this._tickMarks.length - 1));
    return `translateX(${translateX}px`;
  }

  // Handlers for updating the slider ui.

  _onTranslateXChange(source: _MatSliderThumb): void {
    if (!this._hasViewInitialized) {
      return;
    }

    this._updateThumbUI(source);
    this._updateTrackUI(source);
    this._updateOverlappingThumbUI(source as _MatSliderRangeThumb);
  }

  _onTranslateXChangeBySideEffect(
    input1: _MatSliderRangeThumb,
    input2: _MatSliderRangeThumb,
  ): void {
    if (!this._hasViewInitialized) {
      return;
    }

    input1._updateThumbUIByValue();
    input2._updateThumbUIByValue();
  }

  _onValueChange(source: _MatSliderThumb): void {
    if (!this._hasViewInitialized) {
      return;
    }

    this._updateValueIndicatorUI(source);
    this._updateTickMarkUI();
    this._cdr.detectChanges();
  }

  _onMinMaxOrStepChange(): void {
    if (!this._hasViewInitialized) {
      return;
    }

    this._updateTickMarkUI();
    this._updateTickMarkTrackUI();
    this._cdr.markForCheck();
  }

  _onResize(): void {
    if (!this._hasViewInitialized) {
      return;
    }

    this._updateDimensions();
    if (this._isRange) {
      const eInput = this._getInput(_MatThumb.END) as _MatSliderRangeThumb;
      const sInput = this._getInput(_MatThumb.START) as _MatSliderRangeThumb;

      eInput._updateThumbUIByValue();
      sInput._updateThumbUIByValue();

      eInput._updateStaticStyles();
      sInput._updateStaticStyles();

      eInput._updateMinMax();
      sInput._updateMinMax();

      eInput._updateWidthInactive();
      sInput._updateWidthInactive();
    } else {
      const eInput = this._getInput(_MatThumb.END);
      if (eInput) {
        eInput._updateThumbUIByValue();
      }
    }

    this._updateTickMarkUI();
    this._updateTickMarkTrackUI();
    this._cdr.detectChanges();
  }

  /** Whether or not the slider thumbs overlap. */
  private _thumbsOverlap: boolean = false;

  /** Returns true if the slider knobs are overlapping one another. */
  private _areThumbsOverlapping(): boolean {
    const startInput = this._getInput(_MatThumb.START);
    const endInput = this._getInput(_MatThumb.END);
    if (!startInput || !endInput) {
      return false;
    }
    return endInput.translateX - startInput.translateX < 20;
  }

  /**
   * Updates the class names of overlapping slider thumbs so
   * that the current active thumb is styled to be on "top".
   */
  private _updateOverlappingThumbClassNames(source: _MatSliderRangeThumb): void {
    const sibling = source.getSibling()!;
    const sourceThumb = this._getThumb(source.thumbPosition);
    const siblingThumb = this._getThumb(sibling.thumbPosition);
    siblingThumb._hostElement.classList.remove('mdc-slider__thumb--top');
    sourceThumb._hostElement.classList.toggle('mdc-slider__thumb--top', this._thumbsOverlap);
  }

  /** Updates the UI of slider thumbs when they begin or stop overlapping. */
  private _updateOverlappingThumbUI(source: _MatSliderRangeThumb): void {
    if (!this._isRange || this._skipUpdate()) {
      return;
    }
    if (this._thumbsOverlap !== this._areThumbsOverlapping()) {
      this._thumbsOverlap = !this._thumbsOverlap;
      this._updateOverlappingThumbClassNames(source);
    }
  }

  // _MatThumb styles update conditions
  //
  // 1. TranslateX, resize, or dir change
  //    - Reason: The thumb styles need to be updated according to the new translateX.
  // 2. Min, max, or step
  //    - Reason: The value may have silently changed.

  /** Updates the translateX of the given thumb. */
  _updateThumbUI(source: _MatSliderThumb) {
    if (this._skipUpdate()) {
      return;
    }
    const thumb = this._getThumb(
      source.thumbPosition === _MatThumb.END ? _MatThumb.END : _MatThumb.START,
    )!;
    thumb._hostElement.style.transform = `translateX(${source.translateX}px)`;
  }

  // Value indicator text update conditions
  //
  // 1. Value
  //    - Reason: The value displayed needs to be updated.
  // 2. Min, max, or step
  //    - Reason: The value may have silently changed.

  /** Updates the value indicator tooltip ui for the given thumb. */
  _updateValueIndicatorUI(source: _MatSliderThumb): void {
    if (this._skipUpdate()) {
      return;
    }

    const valuetext = this.displayWith(source.value);

    this._hasViewInitialized
      ? (source._valuetext = valuetext)
      : source._hostElement.setAttribute('aria-valuetext', valuetext);

    if (this.discrete) {
      source.thumbPosition === _MatThumb.START
        ? (this.startValueIndicatorText = valuetext)
        : (this.endValueIndicatorText = valuetext);

      const visualThumb = this._getThumb(source.thumbPosition);
      valuetext.length < 3
        ? visualThumb._hostElement.classList.add('mdc-slider__thumb--short-value')
        : visualThumb._hostElement.classList.remove('mdc-slider__thumb--short-value');
    }
  }

  /** Updates all value indicator UIs in the slider. */
  private _updateValueIndicatorUIs(): void {
    const eInput = this._getInput(_MatThumb.END);
    const sInput = this._getInput(_MatThumb.START);

    if (eInput) {
      this._updateValueIndicatorUI(eInput);
    }
    if (sInput) {
      this._updateValueIndicatorUI(sInput);
    }
  }

  // Update Tick Mark Track Width
  //
  // 1. Min, max, or step
  //    - Reason: The maximum reachable value may have changed.
  //    - Side note: The maximum reachable value is different from the maximum value set by the
  //      user. For example, a slider with [min: 5, max: 100, step: 10] would have a maximum
  //      reachable value of 95.
  // 2. Resize
  //    - Reason: The position for the maximum reachable value needs to be recalculated.

  /** Updates the width of the tick mark track. */
  private _updateTickMarkTrackUI(): void {
    if (!this.showTickMarks || this._skipUpdate()) {
      return;
    }

    const step = this._step && this._step > 0 ? this._step : 1;
    const maxValue = Math.floor(this.max / step) * step;
    const percentage = (maxValue - this.min) / (this.max - this.min);
    this._tickMarkTrackWidth = this._cachedWidth * percentage - 6;
  }

  // Track active update conditions
  //
  // 1. TranslateX
  //    - Reason: The track active should line up with the new thumb position.
  // 2. Min or max
  //    - Reason #1: The 'active' percentage needs to be recalculated.
  //    - Reason #2: The value may have silently changed.
  // 3. Step
  //    - Reason: The value may have silently changed causing the thumb(s) to shift.
  // 4. Dir change
  //    - Reason: The track active will need to be updated according to the new thumb position(s).
  // 5. Resize
  //    - Reason: The total width the 'active' tracks translateX is based on has changed.

  /** Updates the scale on the active portion of the track. */
  _updateTrackUI(source: _MatSliderThumb): void {
    if (this._skipUpdate()) {
      return;
    }

    this._isRange
      ? this._updateTrackUIRange(source as _MatSliderRangeThumb)
      : this._updateTrackUINonRange(source as _MatSliderThumb);
  }

  private _updateTrackUIRange(source: _MatSliderRangeThumb): void {
    const sibling = source.getSibling();
    if (!sibling || !this._cachedWidth) {
      return;
    }

    const activePercentage = Math.abs(sibling.translateX - source.translateX) / this._cachedWidth;

    if (source._isLeftThumb && this._cachedWidth) {
      this._setTrackActiveStyles({
        left: 'auto',
        right: `${this._cachedWidth - sibling.translateX}px`,
        transformOrigin: 'right',
        transform: `scaleX(${activePercentage})`,
      });
    } else {
      this._setTrackActiveStyles({
        left: `${sibling.translateX}px`,
        right: 'auto',
        transformOrigin: 'left',
        transform: `scaleX(${activePercentage})`,
      });
    }
  }

  private _updateTrackUINonRange(source: _MatSliderThumb): void {
    this._isRtl
      ? this._setTrackActiveStyles({
          left: 'auto',
          right: '0px',
          transformOrigin: 'right',
          transform: `scaleX(${1 - source.fillPercentage})`,
        })
      : this._setTrackActiveStyles({
          left: '0px',
          right: 'auto',
          transformOrigin: 'left',
          transform: `scaleX(${source.fillPercentage})`,
        });
  }

  // Tick mark update conditions
  //
  // 1. Value
  //    - Reason: a tick mark which was once active might now be inactive or vice versa.
  // 2. Min, max, or step
  //    - Reason #1: the number of tick marks may have changed.
  //    - Reason #2: The value may have silently changed.

  /** Updates the dots along the slider track. */
  _updateTickMarkUI(): void {
    if (
      !this.showTickMarks ||
      this.step === undefined ||
      this.min === undefined ||
      this.max === undefined
    ) {
      return;
    }
    const step = this.step > 0 ? this.step : 1;
    this._isRange ? this._updateTickMarkUIRange(step) : this._updateTickMarkUINonRange(step);

    if (this._isRtl) {
      this._tickMarks.reverse();
    }
  }

  private _updateTickMarkUINonRange(step: number): void {
    const value = this._getValue();
    let numActive = Math.max(Math.round((value - this.min) / step), 0);
    let numInactive = Math.max(Math.round((this.max - value) / step), 0);
    this._isRtl ? numActive++ : numInactive++;

    this._tickMarks = Array(numActive)
      .fill(_MatTickMark.ACTIVE)
      .concat(Array(numInactive).fill(_MatTickMark.INACTIVE));
  }

  private _updateTickMarkUIRange(step: number): void {
    const endValue = this._getValue();
    const startValue = this._getValue(_MatThumb.START);

    const numInactiveBeforeStartThumb = Math.max(Math.floor((startValue - this.min) / step), 0);
    const numActive = Math.max(Math.floor((endValue - startValue) / step) + 1, 0);
    const numInactiveAfterEndThumb = Math.max(Math.floor((this.max - endValue) / step), 0);
    this._tickMarks = Array(numInactiveBeforeStartThumb)
      .fill(_MatTickMark.INACTIVE)
      .concat(
        Array(numActive).fill(_MatTickMark.ACTIVE),
        Array(numInactiveAfterEndThumb).fill(_MatTickMark.INACTIVE),
      );
  }

  /** Gets the slider thumb input of the given thumb position. */
  _getInput(thumbPosition: _MatThumb): _MatSliderThumb | _MatSliderRangeThumb | undefined {
    if (thumbPosition === _MatThumb.END && this._input) {
      return this._input;
    }
    if (this._inputs?.length) {
      return thumbPosition === _MatThumb.START ? this._inputs.first : this._inputs.last;
    }
    return;
  }

  /** Gets the slider thumb HTML input element of the given thumb position. */
  _getThumb(thumbPosition: _MatThumb): _MatSliderVisualThumb {
    return thumbPosition === _MatThumb.END ? this._thumbs?.last! : this._thumbs?.first!;
  }

  _setTransition(withAnimation: boolean): void {
    this._hasAnimation = !this._platform.IOS && withAnimation && !this._noopAnimations;
    this._elementRef.nativeElement.classList.toggle(
      'mat-mdc-slider-with-animation',
      this._hasAnimation,
    );
  }

  /** Whether the given pointer event occurred within the bounds of the slider pointer's DOM Rect. */
  _isCursorOnSliderThumb(event: PointerEvent, rect: DOMRect) {
    const radius = rect.width / 2;
    const centerX = rect.x + radius;
    const centerY = rect.y + radius;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    return Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(radius, 2);
  }
}

/** Ensures that there is not an invalid configuration for the slider thumb inputs. */
function _validateInputs(
  isRange: boolean,
  endInputElement: _MatSliderThumb | _MatSliderRangeThumb,
  startInputElement?: _MatSliderThumb,
): void {
  const startValid =
    !isRange || startInputElement?._hostElement.hasAttribute('matSliderStartThumb');
  const endValid = endInputElement._hostElement.hasAttribute(
    isRange ? 'matSliderEndThumb' : 'matSliderThumb',
  );

  if (!startValid || !endValid) {
    _throwInvalidInputConfigurationError();
  }
}

function _throwInvalidInputConfigurationError(): void {
  throw Error(`Invalid slider thumb input configuration!

   Valid configurations are as follows:

     <mat-slider>
       <input matSliderThumb>
     </mat-slider>

     or

     <mat-slider>
       <input matSliderStartThumb>
       <input matSliderEndThumb>
     </mat-slider>
   `);
}
