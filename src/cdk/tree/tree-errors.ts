/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Returns an error to be thrown when there are multiple nodes that are missing a when function.
 * @docs-private
 */
export function getTreeMultipleDefaultNodeDefsError() {
  return Error(`cdk-tree: There can only be one default row without a when predicate function.`);
}

/**
 * Returns an error to be thrown when there are no matching node defs for a particular set of data.
 * @docs-private
 */
export function getTreeMissingMatchingNodeDefError() {
  return Error(`cdk-tree: Could not find a matching node definition for the provided node data.`);
}
