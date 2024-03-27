/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, NgZone, OnDestroy} from '@angular/core';
import {fromEvent, Observable, Subject, Subscription} from 'rxjs';
import {finalize, share, takeUntil} from 'rxjs/operators';

/**
 * Provides a global listener for all events that occur on the document.
 *
 * This service exposes a single method #listen to allow users to subscribe to events that occur on
 * the document. We use #fromEvent which will lazily attach a listener when the first subscription
 * is made and remove the listener once the last observer unsubscribes.
 */
@Injectable({providedIn: 'root'})
export class GlobalListener implements OnDestroy {
  /** The injected document if available or fallback to the global document reference. */
  private _document: Document;

  /** Stores the subjects that emit the events that occur on the global document. */
  private _observables = new Map<keyof DocumentEventMap, Observable<Event>>();

  /** The notifier that triggers the global event observables to stop emitting and complete. */
  private _destroyed = new Subject();

  constructor(@Inject(DOCUMENT) document: any, private _ngZone: NgZone) {
    this._document = document;
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    this._observables.clear();
  }

  /**
   * Appends an event listener for events whose type attribute value is type.
   * The callback argument sets the callback that will be invoked when the event is dispatched.
   */
  listen(
    type: keyof DocumentEventMap,
    element: HTMLElement,
    listener: (ev: Event) => any,
  ): Subscription {
    // If this is the first time we are listening to this event, create the observable for it.
    if (!this._observables.has(type)) {
      this._observables.set(type, this._createGlobalEventObservable(type));
    }

    return this._ngZone.runOutsideAngular(() =>
      this._observables.get(type)!.subscribe((event: Event) =>
        this._ngZone.run(() => {
          if (event.target instanceof Node && element.contains(event.target)) {
            listener(event);
          }
        }),
      ),
    );
  }

  /** Creates an observable that emits all events of the given type. */
  private _createGlobalEventObservable(type: keyof DocumentEventMap) {
    return fromEvent(this._document, type, {passive: true, capture: true}).pipe(
      takeUntil(this._destroyed),
      finalize(() => this._observables.delete(type)),
      share(),
    );
  }
}
