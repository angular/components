/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Signal} from '@angular/core';
import type {ListTypeaheadController} from './controller';
import {ListNavigationItem, ListNavigation} from '../list-navigation/list-navigation';

/** The required properties for typeahead items. */
export interface ListTypeaheadItem extends ListNavigationItem {
  /** The text used by the typeahead search. */
  searchTerm: Signal<string>;
}

/** The required inputs for list typeahead. */
export interface ListTypeaheadInputs {
  /** The amount of time before the typeahead search is reset. */
  typeaheadDelay: Signal<number>;
}

/** Controls typeahead for a list of items. */
export class ListTypeahead<T extends ListTypeaheadItem> {
  /** The navigation controller of the parent list. */
  navigation: ListNavigation<T>;

  get controller(): Promise<ListTypeaheadController<T>> {
    if (this._controller === null) {
      return this.loadController();
    }
    return Promise.resolve(this._controller);
  }
  private _controller: ListTypeaheadController<T> | null = null;

  constructor(readonly inputs: ListTypeaheadInputs & {navigation: ListNavigation<T>}) {
    this.navigation = inputs.navigation;
  }

  /** Loads the controller for list typeahead. */
  async loadController(): Promise<ListTypeaheadController<T>> {
    return import('./controller').then(m => {
      this._controller = new m.ListTypeaheadController(this);
      return this._controller;
    });
  }

  /** Performs a typeahead search, appending the given character to the search string. */
  async search(char: string) {
    return (await this.controller).search(char);
  }
}
