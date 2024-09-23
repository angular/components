/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {Injectable, OnDestroy, inject} from '@angular/core';
import type {OverlayRef} from '../overlay-ref';

/**
 * Service for dispatching events that land on the body to appropriate overlay ref,
 * if any. It maintains a list of attached overlays to determine best suited overlay based
 * on event target and order of overlay opens.
 */
@Injectable({providedIn: 'root'})
export abstract class BaseOverlayDispatcher implements OnDestroy {
  /** Currently attached overlays in the order they were attached. */
  _attachedOverlays: OverlayRef[] = [];

  protected _document = inject(DOCUMENT);
  protected _isAttached: boolean;

  constructor(...args: unknown[]);

  constructor() {}

  ngOnDestroy(): void {
    this.detach();
  }

  /** Add a new overlay to the list of attached overlay refs. */
  add(overlayRef: OverlayRef): void {
    // Ensure that we don't get the same overlay multiple times.
    this.remove(overlayRef);
    this._attachedOverlays.push(overlayRef);
  }

  /** Remove an overlay from the list of attached overlay refs. */
  remove(overlayRef: OverlayRef): void {
    const index = this._attachedOverlays.indexOf(overlayRef);

    if (index > -1) {
      this._attachedOverlays.splice(index, 1);
    }

    // Remove the global listener once there are no more overlays.
    if (this._attachedOverlays.length === 0) {
      this.detach();
    }
  }

  /** Detaches the global event listener. */
  protected abstract detach(): void;
}
