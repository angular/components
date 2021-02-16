/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectorRef,
  ElementRef,
  EventEmitter,
  InjectionToken,
  QueryList,
} from '@angular/core';
import {Thumb, TickMark} from '@material/slider';

/**
 * Represents a drag event emitted by the MatSlider component.
 */
interface _MatSliderDragEventInterface {
  /** The MatSliderThumb that was interacted with. */
  source: _MatSliderThumbInterface;

  /** The current value of the slider. */
  value: number;

  /** The thumb that was interacted with. */
  thumb: Thumb;
}

export interface _MatSliderThumbInterface {
  /** The current value of this slider input. */
  value: number;

  /** Event emitted when the slider thumb starts being dragged. */
  dragStart: EventEmitter<_MatSliderDragEventInterface>;

  /** Event emitted when the slider thumb stops being dragged. */
  dragEnd: EventEmitter<_MatSliderDragEventInterface>;

  /** Event emitted every time the MatSliderThumb is blurred. */
  _blur: EventEmitter<void>;

  /** Event emitted every time the MatSliderThumb is focused. */
  _focus: EventEmitter<void>;

  /** Indicates which slider thumb this input corresponds to. */
  thumb: Thumb;

  /** A reference to MatSliderThumbs root/host element. */
  _elementRef: ElementRef<HTMLInputElement>;

  /** The injected document if available or fallback to the global document reference. */
  _document: Document;

  /** Returns true if this slider input currently has focus. */
  _isFocused: () => boolean;
}


/**
 * This is a dummy interface that just contains the properties and methods of MatSlider that are
 * used by MatSliderThumb. Rather than directly referencing MatSlider, we use this interface when
 * defining MAT_SLIDER to avoid a circular dependency between MatSlider and MatSliderThumb.
 */
export interface _MatSliderInterface {
  /** The slider thumb(s). */
  _thumbs: QueryList<ElementRef<HTMLElement>>;

  /** The slider thumb knob(s) */
  _knobs: QueryList<ElementRef<HTMLElement>>;

  /** The span containing the slider thumb value indicator text */
  _valueIndicatorTextElements: QueryList<ElementRef<HTMLElement>>;

  /** The active section of the slider track. */
  _trackActive: ElementRef<HTMLElement>;

  /** The sliders hidden range input(s). */
  _inputs: QueryList<_MatSliderThumbInterface>;

  /** Whether the slider is disabled. */
  disabled: boolean;

  /** Whether the slider displays a numeric value label upon pressing the thumb. */
  discrete: boolean;

  /** Whether the slider displays tick marks along the slider track. */
  showTickMarks: boolean;

  /** The minimum value that the slider can have. */
  min: number;

  /** The maximum value that the slider can have. */
  max: number;

  /** The values at which the thumb will snap. */
  step: number;

  /**
   * Function that will be used to format the value before it is displayed
   * in the thumb label. Can be used to format very large number in order
   * for them to fit into the slider thumb.
   */
  displayWith: ((value: number) => string) | null;

  /** Whether the foundation has been initialized. */
  _initialized: boolean;

  /** The injected document if available or fallback to the global document reference. */
  _document: Document;

  /**
   * The defaultView of the injected document if
   * available or fallback to global window reference.
   */
  _window: Window;

  /** Used to keep track of & render the active & inactive tick marks on the slider track. */
  _tickMarks: TickMark[];

  /** The change detector ref. */
  _cdr: ChangeDetectorRef;

  /** A reference to MatSliders root/host element. */
  _elementRef: ElementRef<HTMLElement>;

  /** Sets the value of a slider thumb. */
  _setValue: (value: number, thumb: Thumb) => void;

  /** Whether this is a ranged slider. */
  _isRange: () => boolean;

  /** Gets the slider thumb input of the given thumb. */
  _getInput: (thumb: Thumb) => _MatSliderThumbInterface;

  /** Gets the slider thumb HTML input element of the given thumb. */
  _getInputElement: (thumb: Thumb) => HTMLInputElement;

  /** Gets the slider thumb HTML element of the given thumb. */
  _getThumbElement: (thumb: Thumb) => HTMLElement;

  /** Gets the slider knob HTML element of the given thumb. */
  _getKnobElement: (thumb: Thumb) => HTMLElement;

  /**
   * Sets the value indicator text of the given thumb using the given value.
   *
   * Uses the `displayWith` function if one has been provided. Otherwise, it just uses the
   * numeric value as a string.
   */
  _setValueIndicatorText: (value: number, thumb: Thumb) => void;

  /** Determines the class name for a HTML element. */
  _getTickMarkClass: (tickMark: TickMark) => string;

  /** Returns an array of the thumb types that exist on the current slider instance. */
  _getThumbTypes: () => Thumb[];
}

/**
 * Injection token that can be used to inject instances of MatSlider.
 */
export const MAT_SLIDER = new InjectionToken<_MatSliderInterface>('MatSlider');
