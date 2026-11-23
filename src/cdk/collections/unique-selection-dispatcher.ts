/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Service, OnDestroy} from '@angular/core';

// Users of the Dispatcher never need to see this type, but TypeScript requires it to be exported.
export type UniqueSelectionDispatcherListener = (id: string, name: string) => void;

/**
 * Class to coordinate unique selection based on name.
 * Intended to be consumed as an Angular service.
 * This service is needed because native radio change events are only fired on the item currently
 * being selected, and we still need to uncheck the previous selection.
 *
 * This service does not *store* any IDs and names because they may change at any time, so it is
 * less error-prone if they are simply passed through when the events occur.
 */
@Service()
export class UniqueSelectionDispatcher implements OnDestroy {
  private _listeners: {
    listener: UniqueSelectionDispatcherListener;
    acceptsScope?: (scope: object) => boolean;
  }[] = [];

  /**
   * Notify other items that selection for the given name has been set.
   * @param id ID of the item.
   * @param name Name of the item.
   * @param scope Optional group owner. Omitting it notifies every listener.
   */
  notify(id: string, name: string, scope?: object): void {
    for (const {listener, acceptsScope} of this._listeners) {
      if (scope === undefined || !acceptsScope || acceptsScope(scope)) {
        listener(id, name);
      }
    }
  }

  /**
   * Listen for future changes to item selection.
   * @param listener Callback receiving the selected item's ID and name.
   * @param acceptsScope Optional filter for scoped notifications. Unscoped notifications always pass.
   * @return Function used to deregister listener
   */
  listen(
    listener: UniqueSelectionDispatcherListener,
    acceptsScope?: (scope: object) => boolean,
  ): () => void {
    this._listeners.push({listener, acceptsScope});
    return () => {
      this._listeners = this._listeners.filter(
        registered => registered.listener !== listener || registered.acceptsScope !== acceptsScope,
      );
    };
  }

  ngOnDestroy() {
    this._listeners = [];
  }
}
