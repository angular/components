/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, Signal, WritableSignal} from '@angular/core';
import type {ListNavigationController} from './controller';

/** The required properties for navigation items. */
export interface ListNavigationItem {
  /** Whether an item is disabled. */
  disabled: Signal<boolean>;
}

/** The required inputs for list navigation. */
export interface ListNavigationInputs<T extends ListNavigationItem> {
  /** Whether focus should wrap when navigating. */
  wrap: Signal<boolean>;

  /** The items in the list. */
  items: Signal<T[]>;

  /** Whether disabled items in the list should be skipped when navigating. */
  skipDisabled: Signal<boolean>;

  /** The current index that has been navigated to. */
  activeIndex: WritableSignal<number>;

  /** Whether the list is vertically or horizontally oriented. */
  orientation: Signal<'vertical' | 'horizontal'>;

  /** The direction that text is read based on the users locale. */
  directionality: Signal<'rtl' | 'ltr'>;
}

/** Controls navigation for a list of items. */
export class ListNavigation<T extends ListNavigationItem> {
  /** The last index that was active. */
  prevActiveIndex = signal(0);

  get controller(): Promise<ListNavigationController<T>> {
    if (this._controller === null) {
      return this.loadController();
    }
    return Promise.resolve(this._controller);
  }
  private _controller: ListNavigationController<T> | null = null;

  constructor(readonly inputs: ListNavigationInputs<T>) {
    this.prevActiveIndex.set(inputs.activeIndex());
  }

  /** Loads the controller for list navigation. */
  async loadController(): Promise<ListNavigationController<T>> {
    return import('./controller').then(m => {
      this._controller = new m.ListNavigationController(this);
      return this._controller;
    });
  }

  /** Navigates to the given item. */
  async goto(item: T) {
    return (await this.controller).goto(item);
  }

  /** Navigates to the next item in the list. */
  async next() {
    return (await this.controller).next();
  }

  /** Navigates to the previous item in the list. */
  async prev() {
    return (await this.controller).prev();
  }

  /** Navigates to the first item in the list. */
  async first() {
    return (await this.controller).first();
  }

  /** Navigates to the last item in the list. */
  async last() {
    return (await this.controller).last();
  }

  /** Returns true if the given item can be navigated to. */
  async isFocusable(item: T) {
    return (await this.controller).isFocusable(item);
  }
}
