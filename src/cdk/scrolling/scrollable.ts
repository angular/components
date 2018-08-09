/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {getRtlScrollAxisType, supportsScrollBehavior} from '@angular/cdk/platform';
import {Directive, ElementRef, NgZone, OnDestroy, OnInit, Optional} from '@angular/core';
import {fromEvent, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ScrollDispatcher} from './scroll-dispatcher';


/**
 * An extended version of ScrollToOptions that allows expressing scroll offsets relative to the
 * top, bottom, left, right, start, or end of the viewport rather than just the top and left.
 * Please note: the top and bottom properties are mutually exclusuive, as are the left, right,
 * start, and end properties.
 */
export interface ExtendedScrollToOptions extends ScrollToOptions {
  /** A distance relative to the right edge of the viewport. */
  right?: number;
  /**
   * A distance relative to the start edge of the viewport (left in ltr languages, right in rtl
   * languages).
   */
  start?: number;
  /**
   * A distance relative to the end edge of the viewport (right in ltr languages, left in rtl
   * languages).
   */
  end?: number;
  /** A distance relative to the bottom edge of the viewport. */
  bottom?: number;
}


/**
 * Sends an event when the directive's element is scrolled. Registers itself with the
 * ScrollDispatcher service to include itself as part of its collection of scrolling events that it
 * can be listened to through the service.
 */
@Directive({
  selector: '[cdk-scrollable], [cdkScrollable]'
})
export class CdkScrollable implements OnInit, OnDestroy {
  private _destroyed = new Subject();

  private _elementScrolled: Observable<Event> = Observable.create(observer =>
      this._ngZone.runOutsideAngular(() =>
          fromEvent(this._elementRef.nativeElement, 'scroll').pipe(takeUntil(this._destroyed))
              .subscribe(observer)));

  constructor(private _elementRef: ElementRef<HTMLElement>,
              private _scroll: ScrollDispatcher,
              private _ngZone: NgZone,
              @Optional() private _dir?: Directionality) {}

  ngOnInit() {
    this._scroll.register(this);
  }

  ngOnDestroy() {
    this._scroll.deregister(this);
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** Returns observable that emits when a scroll event is fired on the host element. */
  elementScrolled(): Observable<Event> {
    return this._elementScrolled;
  }

  /** Gets the ElementRef for the viewport. */
  getElementRef(): ElementRef<HTMLElement> {
    return this._elementRef;
  }

  /**
   * Scrolls to the specified offsets.
   * @param options specified the offsets to scroll to.
   */
  scrollTo(options: ExtendedScrollToOptions): void {
    const el = this._elementRef.nativeElement;
    const isRtl = this._dir && this._dir.value == 'rtl';

    // Rewrite start & end offsets as right or left offsets.
    options.left = options.left == null ? (isRtl ? options.end : options.start) : options.left;
    options.right = options.right == null ? (isRtl ? options.start : options.end) : options.right;

    // Rewrite the bottom offset as a top offset.
    if (options.bottom != null) {
      options.top = el.scrollHeight - el.clientHeight - options.bottom;
    }

    // Rewrite the right offset as a left offset.
    if (isRtl && getRtlScrollAxisType() != 'normal') {
      if (options.left != null) {
        options.right = el.scrollWidth - el.clientWidth - options.left;
      }

      if (getRtlScrollAxisType() == 'inverted') {
        options.left = options.right;
      } else if (getRtlScrollAxisType() == 'negated') {
        options.left = options.right ? -options.right : options.right;
      }
    } else {
      if (options.right != null) {
        options.left = el.scrollWidth - el.clientWidth - options.right;
      }
    }

    this._scrollTo(options);
  }

  private _scrollTo(options: ScrollToOptions): void {
    const el = this._elementRef.nativeElement;

    if (supportsScrollBehavior()) {
      el.scrollTo(options);
    } else {
      if (options.top != null) {
        el.scrollTop = options.top;
      }
      if (options.left != null) {
        el.scrollLeft = options.left;
      }
    }
  }

  /**
   * Measures the scroll offset relative to the specified edge of the viewport.
   * @param from The edge to measure from.
   */
  measureScrollOffset(from: 'top' | 'left' | 'right' | 'bottom' | 'start' | 'end'): number {
    const el = this._elementRef.nativeElement;
    if (from == 'top') {
      return el.scrollTop;
    }
    if (from == 'bottom') {
      return el.scrollHeight - el.clientHeight - el.scrollTop;
    }

    // Rewrite start & end as left or right offsets.
    const isRtl = this._dir && this._dir.value == 'rtl';
    if (from == 'start') {
      from = isRtl ? 'right' : 'left';
    } else if (from == 'end') {
      from = isRtl ? 'left' : 'right';
    }

    if (isRtl && getRtlScrollAxisType() == 'inverted') {
      if (from == 'left') {
        return el.scrollWidth - el.clientWidth - el.scrollLeft;
      } else {
        return el.scrollLeft;
      }
    } else if (isRtl && getRtlScrollAxisType() == 'negated') {
      if (from == 'left') {
        return el.scrollLeft + el.scrollWidth - el.clientWidth;
      } else {
        return -el.scrollLeft;
      }
    } else {
      if (from == 'left') {
        return el.scrollLeft;
      } else {
        return el.scrollWidth - el.clientWidth - el.scrollLeft;
      }
    }
  }
}
