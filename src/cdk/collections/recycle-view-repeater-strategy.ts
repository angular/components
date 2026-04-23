/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  EmbeddedViewRef,
  Injector,
  inject,
  IterableChangeRecord,
  IterableChanges,
  ViewContainerRef,
} from '@angular/core';
import {
  _ViewRepeater,
  _ViewRepeaterItemChanged,
  _ViewRepeaterItemContext,
  _ViewRepeaterItemContextFactory,
  _ViewRepeaterItemInsertArgs,
  _ViewRepeaterItemValueResolver,
  _ViewRepeaterOperation,
} from './view-repeater';
import {RecycleViewElementsState} from './recycle-view-elements-state.service';

/** Views that must be retained by `trackById` until their item is rendered again. */
const detachedViewMap = new Map<string, EmbeddedViewRef<unknown>>();
(window as any).detachedViewMap = detachedViewMap;

// let _recycleViewElementsState: RecycleViewElementsState | null = null;
// (window as any).recycleViewElementsState = new RecycleViewElementsState();
/**
 * A repeater that caches views when they are removed from a
 * {@link ViewContainerRef}. When new items are inserted into the container,
 * the repeater will reuse one of the cached views instead of creating a new
 * embedded view. Recycling cached views reduces the quantity of expensive DOM
 * inserts.
 *
 * @template T The type for the embedded view's $implicit property.
 * @template R The type for the item in each IterableDiffer change record.
 * @template C The type for the context passed to each embedded view.
 */
export class _RecycleViewRepeaterStrategy<T, R, C extends _ViewRepeaterItemContext<T>>
  implements _ViewRepeater<T, R, C>
{
  /**
   * The size of the cache used to store unused views.
   * Setting the cache size to `0` will disable caching. Defaults to 20 views.
   */
  viewCacheSize: number = 20;

  /**
   * View cache that stores embedded view instances that have been previously stamped out,
   * but don't are not currently rendered. The view repeater will reuse these views rather than
   * creating brand new ones.
   *
   * TODO(michaeljamesparsons) Investigate whether using a linked list would improve performance.
   */
  private _viewCache: EmbeddedViewRef<C>[] = [];

  /**
   * Service instance for managing scrolling view state.
   * One instance per _RecycleViewRepeaterStrategy.
   */
  private _recycleViewElementsState: RecycleViewElementsState | null = null;

  /**
   * TrackBy function to identify items uniquely.
   * Used for saving/restoring scroll positions.
   */
  private _trackByFn?: (index: number, item: T) => any;

  /**
   * Whether to store and restore scroll positions for items.
   */
  private _storeScrollPosition: boolean = false;

  /**
   * Sets the trackBy function used to identify items for keyed detached-view reuse
   * and scroll state persistence.
   */
  setTrackByFunction(trackBy: ((index: number, item: T) => any) | undefined): void {
    this._trackByFn = trackBy;
  }

  /**
   * Sets whether to store and restore scroll positions for items.
   */
  setStoreScrollPosition(value: boolean): void {
    this._storeScrollPosition = value;
  }

  constructor() {
    // const injected = inject(RecycleViewElementsState, {optional: true})
    // console.log(_recycleViewElementsState, injected)
    this._recycleViewElementsState = inject(RecycleViewElementsState, {optional: true});
    (window as any).recycleViewElementsState = this._recycleViewElementsState;
  }

  /** Apply changes to the DOM. */
  applyChanges(
    changes: IterableChanges<R>,
    viewContainerRef: ViewContainerRef,
    itemContextFactory: _ViewRepeaterItemContextFactory<T, R, C>,
    itemValueResolver: _ViewRepeaterItemValueResolver<T, R>,
    itemViewChanged?: _ViewRepeaterItemChanged<R, C>,
  ) {
    // Rearrange the views to put them in the right location.
    changes.forEachOperation(
      (
        record: IterableChangeRecord<R>,
        adjustedPreviousIndex: number | null,
        currentIndex: number | null,
      ) => {
        let view: EmbeddedViewRef<C> | undefined;
        let operation: _ViewRepeaterOperation;
        if (record.previousIndex == null) {
          // Item added.
          const viewArgsFactory = () =>
            itemContextFactory(record, adjustedPreviousIndex, currentIndex);
          view = this._insertView(
            viewArgsFactory,
            currentIndex!,
            viewContainerRef,
            itemValueResolver(record),
          );
          operation = view ? _ViewRepeaterOperation.INSERTED : _ViewRepeaterOperation.REPLACED;
        } else if (currentIndex == null) {
          // Item removed.
          this._detachAndCacheView(adjustedPreviousIndex!, viewContainerRef);
          operation = _ViewRepeaterOperation.REMOVED;
        } else {
          // Item moved.
          view = this._moveView(
            adjustedPreviousIndex!,
            currentIndex!,
            viewContainerRef,
            itemValueResolver(record),
          );
          operation = _ViewRepeaterOperation.MOVED;
        }

        if (itemViewChanged) {
          itemViewChanged({
            context: view?.context,
            operation,
            record,
          });
        }
      },
    );
  }

  detach() {
    // Save scroll positions before destroying cached views
    this._viewCache.forEach((view, i) => {
      this._saveScrollPosition(view, i);
      view.destroy();
    });
    this._viewCache = [];

    // detachedViewMap.forEach(view => {
    //   this._saveScrollPosition(view, this._getViewIndex(view));
    //   view.destroy();
    // });
    // detachedViewMap.clear();
  }

  /**
   * Inserts a view for a new item, either from the cache or by creating a new
   * one. Returns `undefined` if the item was inserted into a cached view.
   */
  private _insertView(
    viewArgsFactory: () => _ViewRepeaterItemInsertArgs<C>,
    currentIndex: number,
    viewContainerRef: ViewContainerRef,
    value: T,
  ): EmbeddedViewRef<C> | undefined {
    const trackById = this._getTrackById(value, currentIndex);
    const detachedView = trackById
      ? this._insertDetachedViewFromMap(trackById, currentIndex, viewContainerRef)
      : null;

    if (detachedView) {
      detachedView.context.$implicit = value;
      this._restoreScrollPosition(detachedView, value, currentIndex);
      return undefined;
    }

    const cachedView = this._insertViewFromCache(currentIndex!, viewContainerRef);
    if (cachedView) {
      cachedView.context.$implicit = value;
      // Restore scroll position for recycled view
      this._restoreScrollPosition(cachedView, value, currentIndex);
      return undefined;
    }

    const viewArgs = viewArgsFactory();
    let newView: EmbeddedViewRef<C>;

    // Create a custom injector that provides the RecycleViewElementsState
    // so it can be injected into components/directives within the embedded view
    const embeddedViewOptions: {index?: number; injector?: Injector} = {
      index: viewArgs.index,
    };

    if (this._recycleViewElementsState) {
      embeddedViewOptions.injector = Injector.create({
        providers: [
          {
            provide: RecycleViewElementsState,
            useValue: this._recycleViewElementsState,
          },
        ],
        parent: viewContainerRef.injector,
      });
    }

    newView = viewContainerRef.createEmbeddedView(
      viewArgs.templateRef,
      viewArgs.context,
      embeddedViewOptions,
    );

    // Restore scroll position for newly created view
    this._restoreScrollPosition(newView, value, currentIndex);
    return newView;
  }

  /** Detaches the view at the given index and inserts into the view cache. */
  private _detachAndCacheView(index: number, viewContainerRef: ViewContainerRef) {
    const detachedView = viewContainerRef.get(index) as EmbeddedViewRef<C>;

    // Save scroll position before detaching
    if (detachedView) {
      this._saveScrollPosition(detachedView, index);
    }

    viewContainerRef.detach(index);
    this._maybeCacheView(detachedView, viewContainerRef, index);
  }

  /** Moves view at the previous index to the current index. */
  private _moveView(
    adjustedPreviousIndex: number,
    currentIndex: number,
    viewContainerRef: ViewContainerRef,
    value: T,
  ): EmbeddedViewRef<C> {
    const view = viewContainerRef.get(adjustedPreviousIndex!) as EmbeddedViewRef<C>;
    viewContainerRef.move(view, currentIndex);
    view.context.$implicit = value;
    // Restore scroll position after moving
    this._restoreScrollPosition(view, value, currentIndex);
    return view;
  }

  /**
   * Cache the given detached view. If the cache is full, the view will be
   * destroyed.
   */
  private _maybeCacheView(
    view: EmbeddedViewRef<C>,
    viewContainerRef: ViewContainerRef,
    index: number,
  ) {
    const trackById = this._getTrackByIdForView(view, index);
    console.log('_maybeCacheView', trackById, trackById ? this._shouldDetachView(trackById) : null);
    if (trackById && this._shouldDetachView(trackById)) {
      const existingView = detachedViewMap.get(trackById);
      // if (existingView && existingView !== view) {
      //   existingView.destroy();
      // }
      detachedViewMap.set(trackById, view);
      return;
    }

    if (this._viewCache.length < this.viewCacheSize) {
      this._viewCache.push(view);
    } else {
      const viewIndex = viewContainerRef.indexOf(view);

      // The host component could remove views from the container outside of
      // the view repeater. It's unlikely this will occur, but just in case,
      // destroy the view on its own, otherwise destroy it through the
      // container to ensure that all the references are removed.
      if (viewIndex === -1) {
        view.destroy();
      } else {
        viewContainerRef.remove(viewIndex);
      }
    }
  }

  /** Inserts a detached view for the provided `trackById`, if one was retained. */
  private _insertDetachedViewFromMap(
    trackById: string,
    index: number,
    viewContainerRef: ViewContainerRef,
  ): EmbeddedViewRef<C> | null {
    const detachedView = detachedViewMap.get(trackById);

    if (!detachedView) {
      return null;
    }

    detachedViewMap.delete(trackById);
    viewContainerRef.insert(detachedView, index);
    return detachedView as EmbeddedViewRef<C>;
  }

  /** Inserts a recycled view from the cache at the given index. */
  private _insertViewFromCache(
    index: number,
    viewContainerRef: ViewContainerRef,
  ): EmbeddedViewRef<C> | null {
    const cachedView = this._viewCache.pop();
    if (cachedView) {
      viewContainerRef.insert(cachedView, index);
    }
    return cachedView || null;
  }

  /**
   * Gets a unique identifier for an item using the trackBy function.
   */
  private _getTrackById(value: T, index: number): string | null {
    if (!this._trackByFn) {
      return null;
    }
    const trackByValue = this._trackByFn(index, value);
    return trackByValue !== null ? String(trackByValue) : null;
  }

  /** Gets the `trackById` for a detached view from its current context. */
  private _getTrackByIdForView(view: EmbeddedViewRef<C>, index: number): string | null {
    const value = view.context.$implicit;
    if (value === undefined) {
      return null;
    }

    return this._getTrackById(value, index);
  }

  /** Whether the state bag requests that the view be retained in the detached map. */
  private _shouldDetachView(trackById: string): boolean {
    const state = this._recycleViewElementsState?.get<{detach?: boolean}>(trackById);
    return state?.detach === true;
  }

  // /** Best-effort index extraction for saved detached views during teardown. */
  private _getViewIndex(view: EmbeddedViewRef<C>): number {
    const contextWithIndex = view.context as C & {index?: number};
    return typeof contextWithIndex.index === 'number' ? contextWithIndex.index : 0;
  }

  /**
   * Saves the scroll position of a view's root element to the state service.
   */
  private _saveScrollPosition(view: EmbeddedViewRef<C>, index: number): void {
    if (!this._storeScrollPosition || !this._recycleViewElementsState || !this._trackByFn) {
      return;
    }

    const value = view.context.$implicit;
    if (value === undefined) {
      return;
    }

    const trackById = this._getTrackById(value, index);
    if (!trackById) {
      return;
    }

    // Get the first scrollable element from the view's root nodes
    const scrollPosition = this._getScrollPositionFromView(view);
    if (scrollPosition) {
      this._recycleViewElementsState.add(trackById, {scrollPosition});
    }
  }

  /**
   * Restores the scroll position of a view's root element from the state service.
   */
  private _restoreScrollPosition(view: EmbeddedViewRef<C>, value: T, index: number): void {
    if (!this._storeScrollPosition || !this._recycleViewElementsState || !this._trackByFn) {
      return;
    }

    const trackById = this._getTrackById(value, index);
    if (!trackById) {
      return;
    }

    const state = this._recycleViewElementsState.get<{
      scrollPosition?: {scrollTop: number; scrollLeft: number};
    }>(trackById);
    if (state?.scrollPosition) {
      this._setScrollPositionOnView(view, state.scrollPosition);
    }
  }

  /**
   * Gets the scroll position from the view's root element(s).
   */
  private _getScrollPositionFromView(
    view: EmbeddedViewRef<C>,
  ): {scrollTop: number; scrollLeft: number} | null {
    const scrollableEl = this._findScrollableElementInView(view);
    if (scrollableEl && (scrollableEl.scrollTop !== 0 || scrollableEl.scrollLeft !== 0)) {
      return {
        scrollTop: scrollableEl.scrollTop,
        scrollLeft: scrollableEl.scrollLeft,
      };
    }
    return null;
  }

  /**
   * Sets the scroll position on the view's root element(s).
   */
  private _setScrollPositionOnView(
    view: EmbeddedViewRef<C>,
    position: {scrollTop: number; scrollLeft: number},
  ): void {
    // Use requestAnimationFrame to ensure the DOM is rendered before setting scroll
    requestAnimationFrame(() => {
      const scrollableEl = this._findScrollableElementInView(view);
      if (scrollableEl) {
        scrollableEl.scrollTop = position.scrollTop;
        scrollableEl.scrollLeft = position.scrollLeft;
      }
    });
  }

  /**
   * Finds the first scrollable element within the view's root nodes.
   */
  private _findScrollableElementInView(view: EmbeddedViewRef<C>): HTMLElement | null {
    for (const node of view.rootNodes) {
      if (node instanceof HTMLElement) {
        const scrollableEl = this._findScrollableElement(node);
        if (scrollableEl) {
          return scrollableEl;
        }
      }
    }
    return null;
  }

  /**
   * Finds the element that should be used as the scroll container for a view root.
   * Prefers a nested `.cdk-virtual-scrollable` element when present.
   */
  private _findScrollableElement(element: HTMLElement): HTMLElement | null {
    // At this point we support only nested virtual-scrollable element. If we need customization, we should create an input for that class name.
    const scrollableChild = element.querySelector('.cdk-virtual-scrollable') as HTMLElement;
    if (scrollableChild && this._isScrollable(scrollableChild)) {
      return scrollableChild;
    }

    return element;
  }

  /**
   * Checks if an element is scrollable.
   */
  private _isScrollable(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    return (
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowX === 'auto' ||
      overflowX === 'scroll'
    );
  }
}
