import {Injectable} from '@angular/core';
import {Scrollable} from './scrollable';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';


/**
 * Service contained all registered Scrollable references and emits an event when any one of the
 * Scrollable references emit a scrolled event.
 */
@Injectable()
export class Scroll {
  /** Subject for notifying that a registered scrollable reference element has been scrolled. */
  _scrolled: Subject<Event> = new Subject();

  /**
   * Map of all the scrollable references that are registered with the service and their
   * scroll event subscriptions.
   */
  scrollableReferences: Map<Scrollable, Subscription> = new Map();

  constructor() {
    // By default, notify a scroll event when the document is scrolled or the window is resized.
    window.document.addEventListener('scroll', this._notify.bind(this));
    window.addEventListener('resize', this._notify.bind(this));
  }

  /**
   * Registers a Scrollable with the service and listens for its scrolled events. When the
   * scrollable is scrolled, the service emits the event in its scrolled observable.
   */
  register(scrollable: Scrollable): void {
    const scrollSubscription = scrollable.elementScrolled().subscribe(this._notify.bind(this));
    this.scrollableReferences.set(scrollable, scrollSubscription);
  }

  /**
   * Deregisters a Scrollable reference and unsubscribes from its scroll event observable.
   */
  deregister(scrollable: Scrollable): void {
    this.scrollableReferences.get(scrollable).unsubscribe();
    this.scrollableReferences.delete(scrollable);
  }

  /**
   * Returns an observable that emits an event whenever any of the registered Scrollable
   * references (or window, document, or body) fire a scrolled event.
   * TODO: Add an event limiter that includes throttle with the leading and trailing events.
   */
  scrolled(): Observable<Event> {
    return this._scrolled.asObservable();
  }

  /** Sends a notification that a scroll event has been fired. */
  _notify(e: Event) {
    this._scrolled.next(e);
  }
}
