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
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  Self,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {FormControl, FormControlDirective, NgControl, NgModel} from '@angular/forms';
import {
  CanDisableRipple,
  MatRipple,
  MAT_RIPPLE_GLOBAL_OPTIONS,
  mixinColor,
  mixinDisableRipple,
  RippleAnimationConfig,
  RippleGlobalOptions,
  RippleRef,
  RippleState,
} from '@angular/material/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {Thumb, TickMark} from '@material/slider';
import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

// todo: maybe handle the following edge case:
// 1. start dragging discrete slider
// 2. tab to disable checkbox
// 3. without ending drag, disable the slider

/** Represents an event emitted by the MatSlider component. */
export class MatSliderEvent {
  /** The html element that was the target of the event. */
  target: HTMLInputElement;

  /** The MatSliderThumb that was interacted with. */
  source: MatSliderThumb;

  /** The MatSlider that was interacted with. */
  parent: MatSlider;

  /** The current value of the slider. */
  value: number;
}

/**
 * The visual slider thumb.
 *
 * Handles the slider thumb ripple states (hover, focus, and active),
 * and displaying the value tooltip on discrete sliders.
 * INTERNAL USE ONLY.
 */
@Component({
  selector: 'mat-slider-visual-thumb',
  templateUrl: './slider-thumb.html',
  styleUrls: ['slider-thumb.css'],
  host: {
    'class': 'mdc-slider__thumb mat-mdc-slider-visual-thumb',
    '[class.mdc-slider__thumb--focused]': '_sliderInput?._isFocused',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatSliderVisualThumb implements AfterViewInit, OnDestroy {
  /** Whether the slider displays a numeric value label upon pressing the thumb. */
  @Input() discrete: boolean;

  /** Indicates which slider thumb this input corresponds to. */
  @Input() thumbPosition: Thumb;

  /** The display value of the slider thumb. */
  @Input() valueIndicatorText: string;

  /** The MatRipple for this slider thumb. */
  @ViewChild(MatRipple) readonly _ripple: MatRipple;

  /** The slider thumb knob. */
  @ViewChild('knob') _knob: ElementRef<HTMLElement>;

  /** The slider thumb value indicator container. */
  @ViewChild('valueIndicatorContainer')
  _valueIndicatorContainer: ElementRef<HTMLElement>;

  /** The slider input corresponding to this slider thumb. */
  private _sliderInput: MatSliderThumb;

  /** The RippleRef for the slider thumbs hover state. */
  private _hoverRippleRef: RippleRef | undefined;

  /** The RippleRef for the slider thumbs focus state. */
  private _focusRippleRef: RippleRef | undefined;

  /** The RippleRef for the slider thumbs active state. */
  private _activeRippleRef: RippleRef | undefined;

  /** Whether the slider thumb is currently being hovered. */
  private _isHovered: boolean = false;

  /** Whether the slider thumb is currently being pressed. */
  readonly _isActive = false;

  /** Whether the value indicator tooltip is visible. */
  _isValueIndicatorVisible: boolean = false;

  /** The host native HTML input element. */
  _hostElement: HTMLElement;

  constructor(
    readonly _cdr: ChangeDetectorRef,
    private readonly _ngZone: NgZone,
    @Inject(forwardRef(() => MatSlider)) private readonly _slider: MatSlider,
    _elementRef: ElementRef<HTMLElement>,
  ) {
    this._hostElement = _elementRef.nativeElement;
  }

  ngAfterViewInit() {
    this._ripple.radius = 24;
    this._sliderInput = this._slider._getInput(this.thumbPosition)!;

    // These listeners don't update any data bindings so we bind them outside
    // of the NgZone to prevent Angular from needlessly running change detection.
    this._ngZone.runOutsideAngular(() => {
      this._sliderInput._hostElement.addEventListener('pointermove', this._onPointerMove);
      this._sliderInput._hostElement.addEventListener('pointerdown', this._onDragStart);
      this._sliderInput._hostElement.addEventListener('pointerup', this._onDragEnd);
      this._sliderInput._hostElement.addEventListener('pointerleave', this._onMouseLeave);
      this._sliderInput._hostElement.addEventListener('focus', this._onFocus);
      this._sliderInput._hostElement.addEventListener('blur', this._onBlur);
    });
  }

  ngOnDestroy() {
    this._ngZone.runOutsideAngular(() => {
      this._sliderInput._hostElement.removeEventListener('pointermove', this._onPointerMove);
      this._sliderInput._hostElement.removeEventListener('pointerdown', this._onDragStart);
      this._sliderInput._hostElement.removeEventListener('pointerup', this._onDragEnd);
      this._sliderInput._hostElement.removeEventListener('pointerleave', this._onMouseLeave);
      this._sliderInput._hostElement.removeEventListener('focus', this._onFocus);
      this._sliderInput._hostElement.removeEventListener('blur', this._onBlur);
    });
  }

  /********************/
  /** Event listeners */
  /********************/

  private _onPointerMove = (event: PointerEvent): void => {
    if (this._sliderInput._isFocused) {
      return;
    }

    const rect = this._hostElement.getBoundingClientRect();
    const isHovered = this._isSliderThumbHovered(event, rect);
    if (isHovered) {
      if (!this._isHovered) {
        this._isHovered = true;
        this._showHoverRipple();
      }
    } else {
      if (this._isHovered) {
        this._isHovered = false;
        this._hideRipple(this._hoverRippleRef);
      }
    }
  };

  private _onMouseLeave = (): void => {
    this._isHovered = false;
    this._hideRipple(this._hoverRippleRef);
  };

  private _onFocus = (): void => {
    // We don't want to show the hover ripple on top of the focus ripple.
    // Happen when the users cursor is over a thumb and then the user tabs to it.
    this._hideRipple(this._hoverRippleRef);
    this._showFocusRipple();
  };

  private _onBlur = (): void => {
    // Happens when the user tabs away while still dragging a thumb.
    if (!this._isActive) {
      this._hideRipple(this._focusRippleRef);
    }
    // Happens when the user tabs away from a thumb but their cursor is still over it.
    if (this._isHovered) {
      this._showHoverRipple();
    }
  };

  private _onDragStart = (): void => {
    (this as {_isActive: boolean})._isActive = true;
    this._showActiveRipple();
  };

  private _onDragEnd = (): void => {
    (this as {_isActive: boolean})._isActive = false;
    this._hideRipple(this._activeRippleRef);
    // Happens when the user starts dragging a thumb, tabs away, and then stops dragging.
    if (!this._sliderInput._isFocused) {
      this._hideRipple(this._focusRippleRef);
    }
  };

  /** Handles displaying the hover ripple. */
  private _showHoverRipple(): void {
    if (!this._isShowingRipple(this._hoverRippleRef)) {
      this._hoverRippleRef = this._showRipple({enterDuration: 0, exitDuration: 0});
      this._hoverRippleRef?.element.classList.add('mat-mdc-slider-hover-ripple');
    }
  }

  /** Handles displaying the focus ripple. */
  private _showFocusRipple(): void {
    // Show the focus ripple event if noop animations are enabled.
    if (!this._isShowingRipple(this._focusRippleRef)) {
      this._focusRippleRef = this._showRipple({enterDuration: 0, exitDuration: 0});
      this._focusRippleRef?.element.classList.add('mat-mdc-slider-focus-ripple');
    }
  }

  /** Handles displaying the active ripple. */
  private _showActiveRipple(): void {
    if (!this._isShowingRipple(this._activeRippleRef)) {
      this._activeRippleRef = this._showRipple({enterDuration: 225, exitDuration: 400});
      this._activeRippleRef?.element.classList.add('mat-mdc-slider-active-ripple');
    }
  }

  /** Whether the given rippleRef is currently fading in or visible. */
  private _isShowingRipple(rippleRef?: RippleRef): boolean {
    return rippleRef?.state === RippleState.FADING_IN || rippleRef?.state === RippleState.VISIBLE;
  }

  /** Manually launches the slider thumb ripple using the specified ripple animation config. */
  private _showRipple(animation: RippleAnimationConfig): RippleRef | undefined {
    if (this._slider.disabled || this._slider._globalRippleOptions?.disabled) {
      return;
    }
    this._showValueIndicator();
    return this._ripple.launch({
      animation: this._slider._noopAnimations ? {enterDuration: 0, exitDuration: 0} : animation,
      centered: true,
      persistent: true,
    });
  }

  /**
   * Fades out the given ripple.
   * Also hides the value indicator if no ripple is showing.
   */
  private _hideRipple(rippleRef?: RippleRef): void {
    rippleRef?.fadeOut();

    const isShowingAnyRipple =
      this._isShowingRipple(this._hoverRippleRef) ||
      this._isShowingRipple(this._focusRippleRef) ||
      this._isShowingRipple(this._activeRippleRef);
    if (!isShowingAnyRipple) {
      this._hideValueIndicator();
    }
  }

  /** Value Indicator functions */

  /** Shows the value indicator ui. */
  private _showValueIndicator(): void {
    this._isValueIndicatorVisible = true;
    this._cdr.detectChanges();
  }

  /** Hides the value indicator ui. */
  private _hideValueIndicator(): void {
    this._isValueIndicatorVisible = false;
    this._cdr.detectChanges();
  }

  /**********************/
  /** Getters Functions */
  /**********************/

  /** Gets the value indicator container's native HTML element. */
  _getValueIndicatorContainer(): HTMLElement {
    return this._valueIndicatorContainer.nativeElement;
  }

  /** Gets the native HTML element of the slider thumb knob. */
  _getKnob(): HTMLElement {
    return this._knob.nativeElement;
  }

  /*********************/
  /** Helper functions */
  /*********************/

  private _isSliderThumbHovered(event: PointerEvent, rect: DOMRect) {
    const radius = rect.width / 2;
    const centerX = rect.x + radius;
    const centerY = rect.y + radius;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    return Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(radius, 2);
  }
}

/**
 * Directive that adds slider-specific behaviors to an input element inside `<mat-slider>`.
 * Up to two may be placed inside of a `<mat-slider>`.
 *
 * If one is used, the selector `matSliderThumb` must be used, and the outcome will be a normal
 * slider. If two are used, the selectors `matSliderStartThumb` and `matSliderEndThumb` must be
 * used, and the outcome will be a range slider with two slider thumbs.
 */
@Directive({
  selector: 'input[matSliderThumb]',
  exportAs: 'matSliderThumb',
  providers: [],
  host: {
    'class': 'mdc-slider__input',
    'type': 'range',
    '[style.padding]': '_paddingStyle',
    '[attr.aria-valuetext]': '_valuetext',
    '(change)': '_onChange()',
    '(input)': '_onInput()',
    '(pointerdown)': '_onPointerDown($event)',
    '(pointermove)': '_onPointerMove($event)',
    // TODO(wagnermaciel): Consider using a global event listener instead.
    // Reason: I have found a semi-consistent way to mouse up without triggering this event.
    '(pointerup)': '_onPointerUp($event)',
    '(blur)': '_onBlur()',
    '(focus)': '_onFocus()',
  },
})
export class MatSliderThumb implements OnInit, OnDestroy {
  @Input()
  get value(): number {
    return coerceNumberProperty(this._hostElement.value);
  }
  set value(v: NumberInput) {
    const val = coerceNumberProperty(v).toString();
    if (this._hasSetInitialValue && !this._isActive) {
      this._hostElement.value = val;
      this._updateThumbUIByValue();
      this._slider._onValueChange(this);
      this._cdr.detectChanges();
    } else {
      this._initialValue = val;
    }
  }
  @Output() readonly valueChange: EventEmitter<string> = new EventEmitter<string>();

  /** The current translateX in px of the slider visual thumb. */
  get translateX(): number {
    if (this._slider.min >= this._slider.max) {
      this._translateX = this._slider._inputOffset;
      return this._translateX;
    }
    if (this._translateX === undefined) {
      this._translateX = this._calcTranslateXByValue();
    }
    return this._translateX;
  }
  set translateX(v: number) {
    this._translateX = v;
  }
  _translateX: number | undefined;

  /** Indicates whether this thumb is the start or end thumb. */
  thumbPosition: Thumb = Thumb.END;

  get min(): number {
    return coerceNumberProperty(this._hostElement.min);
  }
  set min(v: NumberInput) {
    this._hostElement.min = coerceNumberProperty(v).toString();
    this._cdr.detectChanges();
  }

  get max(): number {
    return coerceNumberProperty(this._hostElement.max);
  }
  set max(v: NumberInput) {
    this._hostElement.max = coerceNumberProperty(v).toString();
    this._cdr.detectChanges();
  }

  get step(): number {
    return coerceNumberProperty(this._hostElement.step);
  }
  set step(v: NumberInput) {
    this._hostElement.step = coerceNumberProperty(v).toString();
    this._cdr.detectChanges();
  }

  get disabled(): boolean {
    return coerceBooleanProperty(this._hostElement.disabled);
  }
  set disabled(v: BooleanInput) {
    this._hostElement.disabled = coerceBooleanProperty(v);
    this._cdr.detectChanges();

    if (this._slider.disabled !== this.disabled) {
      this._slider.disabled = this.disabled;
    }
  }

  get percentage(): number {
    if (this._slider.min >= this._slider.max) {
      return this._slider._isRtl ? 1 : 0;
    }
    return (this.value - this._slider.min) / (this._slider.max - this._slider.min);
  }

  get fillPercentage(): number {
    if (!this._slider._cachedTrackWidth) {
      return this._slider._isRtl ? 1 : 0;
    }
    if (this.translateX === this._slider._inputOffset) {
      return 0;
    }
    return (this.translateX - this._slider._inputOffset) / this._slider._cachedTrackWidth;
  }

  /** The host native HTML input element. */
  _hostElement: HTMLInputElement;

  /** The aria-valuetext string representation of the input's value. */
  _valuetext: string;

  /** The css padding of the native input element. */
  _paddingStyle: string;

  /** The radius of a native html slider's knob. */
  _knobRadius: number = 8;

  /** Whether user's cursor is currently in a mouse down state on the input. */
  _isActive: boolean = false;

  /** Whether the input is currently focused (either by tab or after clicking). */
  _isFocused: boolean = false;

  /** Used to relay updates to _isFocused to the slider visual thumbs. */
  private _setIsFocused(v: boolean): void {
    this._isFocused = v;
    this._slider._getThumb(this.thumbPosition)?._cdr.markForCheck();
  }

  /**
   * Whether the initial value has been set.
   * This exists because the initial value cannot be immediately set because the min and max
   * must first be relayed from the parent MatSlider component, which can only happen later
   * in the component lifecycle.
   */
  _hasSetInitialValue: boolean = false;

  /** The stored initial value. */
  _initialValue: string | undefined;

  /** Defined when a user is using a form control to manage slider value & validation. */
  private _formControl: FormControl | undefined;

  /** Emits when the component is destroyed. */
  protected readonly _destroyed = new Subject<void>();

  /**
   * Indicates whether UI updates should be skipped.
   *
   * This flag is used to avoid flickering
   * when correcting values on pointer up/down.
   */
  _skipUIUpdate: boolean = false;

  constructor(
    @Inject(forwardRef(() => MatSlider)) readonly _slider: MatSlider,
    @Optional() @Self() readonly ngControl: NgControl,
    readonly _elementRef: ElementRef<HTMLInputElement>,
    readonly _cdr: ChangeDetectorRef,
  ) {
    this._hostElement = _elementRef.nativeElement;
    this._onNgControlValueChange = this._onNgControlValueChange.bind(this);
  }

  ngOnInit(): void {
    if (!this.ngControl) {
      return;
    }

    if (this.ngControl instanceof FormControlDirective) {
      this._formControl = this.ngControl.form;
    } else if (this.ngControl instanceof NgModel) {
      this._formControl = this.ngControl.control;
    }

    if (this._formControl) {
      this._formControl.valueChanges
        .pipe(takeUntil(this._destroyed))
        .subscribe(this._onNgControlValueChange);
    }
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  initProps(): void {
    this._updateWidthInactive();
    this.disabled = this._slider.disabled;
    this.step = this._slider.step;
    this.min = this._slider.min;
    this.max = this._slider.max;
    this._initValue();
  }

  initUI(): void {
    this._updateThumbUIByValue();
  }

  _initValue(): void {
    this._hasSetInitialValue = true;
    if (this._initialValue === undefined) {
      this.value = this._getDefaultValue();
    } else {
      this.value = this._initialValue;
    }
  }

  _getDefaultValue(): number {
    return this.min;
  }

  _onBlur(): void {
    this._isActive = false;
    this._setIsFocused(false);
  }

  _onFocus(): void {
    this._setIsFocused(true);
  }

  _onChange(): void {
    // only used to handle the edge case where user
    // mousedown on the slider then uses arrow keys.
    if (this._isActive) {
      this._updateThumbUIByValue({withAnimation: true});
    }
  }

  _onInput(): void {
    this.valueChange.emit(this._hostElement.value);
    // handles arrowing and updating the value when
    // a step is defined.
    if (this._slider.step || !this._isActive) {
      this._updateThumbUIByValue({withAnimation: true});
    }
    this._slider._onValueChange(this);
  }

  _onNgControlValueChange(): void {
    // only used to handle when the value change
    // originates outside of the slider.
    if (!this._isActive || !this._isFocused) {
      this._slider._onValueChange(this);
      this._updateThumbUIByValue();
    }
    this._slider.disabled = this._formControl!.disabled;
  }

  _onPointerDown(event: PointerEvent): void {
    if (this.disabled || event.button !== 0) {
      return;
    }

    this._isActive = true;
    this._setIsFocused(true);
    this._updateWidthActive();

    // Does nothing if a step is defined because we
    // want the value to snap to the values on input.
    if (!this._slider.step) {
      this._updateThumbUIByPointerEvent(event, {withAnimation: true});
    }

    if (!this.disabled) {
      this._handleValueCorrection(event);
    }
  }

  /**
   * Corrects the value of the slider on pointer up/down.
   *
   * Called on pointer down and up because the value is set based
   * on the inactive width instead of the active width.
   */
  private _handleValueCorrection(event: PointerEvent): void {
    // Don't update the UI with the current value! The value on pointerdown
    // and pointerup is calculated in the split second before the input(s)
    // resize. See _updateWidthInactive() and _updateWidthActive() for more
    // details.
    this._skipUIUpdate = true;

    // Note that this function gets triggered before the actual value of the
    // slider is updated. This means if we were to set the value here, it
    // would immediately be overwritten. Using setTimeout ensures the setting
    // of the value happens after the value has been updated by the
    // pointerdown event.
    setTimeout(() => {
      this._skipUIUpdate = false;
      this._fixValue(event);
    }, 0);
  }

  /** Corrects the value of the slider based on the pointer event's position. */
  _fixValue(event: PointerEvent): void {
    const xPos = event.pageX - this._slider._cachedLeft - this._slider._rippleRadius;
    const width = this._slider._cachedWidth - this._slider._inputOffset * 2;

    const percentage = this._slider._isRtl ? 1 - xPos / width : xPos / width;

    // To ensure the percentage is rounded to two decimals.
    const fixedPercentage = Math.round(percentage * 100) / 100;

    const value = fixedPercentage * (this._slider.max - this._slider.min) + this._slider.min;

    const prevValue = this.value;
    if (value === prevValue) {
      // Because we prevented UI updates, if it turns out that the race
      // condition didn't happen and the value is already correct, we
      // have to apply the ui updates now.
      this._slider._onValueChange(this);
      return;
    }

    this.value = value;
    if (this.ngControl instanceof NgModel) {
      this.ngControl?.control?.setValue(this.value);
    }
    this.valueChange.emit(this._hostElement.value);
    this._slider._onValueChange(this);
  }

  _onPointerMove(event: PointerEvent): void {
    // Again, does nothing if a step is defined because
    // we want the value to snap to the values on input.
    if (!this._slider.step && this._isActive) {
      this._updateThumbUIByPointerEvent(event);
    }
  }

  _onPointerUp(event: PointerEvent): void {
    this._isActive = false;
    this._updateWidthInactive();
    if (!this.disabled) {
      this._handleValueCorrection(event);
    }
  }

  _clamp(v: number): number {
    return Math.max(
      Math.min(v, this._slider._cachedWidth - this._slider._inputOffset),
      this._slider._inputOffset,
    );
  }

  _calcTranslateXByValue(): number {
    if (this._slider._isRtl) {
      return (1 - this.percentage) * this._slider._cachedTrackWidth + this._slider._inputOffset;
    }
    return this.percentage * this._slider._cachedTrackWidth + this._slider._inputOffset;
  }

  _calcTranslateXByPointerEvent(event: PointerEvent): number {
    return event.pageX - this._slider._cachedLeft;
  }

  _updateHiddenUI(): void {
    this._updateThumbUIByValue();
    this._updateWidthInactive();
  }

  // TODO(wagnermaciel): describe the difference between inactive and active width and why we need it.
  _updateWidthActive(): void {
    this._paddingStyle = `0 ${this._slider._inputPadding}px`;
    this._hostElement.style.width = `calc(100% - ${this._slider._inputPadding * 2}px)`;
  }

  // TODO(wagnermaciel): describe the difference between inactive and active width and why we need it.
  _updateWidthInactive(): void {
    this._paddingStyle = '0px';
    this._hostElement.style.width = '100%';
  }

  _updateThumbUIByValue(options?: {withAnimation: boolean}): void {
    this.translateX = this._clamp(this._calcTranslateXByValue());
    this._updateThumbUI(options);
  }

  _updateThumbUIByPointerEvent(event: PointerEvent, options?: {withAnimation: boolean}): void {
    this.translateX = this._clamp(this._calcTranslateXByPointerEvent(event));
    this._updateThumbUI(options);
  }

  _updateThumbUI(options?: {withAnimation: boolean}) {
    this._slider._transition =
      options?.withAnimation && !this._slider._noopAnimations ? 'transform 80ms' : 'transform 0ms';
    this._slider._onTranslateXChange(this);
    this._slider._cdr.markForCheck();
  }

  focus(): void {
    this._hostElement.focus();
  }

  blur(): void {
    this._hostElement.blur();
  }
}

@Directive({
  selector: 'input[matSliderStartThumb], input[matSliderEndThumb]',
  exportAs: 'matSliderRangeThumb',
  providers: [],
  host: {
    '[style.pointer-events]': '_pointerEvents',
    '[style.left]': '_left',
    '[style.right]': '_right',
    '[style.z-index]': '_zIndex',
  },
})
export class MatSliderRangeThumb extends MatSliderThumb {
  _pointerEvents: string = 'auto';
  _left: string;
  _right: string;
  _marginLeft: string;
  _marginRight: string;

  getSibling(): MatSliderRangeThumb | undefined {
    if (!this.__sibling) {
      this.__sibling = this._slider._getInput(this._isEndThumb ? Thumb.START : Thumb.END) as
        | MatSliderRangeThumb
        | undefined;
    }
    return this.__sibling;
  }
  private __sibling: MatSliderRangeThumb | undefined;

  /** Returns the minimum translateX position allowed for this slider input's visual thumb. */
  getMinPos(): number {
    const sibling = this.getSibling();
    if (!this._isLeftThumb && sibling) {
      return sibling.translateX;
    }
    return this._slider._inputOffset;
  }

  /** Returns the maximum translateX position allowed for this slider input's visual thumb. */
  getMaxPos(): number {
    const sibling = this.getSibling();
    if (this._isLeftThumb && sibling) {
      return sibling.translateX;
    }
    return this._slider._cachedWidth - this._slider._inputOffset;
  }

  _setIsLeftThumb(): void {
    this._isLeftThumb =
      (this._isEndThumb && this._slider._isRtl) || (!this._isEndThumb && !this._slider._isRtl);
  }

  /** Whether this slider corresponds to the input on the left hand side. */
  _isLeftThumb: boolean;

  /** Whether this slider corresponds to the input with greater value. */
  _isEndThumb: boolean;

  constructor(
    readonly _ngZone: NgZone,
    @Inject(forwardRef(() => MatSlider)) _slider: MatSlider,
    @Optional() @Self() override readonly ngControl: NgControl,
    _elementRef: ElementRef<HTMLInputElement>,
    override readonly _cdr: ChangeDetectorRef,
  ) {
    super(_slider, ngControl, _elementRef, _cdr);
    this._isEndThumb = this._hostElement.hasAttribute('matSliderEndThumb');
    this._setIsLeftThumb();
    this.thumbPosition = this._isEndThumb ? Thumb.END : Thumb.START;
  }

  override _getDefaultValue(): number {
    return this._isEndThumb && this._slider._isRange ? this.max : this.min;
  }

  override initUI(): void {
    this._updateHiddenUI();
    this._cdr.detectChanges();
  }

  override _onInput(): void {
    super._onInput();
    this.__sibling?._updateMinMax();
  }

  override _onNgControlValueChange(): void {
    super._onNgControlValueChange();
    this.getSibling()?._updateMinMax();
  }

  override _onPointerDown(event: PointerEvent): void {
    if (this.disabled) {
      return;
    }
    if (this.__sibling) {
      this.__sibling._updateWidthActive();
      this.__sibling._pointerEvents = 'none';
    }
    super._onPointerDown(event);
  }

  override _onPointerUp(event: PointerEvent): void {
    super._onPointerUp(event);
    if (this.__sibling) {
      this.__sibling._updateWidthInactive();
      this.__sibling._pointerEvents = 'auto';
    }
  }

  override _onPointerMove(event: PointerEvent): void {
    super._onPointerMove(event);
    if (!this._slider.step && this._isActive) {
      this._updateSibling();
    }
  }

  override _fixValue(event: PointerEvent): void {
    super._fixValue(event);
    this.__sibling?._updateMinMax();
  }

  override _clamp(v: number): number {
    return Math.max(Math.min(v, this.getMaxPos()), this.getMinPos());
  }

  override _updateHiddenUI(): void {
    this._updateStaticStyles();
    this._updateThumbUIByValue();
    this._updateMinMax();
    this._updateWidthInactive();
    this._updateSibling();
  }

  private _updateMinMax(): void {
    const sibling = this.getSibling();
    if (!sibling) {
      return;
    }
    if (this._isEndThumb) {
      this.min = Math.max(this._slider.min, sibling.value);
      this.max = this._slider.max;
    } else {
      this.min = this._slider.min;
      this.max = Math.min(this._slider.max, sibling.value);
    }
  }

  // TODO(wagnermaciel): describe the difference between inactive and active width and why we need it.
  override _updateWidthActive(): void {
    const minWidth = this._slider._rippleRadius * 2 - this._slider._inputPadding * 2;
    const maxWidth = this._slider._cachedWidth - this._slider._inputPadding * 2 - minWidth;
    const percentage =
      this._slider.min < this._slider.max
        ? (this.max - this.min) / (this._slider.max - this._slider.min)
        : 1;
    const width = maxWidth * percentage + minWidth;
    this._hostElement.style.width = `${width}px`;
    this._paddingStyle = `0 ${this._slider._inputPadding}px`;
  }

  // TODO(wagnermaciel): describe the difference between inactive and active width and why we need it.
  override _updateWidthInactive(): void {
    const sibling = this.getSibling();
    if (!sibling) {
      return;
    }
    const maxWidth = this._slider._cachedWidth;
    const midValue = this._isEndThumb
      ? this.value - (this.value - sibling.value) / 2
      : this.value + (sibling.value - this.value) / 2;

    const _percentage = this._isEndThumb
      ? (this.max - midValue) / (this._slider.max - this._slider.min)
      : (midValue - this.min) / (this._slider.max - this._slider.min);

    const percentage = this._slider.min < this._slider.max ? _percentage : 1;

    const width = maxWidth * percentage;
    this._hostElement.style.width = `${width}px`;
    this._paddingStyle = '0px';
  }

  _updateStaticStyles(): void {
    if (this._isLeftThumb) {
      this._left = '0';
      this._right = 'auto';
    } else {
      this._left = 'auto';
      this._right = '0';
    }
  }

  private _updateSibling(): void {
    const sibling = this.getSibling();
    if (!sibling) {
      return;
    }
    sibling._updateMinMax();
    sibling._updateWidthActive();
  }
}

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
})
export class MatSlider
  extends _MatSliderMixinBase
  implements AfterViewInit, CanDisableRipple, OnDestroy
{
  /** The active portion of the slider track. */
  @ViewChild('trackActive') _trackActive: ElementRef<HTMLElement>;

  /** The slider thumb(s). */
  @ViewChildren(MatSliderVisualThumb) _thumbs: QueryList<MatSliderVisualThumb>;

  /** The sliders hidden range input(s). */
  @ContentChild(MatSliderThumb) _input: MatSliderThumb;

  /** The sliders hidden range input(s). */
  @ContentChildren(MatSliderRangeThumb, {descendants: false})
  _inputs: QueryList<MatSliderRangeThumb>;

  /** Whether the slider is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(v: BooleanInput) {
    this._disabled = coerceBooleanProperty(v);
    const endInput = this._getInput(Thumb.END);
    const startInput = this._getInput(Thumb.START);

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
    const endInput = this._getInput(Thumb.END) as MatSliderRangeThumb;
    const startInput = this._getInput(Thumb.START) as MatSliderRangeThumb;

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
    const input = this._getInput(Thumb.END);
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
    const endInput = this._getInput(Thumb.END) as MatSliderRangeThumb;
    const startInput = this._getInput(Thumb.START) as MatSliderRangeThumb;

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
    const input = this._getInput(Thumb.END);
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
  get step(): number | undefined {
    return this._step;
  }
  set step(v: NumberInput) {
    const step = coerceNumberProperty(v, this._step);
    if (this._step !== step) {
      this._updateStep(step);
    }
  }
  private _step: number = 0;

  private _updateStep(step: number): void {
    this._step = step;
    this._isRange ? this._updateStepRange() : this._updateStepNonRange();
    this._onMinMaxOrStepChange();
  }

  private _updateStepRange(): void {
    const endInput = this._getInput(Thumb.END) as MatSliderRangeThumb;
    const startInput = this._getInput(Thumb.START) as MatSliderRangeThumb;

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
    const input = this._getInput(Thumb.END);
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
  _tickMarks: TickMark[];

  /** Whether animations have been disabled. */
  _noopAnimations: boolean;

  /** Subscription to changes to the directionality (LTR / RTL) context for the application. */
  private _dirChangeSubscription: Subscription;

  /** Observer used to monitor size changes in the slider. */
  private _resizeObserver: ResizeObserver | null;

  // Stored dimensions to avoid calling getBoundingClientRect redundantly.

  _cachedWidth: number;
  _cachedLeft: number;
  _cachedTrackWidth: number;

  /** The radius of the visual slider's ripple. */
  _rippleRadius: number = 24;

  // The value indicator tooltip text for the visual slider thumb(s).

  protected startValueIndicatorText: string = '';
  protected endValueIndicatorText: string = '';

  /**
   * Controls the timing of the slider thumb animations.
   * Slider thumb animations are immediate unless being manipulated by mouse movements.
   */
  _transition: string = 'transform 0ms';

  // Styles for the full slider track.

  _trackLeftStyle: string;
  _trackWidthStyle: string;

  // Used to control the animation of the active portion of the slider track.

  _trackActiveLeft: string = 'auto';
  _trackActiveRight: string = '450px';
  _trackActiveTransform: string = 'scaleX(0)';
  _trackActiveTransformOrigin: string = 'right';

  // Used to control the translateX of the visual slider thumb(s).

  _endThumbTransform: string;
  _startThumbTransform: string;

  /** Whether the slider is a range slider. */
  _isRange: boolean = false;

  /** Whether the slider is rtl. */
  _isRtl: boolean = false;

  /**
   * The width of the tick mark track.
   * The tick mark track width is different from full track width
   */
  _tickMarkTrackWidth: number = 0;

  private _resizeTimer: null | ReturnType<typeof setTimeout> = null;

  constructor(
    readonly _ngZone: NgZone,
    readonly _cdr: ChangeDetectorRef,
    readonly _platform: Platform,
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

  /**
   * The padding of the native slider input. This is added in order to make the region where the
   * thumb ripple extends past the end of the slider track clickable.
   */
  _inputPadding: number;

  /**
   * The offset represents left most translateX of the slider knob. Inversely,
   * (slider width - offset) = the right most translateX of the slider knob.
   *
   * Note:
   *    * The native slider knob differs from the visual slider. It's knob cannot slide past
   *      the end of the track AT ALL.
   *    * The visual slider knob CAN slide past the end of the track slightly. It's knob can slide
   *      past the end of the track such that it's center lines up with the end of the track.
   */
  _inputOffset: number;

  ngAfterViewInit(): void {
    if (this._platform.isBrowser) {
      this._setDimensions();
    }
    const eInput = this._getInput(Thumb.END);
    const sInput = this._getInput(Thumb.START);
    this._isRange = !!eInput && !!sInput;

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      _validateInputs(this._isRange, this._getInput(Thumb.END)!, this._getInput(Thumb.START));
    }

    const thumb = this._getThumb(Thumb.END);
    this._rippleRadius = thumb._ripple.radius;
    this._trackLeftStyle = `${this._rippleRadius}px`;
    this._trackWidthStyle = `calc(100% - ${this._rippleRadius * 2}px)`;

    this._inputPadding = this._rippleRadius - this._knobRadius;
    this._inputOffset = this._inputPadding + this._knobRadius;

    if (eInput) {
      eInput.initProps();
      eInput.initUI();
    }
    if (sInput) {
      sInput.initProps();
      sInput.initUI();
    }
    this._updateTrackUI(eInput!);
    this._updateTickMarkUI();
    this._updateTickMarkTrackUI();

    this._observeHostResize();
    this._cdr.detectChanges();
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
    const endInput = this._getInput(Thumb.END) as MatSliderRangeThumb;
    const startInput = this._getInput(Thumb.START) as MatSliderRangeThumb;

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
    const input = this._getInput(Thumb.END)!;
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
        this._pollForAdditionalSizeChanges();
      });
      this._resizeObserver.observe(this._elementRef.nativeElement);
    });
  }

  /**
   * Polls for changes to the width or left of the slider's
   * bounding client rect until no changes are observed.
   */
  private _pollForAdditionalSizeChanges(): void {
    this._resizeTimer = setTimeout(() => {
      const prevWidth = this._cachedWidth;
      const prevLeft = this._cachedLeft;
      this._setDimensions();

      if (prevWidth !== this._cachedWidth || prevLeft !== this._cachedLeft) {
        this._pollForAdditionalSizeChanges();
      } else {
        this._onResize();
      }
    }, 100);
  }

  /** Whether any of the thumbs are currently active. */
  private _isActive(): boolean {
    return this._getThumb(Thumb.START)._isActive || this._getThumb(Thumb.END)._isActive;
  }

  private _getValue(thumbPosition: Thumb = Thumb.END): number {
    const input = this._getInput(thumbPosition);
    if (!input) {
      return this.min;
    }
    return input.value;
  }

  private _skipUpdate(): boolean {
    return !!(
      this._getInput(Thumb.START)?._skipUIUpdate || this._getInput(Thumb.END)?._skipUIUpdate
    );
  }

  /** Stores the slider dimensions. */
  private _setDimensions(): void {
    const rect = this._elementRef.nativeElement.getBoundingClientRect();
    this._cachedWidth = rect.width;
    this._cachedLeft = rect.left;
    this._cachedTrackWidth = this._cachedWidth - this._rippleRadius * 2;
  }

  /** Sets the styles for the active portion of the track. */
  _setTrackActiveStyles(styles: {
    left: string;
    right: string;
    transform: string;
    transformOrigin: string;
  }): void {
    this._trackActiveLeft = styles.left;
    this._trackActiveRight = styles.right;
    this._trackActiveTransform = styles.transform;
    this._trackActiveTransformOrigin = styles.transformOrigin;
  }

  /** Returns the translateX positioning for a tick mark based on it's index. */
  _calcTickMarkTransform(index: number): string {
    // TODO(wagnermaciel): See if we can avoid doing this and just using flex to position these.
    const translateX = index * (this._tickMarkTrackWidth / (this._tickMarks.length - 1));
    return `translateX(${translateX}px`;
  }

  // Handlers for updating the slider ui.

  _onTranslateXChange(source: MatSliderThumb): void {
    this._updateThumbUI(source);
    this._updateTrackUI(source);
    this._updateOverlappingThumbUI(source as MatSliderRangeThumb);
    this._cdr.detectChanges();
  }

  _onTranslateXChangeBySideEffect(input1: MatSliderRangeThumb, input2: MatSliderRangeThumb): void {
    input1._updateThumbUIByValue();
    input2._updateThumbUIByValue();
  }

  _onValueChange(source: MatSliderThumb): void {
    this._updateValueIndicatorUI(source);
    this._updateTickMarkUI();
    this._cdr.markForCheck();
  }

  _onMinMaxOrStepChange(): void {
    this._updateTickMarkUI();
    this._updateTickMarkTrackUI();
    this._cdr.markForCheck();
  }

  _onResize(): void {
    this._setDimensions();
    if (this._isRange) {
      const eInput = this._getInput(Thumb.END) as MatSliderRangeThumb;
      const sInput = this._getInput(Thumb.START) as MatSliderRangeThumb;

      eInput._updateThumbUIByValue();
      sInput._updateThumbUIByValue();

      eInput._updateHiddenUI();
      sInput._updateHiddenUI();

      eInput._updateWidthInactive();
      sInput._updateWidthInactive();
    } else {
      const eInput = this._getInput(Thumb.END);
      if (eInput) {
        eInput._updateThumbUIByValue();
        eInput._updateHiddenUI();
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
    const startInput = this._getInput(Thumb.START);
    const endInput = this._getInput(Thumb.END);
    if (!startInput?._translateX || !endInput?._translateX) {
      return false;
    }
    return endInput._translateX - startInput._translateX < 20;
  }

  /**
   * Updates the class names of overlapping slider thumbs so
   * that the current active thumb is styled to be on "top".
   */
  private _updateOverlappingThumbClassNames(source: MatSliderRangeThumb): void {
    const sibling = source.getSibling()!;
    const sourceThumb = this._getThumb(source.thumbPosition);
    const siblingThumb = this._getThumb(sibling.thumbPosition);
    siblingThumb._hostElement.classList.remove('mdc-slider__thumb--top');
    this._thumbsOverlap
      ? sourceThumb._hostElement.classList.add('mdc-slider__thumb--top')
      : sourceThumb._hostElement.classList.remove('mdc-slider__thumb--top');
  }

  /** Updates the UI of slider thumbs when they begin or stop overlapping. */
  private _updateOverlappingThumbUI(source: MatSliderRangeThumb): void {
    if (!this._isRange || this._skipUpdate()) {
      return;
    }
    if (this._thumbsOverlap !== this._areThumbsOverlapping()) {
      this._thumbsOverlap = !this._thumbsOverlap;
      this._updateOverlappingThumbClassNames(source);
    }
  }

  // Thumb styles update conditions
  //
  // 1. TranslateX, resize, or dir change
  //    - Reason: The thumb styles need to be updated according to the new translateX.
  // 2. Min, max, or step
  //    - Reason: The value may have silently changed.

  /** Updates the translateX of the given thumb. */
  _updateThumbUI(source: MatSliderThumb) {
    if (this._skipUpdate()) {
      return;
    }

    const transform = `translateX(${source.translateX}px)`;
    source.thumbPosition === Thumb.END
      ? (this._endThumbTransform = transform)
      : (this._startThumbTransform = transform);
  }

  // Value indicator text update conditions
  //
  // 1. Value
  //    - Reason: The value displayed needs to be updated.
  // 2. Min, max, or step
  //    - Reason: The value may have silently changed.

  /** Updates the value indicator tooltip ui for the given thumb. */
  _updateValueIndicatorUI(source: MatSliderThumb): void {
    if (this._skipUpdate()) {
      return;
    }

    const valuetext = this.displayWith(source.value);
    source._valuetext = valuetext;
    if (this.discrete) {
      source.thumbPosition === Thumb.START
        ? (this.startValueIndicatorText = valuetext)
        : (this.endValueIndicatorText = valuetext);
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
    if (this._skipUpdate()) {
      return;
    }

    const step = this._step && this._step > 0 ? this._step : 1;
    const maxValue = Math.floor(this.max / step) * step;
    const percentage = (maxValue - this.min) / (this.max - this.min);
    this._tickMarkTrackWidth = this._cachedTrackWidth * percentage - 6;
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
  _updateTrackUI(source: MatSliderThumb): void {
    if (this._skipUpdate()) {
      return;
    }

    this._isRange
      ? this._updateTrackUIRange(source as MatSliderRangeThumb)
      : this._updateTrackUINonRange(source as MatSliderThumb);
  }

  private _updateTrackUIRange(source: MatSliderRangeThumb): void {
    const sibling = source.getSibling();
    if (!sibling || !this._cachedTrackWidth) {
      return;
    }

    const activePercentage =
      Math.abs(sibling.translateX - source.translateX) / this._cachedTrackWidth;

    if (source._isLeftThumb && this._cachedTrackWidth) {
      this._setTrackActiveStyles({
        left: 'auto',
        right: `${this._cachedWidth - sibling.translateX - this._rippleRadius}px`,
        transformOrigin: 'right',
        transform: `scaleX(${activePercentage})`,
      });
    } else {
      this._setTrackActiveStyles({
        left: `${sibling.translateX - this._rippleRadius}px`,
        right: 'auto',
        transformOrigin: 'left',
        transform: `scaleX(${activePercentage})`,
      });
    }
  }

  private _updateTrackUINonRange(source: MatSliderThumb): void {
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
    if (this.step === undefined || this.min === undefined || this.max === undefined) {
      return;
    }
    const step = this.step > 0 ? this.step : 1;
    this._isRange ? this._updateTickMarkUIRange(step) : this._updateTickMarkUINonRange(step);

    if (this._isRtl) {
      this._tickMarks.reverse();
    }
    this._cdr.markForCheck();
  }

  private _updateTickMarkUINonRange(step: number): void {
    const value = this._getValue();
    let numActive = Math.floor((value - this.min) / step);
    let numInactive = Math.floor((this.max - value) / step);
    this._isRtl ? numActive++ : numInactive++;

    this._tickMarks = Array.from({length: numActive})
      .map(() => TickMark.ACTIVE)
      .concat(Array.from({length: numInactive}).map(() => TickMark.INACTIVE));
  }

  private _updateTickMarkUIRange(step: number): void {
    const endValue = this._getValue();
    const startValue = this._getValue(Thumb.START);
    const numInactiveBeforeStartThumb = Math.floor((startValue - this.min) / step);
    const numActive = Math.floor((endValue - startValue) / step) + 1;
    const numInactiveAfterEndThumb = Math.floor((this.max - endValue) / step);
    this._tickMarks = Array.from({length: numInactiveBeforeStartThumb})
      .map(() => TickMark.INACTIVE)
      .concat(
        Array.from({length: numActive}).map(() => TickMark.ACTIVE),
        Array.from({length: numInactiveAfterEndThumb}).map(() => TickMark.INACTIVE),
      );
    this._cdr.detectChanges();
  }

  /** Gets the slider thumb input of the given thumb position. */
  _getInput(thumbPosition: Thumb): MatSliderThumb | MatSliderRangeThumb | undefined {
    if (thumbPosition === Thumb.END && this._input) {
      return this._input;
    }
    if (this._inputs?.length) {
      return thumbPosition === Thumb.START ? this._inputs.first : this._inputs.last;
    }
    return;
  }

  /** Gets the slider thumb HTML input element of the given thumb position. */
  _getThumb(thumbPosition: Thumb): MatSliderVisualThumb {
    return thumbPosition === Thumb.END ? this._thumbs?.last! : this._thumbs?.first!;
  }

  // todo: remove this function.
  _setValue(v: number, thumbPosition: Thumb) {
    const input = this._getInput(thumbPosition);
    if (input) {
      input.value = v;
    }
  }
}

/** Ensures that there is not an invalid configuration for the slider thumb inputs. */
function _validateInputs(
  isRange: boolean,
  endInputElement: MatSliderThumb | MatSliderRangeThumb,
  startInputElement?: MatSliderThumb,
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
