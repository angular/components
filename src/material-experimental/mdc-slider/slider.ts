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
  ContentChildren,
  ElementRef,
  forwardRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import {MDCSliderAdapter, MDCSliderFoundation, Thumb, TickMark} from '@material/slider';
import {EventType, SpecificEventListener} from '@material/base';
import {Subscription} from 'rxjs';
import {MatSliderThumb} from './slider-thumb';
import {DOCUMENT} from '@angular/common';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {MatSliderInput} from './slider-input';

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
  @ViewChildren(MatSliderThumb) _thumbs: QueryList<MatSliderThumb>;
  private get thumbs(): MatSliderThumb[] { return this._thumbs?.toArray(); }

  @ViewChild('trackActive') private _trackActive: ElementRef<HTMLElement>;
  private get trackActive(): HTMLElement { return this._trackActive.nativeElement; }

  @ContentChildren(MatSliderInput) private _inputs: QueryList<MatSliderInput>;
  private get inputs(): MatSliderInput[] { return this._inputs ? this._inputs.toArray() : []; }

  /** Whether the slider is disabled. */
  @Input()
  get isDisabled(): boolean { return this._isDisabled; }
  set isDisabled(v: boolean) {
    this._isDisabled = coerceBooleanProperty(v);
    if (this.initialized) {
      this._foundation.setDisabled(v);
    }
  }
  private _isDisabled = false;

  /** Whether the slider displays a numeric value label upon pressing the thumb. */
  @Input()
  get isDiscrete(): boolean { return this._isDiscrete; }
  set isDiscrete(v) { this._isDiscrete = coerceBooleanProperty(v); }
  private _isDiscrete = false;

  /** Whether the slider displays tick marks along the slider track. */
  @Input()
  get hasTickMarks(): boolean { return this._hasTickMarks; }
  set hasTickMarks(v: boolean) {
    // TODO(wagnermaciel): Warn user if they try to set hasTickMarks to true with isDiscrete false.
    this._hasTickMarks = this.isDiscrete && coerceBooleanProperty(v);
  }
  private _hasTickMarks: boolean = false;

  /** The minimum value that the slider can have. */
  @Input()
  get min(): number { return this._min; }
  set min(v: number) {
    this._min = coerceNumberProperty(v, this._min);
    if (this.initialized) {
      // TODO(wagnermaciel): Should inform user that this field shouldn't be changed.
    }
  }
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

  /** Whether this is a ranged slider. */
  get isRange(): boolean { return this.inputs.length === 2; }

  tickMarks: TickMark[] = [];

  initialized: boolean = false;

  private _getWindow() {
    return this._document.defaultView || window;
  }

  private _getThumb(thumb: Thumb): MatSliderThumb {
    return thumb === Thumb.END ? this.thumbs[this.thumbs.length - 1] : this.thumbs[0];
  }

  private _getThumbEl(thumb: Thumb): HTMLElement {
    return this._getThumb(thumb).getRootEl();
  }

  private _getInput(thumb: Thumb): MatSliderInput {
    return thumb === Thumb.END ? this.inputs[this.inputs.length - 1] : this.inputs[0];
  }

  private _getInputEl(thumb: Thumb): HTMLInputElement {
    return this._getInput(thumb).getRootEl();
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
      this._getThumb(_thumb).valueIndicatorText = _value.toString();
    },

    setTrackActiveStyleProperty: (_propertyName: string, _value: string) => {
      this.trackActive.style.setProperty(_propertyName, _value);
    },
    removeTrackActiveStyleProperty: (_propertyName: string) => {
      this.trackActive.style.removeProperty(_propertyName);
    },

    updateTickMarks: (_tickMarks: TickMark[]) => {
      this.tickMarks = _tickMarks;
      this._cdr.detectChanges();
    },

    getInputValue: (_thumb: Thumb) => {
      return this._getInputEl(_thumb).value;
    },
    setInputValue: (_value: string, _thumb: Thumb) => {
      this._getInput(_thumb).value = coerceNumberProperty(_value);
    },
    getInputAttribute: (_attribute: string, _thumb: Thumb) => {
      return this._getInputEl(_thumb).getAttribute(_attribute);
    },
    setInputAttribute: (_attribute: string, _value: string, _thumb: Thumb) => {
      if (_attribute === 'value') {
        this._getInput(_thumb).value = coerceNumberProperty(_value);
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

    emitChangeEvent: (_value: number, _thumb: Thumb) => {
      // console.log('change');
    },
    emitInputEvent: (_value: number, _thumb: Thumb) => {
      // console.log('input');
    },
    emitDragStartEvent: (_value: number, _thumb: Thumb) => {},
    emitDragEndEvent: (_value: number, _thumb: Thumb) => {},
  };

  /** Instance of the MDC slider foundation for this slider. */
  private _foundation = new MDCSliderFoundation(this._sliderAdapter);

  /** Subscription to the Directionality change EventEmitter. */
  private _dirChangeSubscription = Subscription.EMPTY;

  private _document: Document;

  constructor(
      private _cdr: ChangeDetectorRef,
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

  initInputs() {
    if (this.isRange) {
      this.inputs[0].thumb = Thumb.START;
      this.inputs[1].thumb = Thumb.END;
    } else {
      this.inputs[0].thumb = Thumb.END;
    }
  }

  ngAfterViewInit() {
    this.initInputs();
    this._foundation.init();

    // Because layout() calls stuff like getBoundingClientRect(), it only works on the browser.
    // We need this check to make sure it isn't called when using server-side rendering.
    if (this._platform.isBrowser) {
      this._foundation.layout();
    }
    this.initialized = true;
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

  get startValue(): number { return this.getValue(Thumb.START); }
  get endValue(): number { return this.getValue(Thumb.END); }

  private _getValueIndicatorText(value: number) {
    return this.displayWith ? this.displayWith(value) : value.toString();
  }
  get startValueIndicatorText() {
    return this._getValueIndicatorText(this.startValue);
  }
  get endValueIndicatorText() {
    return this._getValueIndicatorText(this.endValue);
  }

  getValue(thumb: Thumb): number {
    return this._getInput(thumb).value;
  }

  setValue(value: number, thumb: Thumb) {
    if (thumb === Thumb.START) {
      this._foundation.setValueStart(value);
    } else {
      this._foundation.setValue(value);
    }
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
