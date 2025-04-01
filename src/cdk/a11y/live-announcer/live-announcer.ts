/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ContentObserver} from '@angular/cdk/observers';
import {DOCUMENT} from '@angular/common';
import {Directive, ElementRef, Injectable, Input, NgZone, OnDestroy, inject} from '@angular/core';
import {Subscription} from 'rxjs';
import {
  AriaLivePoliteness,
  LiveAnnouncerDefaultOptions,
  LIVE_ANNOUNCER_ELEMENT_TOKEN,
  LIVE_ANNOUNCER_DEFAULT_OPTIONS,
} from './live-announcer-tokens';
import {_CdkPrivateStyleLoader, _VisuallyHiddenLoader} from '@angular/cdk/private';

let uniqueIds = 0;

@Injectable({providedIn: 'root'})
export class LiveAnnouncer implements OnDestroy {
  private _ngZone = inject(NgZone);
  private _defaultOptions = inject<LiveAnnouncerDefaultOptions>(LIVE_ANNOUNCER_DEFAULT_OPTIONS, {
    optional: true,
  });

  private _liveElement: HTMLElement;
  private _document = inject(DOCUMENT);
  private _previousTimeout: ReturnType<typeof setTimeout>;
  private _currentPromise: Promise<void> | undefined;
  private _currentResolve: (() => void) | undefined;

  constructor(...args: unknown[]);

  constructor() {
    const elementToken = inject(LIVE_ANNOUNCER_ELEMENT_TOKEN, {optional: true});
    this._liveElement = elementToken || this._createLiveElement();
  }

  /**
   * Announces a message to screen readers.
   * @param message Message to be announced to the screen reader.
   * @returns Promise that will be resolved when the message is added to the DOM.
   */
  announce(message: string): Promise<void>;

  /**
   * Announces a message to screen readers.
   * @param message Message to be announced to the screen reader.
   * @param politeness The politeness of the announcer element.
   * @returns Promise that will be resolved when the message is added to the DOM.
   */
  announce(message: string, politeness?: AriaLivePoliteness): Promise<void>;

  /**
   * Announces a message to screen readers.
   * @param message Message to be announced to the screen reader.
   * @param duration Time in milliseconds after which to clear out the announcer element. Note
   *   that this takes effect after the message has been added to the DOM, which can be up to
   *   100ms after `announce` has been called.
   * @returns Promise that will be resolved when the message is added to the DOM.
   */
  announce(message: string, duration?: number): Promise<void>;

  /**
   * Announces a message to screen readers.
   * @param message Message to be announced to the screen reader.
   * @param politeness The politeness of the announcer element.
   * @param duration Time in milliseconds after which to clear out the announcer element. Note
   *   that this takes effect after the message has been added to the DOM, which can be up to
   *   100ms after `announce` has been called.
   * @returns Promise that will be resolved when the message is added to the DOM.
   */
  announce(message: string, politeness?: AriaLivePoliteness, duration?: number): Promise<void>;

  announce(message: string, ...args: any[]): Promise<void> {
    const defaultOptions = this._defaultOptions;
    let politeness: AriaLivePoliteness | undefined;
    let duration: number | undefined;

    if (args.length === 1 && typeof args[0] === 'number') {
      duration = args[0];
    } else {
      [politeness, duration] = args;
    }

    this.clear();
    clearTimeout(this._previousTimeout);

    if (!politeness) {
      politeness =
        defaultOptions && defaultOptions.politeness ? defaultOptions.politeness : 'polite';
    }

    if (duration == null && defaultOptions) {
      duration = defaultOptions.duration;
    }

    // TODO: ensure changing the politeness works on all environments we support.
    this._liveElement.setAttribute('aria-live', politeness);

    if (this._liveElement.id) {
      this._exposeAnnouncerToModals(this._liveElement.id);
    }

    // This 100ms timeout is necessary for some browser + screen-reader combinations:
    // - Both JAWS and NVDA over IE11 will not announce anything without a non-zero timeout.
    // - With Chrome and IE11 with NVDA or JAWS, a repeated (identical) message won't be read a
    //   second time without clearing and then using a non-zero delay.
    // (using JAWS 17 at time of this writing).
    return this._ngZone.runOutsideAngular(() => {
      if (!this._currentPromise) {
        this._currentPromise = new Promise(resolve => (this._currentResolve = resolve));
      }

      clearTimeout(this._previousTimeout);
      this._previousTimeout = setTimeout(() => {
        this._liveElement.textContent = message;

        if (typeof duration === 'number') {
          this._previousTimeout = setTimeout(() => this.clear(), duration);
        }

        // For some reason in tests this can be undefined
        // Probably related to ZoneJS and every other thing that patches browser APIs in tests
        this._currentResolve?.();
        this._currentPromise = this._currentResolve = undefined;
      }, 100);

      return this._currentPromise;
    });
  }

  /**
   * Clears the current text from the announcer element. Can be used to prevent
   * screen readers from reading the text out again while the user is going
   * through the page landmarks.
   */
  clear() {
    if (this._liveElement) {
      this._liveElement.textContent = '';
    }
  }

  ngOnDestroy() {
    clearTimeout(this._previousTimeout);
    this._liveElement?.remove();
    this._liveElement = null!;
    this._currentResolve?.();
    this._currentPromise = this._currentResolve = undefined;
  }

  private _createLiveElement(): HTMLElement {
    const elementClass = 'cdk-live-announcer-element';
    const previousElements = this._document.getElementsByClassName(elementClass);
    const liveEl = this._document.createElement('div');

    // Remove any old containers. This can happen when coming in from a server-side-rendered page.
    for (let i = 0; i < previousElements.length; i++) {
      previousElements[i].remove();
    }

    liveEl.classList.add(elementClass);
    liveEl.classList.add('cdk-visually-hidden');

    liveEl.setAttribute('aria-atomic', 'true');
    liveEl.setAttribute('aria-live', 'polite');
    liveEl.id = `cdk-live-announcer-${uniqueIds++}`;

    this._document.body.appendChild(liveEl);

    return liveEl;
  }

  /**
   * Some browsers won't expose the accessibility node of the live announcer element if there is an
   * `aria-modal` and the live announcer is outside of it. This method works around the issue by
   * pointing the `aria-owns` of all modals to the live announcer element.
   */
  private _exposeAnnouncerToModals(id: string) {
    // TODO(http://github.com/angular/components/issues/26853): consider de-duplicating this with
    // the `SnakBarContainer` and other usages.
    //
    // Note that the selector here is limited to CDK overlays at the moment in order to reduce the
    // section of the DOM we need to look through. This should cover all the cases we support, but
    // the selector can be expanded if it turns out to be too narrow.
    const modals = this._document.querySelectorAll(
      'body > .cdk-overlay-container [aria-modal="true"]',
    );

    for (let i = 0; i < modals.length; i++) {
      const modal = modals[i];
      const ariaOwns = modal.getAttribute('aria-owns');

      if (!ariaOwns) {
        modal.setAttribute('aria-owns', id);
      } else if (ariaOwns.indexOf(id) === -1) {
        modal.setAttribute('aria-owns', ariaOwns + ' ' + id);
      }
    }
  }
}

/**
 * A directive that works similarly to aria-live, but uses the LiveAnnouncer to ensure compatibility
 * with a wider range of browsers and screen readers.
 */
@Directive({
  selector: '[cdkAriaLive]',
  exportAs: 'cdkAriaLive',
})
export class CdkAriaLive implements OnDestroy {
  private _elementRef = inject(ElementRef);
  private _liveAnnouncer = inject(LiveAnnouncer);
  private _contentObserver = inject(ContentObserver);
  private _ngZone = inject(NgZone);

  /** The aria-live politeness level to use when announcing messages. */
  @Input('cdkAriaLive')
  get politeness(): AriaLivePoliteness {
    return this._politeness;
  }
  set politeness(value: AriaLivePoliteness) {
    this._politeness = value === 'off' || value === 'assertive' ? value : 'polite';
    if (this._politeness === 'off') {
      if (this._subscription) {
        this._subscription.unsubscribe();
        this._subscription = null;
      }
    } else if (!this._subscription) {
      this._subscription = this._ngZone.runOutsideAngular(() => {
        return this._contentObserver.observe(this._elementRef).subscribe(() => {
          // Note that we use textContent here, rather than innerText, in order to avoid a reflow.
          const elementText = this._elementRef.nativeElement.textContent;

          // The `MutationObserver` fires also for attribute
          // changes which we don't want to announce.
          if (elementText !== this._previousAnnouncedText) {
            this._liveAnnouncer.announce(elementText, this._politeness, this.duration);
            this._previousAnnouncedText = elementText;
          }
        });
      });
    }
  }
  private _politeness: AriaLivePoliteness = 'polite';

  /** Time in milliseconds after which to clear out the announcer element. */
  @Input('cdkAriaLiveDuration') duration: number;

  private _previousAnnouncedText?: string;
  private _subscription: Subscription | null;

  constructor(...args: unknown[]);

  constructor() {
    inject(_CdkPrivateStyleLoader).load(_VisuallyHiddenLoader);
  }

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}
