/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

 import {
   Component, Input, ViewEncapsulation, Renderer2, ElementRef, ChangeDetectionStrategy
} from '@angular/core';
 import {coerceBooleanProperty} from '@angular/cdk/coercion';
 import {CanColor, mixinColor} from '@angular/material/core';

 /** @docs-private */
export class MatBadgeBase {
  constructor(public _renderer: Renderer2, public _elementRef: ElementRef) {}
}
export const _MatBadgeMixinBase = mixinColor(MatBadgeBase);

@Component({
  selector: 'mat-badge',
  templateUrl: './badge.html',
  styleUrls: ['./badge.css'],
  inputs: ['color'],
  host: {
    'class': 'mat-badge',
    '[class.mat-badge-overlap]': 'overlap',
    '[class.mat-badge-above]': '_isAbove',
    '[class.mat-badge-below]': '!_isAbove',
    '[class.mat-badge-before]': '!_isAfter',
    '[class.mat-badge-after]': '_isAfter',
  },
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatBadge extends _MatBadgeMixinBase implements CanColor {

  /** Whether the badge should overlap its contents or not */
  @Input()
  set overlap(val: boolean) {
    this._overlap = coerceBooleanProperty(val);
  }
  get overlap(): boolean {
    return this._overlap;
  }
  private _overlap: boolean = true;

  /** Content of the badge */
  @Input() content: string = '';

  /** Direction the badge should reside; 'above|below before|after' */
  @Input()
  set direction(val: string) {
    this._direction = val;
    this._isAbove = val.indexOf('below') === -1;
    this._isAfter = val.indexOf('before') === -1;
  }
  get direction(): string {
    return this._direction;
  }
  private _direction: string = 'above after';

  _isAbove: boolean = true;
  _isBelow: boolean = false;
  _isBefore: boolean = false;
  _isAfter: boolean = true;

  constructor(_renderer: Renderer2, _elementRef: ElementRef) {
    super(_renderer, _elementRef);
  }

}
