/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Provider} from '@angular/core';
import {Subject} from 'rxjs';
import {TREE_KEY_MANAGER} from './tree-key-manager';
import {
  TreeKeyManagerFactory,
  TreeKeyManagerItem,
  TreeKeyManagerStrategy,
} from './tree-key-manager-strategy';

// NoopTreeKeyManager is a "noop" implementation of TreeKeyMangerStrategy. Methods are noops. Does
// not emit to streams.
//
// Used for applications built before TreeKeyManager to opt-out of TreeKeyManager and revert to
// legacy behavior.
/**
 * @nodoc
 *
 * Opt-out of Tree of key manager behavior.
 *
 * When provided, Tree has same focus management behavior as before TreeKeyManager was introduced.
 *  - Tree does not respond to keyboard interaction
 *  - Tree node allows tabindex to be set by Input binding
 *  - Tree node allows tabindex to be set by attribute binding
 *
 * @deprecated NoopTreeKeyManager deprecated. Use TreeKeyManager or inject a
 * TreeKeyManagerStrategy instead. To be removed in a future version.
 *
 * @breaking-change 21.0.0
 */
export class NoopTreeKeyManager<T extends TreeKeyManagerItem> implements TreeKeyManagerStrategy<T> {
  readonly _isNoopTreeKeyManager = true;

  // Provide change as required by TreeKeyManagerStrategy. NoopTreeKeyManager is a "noop"
  // implementation that does not emit to streams.
  readonly change = new Subject<T | null>();

  destroy() {
    this.change.complete();
  }

  onKeydown() {
    // noop
  }

  getActiveItemIndex() {
    // Always return null. NoopTreeKeyManager is a "noop" implementation that does not maintain
    // the active item.
    return null;
  }

  getActiveItem() {
    // Always return null. NoopTreeKeyManager is a "noop" implementation that does not maintain
    // the active item.
    return null;
  }

  focusItem() {
    // noop
  }
}

/**
 * @nodoc
 *
 * Opt-out of Tree of key manager behavior.
 *
 * When provided, Tree has same focus management behavior as before TreeKeyManager was introduced.
 *  - Tree does not respond to keyboard interaction
 *  - Tree node allows tabindex to be set by Input binding
 *  - Tree node allows tabindex to be set by attribute binding
 *
 * @deprecated NoopTreeKeyManager deprecated. Use TreeKeyManager or inject a
 * TreeKeyManagerStrategy instead. To be removed in a future version.
 *
 * @breaking-change 21.0.0
 */
export function NOOP_TREE_KEY_MANAGER_FACTORY<
  T extends TreeKeyManagerItem,
>(): TreeKeyManagerFactory<T> {
  return () => new NoopTreeKeyManager<T>();
}

/**
 * @nodoc
 *
 * Opt-out of Tree of key manager behavior.
 *
 * When provided, Tree has same focus management behavior as before TreeKeyManager was introduced.
 *  - Tree does not respond to keyboard interaction
 *  - Tree node allows tabindex to be set by Input binding
 *  - Tree node allows tabindex to be set by attribute binding
 *
 * @deprecated NoopTreeKeyManager deprecated. Use TreeKeyManager or inject a
 * TreeKeyManagerStrategy instead. To be removed in a future version.
 *
 * @breaking-change 21.0.0
 */
export const NOOP_TREE_KEY_MANAGER_FACTORY_PROVIDER: Provider = {
  provide: TREE_KEY_MANAGER,
  useFactory: NOOP_TREE_KEY_MANAGER_FACTORY,
};
