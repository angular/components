/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs';
import {
  TREE_KEY_MANAGER,
  TreeKeyManagerFactory,
  TreeKeyManagerItem,
  TreeKeyManagerStrategy,
} from './tree-key-manager';

/**
 * @docs-private
 *
 * @deprecated LegacyTreeKeyManager deprecated. Use TreeKeyManager or inject a
 * TreeKeyManagerStrategy instead. To be removed in a future version.
 *
 * @breaking-change 19.0.0
 */
// LegacyTreeKeyManager is a "noop" implementation of TreeKeyMangerStrategy. Methods are noops. Does
// not emit to streams.
//
// Used for applications built before TreeKeyManager to opt-out of TreeKeyManager and revert to
// legacy behavior.
export class LegacyTreeKeyManager<T extends TreeKeyManagerItem>
  implements TreeKeyManagerStrategy<T>
{
  readonly _isLegacyTreeKeyManager = true;

  // Provide change as required by TreeKeyManagerStrategy. LegacyTreeKeyManager is a "noop"
  // implementation that does not emit to streams.
  readonly change = new Subject<T | null>();

  onKeydown() {
    // noop
  }

  getActiveItemIndex() {
    // Always return null. LegacyTreeKeyManager is a "noop" implementation that does not maintain
    // the active item.
    return null;
  }

  getActiveItem() {
    // Always return null. LegacyTreeKeyManager is a "noop" implementation that does not maintain
    // the active item.
    return null;
  }

  onInitialFocus() {
    // noop
  }

  focusItem() {
    // noop
  }
}

/**
 * @docs-private
 *
 * @deprecated LegacyTreeKeyManager deprecated. Use TreeKeyManager or inject a
 * TreeKeyManagerStrategy instead. To be removed in a future version.
 *
 * @breaking-change 19.0.0
 */
export function LEGACY_TREE_KEY_MANAGER_FACTORY<
  T extends TreeKeyManagerItem,
>(): TreeKeyManagerFactory<T> {
  return () => new LegacyTreeKeyManager<T>();
}

/**
 * @docs-private
 *
 * @deprecated LegacyTreeKeyManager deprecated. Use TreeKeyManager or inject a
 * TreeKeyManagerStrategy instead. To be removed in a future version.
 *
 * @breaking-change 19.0.0
 */
export const LEGACY_TREE_KEY_MANAGER_FACTORY_PROVIDER = {
  provide: TREE_KEY_MANAGER,
  useFactory: LEGACY_TREE_KEY_MANAGER_FACTORY,
};
