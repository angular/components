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
import {Platform} from '@angular/cdk/platform';

/** The options for the MatRippleLoader's event listeners. */
const eventListenerOptions = {capture: true};

/** The events that should trigger the initialization of the ripple. */
const rippleInteractionEvents = ['focus', 'click', 'mouseenter', 'touchstart'];

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
 */
@Injectable({providedIn: 'root'})
export class MatRippleLoader implements OnDestroy {
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
    host.setAttribute(matRippleUninitialized, '');

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

  /** Returns the ripple instance for the given host element. */
  getRipple(host: HTMLElement): MatRipple | undefined {
    if ((host as any).matRipple) {
      return (host as any).matRipple;
    }
    return this.createRipple(host);
  }

  /** Sets the disabled state on the ripple instance corresponding to the given host element. */
  setDisabled(host: HTMLElement, disabled: boolean): void {
    const ripple = (host as any).matRipple as MatRipple | undefined;

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

  /** Handles creating and attaching component internals when a component it is initially interacted with. */
  private _onInteraction = (event: Event) => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const eventTarget = event.target as HTMLElement;

    // TODO(wagnermaciel): Consider batching these events to improve runtime performance.

    const element = eventTarget.closest(`[${matRippleUninitialized}]`);
    if (element) {
      this.createRipple(element as HTMLElement);
    }
  };

  /** Creates a MatRipple and appends it to the given element. */
  createRipple(host: HTMLElement): MatRipple | undefined {
    if (!this._document) {
      return;
    }

    // Create the ripple element.
    host.querySelector('.mat-ripple')?.remove();
    const rippleEl = this._document!.createElement('span');
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

  attachRipple(host: Element, ripple: MatRipple): void {
    host.removeAttribute(matRippleUninitialized);
    (host as any).matRipple = ripple;
  }
}
