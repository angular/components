import {Injectable} from '@angular/core';
import {ScrollStrategy} from './scroll-strategy';
import {CloseScrollStrategy} from './close-scroll-strategy';
import {NoopScrollStrategy} from './noop-scroll-strategy';
import {BlockScrollStrategy} from './block-scroll-strategy';
import {ScrollDispatcher} from './scroll-dispatcher';
import {ViewportRuler} from '../position/viewport-ruler';
import {
  RepositionScrollStrategy,
  RepositionScrollStrategyConfig,
} from './reposition-scroll-strategy';


/**
 * Factory that instantiates scroll strategies. Provides the built-in `reposition`, `close`,
 * `noop` and `block` strategies by default.
 */
@Injectable()
export class ScrollStrategyOptions {
  constructor(
    private _scrollDispatcher: ScrollDispatcher,
    private _viewportRuler: ViewportRuler) { }

  noop = () => new NoopScrollStrategy();
  close = () => new CloseScrollStrategy(this._scrollDispatcher);
  block = () => new BlockScrollStrategy(this._viewportRuler);
  reposition = (config?: RepositionScrollStrategyConfig) => {
    return new RepositionScrollStrategy(this._scrollDispatcher, config);
  }
}
