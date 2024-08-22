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
import {MAT_RIPPLE_GLOBAL_OPTIONS, MatRipple} from '../ripple';
import {Platform, _getEventTarget} from '@angular/cdk/platform';

/** The options for the MatRippleLoader's event listeners. */
const eventListenerOptions = {capture: true};

/**
 * The events that should trigger the initialization of the ripple.
 * Note that we use `mousedown`, rather than `click`, for mouse devices because
 * we can't rely on `mouseenter` in the shadow DOM and `click` happens too late.
 */
const rippleInteractionEvents = ['focus', 'mousedown', 'mouseenter', 'touchstart'];

/** The attribute attached to a component whose ripple has not yet been initialized. */
const matRippleUninitialized = 'mat-ripple-loader-uninitialized';

/** Additional classes that should be added to the ripple when it is rendered. */
const matRippleClassName = 'mat-ripple-loader-class-name';

/** Whether the ripple should be centered. */
const matRippleCentered = 'mat-ripple-loader-centered';

/** Whether the ripple should be disabled. */
const matRippleDisabled = 'mat-ripple-loader-disabled';

/**
 * Handles attaching ripples on demand.
 *
 * This service allows us to avoid eagerly creating & attaching MatRipples.
 * It works by creating & attaching a ripple only when a component is first interacted with.
 *
 * @docs-private
 */
@Injectable({providedIn: 'root'})
export class MatRippleLoader implements OnDestroy {
  private _document = inject(DOCUMENT, {optional: true});
  private _animationMode = inject(ANIMATION_MODULE_TYPE, {optional: true});
  private _globalRippleOptions = inject(MAT_RIPPLE_GLOBAL_OPTIONS, {optional: true});
  private _platform = inject(Platform);
  private _ngZone = inject(NgZone);
  private _hosts = new Map<HTMLElement, MatRipple>();

  constructor() {
    this._ngZone.runOutsideAngular(() => {
      for (const event of rippleInteractionEvents) {
        this._document?.addEventListener(event, this._onInteraction, eventListenerOptions);
      }
    });
  }

  ngOnDestroy() {
    const hosts = this._hosts.keys();

    for (const host of hosts) {
      this.destroyRipple(host);
    }

    for (const event of rippleInteractionEvents) {
      this._document?.removeEventListener(event, this._onInteraction, eventListenerOptions);
    }
  }

  /**
   * Configures the ripple that will be rendered by the ripple loader.
   *
   * Stores the given information about how the ripple should be configured on the host
   * element so that it can later be retrived & used when the ripple is actually created.
   */
  configureRipple(
    host: HTMLElement,
    config: {
      className?: string;
      centered?: boolean;
      disabled?: boolean;
    },
  ): void {
    // Indicates that the ripple has not yet been rendered for this component.
    host.setAttribute(matRippleUninitialized, this._globalRippleOptions?.namespace ?? '');

    // Store the additional class name(s) that should be added to the ripple element.
    if (config.className || !host.hasAttribute(matRippleClassName)) {
      host.setAttribute(matRippleClassName, config.className || '');
    }

    // Store whether the ripple should be centered.
    if (config.centered) {
      host.setAttribute(matRippleCentered, '');
    }

    if (config.disabled) {
      host.setAttribute(matRippleDisabled, '');
    }
  }

  /** Sets the disabled state on the ripple instance corresponding to the given host element. */
  setDisabled(host: HTMLElement, disabled: boolean): void {
    const ripple = this._hosts.get(host);

    // If the ripple has already been instantiated, just disable it.
    if (ripple) {
      ripple.disabled = disabled;
      return;
    }

    // Otherwise, set an attribute so we know what the
    // disabled state should be when the ripple is initialized.
    if (disabled) {
      host.setAttribute(matRippleDisabled, '');
    } else {
      host.removeAttribute(matRippleDisabled);
    }
  }

  /**
   * Handles creating and attaching component internals
   * when a component is initially interacted with.
   */
  private _onInteraction = (event: Event) => {
    const eventTarget = _getEventTarget(event);

    if (eventTarget instanceof HTMLElement) {
      // TODO(wagnermaciel): Consider batching these events to improve runtime performance.
      const element = eventTarget.closest(
        `[${matRippleUninitialized}="${this._globalRippleOptions?.namespace ?? ''}"]`,
      );

      if (element) {
        this._createRipple(element as HTMLElement);
      }
    }
  };

  /** Creates a MatRipple and appends it to the given element. */
  private _createRipple(host: HTMLElement): MatRipple | undefined {
    if (!this._document) {
      return;
    }

    const existingRipple = this._hosts.get(host);
    if (existingRipple) {
      return existingRipple;
    }

    // Create the ripple element.
    host.querySelector('.mat-ripple')?.remove();
    const rippleEl = this._document.createElement('span');
    rippleEl.classList.add('mat-ripple', host.getAttribute(matRippleClassName)!);
    host.append(rippleEl);

    // Create the MatRipple.
    const ripple = new MatRipple(
      new ElementRef(rippleEl),
      this._ngZone,
      this._platform,
      this._globalRippleOptions ? this._globalRippleOptions : undefined,
      this._animationMode ? this._animationMode : undefined,
    );
    ripple._isInitialized = true;
    ripple.trigger = host;
    ripple.centered = host.hasAttribute(matRippleCentered);
    ripple.disabled = host.hasAttribute(matRippleDisabled);
    this.attachRipple(host, ripple);
    return ripple;
  }

  attachRipple(host: HTMLElement, ripple: MatRipple): void {
    host.removeAttribute(matRippleUninitialized);
    this._hosts.set(host, ripple);
  }

  destroyRipple(host: HTMLElement) {
    const ripple = this._hosts.get(host);

    if (ripple) {
      // Since this directive is created manually, it needs to be destroyed manually too.
      // tslint:disable-next-line:no-lifecycle-invocation
      ripple.ngOnDestroy();
      this._hosts.delete(host);
    }
  }
}
