/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {DOCUMENT} from '@angular/common';
import {
  defineInjectable,
  ElementRef,
  inject,
  Inject,
  Injectable,
  InjectFlags,
  Optional,
} from '@angular/core';
import {OverlayContainer} from '../overlay-container';
import {OriginConnectionPosition, OverlayConnectionPosition} from './connected-position';
import {ConnectedPositionStrategy} from './connected-position-strategy';
import {FlexibleConnectedPositionStrategy} from './flexible-connected-position-strategy';
import {GlobalPositionStrategy} from './global-position-strategy';


/**
 * Builder for overlay position strategy.
 * @dynamic
 */
export class OverlayPositionBuilder {
  // This is what the Angular compiler would generate for the @Injectable decorator. See #23917.
  /** @nocollapse */
  static ngInjectableDef = defineInjectable({
    providedIn: 'root',
    factory: () => new OverlayPositionBuilder(
        inject(ViewportRuler),
        inject(DOCUMENT),
        inject(Platform, InjectFlags.Optional),
        inject(OverlayContainer, InjectFlags.Optional)),
  });

  constructor(
    private _viewportRuler: ViewportRuler,
    @Inject(DOCUMENT) private _document: any,
    // @breaking-change 7.0.0 `_platform` and `_overlayContainer` parameters to be made required.
    @Optional() private _platform?: Platform | null,
    @Optional() private _overlayContainer?: OverlayContainer | null) { }

  /**
   * Creates a global position strategy.
   */
  global(): GlobalPositionStrategy {
    return new GlobalPositionStrategy();
  }

  /**
   * Creates a relative position strategy.
   * @param elementRef
   * @param originPos
   * @param overlayPos
   * @deprecated Use `flexibleConnectedTo` instead.
   * @breaking-change 7.0.0
   */
  connectedTo(
      elementRef: ElementRef,
      originPos: OriginConnectionPosition,
      overlayPos: OverlayConnectionPosition): ConnectedPositionStrategy {

    return new ConnectedPositionStrategy(originPos, overlayPos, elementRef, this._viewportRuler,
        this._document);
  }

  /**
   * Creates a flexible position strategy.
   * @param elementRef
   */
  flexibleConnectedTo(elementRef: ElementRef | HTMLElement): FlexibleConnectedPositionStrategy {
    return new FlexibleConnectedPositionStrategy(elementRef, this._viewportRuler, this._document,
        this._platform, this._overlayContainer);
  }

}
