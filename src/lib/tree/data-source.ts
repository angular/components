import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {SelectionModel} from '../core';

export interface MdTreeViewData {
  start: number;
  end: number;
}

export abstract class TreeDataSource<T> {

  levelMap: Map<T, number> = new Map<T, number>();
  parentMap: Map<T, T> = new Map<T, T>();
  indexMap: Map<T, number> = new Map<T, number>();
  expandChange = new BehaviorSubject<T[]>([]);


  abstract connectTree(viewChanged: Observable<MdTreeViewData>): Observable<T[]>;

  abstract getChildren(node: T): T[];

  constructor(public expansionModel: SelectionModel<T> = new SelectionModel<T>(true)) {
    expansionModel.onChange.subscribe((_) => this.expandChange.next(expansionModel.selected));
  };

  getLevel(node: T) {
    return this.levelMap.get(node);
  }

  getParent(node: T) {
    return this.parentMap.get(node);
  }

  getIndex(node: T) {
    return this.indexMap.get(node);
  }

  flattenNodes(structuredData: Observable<T[]>): Observable<T[]> {
    return Observable.combineLatest(structuredData, this.expandChange).map((result: any[]) => {
      let [dataNodes, selectionChange] = result;
      let flatNodes = [];
      dataNodes.forEach((node) => {
        this._flattenNode(node, 0, flatNodes);
      });
      return flatNodes;
    });
  }

  _flattenNode(node: T, level: number, flatNodes: T[]) {
    let children = this.getChildren(node);
    let selected = this.expansionModel.isSelected(node);
    this.levelMap.set(node, level);

    this.indexMap.set(node, flatNodes.length);
    flatNodes.push(node);

    if (!!children && selected) {

      children.forEach((child, index) => {
        this.parentMap.set(child, node);
        this._flattenNode(child, level + 1, flatNodes);
      });
    }
  }

  getChildrenRecursive(node: T, collection: T[]) {
    this.getChildren(node).forEach((child) => {
      collection.push(child);
      this.getChildrenRecursive(node, collection)
    });
  }
}
