/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SelectionModel} from './selection';


/**
 * Tree Adapter to change any structured data type to flattened tree data.
 * To be implemented by tree users.
 */
export interface TreeAdapter<T> {
  /** Flatten structured data to an array of data. */
  flattenNodes(structuredData: any[]): T[];

  /** Expand flattened target nodes with expansion model. */
  expandFlattenedNodes(nodes: T[], expansionModel: SelectionModel<T>): T[];

  /**
   * Put node descendants of node in array.
   * If `onlyExpandable` is true, then only process expandable descendants.
   */
  nodeDescendents(node: T, nodes: T[], onlyExpandable: boolean);
}
