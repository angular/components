/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getSystemPath} from '@angular-devkit/core';
import {HostDirEntry, HostTree, Tree} from '@angular-devkit/schematics';

/**
 * Gets the workspace file system path from the given tree. Returns
 * `null` if the path could not be determined.
 */
// TODO: Remove this once we have a fully virtual TypeScript compiler host: COMP-387
export function getWorkspaceFileSystemPath(tree: Tree): string|null {
  if (!(tree.root instanceof HostDirEntry)) {
    return null;
  }
  const hostTree = tree.root['_tree'];
  if (!(hostTree instanceof HostTree) || hostTree['_backend'] === undefined) {
    return null;
  }
  const backend = hostTree['_backend'];
  if (backend['_root'] !== undefined) {
    return getSystemPath(backend['_root']);
  }
  return null;
}
