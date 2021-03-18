/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
import {SpecificEventListener} from '@material/base';
import {Subject, Subscription} from 'rxjs';
import {finalize} from 'rxjs/operators';

/**
 * Handles listening for all change events that occur on the document.
 *
 * This service exposes a single method #listen to allow users to subscribe to change events that
 * occur on the document. Since listening for all change events on the document can be expensive,
 * we lazily attach a single event listener to the document when the first subscription is made,
 * and remove the event listener once the last observer unsubscribes.
 */
@Injectable({providedIn: 'root'})
export class GlobalChangeListener {

  /** The injected document if available or fallback to the global document reference. */
  private _document: Document;

  /** Emits change events that occur on the global document. */
  private _change: Subject<Event> = new Subject<Event>();

  constructor(@Inject(DOCUMENT) document: any) {
    this._document = document;
    this._handler = this._handler.bind(this);
  }

  /** Emits the given event from the change subject. */
  private _handler(event: Event) {
    this._change.next(event);
  }

  /** Returns a subscription to global change events. */
  listen <K extends 'change'>(callback: SpecificEventListener<K>): Subscription {
    // This is the first subscription to change events.
    if (this._change.observers.length === 0) {
      this._document.addEventListener('change', this._handler, true);
    }

    return this._change.pipe(finalize(() => {
        // This is the last change listener unsubscribing.
        if (this._change.observers.length === 1) {
          this._document.removeEventListener('change', this._handler, true);
        }
    })).subscribe(callback);
  }
}
