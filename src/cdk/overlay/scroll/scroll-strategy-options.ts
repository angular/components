/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, Injector, inject} from '@angular/core';
import {createBlockScrollStrategy} from './block-scroll-strategy';
import {CloseScrollStrategyConfig, createCloseScrollStrategy} from './close-scroll-strategy';
import {NoopScrollStrategy} from './noop-scroll-strategy';
import {
  createRepositionScrollStrategy,
  RepositionScrollStrategyConfig,
} from './reposition-scroll-strategy';

/**
 * Options for how an overlay will handle scrolling.
 *
 * Users can provide a custom value for `ScrollStrategyOptions` to replace the default
 * behaviors. This class primarily acts as a factory for ScrollStrategy instances.
 */
@Injectable({providedIn: 'root'})
export class ScrollStrategyOptions {
  private _injector = inject(Injector);

  constructor(...args: unknown[]);
  constructor() {}

  /** Do nothing on scroll. */
  noop = () => new NoopScrollStrategy();

  /**
   * Close the overlay as soon as the user scrolls.
   * @param config Configuration to be used inside the scroll strategy.
   */
  close = (config?: CloseScrollStrategyConfig) => createCloseScrollStrategy(this._injector, config);

  /** Block scrolling. */
  block = () => createBlockScrollStrategy(this._injector);

  /**
   * Update the overlay's position on scroll.
   * @param config Configuration to be used inside the scroll strategy.
   * Allows debouncing the reposition calls.
   */
  reposition = (config?: RepositionScrollStrategyConfig) =>
    createRepositionScrollStrategy(this._injector, config);
}
