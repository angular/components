/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injectable, OnDestroy, RendererFactory2} from '@angular/core';
import {OverlayContainer} from './overlay-container';

/**
 * Alternative to OverlayContainer that supports correct displaying of overlay elements in
 * Fullscreen mode
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen
 *
 * Should be provided in the root component.
 */
@Injectable({providedIn: 'root'})
export class FullscreenOverlayContainer extends OverlayContainer implements OnDestroy {
  private _renderer = inject(RendererFactory2).createRenderer(null, null);
  private _fullScreenEventName: string | undefined;
  private _cleanupFullScreenListener: (() => void) | undefined;

  constructor(...args: unknown[]);

  constructor() {
    super();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._cleanupFullScreenListener?.();
  }

  protected override _createContainer(): void {
    const eventName = this._getEventName();
    super._createContainer();
    this._adjustParentForFullscreenChange();

    if (eventName) {
      this._cleanupFullScreenListener?.();
      this._cleanupFullScreenListener = this._renderer.listen('document', eventName, () => {
        this._adjustParentForFullscreenChange();
      });
    }
  }

  private _adjustParentForFullscreenChange(): void {
    if (this._containerElement) {
      const fullscreenElement = this.getFullscreenElement();
      const parent = fullscreenElement || this._document.body;
      parent.appendChild(this._containerElement);
    }
  }

  private _getEventName(): string | undefined {
    if (!this._fullScreenEventName) {
      const _document = this._document as any;

      if (_document.fullscreenEnabled) {
        this._fullScreenEventName = 'fullscreenchange';
      } else if (_document.webkitFullscreenEnabled) {
        this._fullScreenEventName = 'webkitfullscreenchange';
      } else if (_document.mozFullScreenEnabled) {
        this._fullScreenEventName = 'mozfullscreenchange';
      } else if (_document.msFullscreenEnabled) {
        this._fullScreenEventName = 'MSFullscreenChange';
      }
    }

    return this._fullScreenEventName;
  }

  /**
   * When the page is put into fullscreen mode, a specific element is specified.
   * Only that element and its children are visible when in fullscreen mode.
   */
  getFullscreenElement(): Element {
    const _document = this._document as any;

    return (
      _document.fullscreenElement ||
      _document.webkitFullscreenElement ||
      _document.mozFullScreenElement ||
      _document.msFullscreenElement ||
      null
    );
  }
}
