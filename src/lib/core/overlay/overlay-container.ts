/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Injectable,
  Inject,
  Optional,
  SkipSelf,
  Renderer2,
  RendererFactory2,
  // This isn't being used anywhere, but we need to import it to keep TypeScript happy.
  // tslint:disable-next-line:no-unused-variable
  InjectionToken,
} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';


/**
 * The OverlayContainer is the container in which all overlays will load.
 * It should be provided in the root component to ensure it is properly shared.
 */
@Injectable()
export class OverlayContainer {
  protected _containerElement: HTMLElement;

  private _themeClass: string;
  private _renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2, @Inject(DOCUMENT) private _document: any) {
    this._renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Base theme to be applied to all overlay-based components.
   */
  get themeClass(): string { return this._themeClass; }
  set themeClass(value: string) {
    if (this._containerElement) {
      this._containerElement.classList.remove(this._themeClass);

      if (value) {
        this._containerElement.classList.add(value);
      }
    }

    this._themeClass = value;
  }

  /**
   * This method returns the overlay container element.  It will lazily
   * create the element the first time  it is called to facilitate using
   * the container in non-browser environments.
   * @returns the container element
   */
  getContainerElement(): HTMLElement {
    if (!this._containerElement) { this._createContainer(); }
    return this._containerElement;
  }

  /**
   * Create the overlay container element, which is simply a div
   * with the 'cdk-overlay-container' class on the document body.
   */
  protected _createContainer(): void {
    const container = this._renderer.createElement('div');

    this._renderer.addClass(container, 'cdk-overlay-container');

    if (this._themeClass) {
      this._renderer.addClass(container, this._themeClass);
    }

    this._renderer.appendChild(this._document.body, container);
    this._containerElement = container;
  }
}

export function OVERLAY_CONTAINER_PROVIDER_FACTORY(parentContainer: OverlayContainer,
  rendererFactory: RendererFactory2, document: any) {
  return parentContainer || new OverlayContainer(rendererFactory, document);
}

export const OVERLAY_CONTAINER_PROVIDER = {
  // If there is already an OverlayContainer available, use that. Otherwise, provide a new one.
  provide: OverlayContainer,
  deps: [[new Optional(), new SkipSelf(), OverlayContainer], RendererFactory2, DOCUMENT],
  useFactory: OVERLAY_CONTAINER_PROVIDER_FACTORY
};
