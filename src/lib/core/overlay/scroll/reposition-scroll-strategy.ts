import {Injectable} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {ScrollStrategy, getMdScrollStrategyAlreadyAttachedError} from './scroll-strategy';
import {OverlayRef} from '../overlay-ref';
import {ScrollDispatcher} from './scroll-dispatcher';

/**
 * Config options for the RepositionScrollStrategy.
 */
export interface RepositionScrollStrategyConfig {
  scrollThrottle?: number;
}

/**
 * Strategy that will update the element position as the user is scrolling.
 */
@Injectable()
export class RepositionScrollStrategy implements ScrollStrategy {
  private _scrollSubscription: Subscription|null = null;
  private _overlayRef: OverlayRef;
  private _config: RepositionScrollStrategyConfig;

  constructor(private _scrollDispatcher: ScrollDispatcher) { }

  attach(overlayRef: OverlayRef, config?: RepositionScrollStrategyConfig) {
    if (this._overlayRef) {
      throw getMdScrollStrategyAlreadyAttachedError();
    }

    this._overlayRef = overlayRef;
    this._config = config;
  }

  enable() {
    if (!this._scrollSubscription) {
      let throttle = this._config ? this._config.scrollThrottle : 0;

      this._scrollSubscription = this._scrollDispatcher.scrolled(throttle, () => {
        this._overlayRef.updatePosition();
      });
    }
  }

  disable() {
    if (this._scrollSubscription) {
      this._scrollSubscription.unsubscribe();
      this._scrollSubscription = null;
    }
  }
}
