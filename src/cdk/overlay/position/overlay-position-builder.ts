/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, Injector, inject} from '@angular/core';
import {
  createFlexibleConnectedPositionStrategy,
  FlexibleConnectedPositionStrategy,
  FlexibleConnectedPositionStrategyOrigin,
} from './flexible-connected-position-strategy';
import {createGlobalPositionStrategy, GlobalPositionStrategy} from './global-position-strategy';

/** Builder for overlay position strategy. */
@Injectable({providedIn: 'root'})
export class OverlayPositionBuilder {
  private _injector = inject(Injector);

  constructor(...args: unknown[]);
  constructor() {}

  /**
   * Creates a global position strategy.
   */
  global(): GlobalPositionStrategy {
    return createGlobalPositionStrategy(this._injector);
  }

  /**
   * Creates a flexible position strategy.
   * @param origin Origin relative to which to position the overlay.
   */
  flexibleConnectedTo(
    origin: FlexibleConnectedPositionStrategyOrigin,
  ): FlexibleConnectedPositionStrategy {
    return createFlexibleConnectedPositionStrategy(this._injector, origin);
  }
}
