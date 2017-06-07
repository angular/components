import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {SelectionModel} from '../core';

export interface CollectionViewer {
  viewChanged: Observable<{start: number, end: number}>;
}

export interface CdkTreeContext {
  $implicit: any;
  level: number;
  expandable: boolean;
}

export interface TreeDataSource<T extends Object> {
  /** Connect the data source with the tree component */
  connect(collectionViewer: CollectionViewer): Observable<T[]>;

  /** Get the observable children */
  getChildren(node: T): Observable<T[]>;

  getChildrenFunc(node: T): T[];
}

export class TreeControl<T extends Object> {

  flatNodes: T[];

  /** Level info */
  levelMap: WeakMap<T, number> = new WeakMap<T, number>();

  /** Parent info */
  parentMap: WeakMap<T, T> = new WeakMap<T, T>();

  /** Index info (for flatten version) */
  indexMap: WeakMap<T, number> = new WeakMap<T, number>();

  /** Parent bit information: to draw dotted lines of tree structure */
  parentBitLevels: WeakMap<T, number[]> = new WeakMap<T, number[]>();

  /** Expansion info: the changes */
  expandChange = new BehaviorSubject<T[]>([]);

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
    this.expandChange.next([]);
  }

  getLevel(node: T) {
    return this.levelMap.get(node);
  }

  getParent(node: T) {
    return this.parentMap.get(node);
  }

  getIndex(node: T) {
    return this.indexMap.get(node);
  }

  initialize() {
    this.flatNodes = [];
    this.levelMap = new WeakMap<T, number>();
    this.parentMap = new WeakMap<T, T>();
    this.indexMap = new WeakMap<T, number>();
    this.parentBitLevels = new WeakMap<T, number[]>();
  }

  expanded(node: any) {
    return this.expansionModel.isSelected(node);
  }

  // toggleAll(expand: boolean, node?: any, recursive: boolean = true) {
  //   if (node) {
  //     let children = this.dataSource.getChildren(node);
  //     expand
  //       ? this.expansionModel.select(node)
  //       : this.expansionModel.deselect(node);
  //     if (!!children && recursive) {
  //       children.forEach((child) => this.toggleAll(expand, child, recursive));
  //     }
  //   } else {
  //
  //     this.dataNodes.forEach((node) => {
  //       this.toggleAll(expand, node, recursive)
  //     });
  //   }
  // }
  //
  // toggleExpand(node: any, recursive: boolean = true) {
  //   this.expansionModel.toggle(node);
  //   let expand = this.expansionModel.isSelected(node);
  //   let children = this.dataSource.getChildren(node);
  //   if (recursive && children) {
  //     children.forEach((child) => this.toggleAll(expand, child, recursive));
  //   }
  // }
}

export class TreeAdapter<T extends Object> {
  getChildrenFunc: (node: T) => T[];

  constructor(public treeControl: TreeControl<T>) {}

  flattenNodes(getChildrenFunc: (node: T) => T[], structuredData: Observable<T[]>): Observable<T[]> {
    this.getChildrenFunc = getChildrenFunc;
    return structuredData.map((nodes: T[]) => {

      console.log(`start with structure data`);
      this.treeControl.initialize();
      nodes.forEach((node) => {
        console.log(`flatten node ${node}`)
        this._flattenNode(node, 0);
      });
      return this.treeControl.flatNodes;
    });
  }

  _flattenNode(node: T, level: number) {
    let children = this.getChildrenFunc(node);
    let expanded = this.treeControl.expansionModel.isSelected(node);
    this.treeControl.levelMap.set(node, level);
    this.treeControl.indexMap.set(node, this.treeControl.flatNodes.length);
    this.treeControl.flatNodes.push(node);

    console.log(`has children ${!!children} expanded ${expanded}`)
    if (!!children && expanded) {
      children.forEach((child, index) => {
        this.treeControl.parentMap.set(child, node);
        this._flattenNode(child, level + 1);

        let levels = this.treeControl.parentBitLevels.get(node)|| [];
        if (index != children.length - 1) {
          levels.push(level);
        }
        this.treeControl.parentBitLevels.set(child, levels);
      });
    }
  }
}
