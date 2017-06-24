import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {QueryList} from '@angular/core';
import {SelectionModel} from '../core';
import {FlatNode, NestedNode} from './tree-node';

/**
 * Tree control interface
 */
export interface TreeControl {
  nodes: any[];
  /** The expansion change event */
  expandChange: BehaviorSubject<any>;

  /** Get all decedents of a node */
  getDecedents(node: any);

  /** Expand one node */
  expand(node: any);

  /** Collapse one node */
  collapse(node: any);

  /** Expand all the nodes in the tree */
  expandAll();

  /** Collapse all the nodes in the tree */
  collapseAll();

  /** Toggle a node by expand/collapse it and all its decedents */
  toggleDecedents(node: any);

  /** Expand a node and all its decedents */
  expandDecedents(node: any);

  /** Collapse a ndoe and all its decedents */
  collapseDecedents(node: any);

  expanded(node: any);
}


export class FlatTreeControl<T extends FlatNode> implements TreeControl {
  nodes: T[];

  /** Expansion info: the changes */
  expandChange = new BehaviorSubject<T[]>([]);

  /** Expansion Statues */
  set expansionModel(model: SelectionModel<T>) {
    this._expansionModel = model;
  }
  _expansionModel = new SelectionModel<T>(true);

  toggle(node: T) {
    this._expansionModel.toggle(node);
    this.expandChange.next(this._expansionModel.selected);
  }

  expand(node: T) {
    this._expansionModel.select(node);
    this.expandChange.next(this._expansionModel.selected);
  }

  collapse(node: T) {
    this._expansionModel.deselect(node);
    this.expandChange.next(this._expansionModel.selected);
  }

  expanded(node: any) {
    return this._expansionModel.isSelected(node);
  }

  expandAll() {
    this._expansionModel.clear();
    this.nodes.forEach((node) => {
      node.expandable && this._expansionModel.select(node);
    });
    this.expandChange.next(this._expansionModel.selected);
  }

  collapseAll() {
    this._expansionModel.clear();
    this.expandChange.next(this._expansionModel.selected);
  }

  getDecedents(node: T) {
    let startIndex = this.nodes.indexOf(node);
    let results: T[] = [];
    let i = startIndex + 1;
    for (; i < this.nodes.length && node.level < this.nodes[i].level; i++) {
      results.push(this.nodes[i]);
    }
    return results;
  }

  expandDecedents(node: T) {
    let decedents = this.getDecedents(node);
    decedents.forEach((child) => child.expandable && this._expansionModel.select(child));
    this.expandChange.next(this._expansionModel.selected);
  }

  collapseDecedents(node: T) {
    let decedents = this.getDecedents(node);
    decedents.forEach((child) => this._expansionModel.deselect(child));
    this.expandChange.next(this._expansionModel.selected);
  }

  toggleDecedents(node: T) {
    this._expansionModel.toggle(node);
    let expand = this._expansionModel.isSelected(node);
    expand ? this.expandDecedents(node) : this.collapseDecedents(node);
  }
}

export class NestedTreeControl<T extends NestedNode> implements TreeControl {
  nodes: T[];

  /** Expansion info: the changes */
  expandChange = new BehaviorSubject<T[]>([]);

  /** Expansion Statues */
  set expansionModel(model: SelectionModel<T>) {
    if (this._expansionModel != null && this._expansionModel.onChange != null) {
      this._expansionModel.onChange.unsubscribe();
      this._expansionModel = model;
    }
    if ( this._expansionModel != null && this._expansionModel.onChange != null) {
      this._expansionModel.onChange.subscribe((_) => this.expandChange.next(this.expansionModel.selected));
    }
  }
  get expansionModel(): SelectionModel<T> {
    return this._expansionModel;
  }
  _expansionModel: SelectionModel<T> = new SelectionModel<T>(true);

  /** Expansion info: the model */
  constructor() {
    if (this._expansionModel != null && this._expansionModel.onChange != null) {
      this._expansionModel.onChange.subscribe((_) =>
        this.expandChange.next(this.expansionModel.selected));
    }
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
    this.nodes.forEach((node) => {
      this.expansionModel.select(node);
    });
  }

  collapseAll() {
    this.expansionModel.clear();
  }

  getDecedents(node: T) {
    let decedents = [];
    this._getDecedents(decedents, node);
    return decedents;
  }

  _getDecedents(decedents: T[], node: T) {
    decedents.push(node);
    node.getChildren().subscribe((children: T[]) => {
      if (children) {
        children.forEach((child) => {
          this._getDecedents(decedents, child);
        });
      }
    })
  }

  expandDecedents(node: T) {
    this.expansionModel.select(node);
    node.getChildren().subscribe((children: T[]) => {
      if (children) {
        children.forEach((child) => {
          this.expandDecedents(child)
        });
      }
    });
  }

  collapseDecedents(node: T) {
    this.expansionModel.deselect(node);
    node.getChildren().subscribe((children: T[]) => {
      if (children) {
        children.forEach((child) => {
          this.collapseDecedents(child)
        });
      }
    });
  }

  toggleDecedents(node: T) {
    this.expansionModel.toggle(node);
    let expand = this.expansionModel.isSelected(node);
    node.getChildren().subscribe((children: T[]) => {
      if (children) {
        children.forEach((child) => {
          expand ? this.expandDecedents(child) : this.collapseDecedents(child);
        });
      }
    });
  }
}
