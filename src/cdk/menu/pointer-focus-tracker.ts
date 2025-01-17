/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementRef, QueryList, Renderer2} from '@angular/core';
import {Observable, Subject, Subscription} from 'rxjs';
import {startWith} from 'rxjs/operators';

/** Item to track for mouse focus events. */
export interface FocusableElement {
  /** A reference to the element to be tracked. */
  _elementRef: ElementRef<HTMLElement>;
}

/**
 * PointerFocusTracker keeps track of the currently active item under mouse focus. It also has
 * observables which emit when the users mouse enters and leaves a tracked element.
 */
export class PointerFocusTracker<T extends FocusableElement> {
  private _eventCleanups: (() => void)[] | undefined;
  private _itemsSubscription: Subscription | undefined;

  /** Emits when an element is moused into. */
  readonly entered: Observable<T> = new Subject<T>();

  /** Emits when an element is moused out. */
  readonly exited: Observable<T> = new Subject<T>();

  /** The element currently under mouse focus. */
  activeElement?: T;

  /** The element previously under mouse focus. */
  previousElement?: T;

  constructor(
    private _renderer: Renderer2,
    private readonly _items: QueryList<T>,
  ) {
    this._bindEvents();
    this.entered.subscribe(element => (this.activeElement = element));
    this.exited.subscribe(() => {
      this.previousElement = this.activeElement;
      this.activeElement = undefined;
    });
  }

  /** Stop the managers listeners. */
  destroy() {
    this._cleanupEvents();
    this._itemsSubscription?.unsubscribe();
  }

  /** Binds the enter/exit events on all the items. */
  private _bindEvents() {
    // TODO(crisbeto): this can probably be simplified by binding a single event on a parent node.
    this._itemsSubscription = this._items.changes.pipe(startWith(this._items)).subscribe(() => {
      this._cleanupEvents();
      this._eventCleanups = [];
      this._items.forEach(item => {
        const element = item._elementRef.nativeElement;
        this._eventCleanups!.push(
          this._renderer.listen(element, 'mouseenter', () => {
            (this.entered as Subject<T>).next(item);
          }),
          this._renderer.listen(element, 'mouseout', () => {
            (this.exited as Subject<T>).next(item);
          }),
        );
      });
    });
  }

  /** Cleans up the currently-bound events. */
  private _cleanupEvents() {
    this._eventCleanups?.forEach(cleanup => cleanup());
    this._eventCleanups = undefined;
  }
}
