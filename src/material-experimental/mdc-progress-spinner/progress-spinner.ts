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
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
  ViewEncapsulation
} from '@angular/core';
import {
  MDCCircularProgressAdapter,
  MDCCircularProgressFoundation
} from '@material/circular-progress';
import {CanColor, CanColorCtor, mixinColor} from '@angular/material/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {
  MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS,
  MatProgressSpinnerDefaultOptions
} from '@angular/material/progress-spinner';
import {coerceNumberProperty} from '@angular/cdk/coercion';

// Boilerplate for applying mixins to MatProgressBar.
/** @docs-private */
class MatProgressSpinnerBase {
  constructor(public _elementRef: ElementRef) {
  }
}

const _MatProgressSpinnerMixinBase: CanColorCtor & typeof MatProgressSpinnerBase =
  mixinColor(MatProgressSpinnerBase, 'primary');

/** Possible mode for a progress spinner. */
export type ProgressSpinnerMode = 'determinate' | 'indeterminate';

/**
 * Base reference size of the spinner.
 * @docs-private
 */
const BASE_SIZE = 100;

/**
 * Base reference stroke width of the spinner.
 * @docs-private
 */
const BASE_STROKE_WIDTH = 10;

@Component({
  selector: 'mat-progress-spinner',
  exportAs: 'matProgressSpinner',
  host: {
    'role': 'progressbar',
    'class': 'mat-mdc-progress-spinner',
    '[class._mat-animation-noopable]': `_noopAnimations`,
    '[style.width.px]': 'diameter',
    '[style.height.px]': 'diameter',
    '[attr.aria-valuemin]': 'mode === "determinate" ? 0 : null',
    '[attr.aria-valuemax]': 'mode === "determinate" ? 100 : null',
    '[attr.aria-valuenow]': 'mode === "determinate" ? value : null',
    '[attr.mode]': 'mode',
  },
  inputs: ['color'],
  templateUrl: 'progress-spinner.html',
  styleUrls: ['progress-spinner.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatProgressSpinner extends _MatProgressSpinnerMixinBase implements AfterViewInit,
  OnDestroy,
  CanColor {
  /** Whether the _mat-animation-noopable class should be applied, disabling animations.  */
  _noopAnimations: boolean;
  /** Implements all of the logic of the MDC circular progress. */
  private _foundation: MDCCircularProgressFoundation | undefined;
  private _rootElement: HTMLElement;
  private _determinateCircle: HTMLElement;
  /** Adapter used by MDC to interact with the DOM. */
  private _adapter: MDCCircularProgressAdapter = {
    addClass: (className: string) => this._rootElement.classList.add(className),
    hasClass: (className: string) => this._rootElement.classList.contains(className),
    removeClass: (className: string) => this._rootElement.classList.remove(className),
    removeAttribute: (name: string) => this._rootElement.removeAttribute(name),
    setAttribute: (name: string, value: string) => this._rootElement.setAttribute(name, value),
    getDeterminateCircleAttribute: (attributeName: string) => this._determinateCircle.getAttribute(
      attributeName),
    setDeterminateCircleAttribute: (attributeName: string,
                                    value: string) => this._determinateCircle.setAttribute(
      attributeName,
      value),
  };

  constructor(public _elementRef: ElementRef<HTMLElement>,
              @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode: string,
              @Inject(MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS)
                defaults?: MatProgressSpinnerDefaultOptions) {
    super(_elementRef);
    this._noopAnimations = animationMode === 'NoopAnimations' &&
      (!!defaults && !defaults._forceAnimations);

    if (defaults) {
      if (defaults.diameter) {
        this.diameter = defaults.diameter;
      }

      if (defaults.strokeWidth) {
        this.strokeWidth = defaults.strokeWidth;
      }
    }
  }

  private _mode: ProgressSpinnerMode = 'determinate';

  /**
   * Mode of the progress bar.
   *
   * Input must be one of these values: determinate, indeterminate, buffer, query, defaults to
   * 'determinate'.
   * Mirrored to mode attribute.
   */
  @Input()
  get mode(): ProgressSpinnerMode {
    return this._mode;
  }

  set mode(value: ProgressSpinnerMode) {
    // Note that we don't technically need a getter and a setter here,
    // but we use it to match the behavior of the existing mat-progress-bar.
    this._mode = value;
    this._syncFoundation();
  }

  private _value = 0;

  /** Value of the progress bar. Defaults to zero. Mirrored to aria-valuenow. */
  @Input()
  get value(): number {
    return this.mode === 'determinate' ? this._value : 0;
  }

  set value(v: number) {
    this._value = Math.max(0, Math.min(100, coerceNumberProperty(v)));
    this._syncFoundation();
  }

  private _diameter = BASE_SIZE;

  /** The diameter of the progress spinner (will set width and height of svg). */
  @Input()
  get diameter(): number {
    return this._diameter;
  }

  set diameter(size: number) {
    this._diameter = size;
    this._syncFoundation();
  }

  private _strokeWidth: number;

  /** Stroke width of the progress spinner. */
  @Input()
  get strokeWidth(): number {
    return this._strokeWidth || this.diameter / 10;
  }

  set strokeWidth(value: number) {
    this._strokeWidth = coerceNumberProperty(value);
  }

  /** The radius of the spinner, adjusted for stroke width. */
  get _circleRadius() {
    return (this.diameter - BASE_STROKE_WIDTH) / 2;
  }

  /** The view box of the spinner's svg element. */
  get _viewBox() {
    const viewBox = this._circleRadius * 2 + this.strokeWidth;
    return `0 0 ${viewBox} ${viewBox}`;
  }

  /** The stroke circumference of the svg circle. */
  get _strokeCircumference(): number {
    return 2 * Math.PI * this._circleRadius;
  }

  /** The dash offset of the svg circle. */
  get _strokeDashOffset() {
    if (this.mode === 'determinate') {
      return this._strokeCircumference * (100 - this._value) / 100;
    }

    return null;
  }

  /** Stroke width of the circle in percent. */
  get _circleStrokeWidth() {
    return this.strokeWidth / this.diameter * 100;
  }

  ngAfterViewInit() {
    const element = this._elementRef.nativeElement;

    this._rootElement = element.querySelector('.mdc-circular-progress') as HTMLElement;
    this._determinateCircle =
      element.querySelector('.mdc-circular-progress__determinate-container') as HTMLElement;

    this._foundation = new MDCCircularProgressFoundation(this._adapter);
    this._foundation.init();
    this._syncFoundation();
  }

  ngOnDestroy() {
    if (this._foundation) {
      this._foundation.destroy();
    }
  }

  private _syncFoundation() {
    const foundation = this._foundation;

    if (foundation) {
      const mode = this.mode;
      foundation.setDeterminate(mode === 'determinate');
      foundation.setProgress(this.value / 100);
    }
  }
}

/**
 * `<mat-spinner>` component.
 *
 * This is a component definition to be used as a convenience reference to create an
 * indeterminate `<mat-progress-spinner>` instance.
 */
@Component({
  selector: 'mat-spinner',
  host: {
    'role': 'progressbar',
    'mode': 'indeterminate',
    'class': 'mat-mdc-spinner mat-mdc-progress-spinner',
    '[class._mat-animation-noopable]': `_noopAnimations`,
    '[style.width.px]': 'diameter',
    '[style.height.px]': 'diameter',
  },
  inputs: ['color'],
  templateUrl: 'progress-spinner.html',
  styleUrls: ['progress-spinner.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatSpinner extends MatProgressSpinner {
  constructor(elementRef: ElementRef<HTMLElement>,
              @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode: string,
              @Inject(MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS)
                defaults?: MatProgressSpinnerDefaultOptions) {
    super(elementRef, animationMode, defaults);
    this.mode = 'indeterminate';
  }
}
