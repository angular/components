/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  Input,
  ElementRef,
  Renderer2,
  SimpleChanges,
  OnChanges,
  ViewEncapsulation,
  Optional,
  Inject,
} from '@angular/core';
import {CanColor, mixinColor} from '@angular/material/core';
import {Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';

/** Possible mode for a progress spinner. */
export type ProgressSpinnerMode = 'determinate' | 'indeterminate';

// Boilerplate for applying mixins to MdProgressSpinner.
/** @docs-private */
export class MdProgressSpinnerBase {
  constructor(public _renderer: Renderer2, public _elementRef: ElementRef) {}
}
export const _MdProgressSpinnerMixinBase = mixinColor(MdProgressSpinnerBase, 'primary');

/* tslint:disable:max-line-length */
const INDETERMINATE_ANIMATION_TEMPLATE = `
  .mat-progress-spinner-DIAMETER.mat-progress-spinner-indeterminate-animation[mode="indeterminate"] circle {
    animation: mat-progress-spinner-stroke-rotate-DIAMETER 4s
              cubic-bezier(0.35, 0, 0.25, 1) infinite;
    transition-property: stroke;
  }

  @keyframes mat-progress-spinner-stroke-rotate-DIAMETER {
    0%      { stroke-dashoffset: START_VALUE;  transform: rotate(0); }
    12.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(0); }
    12.51%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(72.5deg); }
    25%     { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(72.5deg); }

    25.1%   { stroke-dashoffset: START_VALUE;  transform: rotate(270deg); }
    37.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(270deg); }
    37.51%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(161.5deg); }
    50%     { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(161.5deg); }

    50.01%  { stroke-dashoffset: START_VALUE;  transform: rotate(180deg); }
    62.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(180deg); }
    62.51%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(251.5deg); }
    75%     { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(251.5deg); }

    75.01%  { stroke-dashoffset: START_VALUE;  transform: rotate(90deg); }
    87.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(90deg); }
    87.51%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(341.5deg); }
    100%    { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(341.5deg); }
  }
`;
/* tslint:enable:max-line-length */

/**
 * <md-progress-spinner> component.
 */
@Component({
  moduleId: module.id,
  selector: 'md-progress-spinner, mat-progress-spinner',
  host: {
    'role': 'progressbar',
    'class': 'mat-progress-spinner',
    '[style.width.px]': '_elementSize',
    '[style.height.px]': '_elementSize',
    '[attr.aria-valuemin]': 'mode === "determinate" ? 0 : null',
    '[attr.aria-valuemax]': 'mode === "determinate" ? 100 : null',
    '[attr.aria-valuenow]': 'value',
    '[attr.mode]': 'mode',
  },
  inputs: ['color'],
  templateUrl: 'progress-spinner.html',
  styleUrls: ['progress-spinner.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MdProgressSpinner extends _MdProgressSpinnerMixinBase implements CanColor,
  OnChanges, AfterViewInit {

  private _value: number;
  private readonly _baseSize = 100;
  private readonly _baseStrokeWidth = 10;

  /** The width and height of the host element. Will grow with stroke width. **/
  _elementSize = this._baseSize;

  /** Tracks diameters of existing instances to de-dupe generated styles. */
  static diameters = new Set<number>([100]);

  /** The diameter of the progress spinner (will set width and height of svg). */
  @Input()
  get diameter(): number {
    return this._diameter;
  }

  set diameter(size: number) {
    this._setDiameterClass(size);
    this._diameter = size;
    if (!MdProgressSpinner.diameters.has(this.diameter)) {
      this._attachStyleNode();
    }
  }
  _diameter = this._baseSize;

  /** Stroke width of the progress spinner. */
  @Input() strokeWidth: number = 10;

  /** Mode of the progress circle */
  @Input() mode: ProgressSpinnerMode = 'determinate';

  /** Value of the progress circle. */
  @Input()
  get value() {
    return this.mode === 'determinate' ? this._value : 0;
  }
  set value(newValue: number) {
    if (newValue != null && this.mode === 'determinate') {
      this._value = Math.max(0, Math.min(100, newValue));
    }
  }

  constructor(public _renderer: Renderer2, public _elementRef: ElementRef,
              platform: Platform, @Optional() @Inject(DOCUMENT) private _document: any) {
    super(_renderer, _elementRef);

    // On IE and Edge we can't animate the `stroke-dashoffset`
    // reliably so we fall back to a non-spec animation.
    const animationClass = (platform.EDGE || platform.TRIDENT) ?
      'mat-progress-spinner-indeterminate-fallback-animation' :
      'mat-progress-spinner-indeterminate-animation';

    _renderer.addClass(_elementRef.nativeElement, animationClass);
  }

  ngAfterViewInit() {
    this._setDiameterClass(this.diameter);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.strokeWidth || changes.diameter) {
      this._elementSize =
          this._diameter + Math.max(this.strokeWidth - this._baseStrokeWidth, 0);
    }
  }

  get _circleRadius() {
    return this._diameter / 2 - 5;
  }

  get _viewBox() {
    return `0 0 ${this._diameter} ${this._diameter}`;
  }

  get _strokeCircumference(): number {
    return 2 * Math.PI * this._circleRadius;
  }

  get _strokeDashOffset() {
    if (this.mode === 'determinate') {
      return this._strokeCircumference * (100 - this._value) / 100;
    }

    return null;
  }

  private _setDiameterClass(size: number): void {
    this._renderer.removeClass(
        this._elementRef.nativeElement, `mat-progress-spinner-${this.diameter}`);
    this._renderer.addClass(
        this._elementRef.nativeElement, `mat-progress-spinner-${size}`);
  }

  private _attachStyleNode(): void {
    const styleTag = this._renderer.createElement('style');
    styleTag.textContent = this._getAnimationText();
    this._renderer.appendChild(this._document.head, styleTag);
    MdProgressSpinner.diameters.add(this.diameter);
  }

  private _getAnimationText(): string {
    return INDETERMINATE_ANIMATION_TEMPLATE
        // Animation should begin at 5% and end at 80%
        .replace(/START_VALUE/g, `${0.95 * this._strokeCircumference}`)
        .replace(/END_VALUE/g, `${0.2 * this._strokeCircumference}`)
        .replace(/DIAMETER/g, `${this.diameter}`);
  }
}


/**
 * <md-spinner> component.
 *
 * This is a component definition to be used as a convenience reference to create an
 * indeterminate <md-progress-spinner> instance.
 */
@Component({
  moduleId: module.id,
  selector: 'md-spinner, mat-spinner',
  host: {
    'role': 'progressbar',
    'mode': 'indeterminate',
    'class': 'mat-spinner mat-progress-spinner',
    '[style.width.px]': '_elementSize',
    '[style.height.px]': '_elementSize',
  },
  inputs: ['color'],
  templateUrl: 'progress-spinner.html',
  styleUrls: ['progress-spinner.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MdSpinner extends MdProgressSpinner {
  constructor(renderer: Renderer2, elementRef: ElementRef, platform: Platform,
              @Optional() @Inject(DOCUMENT) document: any) {
    super(renderer, elementRef, platform, document);
    this.mode = 'indeterminate';
  }
}
