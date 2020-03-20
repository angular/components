/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  coerceBooleanProperty,
  coerceNumberProperty,
  coerceElement,
  BooleanInput
} from '@angular/cdk/coercion';
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
} from '@angular/core';
import {Observable, Subject, Subscription, Observer} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

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
  /** Keeps track of the existing MutationObservers so they can be reused. */
  private _observedElements = new Map<Element, Map<string, {
    observer: MutationObserver | null,
    stream: Subject<MutationRecord[]>,
    count: number
  }>>();

  constructor(private _mutationObserverFactory: MutationObserverFactory) {}

  ngOnDestroy() {
    this._observedElements.forEach((cache, element) => {
      cache.forEach((_, key) => this._cleanupObserver(element, key));
    });
  }

  /**
   * Observe content changes on an element.
   * @param element The element to observe for content changes.
   * @param options Options that can be used to configure what is being observed,
   */
  observe(element: Element, options?: MutationObserverInit): Observable<MutationRecord[]>;

  /**
   * Observe content changes on an element.
   * @param element The element to observe for content changes.
   * @param options Options that can be used to configure what is being observed,
   */
  observe(element: ElementRef<Element>, options?: MutationObserverInit):
      Observable<MutationRecord[]>;

  observe(elementOrRef: Element | ElementRef<Element>, options: MutationObserverInit = {
    characterData: true,
    childList: true,
    subtree: true
  }): Observable<MutationRecord[]> {
    const element = coerceElement(elementOrRef);

    return new Observable((observer: Observer<MutationRecord[]>) => {
      const stream = this._observeElement(element, options);
      const subscription = stream.subscribe(observer);

      return () => {
        subscription.unsubscribe();
        this._unobserveElement(element, options);
      };
    });
  }

  /**
   * Observes the given element by using the existing MutationObserver if available, or creating a
   * new one if not.
   */
  private _observeElement(element: Element, options: MutationObserverInit):
      Subject<MutationRecord[]> {

    const observedElements = this._observedElements;
    const cacheKey = this._getCacheKey(options);
    let elementEntry = observedElements.get(element);

    if (!elementEntry) {
      elementEntry = new Map();
      observedElements.set(element, elementEntry);
    }

    const cachedConfig = elementEntry.get(cacheKey);

    if (cachedConfig) {
      cachedConfig.count++;
      return cachedConfig.stream;
    } else {
      const stream = new Subject<MutationRecord[]>();
      const observer = this._mutationObserverFactory.create(mutations => stream.next(mutations));

      if (observer) {
        observer.observe(element, options);
      }

      elementEntry.set(cacheKey, {observer, stream, count: 1});
      return stream;
    }
  }

  /**
   * Un-observes the given element and cleans up the underlying MutationObserver if nobody else is
   * observing this element.
   */
  private _unobserveElement(element: Element, options: MutationObserverInit) {
    const cacheKey = this._getCacheKey(options);
    const cachedConfig = this._getConfig(element, cacheKey);

    if (cachedConfig) {
      cachedConfig.count--;

      if (cachedConfig.count < 1) {
        this._cleanupObserver(element, cacheKey);
      }
    }
  }

  /** Clean up the underlying MutationObserver for the specified element. */
  private _cleanupObserver(element: Element, cacheKey: string) {
    const cachedConfig = this._getConfig(element, cacheKey);

    if (cachedConfig) {
      const {observer, stream} = cachedConfig;

      if (observer) {
        observer.disconnect();
      }

      stream.complete();
      this._observedElements.get(element)!.delete(cacheKey);

      if (this._observedElements.get(element)!.size < 1) {
        this._observedElements.delete(element);
      }
    }
  }

  /** Gets the cached config for an element, based on a cache key. */
  private _getConfig(element: Element, cacheKey: string) {
    const elementEntry = this._observedElements.get(element);

    if (elementEntry) {
      return elementEntry.get(cacheKey);
    }

    return undefined;
  }

  /** Generates a key for the element cache from a MutationObserver configuration object. */
  private _getCacheKey(options: MutationObserverInit): string {
    return [
      options.attributeFilter ? options.attributeFilter.join(',') : '',
      !!options.attributeOldValue,
      !!options.attributes,
      !!options.characterData,
      !!options.characterDataOldValue,
      !!options.childList,
      !!options.subtree
    ].join('|');
  }
}


/**
 * Directive that triggers a callback whenever the content of
 * its associated element has changed.
 */
@Directive({
  selector: '[cdkObserveContent]',
  exportAs: 'cdkObserveContent',
})
export class CdkObserveContent implements AfterContentInit, OnDestroy {
  /** Event emitted for each change in the element's content. */
  @Output('cdkObserveContent') event = new EventEmitter<MutationRecord[]>();

  /**
   * Whether observing content is disabled. This option can be used
   * to disconnect the underlying MutationObserver until it is needed.
   */
  @Input('cdkObserveContentDisabled')
  get disabled() { return this._disabled; }
  set disabled(value: any) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this._unsubscribe() : this._subscribe();
  }
  private _disabled = false;

  /** Debounce interval for emitting the changes. */
  @Input()
  get debounce(): number { return this._debounce; }
  set debounce(value: number) {
    this._debounce = coerceNumberProperty(value);
    this._subscribe();
  }
  private _debounce: number;

  private _currentSubscription: Subscription | null = null;

  constructor(private _contentObserver: ContentObserver,
              private _elementRef: ElementRef<HTMLElement>,
              private _ngZone: NgZone) {}

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

    // TODO(mmalerba): We shouldn't be emitting on this @Output() outside the zone.
    // Consider brining it back inside the zone next time we're making breaking changes.
    // Bringing it back inside can cause things like infinite change detection loops and changed
    // after checked errors if people's code isn't handling it properly.
    this._ngZone.runOutsideAngular(() => {
      this._currentSubscription =
          (this.debounce ? stream.pipe(debounceTime(this.debounce)) : stream).subscribe(this.event);
    });
  }

  private _unsubscribe() {
    if (this._currentSubscription) {
      this._currentSubscription.unsubscribe();
    }
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_debounce: BooleanInput;
}


@NgModule({
  exports: [CdkObserveContent],
  declarations: [CdkObserveContent],
  providers: [MutationObserverFactory]
})
export class ObserversModule {}
