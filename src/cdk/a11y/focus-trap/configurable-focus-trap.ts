/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MutationObserverFactory} from '@angular/cdk/observers';
import {NgZone} from '@angular/core';
import {InteractivityChecker} from '../interactivity-checker/interactivity-checker';
import {FocusTrap} from './focus-trap';
import {FocusTrapManager, ManagedFocusTrap} from './focus-trap-manager';
import {FocusTrapInertStrategy} from './focus-trap-inert-strategy';
import {ConfigurableFocusTrapConfig} from './configurable-focus-trap-config';
import {FocusTrapWrapStrategy} from './strategies/wrap/wrap-strategy';

/**
 * Class that allows for trapping focus within a DOM element.
 *
 * This class uses a strategy pattern that determines how it traps focus.
 * See FocusTrapInertStrategy and FocusTrapWrapStrategy.
 */
export class ConfigurableFocusTrap extends FocusTrap implements ManagedFocusTrap {
  /** Whether the FocusTrap is enabled. */
  get enabled(): boolean { return this._enabled; }
  set enabled(value: boolean) {
    this._enabled = value;
    if (this._enabled) {
      this._focusTrapManager.register(this);
    } else {
      this._focusTrapManager.deregister(this);
    }
  }

  constructor(
    _element: HTMLElement,
    _checker: InteractivityChecker,
    _ngZone: NgZone,
    _document: Document,
    private _focusTrapManager: FocusTrapManager,
    readonly _mutationObserverFactory: MutationObserverFactory,
    private _inertStrategy: FocusTrapInertStrategy,
    private _wrapStrategy: FocusTrapWrapStrategy,
    readonly _config: ConfigurableFocusTrapConfig) {
    super(_element, _checker, _ngZone, _document, true);
    this._wrapStrategy.init(this);
    this._focusTrapManager.register(this);
  }

  /** Notifies the FocusTrapManager that this FocusTrap will be destroyed. */
  destroy() {
    this._focusTrapManager.deregister(this);
    super.destroy();
  }

  /** @docs-private Implemented as part of ManagedFocusTrap. */
  _enable() {
    this._inertStrategy.preventFocus(this);
    this._wrapStrategy.trapTab(this);
  }

  /** @docs-private Implemented as part of ManagedFocusTrap. */
  _disable() {
    this._inertStrategy.allowFocus(this);
    this._wrapStrategy.allowTabEscape(this);
  }

  getFirstTabbableElement(): HTMLElement | null {
    return this._getRegionBoundary('start');
  }

  getLastTabbableElement(): HTMLElement | null {
    return this._getRegionBoundary('end');
  }
}
