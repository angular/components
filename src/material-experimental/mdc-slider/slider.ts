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
  ElementRef,
  forwardRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MDCSliderAdapter, MDCSliderFoundation, Thumb, TickMark} from '@material/slider';
import {EventType, SpecificEventListener} from '@material/base';
import {Subscription} from 'rxjs';
import {MatSliderThumb} from './slider-thumb';
import {DOCUMENT} from '@angular/common';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

/**
 * Provider Expression that allows mat-slider to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)] and [formControl].
 * @docs-private
 */
export const MAT_SLIDER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatSlider),
  multi: true
};

/** A simple change event emitted by the MatSlider component. */
export class MatSliderChange {
  /** The MatSlider that changed. */
  source: MatSlider;

  /** The new value of the source slider. */
  value: number;
}

@Component({
  selector: 'mat-slider',
  templateUrl: 'slider.html',
  styleUrls: ['slider.css'],
  host: {
    'class': 'mdc-slider',
    '[class.mdc-slider--range]': 'isRange',
    '[class.mdc-slider--disabled]': 'isDisabled',
    '[class.mdc-slider--discrete]': 'isDiscrete',
    '[class.mdc-slider--tick-marks]': 'hasTickMarks',
  },
  exportAs: 'matSlider',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MAT_SLIDER_VALUE_ACCESSOR],
})
export class MatSlider implements OnDestroy, AfterViewInit {
  @ViewChild('startThumb') startThumb: MatSliderThumb;
  @ViewChild('endThumb') endThumb: MatSliderThumb;

  @ViewChild('startInput') startInput: ElementRef<HTMLInputElement>;
  @ViewChild('endInput') endInput: ElementRef<HTMLInputElement>;

  @ViewChild('trackActive') _trackActive: ElementRef<HTMLElement>;
  get trackActive(): HTMLElement { return this._trackActive.nativeElement; }

  // TODO(wagnermaciel): Throw a warning if this isn't set by the user.
  @Input() ariaLabel: string | null;

  /** The end value of a ranged slider. */
  @Input()
  get endValue(): number|null {
    if (this._endValue === null) {
      this.endValue = this.max;
    }
    return this._endValue;
  }
  set endValue(value: number|null) {
    this._endValue = coerceNumberProperty(value);
    this._changeDetectorRef.markForCheck();
  }
  private _endValue: number|null = null;

  @Input()
  get hasTickMarks(): boolean {
    return this._hasTickMarks;
  }
  set hasTickMarks(value: boolean) {
    // TODO(wagnermaciel): Warn user if they try to set hasTickMarks to true with isDiscrete false.
    this._hasTickMarks = this.isDiscrete && coerceBooleanProperty(value);
  }
  private _hasTickMarks: boolean;

  /** Whether the slider is disabled. */
  @Input()
  get isDisabled(): boolean {
    return this._isDisabled;
  }
  set isDisabled(value) {
    this._isDisabled = coerceBooleanProperty(value);
  }
  private _isDisabled = false;

  /** Whether the slider is discrete. */
  @Input()
  get isDiscrete(): boolean {
    return this._isDiscrete;
  }
  set isDiscrete(value) {
    this._isDiscrete = coerceBooleanProperty(value);
  }
  private _isDiscrete = false;

  /** Whether this is a ranged slider. */
  @Input()
  get isRange(): boolean {
    return this._isRange;
  }
  set isRange(value) {
    this._isRange = coerceBooleanProperty(value);
  }
  private _isRange = false;

  /** The maximum value that the slider can have. */
  @Input()
  get max(): number {
    return this._max;
  }
  set max(value: number) {
    this._max = coerceNumberProperty(value);
  }
  private _max = 100;

  /** The minimum value that the slider can have. */
  @Input()
  get min(): number {
    return this._min;
  }
  set min(value: number) {
    this._min = coerceNumberProperty(value);
  }
  private _min = 0;

  @Input()
  get startValue(): number|null {
    if (this._startValue === null) {
      this.startValue = this.min;
    }
    return this._startValue;
  }
  set startValue(value: number|null) {
    this._startValue = coerceNumberProperty(value);
    this._changeDetectorRef.markForCheck();
  }
  private _startValue: number|null = null;

  /** The values at which the thumb will snap. */
  @Input()
  get step(): number {
    return this._step;
  }
  set step(value: number) {
    this._step = coerceNumberProperty(value, this._step);
  }
  private _step: number = 1;

  /**
   * Function that will be used to format the value before it is displayed
   * in the thumb label. Can be used to format very large number in order
   * for them to fit into the slider thumb.
   */
  @Input() displayWith: ((value: number) => string) | null;

  private _getValueIndicatorText(value: number) {
    if (this.displayWith) {
      return this.displayWith(value).toString();
    }
    return value.toString();
  }

  get startValueIndicatorText(): string {
    return this._getValueIndicatorText(this.startValue!);
  }

  get endValueIndicatorText(): string {
    return this._getValueIndicatorText(this.endValue!);
  }

  get maxStartValue(): number {
    return this.isRange ? this.endValue! : this.max;
  }

  get minEndValue(): number {
    return this.isRange ? this.startValue! : this.min;
  }

  tickMarks: TickMark[] = [];

  private _getThumb(thumb: Thumb): MatSliderThumb {
    if (this.isRange && thumb === Thumb.END) {
      return this.endThumb;
    }
    return this.startThumb;
  }

  private _getThumbEl(thumb: Thumb): HTMLElement {
    return this._getThumb(thumb).getRootEl();
  }

  private _getInputEl(thumb: Thumb): HTMLInputElement {
    if (this.isRange && thumb === Thumb.END) {
      return this.endInput.nativeElement;
    }
    return this.startInput.nativeElement;
  }

  private _setValue(value: string | number, thumb: Thumb) {
    if (this.isRange && thumb === Thumb.END) {
      this.endValue = coerceNumberProperty(value);
    } else {
      this.startValue = coerceNumberProperty(value);
    }
  }

  private _getWindow() {
    return this._document.defaultView || window;
  }

  /** Adapter for the MDC slider foundation. */
  private _sliderAdapter: MDCSliderAdapter = {
    hasClass: (_className: string) => {
      return this._elementRef.nativeElement.classList.contains(_className);
    },
    addClass: (_className: string) => {
      this._elementRef.nativeElement.classList.add(_className);
    },
    removeClass: (_className: string) => {
      this._elementRef.nativeElement.classList.remove(_className);
    },
    getAttribute: (_attribute: string) => {
      return this._elementRef.nativeElement.getAttribute(_attribute);
    },
    getBoundingClientRect: () => {
      return this._elementRef.nativeElement.getBoundingClientRect();
    },
    registerEventHandler:
      <K extends EventType>(_evtType: K, _handler: SpecificEventListener<K>) => {
        this._elementRef.nativeElement.addEventListener(_evtType, _handler);
      },
    deregisterEventHandler:
      <K extends EventType>(_evtType: K, _handler: SpecificEventListener<K>) => {
        this._elementRef.nativeElement.removeEventListener(_evtType, _handler);
      },

    isRTL: () => {
      return this._isRtl();
    },
    getValueToAriaValueTextFn: () => {
      return this.displayWith;
    },
    setPointerCapture: (_pointerId: number) => {
      this._elementRef.nativeElement.setPointerCapture(_pointerId);
    },

    registerBodyEventHandler:
      <K extends EventType>(_evtType: K, _handler: SpecificEventListener<K>) => {
        this._document.body.addEventListener(_evtType, _handler);
      },
    deregisterBodyEventHandler:
      <K extends EventType>(_evtType: K, _handler: SpecificEventListener<K>) => {
        this._document.body.removeEventListener(_evtType, _handler);
      },
    registerWindowEventHandler:
      <K extends EventType>(_evtType: K, _handler: SpecificEventListener<K>) => {
        this._getWindow().addEventListener(_evtType, _handler);
      },
    deregisterWindowEventHandler:
      <K extends EventType>(_evtType: K, _handler: SpecificEventListener<K>) => {
        this._getWindow().removeEventListener(_evtType, _handler);
      },

    addThumbClass: (_className: string, _thumb: Thumb) => {
      this._getThumbEl(_thumb).classList.add(_className);
    },
    removeThumbClass: (_className: string, _thumb: Thumb) => {
      this._getThumbEl(_thumb).classList.remove(_className);
    },
    getThumbBoundingClientRect: (_thumb: Thumb) => {
      return this._getThumbEl(_thumb).getBoundingClientRect();
    },
    setThumbStyleProperty: (_propertyName: string, _value: string, _thumb: Thumb) => {
      this._getThumbEl(_thumb).style.setProperty(_propertyName, _value);
    },
    removeThumbStyleProperty: (_propertyName: string, _thumb: Thumb) => {
      this._getThumbEl(_thumb).style.removeProperty(_propertyName);
    },
    getThumbKnobWidth: (_thumb: Thumb) => {
      return this._getThumb(_thumb).getKnobWidth();
    },
    registerThumbEventHandler:
      <K extends EventType>(_thumb: Thumb, _evtType: K, _handler: SpecificEventListener<K>) => {
        this._getThumbEl(_thumb).addEventListener(_evtType, _handler);
      },
    deregisterThumbEventHandler:
      <K extends EventType>(_thumb: Thumb, _evtType: K, _handler: SpecificEventListener<K>) => {
        this._getThumbEl(_thumb).removeEventListener(_evtType, _handler);
      },
    setValueIndicatorText: (_value: number, _thumb: Thumb) => {
      this._setValue(_value, _thumb);
    },

    setTrackActiveStyleProperty: (_propertyName: string, _value: string) => {
      this.trackActive.style.setProperty(_propertyName, _value);
    },
    removeTrackActiveStyleProperty: (_propertyName: string) => {
      this.trackActive.style.removeProperty(_propertyName);
    },

    updateTickMarks: (_tickMarks: TickMark[]) => {
      this.tickMarks = _tickMarks;
    },

    getInputValue: (_thumb: Thumb) => {
      return this._getInputEl(_thumb).value;
    },
    setInputValue: (_value: string, _thumb: Thumb) => {
      this._setValue(_value, _thumb);
    },
    getInputAttribute: (_attribute: string, _thumb: Thumb) => {
      return this._getInputEl(_thumb).getAttribute(_attribute);
    },
    setInputAttribute: (_attribute: string, _value: string, _thumb: Thumb) => {
      if (_attribute === 'value') {
        this._setValue(_value, _thumb);
      }
      this._getInputEl(_thumb).setAttribute(_attribute, _value);
    },
    removeInputAttribute: (_attribute: string, _thumb: Thumb) => {
      this._getInputEl(_thumb).removeAttribute(_attribute);
    },
    focusInput: (_thumb: Thumb) => {
      this._getInputEl(_thumb).focus();
    },
    isInputFocused: (_thumb: Thumb) => {
      return this._getInputEl(_thumb) === this._document.activeElement;
    },
    registerInputEventHandler:
      (_thumb: Thumb, _evtType: any, _handler: SpecificEventListener<any>) => {
        this._getInputEl(_thumb).addEventListener(_evtType, _handler);
      },
    deregisterInputEventHandler:
      (_thumb: Thumb, _evtType: any, _handler: SpecificEventListener<any>) => {
        this._getInputEl(_thumb).removeEventListener(_evtType, _handler);
      },

    emitChangeEvent: (_value: number, _thumb: Thumb) => {},
    emitInputEvent: (_value: number, _thumb: Thumb) => {},
    emitDragStartEvent: (_value: number, _thumb: Thumb) => {},
    emitDragEndEvent: (_value: number, _thumb: Thumb) => {},
  };

  /** Instance of the MDC slider foundation for this slider. */
  private _foundation = new MDCSliderFoundation(this._sliderAdapter);

  /** Subscription to the Directionality change EventEmitter. */
  private _dirChangeSubscription = Subscription.EMPTY;

  private _document: Document;

  constructor(
      private _changeDetectorRef: ChangeDetectorRef,
      private _elementRef: ElementRef<HTMLElement>,
      private _ngZone: NgZone,
      private _platform: Platform,
      @Inject(DOCUMENT) document: any,
      @Optional() private _dir: Directionality) {
    this._document = document;
    if (this._dir) {
      this._dirChangeSubscription = this._dir.change.subscribe(() => {
        // In case the directionality changes, we need to refresh the rendered MDC slider.
        // Note that we need to wait until the page actually updated as otherwise the
        // client rectangle wouldn't reflect the new directionality.
        // TODO(devversion): ideally the MDC slider would just compute dimensions similarly
        // to the standard Material slider on "mouseenter".
        this._ngZone.runOutsideAngular(() => setTimeout(() => this._foundation.layout()));
      });
    }
  }

  ngAfterViewInit() {
    this._foundation.init();

    // Because layout() calls stuff like getBoundingClientRect(), it only works on the browser.
    // We need this check to make sure it isn't called when using server-side rendering.
    if (this._platform.isBrowser) {
      this._foundation.layout();
    }
  }

  ngOnDestroy() {
    this._dirChangeSubscription.unsubscribe();
    // The foundation cannot be destroyed on the server, as the foundation
    // has not be initialized on the server.
    if (this._platform.isBrowser) {
      this._foundation.destroy();
    }
  }

  /** Whether the slider is displayed in RTL-mode. */
  _isRtl(): boolean {
    return this._dir && this._dir.value === 'rtl';
  }

  getTickMarkClass(tickMark: TickMark) {
    return tickMark === TickMark.ACTIVE
      ? 'mdc-slider__tick-mark--active'
      : 'mdc-slider__tick-mark--inactive';
  }

  static ngAcceptInputType_endValue: NumberInput;
  static ngAcceptInputType_hasTickMarks: BooleanInput;
  static ngAcceptInputType_isDisabled: BooleanInput;
  static ngAcceptInputType_isDiscrete: BooleanInput;
  static ngAcceptInputType_isRange: BooleanInput;
  static ngAcceptInputType_max: NumberInput;
  static ngAcceptInputType_min: NumberInput;
  static ngAcceptInputType_startValue: NumberInput;
  static ngAcceptInputType_step: NumberInput;
}
