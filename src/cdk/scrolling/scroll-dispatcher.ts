/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {coerceElement} from '../coercion';
import {Platform} from '../platform';
import {ElementRef, Service, NgZone, OnDestroy, RendererFactory2, inject} from '@angular/core';
import {of as observableOf, Subject, Subscription, Observable, Observer} from 'rxjs';
import {auditTime, filter} from 'rxjs/operators';

/** Time in ms to throttle the scrolling events by default. */
export const DEFAULT_SCROLL_TIME = 20;

/** Scrollable instance that can be registered with the `ScrollDispatcher`. */
export interface ScrollDispatcherTarget {
  /** Observable that emits when the element is scrolled. */
  elementScrolled(): Observable<Event>;

  /** Gets the `ElementRef` representing the scrollable element. */
  getElementRef(): ElementRef<HTMLElement>;
}

/**
 * Service contained all registered scroll targets and emits
 * an event when any one of them emits a scrolled event.
 */
@Service()
export class ScrollDispatcher implements OnDestroy {
  private _ngZone = inject(NgZone);
  private _platform = inject(Platform);
  private _renderer = inject(RendererFactory2).createRenderer(null, null);
  private _cleanupGlobalListener: (() => void) | undefined;

  /** Subject for notifying that a registered element has been scrolled. */
  private readonly _scrolled = new Subject<ScrollDispatcherTarget | void>();

  /** Keeps track of the amount of subscriptions to `scrolled`. Used for cleaning up afterwards. */
  private _scrolledCount = 0;

  /**
   * Map of all the scrollable targets that are registered with the service and their
   * scroll event subscriptions.
   */
  readonly scrollContainers: Map<ScrollDispatcherTarget, Subscription> = new Map();

  /**
   * Registers a scrollable instance with the service and listens for its scrolled events. When the
   * scrollable is scrolled, the service emits the event to its scrolled observable.
   * @param target Scrollable instance to be registered.
   */
  register(target: ScrollDispatcherTarget): void {
    if (!this.scrollContainers.has(target)) {
      this.scrollContainers.set(
        target,
        target.elementScrolled().subscribe(() => this._scrolled.next(target)),
      );
    }
  }

  /**
   * De-registers a Scrollable reference and unsubscribes from its scroll event observable.
   * @param target Scrollable instance to be deregistered.
   */
  deregister(target: ScrollDispatcherTarget): void {
    const ref = this.scrollContainers.get(target);

    if (ref) {
      ref.unsubscribe();
      this.scrollContainers.delete(target);
    }
  }

  /**
   * Returns an observable that emits an event whenever any of the registered Scrollable
   * references (or window, document, or body) fire a scrolled event. Can provide a time in ms
   * to override the default "throttle" time.
   *
   * **Note:** in order to avoid hitting change detection for every scroll event,
   * all of the events emitted from this stream will be run outside the Angular zone.
   * If you need to update any data bindings as a result of a scroll event, you have
   * to run the callback using `NgZone.run`.
   */
  scrolled(auditTimeInMs: number = DEFAULT_SCROLL_TIME): Observable<ScrollDispatcherTarget | void> {
    if (!this._platform.isBrowser) {
      return observableOf<void>();
    }

    return new Observable((observer: Observer<ScrollDispatcherTarget | void>) => {
      if (!this._cleanupGlobalListener) {
        this._cleanupGlobalListener = this._ngZone.runOutsideAngular(() =>
          this._renderer.listen('document', 'scroll', () => this._scrolled.next()),
        );
      }

      // In the case of a 0ms delay, use an observable without auditTime
      // since it does add a perceptible delay in processing overhead.
      const subscription =
        auditTimeInMs > 0
          ? this._scrolled.pipe(auditTime(auditTimeInMs)).subscribe(observer)
          : this._scrolled.subscribe(observer);

      this._scrolledCount++;

      return () => {
        subscription.unsubscribe();
        this._scrolledCount--;

        if (!this._scrolledCount) {
          this._cleanupGlobalListener?.();
          this._cleanupGlobalListener = undefined;
        }
      };
    });
  }

  ngOnDestroy() {
    this._cleanupGlobalListener?.();
    this._cleanupGlobalListener = undefined;
    this.scrollContainers.forEach((_, container) => this.deregister(container));
    this._scrolled.complete();
  }

  /**
   * Returns an observable that emits whenever any of the
   * scrollable ancestors of an element are scrolled.
   * @param elementOrElementRef Element whose ancestors to listen for.
   * @param auditTimeInMs Time to throttle the scroll events.
   */
  ancestorScrolled(
    elementOrElementRef: ElementRef | HTMLElement,
    auditTimeInMs?: number,
  ): Observable<ScrollDispatcherTarget | void> {
    const ancestors = this.getAncestorScrollContainers(elementOrElementRef);

    return this.scrolled(auditTimeInMs).pipe(
      filter(target => !target || ancestors.indexOf(target) > -1),
    );
  }

  /** Returns all registered containers that contain the provided element. */
  getAncestorScrollContainers(
    elementOrElementRef: ElementRef | HTMLElement,
  ): ScrollDispatcherTarget[] {
    const scrollingContainers: ScrollDispatcherTarget[] = [];

    this.scrollContainers.forEach((_, target: ScrollDispatcherTarget) => {
      if (this._targetContainsElement(target, elementOrElementRef)) {
        scrollingContainers.push(target);
      }
    });

    return scrollingContainers;
  }

  /** Returns true if the element is contained within the provided Scrollable. */
  private _targetContainsElement(
    scrollable: ScrollDispatcherTarget,
    elementOrElementRef: ElementRef | HTMLElement,
  ): boolean {
    let element: HTMLElement | null = coerceElement(elementOrElementRef);
    let targetElement = scrollable.getElementRef().nativeElement;

    // Traverse through the element parents until we reach null, checking if any of the elements
    // are the scrollable's element.
    do {
      if (element == targetElement) {
        return true;
      }
    } while ((element = element!.parentElement));

    return false;
  }
}
