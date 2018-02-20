/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Range} from '@angular/cdk/collections';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {takeUntil} from 'rxjs/operators/takeUntil';
import {Subject} from 'rxjs/Subject';
import {CdkVirtualForOf} from './virtual-for-of';
import {VIRTUAL_SCROLL_STRATEGY, VirtualScrollStrategy} from './virtual-scroll-strategy';


/** A viewport that virtualizes it's scrolling with the help of `CdkVirtualForOf`. */
@Component({
  moduleId: module.id,
  selector: 'cdk-virtual-scroll-viewport',
  templateUrl: 'virtual-scroll-viewport.html',
  styleUrls: ['virtual-scroll-viewport.css'],
  host: {
    'class': 'cdk-virtual-scroll-viewport',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false,
})
export class CdkVirtualScrollViewport implements OnInit, DoCheck, OnDestroy {
  /** Emits when the viewport is detached from a CdkVirtualForOf. */
  private _detachedSubject = new Subject<void>();

  /** Emits when the rendered range changes. */
  private _renderedRangeSubject = new Subject<Range>();

  /** The direction the viewport scrolls. */
  @Input() orientation: 'horizontal' | 'vertical' = 'vertical';

  /** The element that wraps the rendered content. */
  @ViewChild('contentWrapper') _contentWrapper: ElementRef;

  /** A stream that emits whenever the rendered range changes. */
  renderedRangeStream: Observable<Range> = this._renderedRangeSubject.asObservable();

  /**
   * The total size of all content (in pixels), including content that is not currently rendered.
   */
  _totalContentSize = 0;

  /** The transform used to offset the rendered content wrapper element. */
  _renderedContentTransform: string;

  /** The currently rendered range of indices. */
  private _renderedRange: Range = {start: 0, end: 0};

  /** The length of the data bound to this viewport (in number of items). */
  private _dataLength = 0;

  /** The size of the viewport (in pixels). */
  private _viewportSize = 0;

  /** Whether this viewport is attached to a CdkVirtualForOf. */
  private _isAttached = false;

  /**
   * The scroll handling status.
   * needed - The scroll state needs to be updated, but a check hasn't yet been scheduled.
   * pending - The scroll state needs to be updated, and an update has already been scheduled.
   * done - The scroll state does not need to be updated.
   */
  private _scrollHandledStatus: 'needed' | 'pending' | 'done' = 'done';

  constructor(public elementRef: ElementRef, private _changeDetectorRef: ChangeDetectorRef,
              private _ngZone: NgZone,
              @Inject(VIRTUAL_SCROLL_STRATEGY) private _scrollStrategy: VirtualScrollStrategy) {}

  /** Gets the length of the data bound to this viewport (in number of items). */
  getDataLength(): number {
    return this._dataLength;
  }

  /** Gets the size of the viewport (in pixels). */
  getViewportSize(): number {
    return this._viewportSize;
  }

  // TODO(mmalebra): Consider calling `detectChanges()` directly rather than the methods below.

  /**
   * Sets the total size of all content (in pixels), including content that is not currently
   * rendered.
   */
  setTotalContentSize(size: number) {
    if (this._totalContentSize != size) {
      // Re-enter the Angular zone so we can mark for change detection.
      this._ngZone.run(() => {
        this._totalContentSize = size;
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  /** Sets the currently rendered range of indices. */
  setRenderedRange(range: Range) {
    if (!this._rangesEqual(this._renderedRange, range)) {
      // Re-enter the Angular zone so we can mark for change detection.
      this._ngZone.run(() => {
        this._renderedRangeSubject.next(this._renderedRange = range);
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  /** Sets the offset of the rendered portion of the data from the start (in pixels). */
  setRenderedContentOffset(offset: number) {
    const transform =
        this.orientation === 'horizontal' ? `translateX(${offset}px)` : `translateY(${offset}px)`;
    if (this._renderedContentTransform != transform) {
      // Re-enter the Angular zone so we can mark for change detection.
      this._ngZone.run(() => {
        this._renderedContentTransform = transform;
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  /** Attaches a `CdkVirtualForOf` to this viewport. */
  attach(forOf: CdkVirtualForOf<any>) {
    if (this._isAttached) {
      throw Error('CdkVirtualScrollViewport is already attached.');
    }

    this._isAttached = true;
    // Subscribe to the data stream of the CdkVirtualForOf to keep track of when the data length
    // changes.
    forOf.dataStream.pipe(takeUntil(this._detachedSubject)).subscribe(data => {
      const len = data.length;
      if (len != this._dataLength) {
        this._dataLength = len;
        this._scrollStrategy.onDataLengthChanged();
      }
    });
  }

  /** Detaches the current `CdkVirtualForOf`. */
  detach() {
    this._isAttached = false;
    this._detachedSubject.next();
  }

  /** Gets the current scroll offset of the viewport (in pixels). */
  measureScrollOffset() {
    return this.orientation === 'horizontal' ?
        this.elementRef.nativeElement.scrollLeft : this.elementRef.nativeElement.scrollTop;
  }

  ngOnInit() {
    Promise.resolve().then(() => {
      this._viewportSize = this.orientation === 'horizontal' ?
          this.elementRef.nativeElement.clientWidth : this.elementRef.nativeElement.clientHeight;
      this._ngZone.runOutsideAngular(() => {
        fromEvent(this.elementRef.nativeElement, 'scroll').subscribe(() => {
          this._markScrolled();
        });
      });
      this._scrollStrategy.attach(this);
    });
  }

  ngDoCheck() {
    if (this._scrollHandledStatus === 'needed') {
      this._scrollHandledStatus = 'pending';
      this._ngZone.runOutsideAngular(() => requestAnimationFrame(() => {
        this._scrollHandledStatus = 'done';
        this._scrollStrategy.onContentScrolled();
      }));
    }
  }

  ngOnDestroy() {
    this.detach();
    this._scrollStrategy.detach();

    // Complete all subjects
    this._detachedSubject.complete();
    this._renderedRangeSubject.complete();
  }

  /** Marks that a scroll event happened and that the scroll state should be checked. */
  private _markScrolled() {
    if (this._scrollHandledStatus === 'done') {
      // Re-enter the Angular zone so we can mark for change detection.
      this._ngZone.run(() => {
        this._scrollHandledStatus = 'needed';
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  /** Checks if the given ranges are equal. */
  private _rangesEqual(r1: Range, r2: Range): boolean {
    return r1.start == r2.start && r1.end == r2.end;
  }
}
