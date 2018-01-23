/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Range} from '@angular/cdk/collections';
import {CdkVirtualForOf} from '@angular/cdk/scrolling/virtual-for-of';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  Input,
} from '@angular/core';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {takeUntil} from 'rxjs/operators/takeUntil';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
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
  private _disconnectSubject = new Subject<void>();

  private _renderedRangeSubject = new Subject<Range>();

  /** The direction the viewport scrolls. */
  @Input() orientation: 'horizontal' | 'vertical' = 'vertical';

  /** The element that wraps the rendered content. */
  @ViewChild('contentWrapper') _contentWrapper: ElementRef;

  /** The total size of all content, including content that is not currently rendered. */
  get totalContentSize() { return this._totalContentSize; }
  set totalContentSize(size: number) {
    if (this._totalContentSize != size) {
      this._ngZone.run(() => {
        this._totalContentSize = size;
        this._changeDetectorRef.markForCheck();
      });
    }
  }
  private _totalContentSize = 0;

  /** The currently rendered range of indices. */
  get renderedRange() { return this._renderedRange; }
  set renderedRange(range: Range) {
    if (!this._rangesEqual(this._renderedRange, range)) {
      this._ngZone.run(() => {
        this._renderedRangeSubject.next(this._renderedRange = range);
        this._changeDetectorRef.markForCheck();
      });
    }
  }
  private _renderedRange: Range = {start: 0, end: 0};

  /** The offset of the rendered portion of the data from the start. */
  get renderedContentOffset(): number { return this._renderedContentOffset; }
  set renderedContentOffset(offset: number) {
    if (this._renderedContentOffset != offset) {
      this._ngZone.run(() => {
        this._renderedContentOffset = offset;
        this._renderedContentTransform = this.orientation === 'horizontal' ?
            `translateX(${offset}px)`: `translateY(${offset}px)`;
        this._changeDetectorRef.markForCheck();
      });
    }
  }
  private _renderedContentOffset = 0;

  /** The length of the data connected to this viewport. */
  get dataLength() { return this._dataLength; }
  private _dataLength = 0;

  /** The size of the viewport. */
  get viewportSize() { return this._viewportSize; }
  private _viewportSize = 0;

  /** A stream that emits whenever the rendered range changes. */
  renderedRangeStream: Observable<Range> = this._renderedRangeSubject.asObservable();

  _renderedContentTransform: string;

  private _connected = false;

  private _scrollHandledStatus: 'needed' | 'pending' | 'done' = 'done';

  constructor(public elementRef: ElementRef, private _changeDetectorRef: ChangeDetectorRef,
              private _ngZone: NgZone,
              @Inject(VIRTUAL_SCROLL_STRATEGY) private _scrollStrategy: VirtualScrollStrategy) {}

  /** Connect a `CdkVirtualForOf` to this viewport. */
  connect(forOf: CdkVirtualForOf<any>) {
    if (this._connected) {
      throw Error('CdkVirtualScrollViewport is already connected.');
    }

    this._connected = true;
    forOf.dataStream.pipe(takeUntil(this._disconnectSubject)).subscribe(data => {
      const len = data.length;
      if (len != this._dataLength) {
        this._dataLength = len;
        this._scrollStrategy.onDataLengthChanged();
      }
    });
  }

  /** Disconnect the current `CdkVirtualForOf`. */
  disconnect() {
    this._connected = false;
    this._disconnectSubject.next();
  }

  /** Gets the current scroll offset of the viewport. */
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
    this.disconnect();
    this._scrollStrategy.detach();

    // Complete all subjects
    this._disconnectSubject.complete();
    this._renderedRangeSubject.complete();
  }

  private _markScrolled() {
    if (this._scrollHandledStatus === 'done') {
      this._ngZone.run(() => {
        this._scrollHandledStatus = 'needed';
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  private _rangesEqual(r1: Range, r2: Range): boolean {
    return r1.start == r2.start && r1.end == r2.end;
  }
}
