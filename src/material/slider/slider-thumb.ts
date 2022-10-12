/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {Thumb} from '@material/slider';
import {MatRipple, RippleAnimationConfig, RippleRef, RippleState} from '@angular/material/core';
import {
  MatSliderInterface,
  MatSliderThumbInterface,
  MatSliderVisualThumbInterface,
  MAT_SLIDER_TOKEN,
  MAT_SLIDER_VISUAL_THUMB_TOKEN,
} from './slider-interface';

/**
 * The visual slider thumb.
 *
 * Handles the slider thumb ripple states (hover, focus, and active),
 * and displaying the value tooltip on discrete sliders.
 * @docs-private.
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
  providers: [{provide: MAT_SLIDER_VISUAL_THUMB_TOKEN, useExisting: MatSliderVisualThumb}],
})
export class MatSliderVisualThumb
  implements MatSliderVisualThumbInterface, AfterViewInit, OnDestroy
{
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
  private _sliderInput: MatSliderThumbInterface;

  /** The native html element of the slider input corresponding to this thumb. */
  private _sliderInputEl: HTMLInputElement;

  /** The RippleRef for the slider thumbs hover state. */
  private _hoverRippleRef: RippleRef | undefined;

  /** The RippleRef for the slider thumbs focus state. */
  private _focusRippleRef: RippleRef | undefined;

  /** The RippleRef for the slider thumbs active state. */
  private _activeRippleRef: RippleRef | undefined;

  /** Whether the slider thumb is currently being hovered. */
  private _isHovered: boolean = false;

  /** Whether the slider thumb is currently being pressed. */
  _isActive = false;

  /** Whether the value indicator tooltip is visible. */
  _isValueIndicatorVisible: boolean = false;

  /** The host native HTML input element. */
  _hostElement: HTMLElement;

  constructor(
    readonly _cdr: ChangeDetectorRef,
    private readonly _ngZone: NgZone,
    _elementRef: ElementRef<HTMLElement>,
    @Inject(MAT_SLIDER_TOKEN) private _slider: MatSliderInterface,
  ) {
    this._hostElement = _elementRef.nativeElement;
  }

  ngAfterViewInit() {
    this._ripple.radius = 24;
    this._sliderInput = this._slider._getInput(this.thumbPosition)!;
    this._sliderInputEl = this._sliderInput._hostElement;

    // These listeners don't update any data bindings so we bind them outside
    // of the NgZone to prevent Angular from needlessly running change detection.
    this._ngZone.runOutsideAngular(() => {
      this._sliderInputEl.addEventListener('pointermove', this._onPointerMove);
      this._sliderInputEl.addEventListener('pointerdown', this._onDragStart);
      this._sliderInputEl.addEventListener('pointerup', this._onDragEnd);
      this._sliderInputEl.addEventListener('pointerleave', this._onMouseLeave);
      this._sliderInputEl.addEventListener('focus', this._onFocus);
      this._sliderInputEl.addEventListener('blur', this._onBlur);
    });
  }

  ngOnDestroy() {
    this._sliderInputEl.removeEventListener('pointermove', this._onPointerMove);
    this._sliderInputEl.removeEventListener('pointerdown', this._onDragStart);
    this._sliderInputEl.removeEventListener('pointerup', this._onDragEnd);
    this._sliderInputEl.removeEventListener('pointerleave', this._onMouseLeave);
    this._sliderInputEl.removeEventListener('focus', this._onFocus);
    this._sliderInputEl.removeEventListener('blur', this._onBlur);
  }

  private _onPointerMove = (event: PointerEvent): void => {
    if (this._sliderInput._isFocused) {
      return;
    }

    const rect = this._hostElement.getBoundingClientRect();
    const isHovered = this._isSliderThumbHovered(event, rect);
    this._isHovered = isHovered;

    if (isHovered) {
      this._showHoverRipple();
    } else {
      this._hideRipple(this._hoverRippleRef);
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
    this._isActive = true;
    this._showActiveRipple();
  };

  private _onDragEnd = (): void => {
    this._isActive = false;
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

  /** Shows the value indicator ui. */
  private _showValueIndicator(): void {
    this._getValueIndicatorContainer()?.classList.add('mdc-slider__thumb--with-indicator');
  }

  /** Hides the value indicator ui. */
  private _hideValueIndicator(): void {
    this._getValueIndicatorContainer()?.classList.remove('mdc-slider__thumb--with-indicator');
  }

  /** Gets the value indicator container's native HTML element. */
  _getValueIndicatorContainer(): HTMLElement | undefined {
    return this._valueIndicatorContainer?.nativeElement;
  }

  /** Gets the native HTML element of the slider thumb knob. */
  _getKnob(): HTMLElement {
    return this._knob.nativeElement;
  }

  private _isSliderThumbHovered(event: PointerEvent, rect: DOMRect) {
    const radius = rect.width / 2;
    const centerX = rect.x + radius;
    const centerY = rect.y + radius;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    return Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(radius, 2);
  }
}
