/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NumberInput, coerceElement, coerceNumberProperty} from '@angular/cdk/coercion';
import {
  AfterContentInit,
  Directive,
  ElementRef,
  EventEmitter,
  Injectable,
  Input,
  NgModule,
  NgZone,
  OnDestroy,
  Output,
  booleanAttribute,
  inject,
} from '@angular/core';
import {Observable, Observer, Subject, Subscription} from 'rxjs';
import {debounceTime, filter, map} from 'rxjs/operators';

// Angular may add, remove, or edit comment nodes during change detection. We don't care about
// these changes because they don't affect the user-preceived content, and worse it can cause
// infinite change detection cycles where the change detection updates a comment, triggering the
// MutationObserver, triggering another change detection and kicking the cycle off again.
function shouldIgnoreRecord(record: MutationRecord) {
  // Ignore changes to comment text.
  if (record.type === 'characterData' && record.target instanceof Comment) {
    return true;
  }
  // Ignore addition / removal of comments.
  if (record.type === 'childList') {
    for (let i = 0; i < record.addedNodes.length; i++) {
      if (!(record.addedNodes[i] instanceof Comment)) {
        return false;
      }
    }
    for (let i = 0; i < record.removedNodes.length; i++) {
      if (!(record.removedNodes[i] instanceof Comment)) {
        return false;
      }
    }
    return true;
  }
  // Observe everything else.
  return false;
}

/**
 * Factory that creates a new MutationObserver and allows us to stub it out in unit tests.
 * @docs-private
 */
@Injectable({providedIn: 'root'})
export class MutationObserverFactory {
  create(callback: MutationCallback): MutationObserver | null {
    return typeof MutationObserver === 'undefined' ? null : new MutationObserver(callback);
  }
}

/** An injectable service that allows watching elements for changes to their content. */
@Injectable({providedIn: 'root'})
export class ContentObserver implements OnDestroy {
  private _mutationObserverFactory = inject(MutationObserverFactory);

  /** Keeps track of the existing MutationObservers so they can be reused. */
  private _observedElements = new Map<
    Element,
    {
      observer: MutationObserver | null;
      readonly stream: Subject<MutationRecord[]>;
      count: number;
    }
  >();

  private _ngZone = inject(NgZone);

  constructor(...args: unknown[]);
  constructor() {}

  ngOnDestroy() {
    this._observedElements.forEach((_, element) => this._cleanupObserver(element));
  }

  /**
   * Observe content changes on an element.
   * @param element The element to observe for content changes.
   */
  observe(element: Element): Observable<MutationRecord[]>;

  /**
   * Observe content changes on an element.
   * @param element The element to observe for content changes.
   */
  observe(element: ElementRef<Element>): Observable<MutationRecord[]>;

  observe(elementOrRef: Element | ElementRef<Element>): Observable<MutationRecord[]> {
    const element = coerceElement(elementOrRef);

    return new Observable((observer: Observer<MutationRecord[]>) => {
      const stream = this._observeElement(element);
      const subscription = stream
        .pipe(
          map(records => records.filter(record => !shouldIgnoreRecord(record))),
          filter(records => !!records.length),
        )
        .subscribe(records => {
          this._ngZone.run(() => {
            observer.next(records);
          });
        });

      return () => {
        subscription.unsubscribe();
        this._unobserveElement(element);
      };
    });
  }

  /**
   * Observes the given element by using the existing MutationObserver if available, or creating a
   * new one if not.
   */
  private _observeElement(element: Element): Subject<MutationRecord[]> {
    return this._ngZone.runOutsideAngular(() => {
      if (!this._observedElements.has(element)) {
        const stream = new Subject<MutationRecord[]>();
        const observer = this._mutationObserverFactory.create(mutations => stream.next(mutations));
        if (observer) {
          observer.observe(element, {
            characterData: true,
            childList: true,
            subtree: true,
          });
        }
        this._observedElements.set(element, {observer, stream, count: 1});
      } else {
        this._observedElements.get(element)!.count++;
      }
      return this._observedElements.get(element)!.stream;
    });
  }

  /**
   * Un-observes the given element and cleans up the underlying MutationObserver if nobody else is
   * observing this element.
   */
  private _unobserveElement(element: Element) {
    if (this._observedElements.has(element)) {
      this._observedElements.get(element)!.count--;
      if (!this._observedElements.get(element)!.count) {
        this._cleanupObserver(element);
      }
    }
  }

  /** Clean up the underlying MutationObserver for the specified element. */
  private _cleanupObserver(element: Element) {
    if (this._observedElements.has(element)) {
      const {observer, stream} = this._observedElements.get(element)!;
      if (observer) {
        observer.disconnect();
      }
      stream.complete();
      this._observedElements.delete(element);
    }
  }
}

/**
 * Directive that triggers a callback whenever the content of
 * its associated element has changed.
 */
@Directive({
  selector: '[cdkObserveContent]',
  exportAs: 'cdkObserveContent',
  standalone: true,
})
export class CdkObserveContent implements AfterContentInit, OnDestroy {
  private _contentObserver = inject(ContentObserver);
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Event emitted for each change in the element's content. */
  @Output('cdkObserveContent') readonly event = new EventEmitter<MutationRecord[]>();

  /**
   * Whether observing content is disabled. This option can be used
   * to disconnect the underlying MutationObserver until it is needed.
   */
  @Input({alias: 'cdkObserveContentDisabled', transform: booleanAttribute})
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
    this._disabled ? this._unsubscribe() : this._subscribe();
  }
  private _disabled = false;

  /** Debounce interval for emitting the changes. */
  @Input()
  get debounce(): number {
    return this._debounce;
  }
  set debounce(value: NumberInput) {
    this._debounce = coerceNumberProperty(value);
    this._subscribe();
  }
  private _debounce: number;

  private _currentSubscription: Subscription | null = null;

  constructor(...args: unknown[]);
  constructor() {}

  ngAfterContentInit() {
    if (!this._currentSubscription && !this.disabled) {
      this._subscribe();
    }
  }

  ngOnDestroy() {
    this._unsubscribe();
  }

  private _subscribe() {
    this._unsubscribe();
    const stream = this._contentObserver.observe(this._elementRef);

    this._currentSubscription = (
      this.debounce ? stream.pipe(debounceTime(this.debounce)) : stream
    ).subscribe(this.event);
  }

  private _unsubscribe() {
    this._currentSubscription?.unsubscribe();
  }
}

@NgModule({
  imports: [CdkObserveContent],
  exports: [CdkObserveContent],
  providers: [MutationObserverFactory],
})
export class ObserversModule {}
