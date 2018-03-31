/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {Subject} from 'rxjs';

/**
 * Semi-transparent backdrop that will be rendered behind an overlay.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  template: '',
  host: {
    'class': 'cdk-overlay-backdrop',
    '[@state]': '_animationState',
    '(@state.done)': '_animationStream.next($event)',
    '(click)': '_clickStream.next($event)',
  },
  animations: [
    trigger('state', [
      state('void', style({opacity: '0'})),
      state('visible', style({opacity: '1'})),
      transition('* => *', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CdkOverlayBackdrop implements OnDestroy {
  _animationState = 'visible';
  _clickStream = new Subject<MouseEvent>();
  _animationStream = new Subject<AnimationEvent>();

  constructor(public _element: ElementRef) {}

  _setClass(cssClass: string) {
    this._element.nativeElement.classList.add(cssClass);
  }

  ngOnDestroy() {
    this._clickStream.complete();
  }
}
