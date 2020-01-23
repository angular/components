/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConfigurableFocusTrap} from '../../configurable-focus-trap';
import {FocusTrapWrapStrategy} from './wrap-strategy';

/**
 * FocusTrapWrapStrategy that adds a keydown listener to intercept and redirect Tab
 * and Shift-Tab keypresses.
 */
export class TabListenerFocusTrapWrapStrategy implements FocusTrapWrapStrategy {
  private _firstTabbableElement: HTMLElement | null;
  private _lastTabbableElement: HTMLElement | null;
  private _observer: MutationObserver;
  private _listener: (e: KeyboardEvent) => void;

  private _observerConfig = {
    // Only observe tab-relevant attribute changes
    attributeFilter: [
      'tabindex',
      'disabled',
      'href',
      'contenteditable',
      'controls',
      'cdk-focus-start',
      'cdk-focus-region-start',
      'cdkFocusRegionStart',
      'cdk-focus-end',
      'cdk-focus-region-end',
      'cdkFocusRegionEnd'],
    attributes: true,
    childList: true,
    subtree: true
  };

  /** No-op. No initialization needed */
  init(focusTrap: ConfigurableFocusTrap): void {}

  /**
   * Adds the keydown listener, initializes the cached elements, and
   * sets up the MutationObserver to update the cache as needed.
   */
  trapTab(focusTrap: ConfigurableFocusTrap): void {
    this._updateCachedTabbableElements(focusTrap);
    this._observer = focusTrap._mutationObserverFactory.create(
      () => this._updateCachedTabbableElements(focusTrap))!;
    this._observer.observe(focusTrap._element, this._observerConfig);
    this._listener = (e: KeyboardEvent) => this._wrapTab(e);
    focusTrap._ngZone.runOutsideAngular(() => {
     focusTrap._document.addEventListener('keydown', this._listener);
    });
  }

  /** Removes the keydown listener and disconnects the MutationObserver. */
  allowTabEscape(focusTrap: ConfigurableFocusTrap): void {
    this._observer.disconnect();
    focusTrap._document.removeEventListener('keydown', this._listener, true);
  }

  /**
   * Redirects focus if the key was Tab on the last element, or Shift-Tab on the first.
   */
  private _wrapTab(e: KeyboardEvent) {
    if (e.key !== 'Tab') {
      return;
    }
    if (e.shiftKey && e.target === this._firstTabbableElement && !!this._lastTabbableElement) {
      e.preventDefault();
      this._lastTabbableElement.focus();
      return;
    }
    if (!e.shiftKey && e.target === this._lastTabbableElement && !!this._firstTabbableElement) {
      e.preventDefault();
      this._firstTabbableElement.focus();
      return;
    }
  }

  private _updateCachedTabbableElements(focusTrap: ConfigurableFocusTrap) {
    this._firstTabbableElement = focusTrap.getFirstTabbableElement();
    this._lastTabbableElement = focusTrap.getLastTabbableElement();
  }
}
