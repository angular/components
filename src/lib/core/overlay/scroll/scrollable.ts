import {
  Directive, ElementRef, OnInit, OnDestroy, Optional, SkipSelf
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ScrollDispatcher} from './scroll-dispatcher';
import 'rxjs/add/observable/fromEvent';


/**
 * Sends an event when the directive's element is scrolled. Registers itself with the
 * ScrollDispatcher service to include itself as part of its collection of scrolling events that it
 * can be listened to through the service.
 */
@Directive({
  selector: '[cdk-scrollable]'
})
export class Scrollable implements OnInit, OnDestroy {
  constructor(private _elementRef: ElementRef,
              @SkipSelf() @Optional() private parentScrollable: Scrollable,
              private _scroll: ScrollDispatcher) {}

  ngOnInit() {
    this._scroll.register(this);
  }

  ngOnDestroy() {
    this._scroll.deregister(this);
  }

  /**
   * Returns observable that emits when a scroll event is fired on the host element.
   */
  elementScrolled(): Observable<any> {
    return Observable.fromEvent(this._elementRef.nativeElement, 'scroll');
  }

  getElementRef(): ElementRef {
    return this._elementRef;
  }

  /** Returns this scrollable along with all the scrollables that this is contained within. */
  getAllScrollables(): Scrollable[] {
    return this.parentScrollable ? this.parentScrollable.getAllScrollables().concat(this) : [this];
  }
}
