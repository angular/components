/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, NgZone, RendererFactory2, inject} from '@angular/core';
import {BaseOverlayDispatcher} from './base-overlay-dispatcher';
import type {OverlayRef} from '../overlay-ref';

/**
 * Service for dispatching keyboard events that land on the body to appropriate overlay ref,
 * if any. It maintains a list of attached overlays to determine best suited overlay based
 * on event target and order of overlay opens.
 */
@Injectable({providedIn: 'root'})
export class OverlayKeyboardDispatcher extends BaseOverlayDispatcher {
  private _ngZone = inject(NgZone);
  private _renderer = inject(RendererFactory2).createRenderer(null, null);
  private _cleanupKeydown: (() => void) | undefined;

  /** Add a new overlay to the list of attached overlay refs. */
  override add(overlayRef: OverlayRef): void {
    super.add(overlayRef);

    // Lazily start dispatcher once first overlay is added
    if (!this._isAttached) {
      this._ngZone.runOutsideAngular(() => {
        this._cleanupKeydown = this._renderer.listen('body', 'keydown', this._keydownListener);
      });

      this._isAttached = true;
    }
  }

  /** Detaches the global keyboard event listener. */
  protected detach() {
    if (this._isAttached) {
      this._cleanupKeydown?.();
      this._isAttached = false;
    }
  }

  /** Keyboard event listener that will be attached to the body. */
  private _keydownListener = (event: KeyboardEvent) => {
    const overlays = this._attachedOverlays;

    for (let i = overlays.length - 1; i > -1; i--) {
      // Dispatch the keydown event to the top overlay which has subscribers to its keydown events.
      // We want to target the most recent overlay, rather than trying to match where the event came
      // from, because some components might open an overlay, but keep focus on a trigger element
      // (e.g. for select and autocomplete). We skip overlays without keydown event subscriptions,
      // because we don't want overlays that don't handle keyboard events to block the ones below
      // them that do.
      if (overlays[i]._keydownEvents.observers.length > 0) {
        this._ngZone.run(() => overlays[i]._keydownEvents.next(event));
        break;
      }
    }
  };
}
