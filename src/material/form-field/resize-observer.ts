/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injectable, OnDestroy} from '@angular/core';

class SingleBoxSharedResizeObserver {
  private _observer?: ResizeObserver;
  private _callbacks = new Map<Element, Set<(entry: ResizeObserverEntry) => void>>();

  constructor(private _box: ResizeObserverBoxOptions) {}

  observe(target: Element, callback: (entry: ResizeObserverEntry) => void): () => void {
    this._observer = this._observer || new ResizeObserver(this._onResize.bind(this));
    this._getOrCreateCallbacks(target).add(callback);
    this._observer.observe(target, {box: this._box});
    return () => {
      this._removeCallback(target, callback);
    };
  }

  destroy() {
    this._observer?.disconnect();
    this._callbacks.clear();
  }

  private _getOrCreateCallbacks(target: Element) {
    if (!this._callbacks.has(target)) {
      this._callbacks.set(target, new Set());
    }
    return this._callbacks.get(target)!;
  }

  private _removeCallback(target: Element, callback: (entry: ResizeObserverEntry) => void) {
    const callbacks = this._callbacks.get(target);
    callbacks?.delete(callback);
    if (callbacks?.size === 0) {
      this._observer?.unobserve(target);
      this._callbacks.delete(target);
    }
  }

  private _onResize(entries: ResizeObserverEntry[]) {
    for (const entry of entries) {
      const callbacks = this._callbacks.get(entry.target);
      for (const callback of callbacks || []) {
        callback(entry);
      }
    }
  }
}

/**
 * Allows many callbacks to register separately to a set of shared `ResizeObserver`.
 *
 * Rather than share a single `ResizeObserver`, this class creates one `ResizeObserver` per type
 * of observed box ('content-box', 'border-box', and 'device-pixel-content-box'). This avoids
 * later calls to `observe` with a different box type from influencing the events dispatched to
 * earlier calls.
 */
@Injectable({
  providedIn: 'root',
})
export class SharedResizeObserver implements OnDestroy {
  private _observers = new Map<ResizeObserverBoxOptions, SingleBoxSharedResizeObserver>();

  /**
   * Registers a callback to observe when the target element resizes.
   * @param target The element to observe for resizes.
   * @param callback The callback to call when the target resizes.
   * @param options Options to pass to the `ResizeObserver`
   * @return A function that should be called to stop observing.
   */
  observe(
    target: Element,
    callback: (entry: ResizeObserverEntry) => void,
    options?: ResizeObserverOptions,
  ): () => void {
    const box = options?.box || 'content-box';
    const observer = this._getOrCreateObserver(box);
    return observer.observe(target, callback);
  }

  private _getOrCreateObserver(box: ResizeObserverBoxOptions) {
    if (!this._observers.has(box)) {
      this._observers.set(box, new SingleBoxSharedResizeObserver(box));
    }
    return this._observers.get(box)!;
  }

  ngOnDestroy() {
    for (const [_, observer] of this._observers) {
      observer.destroy();
    }
    this._observers.clear();
  }
}
