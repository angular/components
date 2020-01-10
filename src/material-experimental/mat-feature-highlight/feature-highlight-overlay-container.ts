/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayContainer} from '@angular/cdk/overlay';
import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';

/**
 * An overlay container for hosting feature highlight component. Allow a
 * container element to be set instead of creating a container element under
 * <body> which is done in {@link OverlayContainer}.
 */
@Injectable({providedIn: 'root'})
export class FeatureHighlightOverlayContainer extends OverlayContainer {
  constructor(
      @Inject(DOCUMENT) document: Document,
  ) {
    super(document);
  }

  setContainerElement(element: HTMLElement) {
    this._containerElement = element;
  }

  /** @override */
  getContainerElement(): HTMLElement {
    return this._containerElement;
  }

  /**
   * Prevent a cdk overlay container element being created under body tag.
   * @override
   */
  // tslint:disable-next-line:enforce-name-casing function is overridden.
  _createContainer() {
    return;
  }
}
