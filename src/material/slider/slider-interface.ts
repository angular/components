/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';
import {Thumb} from '@material/slider';
import {MatRipple, RippleGlobalOptions} from '@angular/material/core';

/**
 * Injection token that can be used for a `MatSlider` to provide itself as a
 * parent to the `MatSliderThumb` and `MatSliderRangeThumb`.
 * Used primarily to avoid circular imports.
 * @docs-private
 */
export const MAT_SLIDER_TOKEN = new InjectionToken<{}>('MAT_SLIDER_TOKEN');

/**
 * Injection token that can be used to query for a `MatSliderThumb`.
 * Used primarily to avoid circular imports.
 * @docs-private
 */
export const MAT_SLIDER_THUMB_TOKEN = new InjectionToken<{}>('MAT_SLIDER_THUMB_TOKEN');

/**
 * Injection token that can be used to query for a `MatSliderRangeThumb`.
 * Used primarily to avoid circular imports.
 * @docs-private
 */
export const MAT_SLIDER_RANGE_THUMB_TOKEN = new InjectionToken<{}>('MAT_SLIDER_RANGE_THUMB_TOKEN');

/**
 * Injection token that can be used to query for a `MatSliderVisualThumb`.
 * Used primarily to avoid circular imports.
 * @docs-private
 */
export const MAT_SLIDER_VISUAL_THUMB_TOKEN = new InjectionToken<{}>(
  'MAT_SLIDER_VISUAL_THUMB_TOKEN',
);

export interface MatSliderInterface {
  _getInput(
    thumbPosition: Thumb,
  ): MatSliderThumbInterface | MatSliderRangeThumbInterface | undefined;

  /** The minimum value that the slider can have. */
  min: number;

  /** The maximum value that the slider can have. */
  max: number;

  /** The amount that slider values can increment or decrement by. */
  step: number;

  /** Whether the slider is disabled. */
  disabled: boolean;

  /** Whether the slider is a range slider. */
  _isRange: boolean;

  /** Whether the slider is rtl. */
  _isRtl: boolean;

  /** The stored width of the host element's bounding client rect. */
  _cachedWidth: number;

  /** The stored width of the host element's bounding client rect. */
  _cachedLeft: number;

  /** The stored precomputed width of the slider track. */
  _cachedTrackWidth: number;

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

  /** The radius of the visual slider's ripple. */
  _rippleRadius: number;

  /** The global configuration for `matRipple` instances. */
  readonly _globalRippleOptions?: RippleGlobalOptions;

  /** Whether animations have been disabled. */
  _noopAnimations: boolean;

  /** Whether or not the slider should use animations. */
  _hasAnimation: boolean;

  /** Triggers UI updates that are needed after a slider input value has changed. */
  _onValueChange: (source: MatSliderThumbInterface) => void;

  /** Triggers UI updates that are needed after the slider thumb position has changed. */
  _onTranslateXChange: (source: MatSliderThumbInterface) => void;

  /** Updates the stored slider dimensions using the current bounding client rect. */
  _updateDimensions: () => void;

  /** Used to set the transition duration for thumb and track animations. */
  _setTransition: (withAnimation: boolean) => void;
}

export interface MatSliderThumbInterface {
  min: number;
  max: number;
  step: number;
  /** The current value of this slider input. */
  value: number;

  translateX: number;

  thumbPosition: Thumb;

  fillPercentage: number;

  disabled: boolean;

  /** The host native HTML input element. */
  _hostElement: HTMLInputElement;

  /** Whether the input is currently focused (either by tab or after clicking). */
  _isFocused: boolean;

  /** The aria-valuetext string representation of the input's value. */
  _valuetext: string;

  _skipUIUpdate: boolean;

  initProps: () => void;

  initUI: () => void;

  _calcTranslateXByValue: () => number;

  _updateThumbUIByValue: () => void;

  _updateHiddenUI: () => void;

  _updateWidthInactive: () => void;

  _updateWidthActive: () => void;
}

export interface MatSliderRangeThumbInterface extends MatSliderThumbInterface {
  _isLeftThumb: boolean;
  getSibling: () => MatSliderRangeThumbInterface | undefined;
  _setIsLeftThumb: () => void;
  _updateStaticStyles: () => void;
  _updateMinMax: () => void;
}

export interface MatSliderVisualThumbInterface {
  _ripple: MatRipple;
  _isActive: boolean;
  _hostElement: HTMLElement;
}
