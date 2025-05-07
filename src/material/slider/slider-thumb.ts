/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Platform} from '@angular/cdk/platform';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  NgZone,
  OnDestroy,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {MatRipple, RippleAnimationConfig, RippleRef, RippleState} from '../core';
import {
  _MatSlider,
  _MatSliderThumb,
  _MatSliderVisualThumb,
  _MatThumb,
  MAT_SLIDER,
  MAT_SLIDER_VISUAL_THUMB,
} from './slider-interface';

/**
 * The visual slider thumb.
 *
 * Handles the slider thumb ripple states (hover, focus, and active),
 * and displaying the value tooltip on discrete sliders.
 * @nodoc
 */
@Component({
  selector: 'mat-slider-visual-thumb',
  templateUrl: './slider-thumb.html',
  styleUrl: 'slider-thumb.css',
  host: {
    'class': 'mdc-slider__thumb mat-mdc-slider-visual-thumb',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{provide: MAT_SLIDER_VISUAL_THUMB, useExisting: MatSliderVisualThumb}],
  imports: [MatRipple],
})
export class MatSliderVisualThumb implements _MatSliderVisualThumb, AfterViewInit, OnDestroy {
  readonly _cdr = inject(ChangeDetectorRef);
  private readonly _ngZone = inject(NgZone);
  private _slider = inject<_MatSlider>(MAT_SLIDER);
  private _renderer = inject(Renderer2);
  private _listenerCleanups: (() => void)[] | undefined;

  /** Whether the slider displays a numeric value label upon pressing the thumb. */
  @Input() discrete: boolean;

  /** Indicates which slider thumb this input corresponds to. */
  @Input() thumbPosition: _MatThumb;

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
  private _sliderInput: _MatSliderThumb;

  /** The native html element of the slider input corresponding to this thumb. */
  private _sliderInputEl: HTMLInputElement | undefined;

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
  _hostElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private _platform = inject(Platform);

  constructor(...args: unknown[]);
  constructor() {}

  ngAfterViewInit() {
    const sliderInput = this._slider._getInput(this.thumbPosition);

    // No-op if the slider isn't configured properly. `MatSlider` will
    // throw an error instructing the user how to set up the slider.
    if (!sliderInput) {
      return;
    }

    this._ripple.radius = 24;
    this._sliderInput = sliderInput;
    this._sliderInputEl = this._sliderInput._hostElement;

    // These listeners don't update any data bindings so we bind them outside
    // of the NgZone to prevent Angular from needlessly running change detection.
    this._ngZone.runOutsideAngular(() => {
      const input = this._sliderInputEl!;
      const renderer = this._renderer;
      this._listenerCleanups = [
        renderer.listen(input, 'pointermove', this._onPointerMove),
        renderer.listen(input, 'pointerdown', this._onDragStart),
        renderer.listen(input, 'pointerup', this._onDragEnd),
        renderer.listen(input, 'pointerleave', this._onMouseLeave),
        renderer.listen(input, 'focus', this._onFocus),
        renderer.listen(input, 'blur', this._onBlur),
      ];
    });
  }

  ngOnDestroy() {
    this._listenerCleanups?.forEach(cleanup => cleanup());
  }

  private _onPointerMove = (event: PointerEvent): void => {
    if (this._sliderInput._isFocused) {
      return;
    }

    const rect = this._hostElement.getBoundingClientRect();
    const isHovered = this._slider._isCursorOnSliderThumb(event, rect);
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
    this._hostElement.classList.add('mdc-slider__thumb--focused');
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
    this._hostElement.classList.remove('mdc-slider__thumb--focused');
  };

  private _onDragStart = (event: PointerEvent): void => {
    if (event.button !== 0) {
      return;
    }
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

    // On Safari we need to immediately re-show the hover ripple because
    // sliders do not retain focus from pointer events on that platform.
    if (this._platform.SAFARI) {
      this._showHoverRipple();
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
      this._focusRippleRef = this._showRipple({enterDuration: 0, exitDuration: 0}, true);
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
  private _showRipple(
    animation: RippleAnimationConfig,
    ignoreGlobalRippleConfig?: boolean,
  ): RippleRef | undefined {
    if (this._slider.disabled) {
      return;
    }
    this._showValueIndicator();
    if (this._slider._isRange) {
      const sibling = this._slider._getThumb(
        this.thumbPosition === _MatThumb.START ? _MatThumb.END : _MatThumb.START,
      );
      sibling._showValueIndicator();
    }
    if (this._slider._globalRippleOptions?.disabled && !ignoreGlobalRippleConfig) {
      return;
    }
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

    if (this._isShowingAnyRipple()) {
      return;
    }

    if (!this._slider._isRange) {
      this._hideValueIndicator();
    }

    const sibling = this._getSibling();
    if (!sibling._isShowingAnyRipple()) {
      this._hideValueIndicator();
      sibling._hideValueIndicator();
    }
  }

  /** Shows the value indicator ui. */
  _showValueIndicator(): void {
    this._hostElement.classList.add('mdc-slider__thumb--with-indicator');
  }

  /** Hides the value indicator ui. */
  _hideValueIndicator(): void {
    this._hostElement.classList.remove('mdc-slider__thumb--with-indicator');
  }

  _getSibling(): _MatSliderVisualThumb {
    return this._slider._getThumb(
      this.thumbPosition === _MatThumb.START ? _MatThumb.END : _MatThumb.START,
    );
  }

  /** Gets the value indicator container's native HTML element. */
  _getValueIndicatorContainer(): HTMLElement | undefined {
    return this._valueIndicatorContainer?.nativeElement;
  }

  /** Gets the native HTML element of the slider thumb knob. */
  _getKnob(): HTMLElement {
    return this._knob.nativeElement;
  }

  _isShowingAnyRipple(): boolean {
    return (
      this._isShowingRipple(this._hoverRippleRef) ||
      this._isShowingRipple(this._focusRippleRef) ||
      this._isShowingRipple(this._activeRippleRef)
    );
  }
}
