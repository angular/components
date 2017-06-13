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

  toggle(node: T) {
    this.expansionModel.toggle(node);
  }

  expand(node: T) {
    this.expansionModel.select(node);
  }

  collapse(node: T) {
    this.expansionModel.deselect(node);
  }

  expanded(node: any) {
    return this.expansionModel.isSelected(node);
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

  toggle(node: T) {
    this.expansionModel.toggle(node);
  }

  expand(node: T) {
    this.expansionModel.select(node);
  }

  collapse(node: T) {
    this.expansionModel.deselect(node);
  }

  expanded(node: any) {
    return this.expansionModel.isSelected(node);
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
    this.expansionModel.select(node);
    let subscription = node.getChildren().subscribe((children: T[]) => {
      if (children) {
        children.forEach((child) => this.expandDecedents(child));
      }
    });
    subscription.unsubscribe();
  }

  collapseDecedents(node: T) {
    this.expansionModel.deselect(node);
    let subscription = node.getChildren().subscribe((children: T[]) => {
      if (children) {
        children.forEach((child) => this.collapseDecedents(child));
      }
    });
    subscription.unsubscribe();
  }

  toggleDecedents(node: T) {
    this.expansionModel.toggle(node);
    let expand = this.expansionModel.isSelected(node);
    let subscription = node.getChildren().subscribe((children: T[]) => {
      console.log(`children ${children}`);
      if (children) {
        children.forEach((child) =>
          expand ? this.expandDecedents(child) : this.collapseDecedents(child));
      }
    });
    subscription.unsubscribe();
  }
}
