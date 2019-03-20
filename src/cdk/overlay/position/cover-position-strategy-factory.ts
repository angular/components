import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Platform} from '@angular/cdk/platform';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {OverlayContainer} from '../overlay-container';
import {FlexibleConnectedPositionStrategyOrigin} from './flexible-positioning';
import {CoverPositionStrategy} from './cover-position-strategy';

@Injectable({providedIn: 'root'})
export class CoverPositionStrategyFactory {
  constructor(
      private _viewportRuler: ViewportRuler,
      @Inject(DOCUMENT) private _document: any,
      private _platform: Platform,
      private _overlayContainer: OverlayContainer,) {}
  
  create() {
    return this.createWithConnections({});
  }
  
  createWithConnections({top, right, left, bottom}: {
    top?: FlexibleConnectedPositionStrategyOrigin,
    right?: FlexibleConnectedPositionStrategyOrigin,
    bottom?: FlexibleConnectedPositionStrategyOrigin,
    left?: FlexibleConnectedPositionStrategyOrigin
  }) {
    return new CoverPositionStrategy(
        this._viewportRuler,
        this._document,
        this._platform,
        this._overlayContainer,
        top,
        right,
        bottom,
        left);
  }
}
