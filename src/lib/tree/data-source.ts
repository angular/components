import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {SelectionModel} from '../core';
import {FlatNode, NestedNode} from './tree-node';



function expandFlattenedNodes(nodes: FlatNode[],
  expansionModel: SelectionModel<any>): FlatNode[] {
  let results: FlatNode[] = [];
  let currentExpand: boolean[] = [];
  currentExpand[0] = true;

  nodes.forEach((node, index) => {
    let expand = true;
    for (let i = 0; i <= node.level; i++) {
      expand = expand && currentExpand[i];
    }
    if (expand) {
      results.push(node);
    }
    if (node.expandable) {
      currentExpand[node.level + 1] = expansionModel.isSelected(node);
    }
  });
  return results;
}

export function nodeDecedents(node: FlatNode, nodes: FlatNode[], onlyExpandable: boolean = true) {
  let results: FlatNode[] = [];
  let startIndex = nodes.indexOf(node);
  if (startIndex < 0) { return results; }
  for (let i = startIndex; i < nodes.length && nodes[i].level > node.level; ++i) {
    if (!onlyExpandable || nodes[i].expandable) {
      results.push(nodes[i]);
    }
  }
  return results;
}

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

export interface TreeControl {

  /** Expansion info: the changes */
  expandChange: BehaviorSubject<any>;

  getDecedents(node: any);

  expand(node: any);

  collapse(node: any);

  expandAll();

  collapseAll();

  toggleDecedents(node: any);

  expandDecedents(node: any);

  collapseDecedents(node: any);
}


export class FlatTreeControl<T extends FlatNode> implements TreeControl {
  flatNodes: T[];

  /** Expansion info: the changes */
  expandChange = new BehaviorSubject<T[]>([]);

  /** Expansion Statues */
  set expansionModel(model: SelectionModel<T>) {
    this._expansionModel.onChange.unsubscribe();
    this._expansionModel = model;
    this._expansionModel.onChange.subscribe((_) => this.expandChange.next(this.expansionModel.selected));
  }
  get expansionModel() {
    return this._expansionModel;
  }
  _expansionModel = new SelectionModel<T>(true);

  /** Expansion info: the model */
  constructor() {
    this._expansionModel.onChange.subscribe((_) =>
      this.expandChange.next(this.expansionModel.selected));
  }

  expand(node: T) {
    this.expansionModel.select(node);
  }

  collapse(node: T) {
    this.expansionModel.deselect(node);
  }

  expandAll() {
    this.expansionModel.clear();
    this.flatNodes.forEach((node) => {
      node.expandable && this.expansionModel.select(node);
    });
  }

  collapseAll() {
    this.expansionModel.clear();
  }

  getDecedents(node: T) {
    let startIndex = this.flatNodes.indexOf(node);
    let results = [];
    let i = startIndex + 1
    for (; i < this.flatNodes.length && node.level < this.flatNodes[i].level; i++) {
      results.push(this.flatNodes[i]);
    }
    return results;
  }

  expandDecedents(node: T) {
    let decedents = this.getDecedents(node);
    decedents.forEach((child) => child.expandable && this.expansionModel.select(child));
  }

  collapseDecedents(node: T) {
    let decedents = this.getDecedents(node);
    decedents.forEach((child) => this.expansionModel.deselect(child));
  }

  toggleDecedents(node: T) {
    let expand = this.expansionModel.isSelected(node);
    expand ? this.expandDecedents(node) : this.collapseDecedents(node);
  }
}

export class NestedTreeControl<T extends NestedNode> implements TreeControl {
  nestedNodes: T[];

  /** Expansion info: the changes */
  expandChange = new BehaviorSubject<T[]>([]);

  /** Expansion Statues */
  set expansionModel(model: SelectionModel<T>) {
    this._expansionModel.onChange.unsubscribe();
    this._expansionModel = model;
    this._expansionModel.onChange.subscribe((_) => this.expandChange.next(this.expansionModel.selected));
  }
  get expansionModel() {
    return this._expansionModel;
  }
  _expansionModel = new SelectionModel<T>(true);

  /** Expansion info: the model */
  constructor() {
    this._expansionModel.onChange.subscribe((_) =>
      this.expandChange.next(this.expansionModel.selected));
  }

  expand(node: T) {
    this.expansionModel.select(node);
  }

  collapse(node: T) {
    this.expansionModel.deselect(node);
  }

  expandAll() {
    this.expansionModel.clear();
    this.nestedNodes.forEach((node) => {
      this.expansionModel.select(node);
    });
  }

  collapseAll() {
    this.expansionModel.clear();
  }

  getDecedents(node: T) {
    return [];
  }

  expandDecedents(node: T) {
  }

  collapseDecedents(node: T) {
  }

  toggleDecedents(node: T) {
  }
}

// export class TreeControl<T extends (FlatNode|NestedNode)> {
//
//   getChildrenFunc: (node: T) => T[];
//
//   flatNodes: T[];
//   nestedNodes: T[];
//
//   /** Level info */
//   levelMap: WeakMap<T, number> = new WeakMap<T, number>();
//
//   /** Parent info */
//   parentMap: WeakMap<T, T> = new WeakMap<T, T>();
//
//   /** Index info (for flatten version) */
//   indexMap: WeakMap<T, number> = new WeakMap<T, number>();
//
//   /** Parent bit information: to draw dotted lines of tree structure */
//   parentBitLevels: WeakMap<T, number[]> = new WeakMap<T, number[]>();
//
//   decedentsMap: WeakMap<T, T[]> = new WeakMap<T, T[]>();
//
//   /** Expansion info: the changes */
//   expandChange = new BehaviorSubject<T[]>([]);
//
//   set expansionModel(model: SelectionModel<T>) {
//     this._expansionModel.onChange.unsubscribe();
//     this._expansionModel = model;
//     this._expansionModel.onChange.subscribe((_) => this.expandChange.next(this.expansionModel.selected));
//   }
//   get expansionModel() {
//     return this._expansionModel;
//   }
//   _expansionModel = new SelectionModel<T>(true);
//
//   /** Expansion info: the model */
//   constructor() {
//     this._expansionModel.onChange.subscribe((_) =>
//       this.expandChange.next(this.expansionModel.selected));
//   }
//
//   getLevel(node: T) {
//     return this.levelMap.get(node);
//   }
//
//   getParent(node: T) {
//     return this.parentMap.get(node);
//   }
//
//   getIndex(node: T) {
//     return this.indexMap.get(node);
//   }
//
//   initialize() {
//     this.flatNodes = [];
//     this.levelMap = new WeakMap<T, number>();
//     this.parentMap = new WeakMap<T, T>();
//     this.indexMap = new WeakMap<T, number>();
//     this.parentBitLevels = new WeakMap<T, number[]>();
//     this.decedentsMap = new WeakMap<T, T[]>();
//   }
//
//   expanded(node: any) {
//     return this.expansionModel.isSelected(node);
//   }
//
//   expandAll() {
//     this.expansionModel.clear();
//     // flat tree
//     this.flatNodes.forEach((node) => {
//       if ('expandable' in node) {
//         if (node.expandable) {
//           this.expansionModel.select(node);
//         }
//       }
//     });
//
//     // Nested tree
//     this.nestedNodes.forEach((node) => {
//       this.toggleRecursive(node, true, this.expansionModel);
//     });
//   }
//
//   toggleRecursive(node: any, expand: boolean, selection: SelectionModel<any>) {
//     // flat
//     let startIndex = this.flatNodes.indexOf(node);
//     for (let i = startIndex; i < this.flatNodes.length && this.flatNodes[i].level > node.level; i++) {
//       expand ? selection.select(this.flatNodes[i]) : selection.deselect(this.flatNodes[i]);
//     }
//
//     // nested tree
//     this.nestedNodes.forEach((child) => this._toggleNestedNodes(child, expand, selection));
//   }
//
//   _toggleNestedNodes(node: any, expand: boolean, selection: SelectionModel<any>) {
//     node.getChildren().subscribe((children) => {
//       if (!!children) {
//         expand ? selection.select(node) : selection.deselect(node);
//         children.forEach((child) => {
//           children.forEach((child) => {
//             this._toggleNestedNodes(child, expand, selection);
//           });
//         });
//       } else {
//         selection.deselect(node);
//       }
//     });
//   }
//
//   collapseAll() {
//     this.expansionModel.clear();
//   }
// }
