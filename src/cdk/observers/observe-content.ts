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
  NgZone,
  OnDestroy,
  Output,
} from '@angular/core';
import {Observable, Subject} from 'rxjs';
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
export class ContentObserverFactory {
  constructor(private _mutationObserverFactory: MutationObserverFactory, private _ngZone: NgZone) {}

  create(element: Element, debounce?: number) {
    const changes = new Subject<MutationRecord[]>();
    const observer = this._ngZone.runOutsideAngular(
        () => this._mutationObserverFactory.create((mutations) => changes.next(mutations)));
    return new ContentObserver(element, observer, changes, debounce);
  }
}


/** A class that observes an element for content changes. */
export class ContentObserver {
  changes: Observable<MutationRecord[]>;

  constructor(private _element: Element, private _mutationObserver: MutationObserver | null,
              private _rawChanges: Subject<MutationRecord[]>, debounce: number = 0) {
    this.changes = debounce ?
        this._rawChanges.pipe(debounceTime(debounce)) : this._rawChanges.asObservable();
  }

  start(): ContentObserver {
    if (this._mutationObserver) {
      this._mutationObserver.observe(this._element, {
        characterData: true,
        childList: true,
        subtree: true
      });
    }
    return this;
  }

  pause() {
    if (this._mutationObserver) {
      this._mutationObserver.disconnect();
    }
  }

  stop() {
    this.pause();
    this._rawChanges.complete();
    this._mutationObserver = null;
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
    if (this._observer) {
      if (this._disabled) {
        this._observer.pause();
      } else {
        this._observer.start();
      }
    }
  }
  private _disabled = false;

  /** Debounce interval for emitting the changes. */
  @Input()
  get debounce(): number { return this._debounce; }
  set debounce(value: number) {
    this._debounce = coerceNumberProperty(value);
  }
  private _debounce: number;

  private _observer: ContentObserver;

  constructor(private _contentObserverFactory: ContentObserverFactory,
              private _elementRef: ElementRef, private _ngZone: NgZone) {}

  ngAfterContentInit() {
    this._observer =
        this._contentObserverFactory.create(this._elementRef.nativeElement, this.debounce);
    this._ngZone.run(
        () => this._observer.changes.subscribe(mutations => this.event.next(mutations)));

    if (!this.disabled) {
      this._observer.start();
    }
  }

  ngOnDestroy() {
    // Its possible _observer is undefined if the component is destroyed before init
    // (could happen in a test).
    if (this._observer) {
      this._observer.stop();
    }
  }
}


@NgModule({
  exports: [CdkObserveContent],
  declarations: [CdkObserveContent],
  providers: [MutationObserverFactory]
})
export class ObserversModule {}
