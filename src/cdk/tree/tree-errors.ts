/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Returns an error to be thrown when there is no usable data.
 * @docs-private
 */
export function getTreeNoValidDataSourceError() {
  return Error(`A valid data source must be provided.`);
}

/**
 * Returns an error to be thrown when there are multiple nodes that are missing a when function.
 * @docs-private
 */
export function getTreeMultipleDefaultNodeDefsError() {
  return Error(`There can only be one default row without a when predicate function.`);
}

/**
 * Returns an error to be thrown when there are no matching node defs for a particular set of data.
 * @docs-private
 */
export function getTreeMissingMatchingNodeDefError() {
  return Error(`Could not find a matching node definition for the provided node data.`);
}

/**
 * Returns an error to be thrown when there is no tree control.
 * @docs-private
 */
export function getTreeControlMissingError() {
  return Error(`Could not find a tree control, levelAccessor, or childrenAccessor for the tree.`);
}

/**
 * Returns an error to be thrown when there are multiple ways of specifying children or level
 * provided to the tree.
 * @docs-private
 */
export function getMultipleTreeControlsError() {
  return Error(`More than one of tree control, levelAccessor, or childrenAccessor were provided.`);
}

/**
 * Returns an error to be thrown when a node is attempted to be expanded or collapsed when
 * it's not expandable.
 * @docs-private
 */
export function getNodeNotExpandableError() {
  return Error(
    `The node that was attempted to be expanded or collapsed is not expandable; you might ` +
      `need to provide 'isExpandable'.`,
  );
}
