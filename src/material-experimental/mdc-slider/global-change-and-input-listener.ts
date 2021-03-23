/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, NgZone} from '@angular/core';
import {SpecificEventListener} from '@material/base';
import {Subject, Subscription} from 'rxjs';
import {finalize} from 'rxjs/operators';

/**
 * Handles listening for all change and input events that occur on the document.
 *
 * This service exposes a single method #listen to allow users to subscribe to change and input
 * events that occur on the document. Since listening for these events on the document can be
 * expensive, we lazily attach listeners to the document when the first subscription is made, and
 * remove the listeners once the last observer unsubscribes.
 */
@Injectable({providedIn: 'root'})
export class GlobalChangeAndInputListener<K extends 'change'|'input'> {

  /** The injected document if available or fallback to the global document reference. */
  private _document: Document;

  /** Stores the subjects that emit the events that occur on the global document. */
  private _subjects = new Map<K, Subject<Event>>();

  /** Stores the event handlers that emit the events that occur on the global document. */
  private _handlers = new Map<K, ((event: Event) => void)>();

  constructor(@Inject(DOCUMENT) document: any, private _ngZone: NgZone) {
    this._document = document;
  }

  /** Returns a function for handling the given type of event. */
  private _createHandlerFn(type: K): ((event: Event) => void) {
    return (event: Event) => {
      this._subjects.get(type)!.next(event);
    };
  }

  /** Returns a subscription to global change or input events. */
  listen(type: K, callback: SpecificEventListener<K>): Subscription {
    // This is the first subscription to these events.
    if (!this._subjects.get(type)) {
      const handlerFn = this._createHandlerFn(type).bind(this);
      this._subjects.set(type, new Subject<Event>());
      this._handlers.set(type, handlerFn);
      this._ngZone.runOutsideAngular(() => {
        this._document.addEventListener(type, handlerFn, true);
      });
    }

    const subject = this._subjects.get(type)!;
    const handler = this._handlers.get(type)!;

    return subject.pipe(finalize(() => {
        // This is the last event listener unsubscribing.
        if (subject.observers.length === 1) {
          this._document.removeEventListener(type, handler, true);
          this._subjects.delete(type);
          this._handlers.delete(type);
        }
    })).subscribe(callback);
  }
}
