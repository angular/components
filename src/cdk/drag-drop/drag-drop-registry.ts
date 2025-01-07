/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  NgZone,
  OnDestroy,
  ViewEncapsulation,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {normalizePassiveListenerOptions} from '@angular/cdk/platform';
import {_CdkPrivateStyleLoader} from '@angular/cdk/private';
import {Observable, Observer, Subject, merge} from 'rxjs';
import type {DropListRef} from './drop-list-ref';
import type {DragRef} from './drag-ref';
import type {CdkDrag} from './directives/drag';

/** Event options that can be used to bind an active, capturing event. */
const activeCapturingEventOptions = normalizePassiveListenerOptions({
  passive: false,
  capture: true,
});

/**
 * Component used to load the drag&drop reset styles.
 * @docs-private
 */
@Component({
  styleUrl: 'resets.css',
  encapsulation: ViewEncapsulation.None,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'cdk-drag-resets-container': ''},
})
export class _ResetsLoader {}

// TODO(crisbeto): remove generics when making breaking changes.
/**
 * Service that keeps track of all the drag item and drop container
 * instances, and manages global event listeners on the `document`.
 * @docs-private
 */
@Injectable({providedIn: 'root'})
export class DragDropRegistry<_ = unknown, __ = unknown> implements OnDestroy {
  private _ngZone = inject(NgZone);
  private _document = inject(DOCUMENT);
  private _styleLoader = inject(_CdkPrivateStyleLoader);

  /** Registered drop container instances. */
  private _dropInstances = new Set<DropListRef>();

  /** Registered drag item instances. */
  private _dragInstances = new Set<DragRef>();

  /** Drag item instances that are currently being dragged. */
  private _activeDragInstances: WritableSignal<DragRef[]> = signal([]);

  /** Keeps track of the event listeners that we've bound to the `document`. */
  private _globalListeners = new Map<
    string,
    {
      handler: (event: Event) => void;
      options?: AddEventListenerOptions | boolean;
    }
  >();

  /**
   * Predicate function to check if an item is being dragged.  Moved out into a property,
   * because it'll be called a lot and we don't want to create a new function every time.
   */
  private _draggingPredicate = (item: DragRef) => item.isDragging();

  /**
   * Map tracking DOM nodes and their corresponding drag directives. Note that this is different
   * from looking through the `_dragInstances` and getting their root node, because the root node
   * isn't necessarily the node that the directive is set on.
   */
  private _domNodesToDirectives: WeakMap<Node, CdkDrag> | null = null;

  /**
   * Emits the `touchmove` or `mousemove` events that are dispatched
   * while the user is dragging a drag item instance.
   */
  readonly pointerMove: Subject<TouchEvent | MouseEvent> = new Subject<TouchEvent | MouseEvent>();

  /**
   * Emits the `touchend` or `mouseup` events that are dispatched
   * while the user is dragging a drag item instance.
   */
  readonly pointerUp: Subject<TouchEvent | MouseEvent> = new Subject<TouchEvent | MouseEvent>();

  /**
   * Emits when the viewport has been scrolled while the user is dragging an item.
   * @deprecated To be turned into a private member. Use the `scrolled` method instead.
   * @breaking-change 13.0.0
   */
  readonly scroll: Subject<Event> = new Subject<Event>();

  constructor(...args: unknown[]);
  constructor() {}

  /** Adds a drop container to the registry. */
  registerDropContainer(drop: DropListRef) {
    if (!this._dropInstances.has(drop)) {
      this._dropInstances.add(drop);
    }
  }

  /** Adds a drag item instance to the registry. */
  registerDragItem(drag: DragRef) {
    this._dragInstances.add(drag);

    // The `touchmove` event gets bound once, ahead of time, because WebKit
    // won't preventDefault on a dynamically-added `touchmove` listener.
    // See https://bugs.webkit.org/show_bug.cgi?id=184250.
    if (this._dragInstances.size === 1) {
      this._ngZone.runOutsideAngular(() => {
        // The event handler has to be explicitly active,
        // because newer browsers make it passive by default.
        this._document.addEventListener(
          'touchmove',
          this._persistentTouchmoveListener,
          activeCapturingEventOptions,
        );
      });
    }
  }

  /** Removes a drop container from the registry. */
  removeDropContainer(drop: DropListRef) {
    this._dropInstances.delete(drop);
  }

  /** Removes a drag item instance from the registry. */
  removeDragItem(drag: DragRef) {
    this._dragInstances.delete(drag);
    this.stopDragging(drag);

    if (this._dragInstances.size === 0) {
      this._document.removeEventListener(
        'touchmove',
        this._persistentTouchmoveListener,
        activeCapturingEventOptions,
      );
    }
  }

  /**
   * Starts the dragging sequence for a drag instance.
   * @param drag Drag instance which is being dragged.
   * @param event Event that initiated the dragging.
   */
  startDragging(drag: DragRef, event: TouchEvent | MouseEvent) {
    // Do not process the same drag twice to avoid memory leaks and redundant listeners
    if (this._activeDragInstances().indexOf(drag) > -1) {
      return;
    }

    this._styleLoader.load(_ResetsLoader);
    this._activeDragInstances.update(instances => [...instances, drag]);

    if (this._activeDragInstances().length === 1) {
      // We explicitly bind __active__ listeners here, because newer browsers will default to
      // passive ones for `mousemove` and `touchmove`. The events need to be active, because we
      // use `preventDefault` to prevent the page from scrolling while the user is dragging.
      const isTouchEvent = event.type.startsWith('touch');
      const endEventHandler = {
        handler: (e: Event) => this.pointerUp.next(e as TouchEvent | MouseEvent),
        options: true,
      };

      if (isTouchEvent) {
        this._globalListeners.set('touchend', endEventHandler);
        this._globalListeners.set('touchcancel', endEventHandler);
      } else {
        this._globalListeners.set('mouseup', endEventHandler);
      }

      this._globalListeners
        .set('scroll', {
          handler: (e: Event) => this.scroll.next(e),
          // Use capturing so that we pick up scroll changes in any scrollable nodes that aren't
          // the document. See https://github.com/angular/components/issues/17144.
          options: true,
        })
        // Preventing the default action on `mousemove` isn't enough to disable text selection
        // on Safari so we need to prevent the selection event as well. Alternatively this can
        // be done by setting `user-select: none` on the `body`, however it has causes a style
        // recalculation which can be expensive on pages with a lot of elements.
        .set('selectstart', {
          handler: this._preventDefaultWhileDragging,
          options: activeCapturingEventOptions,
        });

      // We don't have to bind a move event for touch drag sequences, because
      // we already have a persistent global one bound from `registerDragItem`.
      if (!isTouchEvent) {
        this._globalListeners.set('mousemove', {
          handler: (e: Event) => this.pointerMove.next(e as MouseEvent),
          options: activeCapturingEventOptions,
        });
      }

      this._ngZone.runOutsideAngular(() => {
        this._globalListeners.forEach((config, name) => {
          this._document.addEventListener(name, config.handler, config.options);
        });
      });
    }
  }

  /** Stops dragging a drag item instance. */
  stopDragging(drag: DragRef) {
    this._activeDragInstances.update(instances => {
      const index = instances.indexOf(drag);
      if (index > -1) {
        instances.splice(index, 1);
        return [...instances];
      }
      return instances;
    });

    if (this._activeDragInstances().length === 0) {
      this._clearGlobalListeners();
    }
  }

  /** Gets whether a drag item instance is currently being dragged. */
  isDragging(drag: DragRef) {
    return this._activeDragInstances().indexOf(drag) > -1;
  }

  /**
   * Gets a stream that will emit when any element on the page is scrolled while an item is being
   * dragged.
   * @param shadowRoot Optional shadow root that the current dragging sequence started from.
   *   Top-level listeners won't pick up events coming from the shadow DOM so this parameter can
   *   be used to include an additional top-level listener at the shadow root level.
   */
  scrolled(shadowRoot?: DocumentOrShadowRoot | null): Observable<Event> {
    const streams: Observable<Event>[] = [this.scroll];

    if (shadowRoot && shadowRoot !== this._document) {
      // Note that this is basically the same as `fromEvent` from rxjs, but we do it ourselves,
      // because we want to guarantee that the event is bound outside of the `NgZone`. With
      // `fromEvent` it'll only happen if the subscription is outside the `NgZone`.
      streams.push(
        new Observable((observer: Observer<Event>) => {
          return this._ngZone.runOutsideAngular(() => {
            const eventOptions = true;
            const callback = (event: Event) => {
              if (this._activeDragInstances().length) {
                observer.next(event);
              }
            };

            (shadowRoot as ShadowRoot).addEventListener('scroll', callback, eventOptions);

            return () => {
              (shadowRoot as ShadowRoot).removeEventListener('scroll', callback, eventOptions);
            };
          });
        }),
      );
    }

    return merge(...streams);
  }

  /**
   * Tracks the DOM node which has a draggable directive.
   * @param node Node to track.
   * @param dragRef Drag directive set on the node.
   */
  registerDirectiveNode(node: Node, dragRef: CdkDrag): void {
    this._domNodesToDirectives ??= new WeakMap();
    this._domNodesToDirectives.set(node, dragRef);
  }

  /**
   * Stops tracking a draggable directive node.
   * @param node Node to stop tracking.
   */
  removeDirectiveNode(node: Node): void {
    this._domNodesToDirectives?.delete(node);
  }

  /**
   * Gets the drag directive corresponding to a specific DOM node, if any.
   * @param node Node for which to do the lookup.
   */
  getDragDirectiveForNode(node: Node): CdkDrag | null {
    return this._domNodesToDirectives?.get(node) || null;
  }

  ngOnDestroy() {
    this._dragInstances.forEach(instance => this.removeDragItem(instance));
    this._dropInstances.forEach(instance => this.removeDropContainer(instance));
    this._domNodesToDirectives = null;
    this._clearGlobalListeners();
    this.pointerMove.complete();
    this.pointerUp.complete();
  }

  /**
   * Event listener that will prevent the default browser action while the user is dragging.
   * @param event Event whose default action should be prevented.
   */
  private _preventDefaultWhileDragging = (event: Event) => {
    if (this._activeDragInstances().length > 0) {
      event.preventDefault();
    }
  };

  /** Event listener for `touchmove` that is bound even if no dragging is happening. */
  private _persistentTouchmoveListener = (event: TouchEvent) => {
    if (this._activeDragInstances().length > 0) {
      // Note that we only want to prevent the default action after dragging has actually started.
      // Usually this is the same time at which the item is added to the `_activeDragInstances`,
      // but it could be pushed back if the user has set up a drag delay or threshold.
      if (this._activeDragInstances().some(this._draggingPredicate)) {
        event.preventDefault();
      }

      this.pointerMove.next(event);
    }
  };

  /** Clears out the global event listeners from the `document`. */
  private _clearGlobalListeners() {
    this._globalListeners.forEach((config, name) => {
      this._document.removeEventListener(name, config.handler, config.options);
    });

    this._globalListeners.clear();
  }
}
