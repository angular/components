/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgZone} from '@angular/core';
import {BehaviorSubject, Observable, Subscriber} from 'rxjs';
import {switchMap} from 'rxjs/operators';

interface ListenerHandle {
  remove(): void;
}

type MapEventManagerTarget =
  | {
      addListener<T extends unknown[]>(
        name: string,
        callback: (...args: T) => void,
      ): google.maps.MapsEventListener | undefined;

      addEventListener?<T extends unknown[]>(name: string, callback: (...args: T) => void): void;
      removeEventListener?<T extends unknown[]>(name: string, callback: (...args: T) => void): void;
    }
  | undefined;

/** Manages event on a Google Maps object, ensuring that events are added only when necessary. */
export class MapEventManager {
  /** Pending listeners that were added before the target was set. */
  private _pending: {observable: Observable<unknown>; observer: Subscriber<unknown>}[] = [];
  private _listeners: ListenerHandle[] = [];
  private _targetStream = new BehaviorSubject<MapEventManagerTarget>(undefined);

  /** Clears all currently-registered event listeners. */
  private _clearListeners() {
    for (const listener of this._listeners) {
      listener.remove();
    }

    this._listeners = [];
  }

  constructor(private _ngZone: NgZone) {}

  /**
   * Gets an observable that adds an event listener to the map when a consumer subscribes to it.
   * @param name Name of the event for which the observable is being set up.
   * @param type Type of the event (e.g. one going to a DOM node or a custom Maps one).
   */
  getLazyEmitter<T>(name: string, type?: 'custom' | 'native'): Observable<T> {
    return this._targetStream.pipe(
      switchMap(target => {
        const observable = new Observable<T>(observer => {
          // If the target hasn't been initialized yet, cache the observer so it can be added later.
          if (!target) {
            this._pending.push({observable, observer});
            return undefined;
          }

          let handle: ListenerHandle;
          const listener = (event: T) => {
            this._ngZone.run(() => observer.next(event));
          };

          if (type === 'native') {
            if (
              (typeof ngDevMode === 'undefined' || ngDevMode) &&
              (!target.addEventListener || !target.removeEventListener)
            ) {
              throw new Error(
                'Maps event target that uses native events must have `addEventListener` and `removeEventListener` methods.',
              );
            }

            target.addEventListener!(name, listener);
            handle = {remove: () => target.removeEventListener!(name, listener)};
          } else {
            handle = target.addListener(name, listener)!;
          }

          // If there's an error when initializing the Maps API (e.g. a wrong API key), it will
          // return a dummy object that returns `undefined` from `addListener` (see #26514).
          if (!handle) {
            observer.complete();
            return undefined;
          }

          this._listeners.push(handle);
          return () => handle.remove();
        });

        return observable;
      }),
    );
  }

  /** Sets the current target that the manager should bind events to. */
  setTarget(target: MapEventManagerTarget) {
    const currentTarget = this._targetStream.value;

    if (target === currentTarget) {
      return;
    }

    // Clear the listeners from the pre-existing target.
    if (currentTarget) {
      this._clearListeners();
      this._pending = [];
    }

    this._targetStream.next(target);

    // Add the listeners that were bound before the map was initialized.
    this._pending.forEach(subscriber => subscriber.observable.subscribe(subscriber.observer));
    this._pending = [];
  }

  /** Destroys the manager and clears the event listeners. */
  destroy() {
    this._clearListeners();
    this._pending = [];
    this._targetStream.complete();
  }
}
