/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgZone, Renderer2} from '@angular/core';

/** Encapsulates the logic for attaching and detaching a backdrop. */
export class BackdropRef {
  readonly element: HTMLElement;
  private _cleanupClick: (() => void) | undefined;
  private _cleanupTransitionEnd: (() => void) | undefined;
  private _fallbackTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(
    document: Document,
    private _renderer: Renderer2,
    private _ngZone: NgZone,
    onClick: (event: MouseEvent) => void,
  ) {
    this.element = document.createElement('div');
    this.element.classList.add('cdk-overlay-backdrop');
    this._cleanupClick = _renderer.listen(this.element, 'click', onClick);
  }

  detach() {
    this._ngZone.runOutsideAngular(() => {
      const element = this.element;
      clearTimeout(this._fallbackTimeout);
      this._cleanupTransitionEnd?.();
      this._cleanupTransitionEnd = this._renderer.listen(element, 'transitionend', this.dispose);
      this._fallbackTimeout = setTimeout(this.dispose, 500);

      // If the backdrop doesn't have a transition, the `transitionend` event won't fire.
      // In this case we make it unclickable and we try to remove it after a delay.
      element.style.pointerEvents = 'none';
      element.classList.remove('cdk-overlay-backdrop-showing');
    });
  }

  dispose = () => {
    clearTimeout(this._fallbackTimeout);
    this._cleanupClick?.();
    this._cleanupTransitionEnd?.();
    this._cleanupClick = this._cleanupTransitionEnd = this._fallbackTimeout = undefined;
    this.element.remove();
  };
}
