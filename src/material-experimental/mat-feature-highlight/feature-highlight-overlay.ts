/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {Overlay, OverlayKeyboardDispatcher, OverlayPositionBuilder, ScrollStrategyOptions} from '@angular/cdk/overlay';
import {DOCUMENT} from '@angular/common';
import {ComponentFactoryResolver, Inject, Injectable, Injector, NgZone} from '@angular/core';

import {FeatureHighlightOverlayContainer} from './feature-highlight-overlay-container';

/**
 * An overlay for hosting feature highlight component. Allow a container
 * element to be passed into {@link FeatureHighlightOverlayContainer}.
 */
@Injectable({providedIn: 'root'})
export class FeatureHighlightOverlay extends Overlay {
  constructor(
      readonly scrollStrategies: ScrollStrategyOptions,
      private readonly _featureHighlightOverlayContainer:
          FeatureHighlightOverlayContainer,
      readonly componentFactoryResolver: ComponentFactoryResolver,
      readonly positionBuilder: OverlayPositionBuilder,
      readonly keyboardDispatcher: OverlayKeyboardDispatcher,
      readonly injector: Injector,
      readonly ngZone: NgZone,
      @Inject(DOCUMENT) readonly document: Document,
      readonly directionality: Directionality,
  ) {
    super(
        scrollStrategies,
        _featureHighlightOverlayContainer,
        componentFactoryResolver,
        positionBuilder,
        keyboardDispatcher,
        injector,
        ngZone,
        document,
        directionality,
    );
  }

  setContainerElement(element: HTMLElement) {
    this._featureHighlightOverlayContainer.setContainerElement(element);
  }

  getContainerElement(): HTMLElement {
    return this._featureHighlightOverlayContainer.getContainerElement();
  }
}
