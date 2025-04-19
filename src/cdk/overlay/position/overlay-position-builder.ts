/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Platform} from '../../platform';
import {ViewportRuler} from '../../scrolling';

import {Injectable, inject, DOCUMENT} from '@angular/core';
import {OverlayContainer} from '../overlay-container';
import {
  FlexibleConnectedPositionStrategy,
  FlexibleConnectedPositionStrategyOrigin,
} from './flexible-connected-position-strategy';
import {GlobalPositionStrategy} from './global-position-strategy';

/** Builder for overlay position strategy. */
@Injectable({providedIn: 'root'})
export class OverlayPositionBuilder {
  private _viewportRuler = inject(ViewportRuler);
  private _document = inject(DOCUMENT);
  private _platform = inject(Platform);
  private _overlayContainer = inject(OverlayContainer);

  constructor(...args: unknown[]);
  constructor() {}

  /**
   * Creates a global position strategy.
   */
  global(): GlobalPositionStrategy {
    return new GlobalPositionStrategy();
  }

  /**
   * Creates a flexible position strategy.
   * @param origin Origin relative to which to position the overlay.
   */
  flexibleConnectedTo(
    origin: FlexibleConnectedPositionStrategyOrigin,
  ): FlexibleConnectedPositionStrategy {
    return new FlexibleConnectedPositionStrategy(
      origin,
      this._viewportRuler,
      this._document,
      this._platform,
      this._overlayContainer,
    );
  }
}
