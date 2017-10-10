/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SelectionModel} from './selection';


export interface TreeAdapter<T> {
  flattenNodes( structuredData: any[]): T[];

  expandFlattenedNodes(nodes: T[], expansionModel: SelectionModel<T>): T[];

  nodeDecedents(node: T, nodes: T[], onlyExpandable: boolean);
}
