import {Injectable} from '@angular/core';
import {ScrollStrategy} from './scroll-strategy';
import {RepositionScrollStrategy} from './reposition-scroll-strategy';
import {CloseScrollStrategy} from './close-scroll-strategy';
import {NoopScrollStrategy} from './noop-scroll-strategy';
import {BlockScrollStrategy} from './block-scroll-strategy';
import {ScrollDispatcher} from './scroll-dispatcher';
import {ViewportRuler} from '../position/viewport-ruler';

export type ScrollStrategyOption = () => ScrollStrategy;


/**
 * Factory that instantiates scroll strategies. Provides the built-in `reposition`, `close`,
 * `noop` and `block` strategies by default.
 */
@Injectable()
export class ScrollStrategyOptions {
  constructor(
    private _scrollDispatcher: ScrollDispatcher,
    private _viewportRuler: ViewportRuler) { }

  noop: ScrollStrategyOption = () => new NoopScrollStrategy();
  close: ScrollStrategyOption = () => new CloseScrollStrategy(this._scrollDispatcher);
  block: ScrollStrategyOption = () => new BlockScrollStrategy(this._viewportRuler);
  reposition: ScrollStrategyOption = () => new RepositionScrollStrategy(this._scrollDispatcher);
}
