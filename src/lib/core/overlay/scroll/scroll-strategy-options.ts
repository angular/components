import {Injectable} from '@angular/core';
import {ScrollStrategy} from './scroll-strategy';
import {RepositionScrollStrategy} from './reposition-scroll-strategy';
import {CloseScrollStrategy} from './close-scroll-strategy';
import {NoopScrollStrategy} from './noop-scroll-strategy';
import {BlockScrollStrategy} from './block-scroll-strategy';
import {ScrollDispatcher} from './scroll-dispatcher';
import {ViewportRuler} from '../position/viewport-ruler';


/**
 * Factory that instantiates scroll strategies. Provides the built-in `reposition`, `close`,
 * `noop` and `block` strategies by default.
 */
@Injectable()
export class ScrollStrategyOptions {
  constructor(
    private _scrollDispatcher: ScrollDispatcher,
    private _viewportRuler: ViewportRuler) { }

  get(strategy: string): ScrollStrategy {
    switch (strategy) {
      case 'reposition': return new RepositionScrollStrategy(this._scrollDispatcher);
      case 'close': return new CloseScrollStrategy(this._scrollDispatcher);
      case 'noop': return new NoopScrollStrategy();
      case 'block': return new BlockScrollStrategy(this._viewportRuler);
    }

    throw new Error(`Unsupported scroll strategy "${strategy}".`);
  }
}
