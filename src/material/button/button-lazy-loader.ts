/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {
  ANIMATION_MODULE_TYPE,
  ElementRef,
  Injectable,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';
import {
  MAT_RIPPLE_GLOBAL_OPTIONS,
  MatRipple,
  RippleConfig,
  RippleGlobalOptions,
  RippleRenderer,
  RippleTarget,
} from '@angular/material/core';
import {Platform} from '@angular/cdk/platform';

/** The options for the MatButtonRippleLoader's event listeners. */
const eventListenerOptions = {capture: true};

/** The events that should trigger the initialization of the ripple. */
const rippleInteractionEvents = ['focus', 'click', 'mouseenter', 'touchstart'];

/** The attribute attached to a mat-button whose ripple has not yet been initialized. */
export const MAT_BUTTON_RIPPLE_UNINITIALIZED = 'mat-button-ripple-uninitialized';

/**
 * Handles attaching the MatButton's ripple on demand.
 *
 * This service allows us to avoid eagerly creating & attaching the MatButton's ripple.
 * It works by creating & attaching the ripple only when a MatButton is first interacted with.
 */
@Injectable({providedIn: 'root'})
export class MatButtonLazyLoader implements OnDestroy {
  private _document = inject(DOCUMENT, {optional: true});
  private _animationMode = inject(ANIMATION_MODULE_TYPE, {optional: true});
  private _globalRippleOptions = inject(MAT_RIPPLE_GLOBAL_OPTIONS, {optional: true});
  private _platform = inject(Platform);
  private _ngZone = inject(NgZone);

  constructor() {
    this._ngZone.runOutsideAngular(() => {
      for (const event of rippleInteractionEvents) {
        this._document?.addEventListener(event, this._onInteraction, eventListenerOptions);
      }
    });
  }

  ngOnDestroy() {
    for (const event of rippleInteractionEvents) {
      this._document?.removeEventListener(event, this._onInteraction, eventListenerOptions);
    }
  }

  /** Handles creating and attaching button internals when a button is initially interacted with. */
  private _onInteraction = (event: Event) => {
    if (event.target === this._document) {
      return;
    }
    const eventTarget = event.target as Element;

    // TODO(wagnermaciel): Consider batching these events to improve runtime performance.

    const button = eventTarget.closest(`[${MAT_BUTTON_RIPPLE_UNINITIALIZED}]`);
    if (button) {
      button.removeAttribute(MAT_BUTTON_RIPPLE_UNINITIALIZED);
      this._appendRipple(button as HTMLElement);
    }
  };

  /** Creates a MatButtonRipple and appends it to the given button element. */
  private _appendRipple(button: HTMLElement): void {
    if (!this._document) {
      return;
    }
    const ripple = this._document.createElement('span');
    ripple.classList.add('mat-mdc-button-ripple');

    const target = new MatButtonRippleTarget(
      button,
      this._globalRippleOptions ? this._globalRippleOptions : undefined,
      this._animationMode ? this._animationMode : undefined,
    );
    target.rippleConfig.centered = button.hasAttribute('mat-icon-button');

    const rippleRenderer = new RippleRenderer(target, this._ngZone, ripple, this._platform);
    rippleRenderer.setupTriggerEvents(button);
    button.append(ripple);
  }

  _createMatRipple(button: HTMLElement): MatRipple | undefined {
    if (!this._document) {
      return;
    }
    button.querySelector('.mat-mdc-button-ripple')?.remove();
    button.removeAttribute(MAT_BUTTON_RIPPLE_UNINITIALIZED);
    const rippleEl = this._document!.createElement('span');
    rippleEl.classList.add('mat-mdc-button-ripple');
    const ripple = new MatRipple(
      new ElementRef(rippleEl),
      this._ngZone,
      this._platform,
      this._globalRippleOptions ? this._globalRippleOptions : undefined,
      this._animationMode ? this._animationMode : undefined,
    );
    ripple._isInitialized = true;
    ripple.trigger = button;
    button.append(rippleEl);
    return ripple;
  }
}

/**
 * The RippleTarget for the lazily rendered MatButton ripple.
 * It handles ripple configuration and disabled state for ripples interactions.
 *
 * Note that this configuration is usually handled by the MatRipple, but the MatButtonLazyLoader does not use the
 * MatRipple Directive. In order to create & attach a ripple on demand, it uses the "lower level" RippleRenderer.
 */
class MatButtonRippleTarget implements RippleTarget {
  rippleConfig: RippleConfig & RippleGlobalOptions;

  constructor(
    private _button: HTMLElement,
    private _globalRippleOptions?: RippleGlobalOptions,
    animationMode?: string,
  ) {
    this._setRippleConfig(_globalRippleOptions, animationMode);
  }

  private _setRippleConfig(globalRippleOptions?: RippleGlobalOptions, animationMode?: string) {
    this.rippleConfig = globalRippleOptions || {};
    if (animationMode === 'NoopAnimations') {
      this.rippleConfig.animation = {enterDuration: 0, exitDuration: 0};
    }
  }

  get rippleDisabled(): boolean {
    return this._button.hasAttribute('disabled') || !!this._globalRippleOptions?.disabled;
  }
}
