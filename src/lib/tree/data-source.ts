import {Observable} from 'rxjs/Observable';
import {SelectionModel} from '../core';
import {FlatNode, NestedNode} from './tree-node';

export interface TreeAdapter {
  flattenNodes( structuredData: any[]): FlatNode[];

  expandFlattenedNodes(nodes: FlatNode[], expansionModel: SelectionModel<FlatNode>): FlatNode[];

  nodeDecedents(node: FlatNode, nodes: FlatNode[], onlyExpandable: boolean);
}


export interface CollectionViewer {
  viewChanged: Observable<{start: number, end: number}>;
}

export interface TreeDataSource<T extends Object> {
  /** Connect the data source with the tree component */
  connect(collectionViewer: CollectionViewer): Observable<FlatNode[] | NestedNode[]>;
}

