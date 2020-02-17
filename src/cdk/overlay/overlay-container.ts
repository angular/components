/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {
  Inject,
  Injectable,
  InjectionToken,
  OnDestroy,
  Optional,
  SkipSelf,
} from '@angular/core';

const CONTAINER_CLASS = 'cdk-overlay-container';

/** Container inside which all overlays will render. */
@Injectable({providedIn: 'root'})
export class OverlayContainer implements OnDestroy {
  protected _containerElement: HTMLElement;
  protected _document: Document;

  constructor(@Inject(DOCUMENT) document: any) {
    this._document = document;
  }

  ngOnDestroy() {
    if (this._containerElement && this._containerElement.parentNode) {
      this._containerElement.parentNode.removeChild(this._containerElement);
    }
  }

  /**
   * This method returns the overlay container element. It will lazily
   * create the element the first time  it is called to facilitate using
   * the container in non-browser environments.
   * @returns the container element
   */
  getContainerElement(): HTMLElement {
    if (!this._containerElement) {
      this._createContainer();
    } else if (!this._containerElement.parentNode) {
        this._removeExistingCdkContainers();
        this._appendContainerElementToBody();
    }

    return this._containerElement;
  }

  /**
   * Create the overlay container element, which is simply a div
   * with the 'cdk-overlay-container' class on the document body.
   */
  protected _createContainer(): void {
    this._removeExistingCdkContainers();
    const container = this._document.createElement('div');
    container.classList.add(CONTAINER_CLASS);
    this._containerElement = container;
    this._appendContainerElementToBody();
  }

  /**
   * Append the current container element
   */
  protected _appendContainerElementToBody() {
    if (this._containerElement) {
      this._document.body.appendChild(this._containerElement);
    }
  }

  /**
   * Remove all existing CDK containers
   */
  protected _removeExistingCdkContainers() {
    const previousContainers = this._document.getElementsByClassName(CONTAINER_CLASS);

    // Remove any old containers. This can happen when transitioning from the server to the client.
    for (let i = 0; i < previousContainers.length; i++) {
      if (previousContainers[i] !== this._containerElement) {
        previousContainers[i].parentNode!.removeChild(previousContainers[i]);
      }
    }
  }
}


/** @docs-private @deprecated @breaking-change 8.0.0 */
export function OVERLAY_CONTAINER_PROVIDER_FACTORY(parentContainer: OverlayContainer,
  _document: any) {
  return parentContainer || new OverlayContainer(_document);
}

/** @docs-private @deprecated @breaking-change 8.0.0 */
export const OVERLAY_CONTAINER_PROVIDER = {
  // If there is already an OverlayContainer available, use that. Otherwise, provide a new one.
  provide: OverlayContainer,
  deps: [
    [new Optional(), new SkipSelf(), OverlayContainer],
    DOCUMENT as InjectionToken<any> // We need to use the InjectionToken somewhere to keep TS happy
  ],
  useFactory: OVERLAY_CONTAINER_PROVIDER_FACTORY
};
