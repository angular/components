/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Directive, inject, Input, OnDestroy} from '@angular/core';
import {_RecycleViewRepeaterStrategy, _VIEW_REPEATER_STRATEGY, ListRange} from '../collections';
import {
  animationFrameScheduler,
  asapScheduler,
  BehaviorSubject,
  combineLatest,
  Observable,
  ReplaySubject,
  Subject,
} from 'rxjs';
import {auditTime, shareReplay, takeUntil} from 'rxjs/operators';
import {CdkVirtualScrollRepeater, CdkVirtualScrollViewport} from '../scrolling';
import {
  StickyPositioningListener,
  StickyUpdate,
  STICKY_POSITIONING_LISTENER,
} from './sticky-position-listener';
import {_TABLE_VIEW_CHANGE_STRATEGY, CdkTable, RenderRow, RowContext} from './table';

/** @docs-private */
export const _TABLE_VIRTUAL_SCROLL_COLLECTION_VIEWER_FACTORY = () =>
  new BehaviorSubject<ListRange>({start: 0, end: 0});

/**
 * Scheduler to be used for scroll events. Needs to fall back to
 * something that doesn't rely on requestAnimationFrame on environments
 * that don't support it (e.g. server-side rendering).
 *
 * This is identical to the scheduler used by the virtual scroll module.
 */
const SCROLL_SCHEDULER =
  typeof requestAnimationFrame !== 'undefined' ? animationFrameScheduler : asapScheduler;

/**
 * A directive that enables virtual scroll for a {@link CdkTable}.
 */
@Directive({
  selector: 'cdk-table[virtualScroll], table[cdk-table][virtualScroll]',
  exportAs: 'cdkTableVirtualScroll',
  providers: [
    {provide: _VIEW_REPEATER_STRATEGY, useClass: _RecycleViewRepeaterStrategy},
    {provide: STICKY_POSITIONING_LISTENER, useExisting: CdkTableVirtualScroll},
    // Initially emit an empty range. The virtual scroll viewport will update the range after it is
    // initialized.
    {
      provide: _TABLE_VIEW_CHANGE_STRATEGY,
      useFactory: _TABLE_VIRTUAL_SCROLL_COLLECTION_VIEWER_FACTORY,
    },
  ],
  host: {
    'class': 'cdk-table-virtual-scroll',
  },
})
export class CdkTableVirtualScroll<T>
  implements CdkVirtualScrollRepeater<T>, OnDestroy, StickyPositioningListener
{
  private readonly _table = inject<CdkTable<T>>(CdkTable);
  private readonly _viewChange = inject<BehaviorSubject<ListRange>>(_TABLE_VIEW_CHANGE_STRATEGY);
  private readonly _viewRepeater =
    inject<_RecycleViewRepeaterStrategy<T, RenderRow<T>, RowContext<T>>>(_VIEW_REPEATER_STRATEGY);
  private readonly _viewport = inject(CdkVirtualScrollViewport);

  /** Emits when the component is destroyed. */
  private _destroyed = new ReplaySubject<void>(1);

  /** Emits when the header rows sticky state changes. */
  private readonly _headerRowStickyUpdates = new Subject<StickyUpdate>();

  /** Emits when the footer rows sticky state changes. */
  private readonly _footerRowStickyUpdates = new Subject<StickyUpdate>();

  /**
   * Observable that emits the data source's complete data set. This exists to implement
   * {@link CdkVirtualScrollRepeater}.
   */
  get dataStream(): Observable<readonly T[]> {
    return this._dataStream;
  }
  private _dataStream = this._table._dataStream.pipe(shareReplay(1));

  /**
   * The size of the cache used to store unused views. Setting the cache size to `0` will disable
   * caching.
   */
  @Input()
  get viewCacheSize(): number {
    return this._viewRepeater.viewCacheSize;
  }
  set viewCacheSize(size: number) {
    this._viewRepeater.viewCacheSize = size;
  }

  constructor() {
    // Force the table to enable `fixedLayout` to prevent column widths from changing as the user
    // scrolls. This also enables caching in the table's sticky styler which reduces calls to
    // expensive DOM APIs, such as `getBoundingClientRect()`, and improves overall performance.
    if (!this._table.fixedLayout && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('[virtualScroll] requires input `fixedLayout` to be set on the table.');
    }

    // Update sticky styles for header rows when either the render range or sticky state change.
    combineLatest([this._viewport._renderedContentOffsetRendered, this._headerRowStickyUpdates])
      .pipe(takeUntil(this._destroyed))
      .subscribe(([offset, update]) => {
        this._stickHeaderRows(offset, update);
      });

    // Update sticky styles for footer rows when either the render range or sticky state change.
    combineLatest([this._viewport._renderedContentOffsetRendered, this._footerRowStickyUpdates])
      .pipe(takeUntil(this._destroyed))
      .subscribe(([offset, update]) => {
        this._stickFooterRows(offset, update);
      });

    // Forward the rendered range computed by the virtual scroll viewport to the table.
    this._viewport.renderedRangeStream
      // We need the scheduler here, because the virtual scrolling module uses an identical
      // one for scroll listeners. Without it the two go out of sync and the list starts
      // jumping back to the beginning whenever it needs to re-render.
      .pipe(auditTime(0, SCROLL_SCHEDULER), takeUntil(this._destroyed))
      .subscribe(this._viewChange);
    this._viewport.attach(this);
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * Measures the combined size (width for horizontal orientation, height for vertical) of all items
   * in the specified range.
   */
  measureRangeSize(range: ListRange, orientation: 'horizontal' | 'vertical'): number {
    // TODO(michaeljamesparsons) Implement method so virtual tables can use the `autosize` virtual
    //  scroll strategy.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      throw new Error('autoSize is not supported for tables with virtual scroll enabled.');
    }
    return 0;
  }

  stickyColumnsUpdated(): void {}

  stickyEndColumnsUpdated(): void {}

  stickyHeaderRowsUpdated(update: StickyUpdate): void {
    this._headerRowStickyUpdates.next(update);
  }

  stickyFooterRowsUpdated(update: StickyUpdate): void {
    this._footerRowStickyUpdates.next(update);
  }

  /**
   * The {@link StickyStyler} sticks elements by applying a `top` position offset to them. However,
   * the virtual scroll viewport applies a `translateY` offset to a container div that
   * encapsulates the table. The translation causes the header rows to also be offset by the
   * distance from the top of the scroll viewport in addition to their `top` offset. This method
   * negates the translation to move the header rows to their correct positions.
   *
   * @param offsetFromTop The distance scrolled from the top of the container.
   * @param update Metadata about the sticky headers that changed in the last sticky update.
   * @private
   */
  private _stickHeaderRows(offsetFromTop: number, update: StickyUpdate) {
    if (!update.sizes || !update.offsets || !update.elements) {
      return;
    }

    for (let i = 0; i < update.elements.length; i++) {
      if (!update.elements[i]) {
        continue;
      }
      let offset =
        offsetFromTop !== 0
          ? Math.max(offsetFromTop - update.offsets[i]!, update.offsets[i]!)
          : -update.offsets[i]!;

      this._stickCells(update.elements[i]!, 'top', -offset);
    }
  }

  /**
   * The {@link StickyStyler} sticks elements by applying a `bottom` position offset to them.
   * However, the virtual scroll viewport applies a `translateY` offset to a container div that
   * encapsulates the table. The translation causes the footer rows to also be offset by the
   * distance from the top of the scroll viewport in addition to their `bottom` offset. This method
   * negates the translation to move the footer rows to their correct positions.
   *
   * @param offsetFromTop The distance scrolled from the top of the container.
   * @param update Metadata about the sticky footers that changed in the last sticky update.
   * @private
   */
  private _stickFooterRows(offsetFromTop: number, update: StickyUpdate) {
    if (!update.sizes || !update.offsets || !update.elements) {
      return;
    }

    for (let i = 0; i < update.elements.length; i++) {
      if (!update.elements[i]) {
        continue;
      }
      this._stickCells(update.elements[i]!, 'bottom', offsetFromTop + update.offsets[i]!);
    }
  }

  private _stickCells(cells: HTMLElement[], position: 'bottom' | 'top', offset: number) {
    for (const cell of cells) {
      cell.style[position] = `${offset}px`;
    }
  }
}
