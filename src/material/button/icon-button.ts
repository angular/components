/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  NgZone,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';

import {
  MAT_ANCHOR_HOST,
  MAT_ANCHOR_INPUTS,
  MAT_BUTTON_HOST,
  MAT_BUTTON_INPUTS,
  MatAnchorBase,
  MatButtonBase,
} from './button-base';
import {MatRipple} from '@angular/material/core';

/**
 * Material Design icon button component. This type of button displays a single interactive icon for
 * users to perform an action.
 * See https://material.io/develop/web/components/buttons/icon-buttons/
 */
@Component({
  selector: `button[mat-icon-button]`,
  templateUrl: 'icon-button.html',
  styleUrls: ['icon-button.css', 'button-high-contrast.css'],
  inputs: MAT_BUTTON_INPUTS,
  host: MAT_BUTTON_HOST,
  exportAs: 'matButton',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatIconButton extends MatButtonBase {
  /**
   * Reference to the MatRipple instance of the button.
   * @deprecated Considered an implementation detail. To be removed.
   * @breaking-change 17.0.0
   */
  override get ripple(): MatRipple {
    if (!this._ripple && this._rippleLoader) {
      this._ripple = this._rippleLoader._createMatRipple(this._elementRef.nativeElement);
      this._ripple!.centered = true;
    }
    return this._ripple!;
  }

  constructor(
    elementRef: ElementRef,
    platform: Platform,
    ngZone: NgZone,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    super(elementRef, platform, ngZone, animationMode);
  }
}

/**
 * Material Design icon button component for anchor elements. This button displays a single
 * interaction icon that allows users to navigate across different routes or pages.
 * See https://material.io/develop/web/components/buttons/icon-buttons/
 */
@Component({
  selector: `a[mat-icon-button]`,
  templateUrl: 'button.html',
  styleUrls: ['icon-button.css', 'button-high-contrast.css'],
  inputs: MAT_ANCHOR_INPUTS,
  host: MAT_ANCHOR_HOST,
  exportAs: 'matButton, matAnchor',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatIconAnchor extends MatAnchorBase {
  constructor(
    elementRef: ElementRef,
    platform: Platform,
    ngZone: NgZone,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    super(elementRef, platform, ngZone, animationMode);
  }
}