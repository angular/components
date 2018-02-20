/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CollectionViewer, DataSource, Range, StaticArrayDataSource} from '@angular/cdk/collections';
import {
  Directive,
  DoCheck,
  EmbeddedViewRef,
  Input,
  IterableChangeRecord,
  IterableChanges,
  IterableDiffer,
  IterableDiffers,
  NgIterable,
  OnDestroy,
  SkipSelf,
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


/** The context for an item rendered by `CdkVirtualForOf` */
export type CdkVirtualForOfContext<T> = {
  $implicit: T;
  cdkVirtualForOf: NgIterable<T> | DataSource<T>;
  index: number;
  count: number;
  first: boolean;
  last: boolean;
  even: boolean;
  odd: boolean;
};


type RecordViewTuple<T> = {
  record: IterableChangeRecord<T> | null,
  view?: EmbeddedViewRef<CdkVirtualForOfContext<T>>
};


/**
 * A directive similar to `ngForOf` to be used for rendering data inside a virtual scrolling
 * container.
 */
@Directive({
  selector: '[cdkVirtualFor][cdkVirtualForOf]',
})
export class CdkVirtualForOf<T> implements CollectionViewer, DoCheck, OnDestroy {
  /** Emits when the rendered view of the data changes. */
  viewChange = new Subject<Range>();

  /** Subject that emits when a new DataSource instance is given. */
  private _dataSourceChanges = new Subject<DataSource<T>>();

  /** The DataSource to display. */
  @Input()
  get cdkVirtualForOf(): NgIterable<T> | DataSource<T> { return this._cdkVirtualForOf; }
  set cdkVirtualForOf(value: NgIterable<T> | DataSource<T>) {
    this._cdkVirtualForOf = value;
    const ds = value instanceof DataSource ? value :
        // Slice the value since NgIterable may be array-like rather than an array.
        new StaticArrayDataSource<T>(Array.prototype.slice.call(value));
    this._dataSourceChanges.next(ds);
  }
  _cdkVirtualForOf: NgIterable<T> | DataSource<T>;

  /**
   * The `TrackByFunction` to use for tracking changes. The `TrackByFunction` takes the index and
   * the item and produces a value to be used as the item's identity when tracking changes.
   */
  @Input()
  get cdkVirtualForTrackBy(): TrackByFunction<T> {
    return this._cdkVirtualForTrackBy;
  }
  set cdkVirtualForTrackBy(fn: TrackByFunction<T>) {
    this._needsUpdate = true;
    this._cdkVirtualForTrackBy =
        (index, item) => fn(index + (this._renderedRange ? this._renderedRange.start : 0), item);
  }
  private _cdkVirtualForTrackBy: TrackByFunction<T>;

  /** The template used to stamp out new elements. */
  @Input()
  set cdkVirtualForTemplate(value: TemplateRef<CdkVirtualForOfContext<T>>) {
    if (value) {
      this._needsUpdate = true;
      this._template = value;
    }
  }

  /** Emits whenever the data in the current DataSource changes. */
  dataStream: Observable<T[]> = this._dataSourceChanges
      .pipe(
          // Start off with null `DataSource`.
          startWith(null!),
          // Bundle up the previous and current data sources so we can work with both.
          pairwise(),
          // Use `_changeDataSource` to disconnect from the previous data source and connect to the
          // new one, passing back a stream of data changes which we run through `switchMap` to give
          // us a data stream that emits the latest data from whatever the current `DataSource` is.
          switchMap(([prev, cur]) => this._changeDataSource(prev, cur)),
          // Replay the last emitted data when someone subscribes.
          shareReplay(1));

  /** The differ used to calculate changes to the data. */
  private _differ: IterableDiffer<T> | null = null;

  /** The most recent data emitted from the DataSource. */
  private _data: T[];

  /** The currently rendered items. */
  private _renderedItems: T[];

  /** The currently rendered range of indices. */
  private _renderedRange: Range;

  /**
   * The template cache used to hold on ot template instancess that have been stamped out, but don't
   * currently need to be rendered. These instances will be reused in the future rather than
   * stamping out brand new ones.
   */
  private _templateCache: EmbeddedViewRef<CdkVirtualForOfContext<T>>[] = [];

  /** Whether the rendered data should be updated during the next ngDoCheck cycle. */
  private _needsUpdate = false;

  constructor(
      /** The view container to add items to. */
      private _viewContainerRef: ViewContainerRef,
      /** The template to use when stamping out new items. */
      private _template: TemplateRef<CdkVirtualForOfContext<T>>,
      /** The set of available differs. */
      private _differs: IterableDiffers,
      /** The virtual scrolling viewport that these items are being rendered in. */
      @SkipSelf() private _viewport: CdkVirtualScrollViewport) {
    this.dataStream.subscribe(data => this._data = data);
    this._viewport.renderedRangeStream.subscribe(range => this._onRenderedRangeChange(range));
    this._viewport.attach(this);
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
      throw Error(`Error: attempted to measure an element that isn't rendered.`);
    }
    const renderedIndex = index - this._renderedRange.start;
    let view = this._viewContainerRef.get(renderedIndex) as
        EmbeddedViewRef<CdkVirtualForOfContext<T>> | null;
    if (view && view.rootNodes.length) {
      // There may be multiple root DOM elements for a single data element, so we merge their rects.
      // These variables keep track of the minimum top and left as well as maximum bottom and right
      // that we have encoutnered on any rectangle, so that we can merge the results into the
      // smallest possible rect that contains all of the root rects.
      let minTop = Infinity;
      let minLeft = Infinity;
      let maxBottom = -Infinity;
      let maxRight = -Infinity;

      for (let i = view.rootNodes.length - 1; i >= 0 ; i--) {
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
      // TODO(mmalerba): We should differentiate needs update due to scrolling and a new portion of
      // this list being rendered (can use simpler algorithm) vs needs update due to data actually
      // changing (need to do this diff).
      const changes = this._differ.diff(this._renderedItems);
      if (!changes) {
        this._updateContext();
      } else {
        this._applyChanges(changes);
      }
      this._needsUpdate = false;
    }
  }

  ngOnDestroy() {
    this._viewport.detach();

    this._dataSourceChanges.complete();
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
      this._differ = this._differs.find(this._renderedItems).create(this.cdkVirtualForTrackBy);
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

  /** Update the `CdkVirtualForOfContext` for all views. */
  private _updateContext() {
    const count = this._data.length;
    let i = this._viewContainerRef.length;
    while (i--) {
      let view = this._viewContainerRef.get(i) as EmbeddedViewRef<CdkVirtualForOfContext<T>>;
      view.context.index = this._renderedRange.start + i;
      view.context.count = count;
      this._updateComputedContextProperties(view.context);
      view.detectChanges();
    }
  }

  /** Apply changes to the DOM. */
  private _applyChanges(changes: IterableChanges<T>) {
    // TODO(mmalerba): Currently we remove every view and then re-insert it in the correct place.
    // It would be better to generate the minimal set of remove & inserts to get to the new list
    // instead.

    // Detach all of the views and add them into an array to preserve their original order.
    const previousViews: (EmbeddedViewRef<CdkVirtualForOfContext<T>> | null)[] = [];
    let i = this._viewContainerRef.length;
    while (i--) {
      previousViews.unshift(
          this._viewContainerRef.detach()! as EmbeddedViewRef<CdkVirtualForOfContext<T>>);
    }

    // Mark the removed indices so we can recycle their views.
    changes.forEachRemovedItem(record => {
      this._templateCache.push(previousViews[record.previousIndex!]!);
      previousViews[record.previousIndex!] = null;
    });

    // Queue up the newly added items to be inserted, recycling views from the cache if possible.
    const insertTuples: RecordViewTuple<T>[] = [];
    changes.forEachAddedItem(record => {
      insertTuples[record.currentIndex!] = {record, view: this._templateCache.pop()};
    });

    // Queue up moved items to be re-inserted.
    changes.forEachMovedItem(record => {
      insertTuples[record.currentIndex!] = {record, view: previousViews[record.previousIndex!]!};
      previousViews[record.previousIndex!] = null;
    });

    // We have nulled-out all of the views that were removed or moved from previousViews. What is
    // left is the unchanged items that we queue up to be re-inserted.
    i = previousViews.length;
    while (i--) {
      if (previousViews[i]) {
        insertTuples[i] = {record: null, view: previousViews[i]!};
      }
    }

    // We now have a full list of everything to be inserted, so go ahead and insert them.
    this._insertViews(insertTuples);
  }

  /** Insert the RecordViewTuples into the container element. */
  private _insertViews(insertTuples: RecordViewTuple<T>[]) {
    const count = this._data.length;
    let i = insertTuples.length;
    const lastIndex = i - 1;
    while (i--) {
      const index = lastIndex - i;
      let {view, record} = insertTuples[index];
      if (view) {
        this._viewContainerRef.insert(view);
      } else {
        view = this._viewContainerRef.createEmbeddedView(this._template, {
              $implicit: null!,
              cdkVirtualForOf: this._cdkVirtualForOf,
              index: -1,
              count: -1,
              first: false,
              last: false,
              odd: false,
              even: false
            });
      }

      if (record) {
        view.context.$implicit = record.item as T;
      }
      view.context.index = this._renderedRange.start + index;
      view.context.count = count;
      this._updateComputedContextProperties(view.context);
      view.detectChanges();
    }
  }

  /** Update the computed properties on the `CdkVirtualForOfContext`. */
  private _updateComputedContextProperties(context: CdkVirtualForOfContext<any>) {
    context.first = context.index === 0;
    context.last = context.index === context.count - 1;
    context.even = context.index % 2 === 0;
    context.odd = !context.even;
  }
}
