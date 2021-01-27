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

/** Represents an interaction event emitted by the MatSlider component. */
export interface MatSliderThumbInteractionEvent {
  /** The MatSlider that was interacted with. */
  source: MatSlider;

  /** The thumb that was interacted with. */
  thumb: Thumb;
}

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
    '[class.mdc-slider--range]': 'isRange',
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
    this._showTickMarks = coerceBooleanProperty(this._showTickMarks);
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

  /** Event emitted when the slider thumb starts being dragged. */
  @Output() readonly dragStart: EventEmitter<MatSliderThumbInteractionEvent>
    = new EventEmitter<MatSliderThumbInteractionEvent>();

  /** Event emitted when the slider thumb stops being dragged. */
  @Output() readonly dragEnd: EventEmitter<MatSliderThumbInteractionEvent>
    = new EventEmitter<MatSliderThumbInteractionEvent>();

  /** Whether this is a ranged slider. */
  get isRange(): boolean { return this._inputs.length === 2; }

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
  get tickMarks(): TickMark[] { return this._tickMarks; }
  set tickMarks(v: TickMark[]) {
    this._tickMarks = v;
    this._cdr.markForCheck();
  }
  private _tickMarks: TickMark[];

  constructor(
    private _cdr: ChangeDetectorRef,
    private readonly _elementRef: ElementRef<HTMLElement>,
    private readonly _platform: Platform,
    @Inject(DOCUMENT) protected readonly document: any) {
      this._document = this.document;
      this._window = this._document.defaultView || window;
      this._hostElement = this._elementRef.nativeElement;
    }

  ngAfterViewInit() {
    this._foundation.init();
    if (this._platform.isBrowser) {
      this._foundation.layout();
    }
  }

  ngOnDestroy() {
    if (this._platform.isBrowser) {
      this._foundation.destroy();
    }
  }

  /** Gets the current value of given slider thumb. */
  getValue(thumb: Thumb): number {
    return thumb === Thumb.START
      ? this._foundation.getValueStart()
      : this._foundation.getValue();
  }

  /** Sets the value of a slider thumb. */
  setValue(value: number, thumb: Thumb): void {
    thumb === Thumb.START
      ? this._foundation.setValueStart(value)
      : this._foundation.setValue(value);
  }

  /** Gets the slider thumb input of the given thumb. */
  _getInput(thumb: Thumb): MatSliderThumb {
    return thumb === Thumb.END ? this._inputs.get(this._inputs.length - 1)! : this._inputs.get(0)!;
  }

  /** Gets the slider thumb HTML input element of the given thumb. */
  _getInputElement(thumb: Thumb): HTMLInputElement {
    return this._getInput(thumb)._hostElement;
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
    return this._getValueIndicatorText(this.getValue(thumb));
  }

  /** Determines the class name for a HTML element. */
  _getTickMarkClass(tickMark: TickMark): string {
    return tickMark === TickMark.ACTIVE
      ? 'mdc-slider__tick-mark--active'
      : 'mdc-slider__tick-mark--inactive';
  }

  /** Returns an array of the thumb types that exist on the current slider instance. */
  _getThumbTypes(): Thumb[] {
    return this.isRange ? [Thumb.START, Thumb.END] : [Thumb.END];
  }

  /** Creates a MatSliderInteraction event. */
  _createThumbInteractionEvent(thumb: Thumb): MatSliderThumbInteractionEvent {
    return {source: this, thumb};
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_discrete: BooleanInput;
  static ngAcceptInputType_showTickMarks: BooleanInput;
  static ngAcceptInputType_min: NumberInput;
  static ngAcceptInputType_max: NumberInput;
  static ngAcceptInputType_step: NumberInput;
}
