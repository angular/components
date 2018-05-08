/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';
import {
  AfterContentInit,
  Directive,
  ElementRef,
  EventEmitter,
  Injectable,
  Input,
  NgModule,
  OnDestroy,
  Output,
} from '@angular/core';
import {Observable, Subject, Subscription} from 'rxjs';
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


/** A factory that creates ContentObservers. */
@Injectable({providedIn: 'root'})
export class ContentObserver {
  private _observedElements = new Map<Element, {
    observer: MutationObserver | null,
    stream: Subject<MutationRecord[]>,
    count: number
  }>();

  constructor(private _mutationObserverFactory: MutationObserverFactory) {}

  observe(element: Element, debounce?: number): Observable<MutationRecord[]> {
    return Observable.create(observer => {
      const stream = this._observeElement(element);
      const subscription =
          (debounce ? stream.pipe(debounceTime(debounce)) : stream).subscribe(observer);

      return () => {
        subscription.unsubscribe();
        this._unobserveElement(element);
      }
    });
  }

  private _observeElement(element: Element): Subject<MutationRecord[]> {
    if (!this._observedElements.has(element)) {
      const stream = new Subject<MutationRecord[]>();
      const observer = this._mutationObserverFactory.create(mutations => stream.next(mutations));
      if (observer) {
        observer.observe(element, {
          characterData: true,
          childList: true,
          subtree: true
        });
      }
      this._observedElements.set(element, {observer, stream, count: 1});
    } else {
      this._observedElements.get(element)!.count++;
    }
    return this._observedElements.get(element)!.stream;
  }

  private _unobserveElement(element: Element) {
    if (this._observedElements.has(element)) {
      if (!--this._observedElements.get(element)!.count) {
        this._cleanupObserver(element);
      }
    }
  }

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
    if (this._disabled) {
      this._unsubscribe();
    } else {
      this._subscribe();
    }
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

  constructor(private _contentObserver: ContentObserver, private _elementRef: ElementRef) {}

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
    this._currentSubscription =
        this._contentObserver.observe(this._elementRef.nativeElement, this.debounce)
            .subscribe(mutations => this.event.next(mutations));
  }

  private _unsubscribe() {
    if (this._currentSubscription) {
      this._currentSubscription.unsubscribe();
    }
  }
}


@NgModule({
  exports: [CdkObserveContent],
  declarations: [CdkObserveContent],
  providers: [MutationObserverFactory]
})
export class ObserversModule {}
