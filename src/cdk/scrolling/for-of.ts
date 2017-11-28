/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ArrayDataSource, CollectionViewer, DataSource, Range} from '@angular/cdk/collections';
import {
  Directive,
  DoCheck,
  EmbeddedViewRef,
  Host,
  Input,
  IterableChangeRecord,
  IterableChanges,
  IterableDiffer,
  IterableDiffers,
  NgIterable,
  OnDestroy,
  TemplateRef,
  TrackByFunction,
  ViewContainerRef,
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {pairwise} from 'rxjs/operators/pairwise';
import {shareReplay} from 'rxjs/operators/shareReplay';
import {startWith} from 'rxjs/operators/startWith';
import {switchMap} from 'rxjs/operators/switchMap';
import {Subject} from 'rxjs/Subject';
import {CdkVirtualScrollViewport} from './virtual-scroll-viewport';


/** The context for an item rendered by `CdkForOf` */
export class CdkForOfContext<T> {
  constructor(public $implicit: T, public cdkForOf: NgIterable<T> | DataSource<T>,
              public index: number, public count: number) {}

  get first(): boolean { return this.index === 0; }

  get last(): boolean { return this.index === this.count - 1; }

  get even(): boolean { return this.index % 2 === 0; }

  get odd(): boolean { return !this.even; }
}


type RecordViewTuple<T> = {
  record: IterableChangeRecord<T> | null,
  view?: EmbeddedViewRef<CdkForOfContext<T>>
};


/**
 * A directive similar to `ngForOf` to be used for rendering data inside a virtual scrolling
 * container.
 */
@Directive({
  selector: '[cdkFor][cdkForOf]',
})
export class CdkForOf<T> implements CollectionViewer, DoCheck, OnDestroy {
  /** Emits when the rendered view of the data changes. */
  viewChange = new Subject<Range>();

  /** Emits when the data source changes. */
  private _dataSourceSubject = new Subject<DataSource<T>>();

  /** The DataSource to display. */
  @Input()
  get cdkForOf(): NgIterable<T> | DataSource<T> { return this._cdkForOf; }
  set cdkForOf(value: NgIterable<T> | DataSource<T>) {
    this._cdkForOf = value;
    let ds = value instanceof DataSource ? value :
        new ArrayDataSource<T>(Array.prototype.slice.call(value));
    this._dataSourceSubject.next(ds);
  }
  _cdkForOf: NgIterable<T> | DataSource<T>;

  /** The trackBy function to use for tracking elements. */
  @Input()
  get cdkForTrackBy(): TrackByFunction<T> {
    return this._cdkForOfTrackBy;
  }
  set cdkForTrackBy(fn: TrackByFunction<T>) {
    this._needsUpdate = true;
    this._cdkForOfTrackBy =
        (index, item) => fn(index + (this._renderedRange ? this._renderedRange.start : 0), item);
  }
  private _cdkForOfTrackBy: TrackByFunction<T>;

  /** The template used to stamp out new elements. */
  @Input()
  set cdkForTemplate(value: TemplateRef<CdkForOfContext<T>>) {
    if (value) {
      this._needsUpdate = true;
      this._template = value;
    }
  }

  /** Emits whenever the data in the current DataSource changes. */
  dataStream: Observable<T[]> = this._dataSourceSubject
      .pipe(
          startWith(null!),
          pairwise(),
          switchMap(([prev, cur]) => this._changeDataSource(prev, cur)),
          shareReplay(1));

  private _differ: IterableDiffer<T> | null = null;

  private _data: T[];

  private _renderedItems: T[];

  private _renderedRange: Range;

  private _templateCache: EmbeddedViewRef<CdkForOfContext<T>>[] = [];

  private _needsUpdate = false;

  constructor(
      private _viewContainerRef: ViewContainerRef,
      private _template: TemplateRef<CdkForOfContext<T>>,
      private _differs: IterableDiffers,
      @Host() private _viewport: CdkVirtualScrollViewport) {
    this.dataStream.subscribe(data => this._data = data);
    this._viewport.renderedRangeStream.subscribe(range => this._onRenderedRangeChange(range));
    this._viewport.connect(this);
  }

  /**
   * Get the client rect for the given index.
   * @param index The index of the data element whose client rect we want to measure.
   * @return The combined client rect for all DOM elements rendered as part of the given index.
   *     Or null if no DOM elements are rendered for the given index.
   * @throws If the given index is not in the rendered range.
   */
  measureClientRect(index: number): ClientRect | null {
    if (index < this._renderedRange.start || index >= this._renderedRange.end) {
      throw Error('Error: attempted to measure an element that isn\'t rendered.');
    }
    index -= this._renderedRange.start;
    let view = this._viewContainerRef.get(index) as EmbeddedViewRef<CdkForOfContext<T>> | null;
    if (view && view.rootNodes.length) {
      let minTop = Infinity;
      let minLeft = Infinity;
      let maxBottom = -Infinity;
      let maxRight = -Infinity;

      // There may be multiple root DOM elements for a single data element, so we merge their rects.
      for (let i = 0, ilen = view.rootNodes.length; i < ilen; i++) {
        let rect = (view.rootNodes[i] as Element).getBoundingClientRect();
        minTop = Math.min(minTop, rect.top);
        minLeft = Math.min(minLeft, rect.left);
        maxBottom = Math.max(maxBottom, rect.bottom);
        maxRight = Math.max(maxRight, rect.right);
      }

      return {
        top: minTop,
        left: minLeft,
        bottom: maxBottom,
        right: maxRight,
        height: maxBottom - minTop,
        width: maxRight - minLeft
      };
    }
    return null;
  }

  ngDoCheck() {
    if (this._differ && this._needsUpdate) {
      const changes = this._differ.diff(this._renderedItems);
      this._applyChanges(changes);
      this._needsUpdate = false;
    }
  }

  ngOnDestroy() {
    this._viewport.disconnect();

    this._dataSourceSubject.complete();
    this.viewChange.complete();

    for (let view of this._templateCache) {
      view.destroy();
    }
  }

  /** React to scroll state changes in the viewport. */
  private _onRenderedRangeChange(renderedRange: Range) {
    this._renderedRange = renderedRange;
    this.viewChange.next(this._renderedRange);
    this._renderedItems = this._data.slice(this._renderedRange.start, this._renderedRange.end);
    if (!this._differ) {
      this._differ = this._differs.find(this._renderedItems).create(this.cdkForTrackBy);
    }
    this._needsUpdate = true;
  }

  /** Swap out one `DataSource` for another. */
  private _changeDataSource(oldDs: DataSource<T> | null, newDs: DataSource<T>): Observable<T[]> {
    if (oldDs) {
      oldDs.disconnect(this);
    }
    this._needsUpdate = true;
    return newDs.connect(this);
  }

  /** Apply changes to the DOM. */
  private _applyChanges(changes: IterableChanges<T> | null) {
    // If there are no changes, just update the index and count on the view context and be done.
    if (!changes) {
      for (let i = 0, len = this._viewContainerRef.length; i < len; i++) {
        let view = this._viewContainerRef.get(i) as EmbeddedViewRef<CdkForOfContext<T>>;
        view.context.index = this._renderedRange.start + i;
        view.context.count = this._data.length;
        view.detectChanges();
      }
      return;
    }

    // Detach all of the views and add them into an array to preserve their original order.
    const previousViews: EmbeddedViewRef<CdkForOfContext<T>>[] = [];
    for (let i = 0, len = this._viewContainerRef.length; i < len; i++) {
      previousViews.unshift(
          this._viewContainerRef.detach()! as EmbeddedViewRef<CdkForOfContext<T>>);
    }

    // Mark the removed indices so we can recycle their views.
    changes.forEachRemovedItem(record => {
      this._templateCache.push(previousViews[record.previousIndex!]);
      delete previousViews[record.previousIndex!];
    });

    // Queue up the newly added items to be inserted, recycling views from the cache if possible.
    const insertTuples: RecordViewTuple<T>[] = [];
    changes.forEachAddedItem(record => {
      insertTuples[record.currentIndex!] = {record, view: this._templateCache.pop()};
    });

    // Queue up moved items to be re-inserted.
    changes.forEachMovedItem(record => {
      insertTuples[record.currentIndex!] = {record, view: previousViews[record.previousIndex!]};
      delete previousViews[record.previousIndex!];
    });

    // We have deleted all of the views that were removed or moved from previousViews. What is left
    // is the unchanged items that we queue up to be re-inserted.
    for (let i = 0, len = previousViews.length; i < len; i++) {
      if (previousViews[i]) {
        insertTuples[i] = {record: null, view: previousViews[i]};
      }
    }

    // We now have a full list of everything to be inserted, so go ahead and insert them.
    for (let i = 0, len = insertTuples.length; i < len; i++) {
      let {view, record} = insertTuples[i];
      if (view) {
        this._viewContainerRef.insert(view);
      } else {
        view = this._viewContainerRef.createEmbeddedView(this._template,
            new CdkForOfContext<T>(null!, this._cdkForOf, -1, -1));
      }

      if (record) {
        view.context.$implicit = record.item as T;
      }
      view.context.index = this._renderedRange.start + i;
      view.context.count = this._data.length;
      view.detectChanges();
    }
  }
}
