/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ElementRef,
  Renderer2,
  Directive,
  ViewChild,
  SimpleChanges,
  OnChanges,
  ViewEncapsulation,
} from '@angular/core';
import {CanColor, mixinColor} from '@angular/material/core';
import {Platform} from '@angular/cdk/platform';

/** Possible mode for a progress spinner. */
export type ProgressSpinnerMode = 'determinate' | 'indeterminate';

// Boilerplate for applying mixins to MdProgressSpinner.
/** @docs-private */
export class MdProgressSpinnerBase {
  constructor(public _renderer: Renderer2, public _elementRef: ElementRef) {}
}
export const _MdProgressSpinnerMixinBase = mixinColor(MdProgressSpinnerBase, 'primary');

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
export class MdProgressSpinner extends _MdProgressSpinnerMixinBase implements CanColor, OnChanges {
  private _value: number;
  private readonly _baseSize = 100;
  private readonly _baseStrokeWidth = 10;

  _elementSize = this._baseSize;
  _circleRadius = 45;

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

  constructor(renderer: Renderer2, elementRef: ElementRef, platform: Platform) {
    super(renderer, elementRef);

    // On IE and Edge we can't animate the `stroke-dashoffset`
    // reliably so we fall back to a non-spec animation.
    const animationClass = (platform.EDGE || platform.TRIDENT) ?
      'mat-progress-spinner-indeterminate-fallback-animation' :
      'mat-progress-spinner-indeterminate-animation';

    renderer.addClass(elementRef.nativeElement, animationClass);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.strokeWidth) {
      this._elementSize = this._baseSize + Math.max(this.strokeWidth - this._baseStrokeWidth, 0);
    }
  }

  _getStrokeDashOffset() {
    if (this.mode === 'determinate') {
      return 2 * Math.PI * this._circleRadius * (100 - this._value) / 100;
    }

    return null;
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
  constructor(renderer: Renderer2, elementRef: ElementRef, platform: Platform) {
    super(renderer, elementRef, platform);
    this.mode = 'indeterminate';
  }
}
