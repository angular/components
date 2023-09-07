/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalizePassiveListenerOptions, _getEventTarget} from '@angular/cdk/platform';
import {NgZone} from '@angular/core';

/** Options used to bind a passive capturing event. */
const passiveCapturingEventOptions = normalizePassiveListenerOptions({
  passive: true,
  capture: true,
});

/** Manages events through delegation so that as few event handlers as possible are bound. */
export class RippleEventManager {
  private _events = new Map<string, Map<HTMLElement, Set<EventListenerObject>>>();

  /** Adds an event handler. */
  addHandler(ngZone: NgZone, name: string, element: HTMLElement, handler: EventListenerObject) {
    const handlersForEvent = this._events.get(name);

    if (handlersForEvent) {
      const handlersForElement = handlersForEvent.get(element);

      if (handlersForElement) {
        handlersForElement.add(handler);
      } else {
        handlersForEvent.set(element, new Set([handler]));
      }
    } else {
      this._events.set(name, new Map([[element, new Set([handler])]]));

      ngZone.runOutsideAngular(() => {
        document.addEventListener(name, this._delegateEventHandler, passiveCapturingEventOptions);
      });
    }
  }

  /** Removes an event handler. */
  removeHandler(name: string, element: HTMLElement, handler: EventListenerObject) {
    const handlersForEvent = this._events.get(name);

    if (!handlersForEvent) {
      return;
    }

    const handlersForElement = handlersForEvent.get(element);

    if (!handlersForElement) {
      return;
    }

    handlersForElement.delete(handler);

    if (handlersForElement.size === 0) {
      handlersForEvent.delete(element);
    }

    if (handlersForEvent.size === 0) {
      this._events.delete(name);
      document.removeEventListener(name, this._delegateEventHandler, passiveCapturingEventOptions);
    }
  }

  /** Event handler that is bound and which dispatches the events to the different targets. */
  private _delegateEventHandler = (event: Event) => {
    const target = _getEventTarget(event);

    if (target) {
      this._events.get(event.type)?.forEach((handlers, element) => {
        if (element === target || element.contains(target as Node)) {
          handlers.forEach(handler => handler.handleEvent(event));
        }
      });
    }
  };
}
