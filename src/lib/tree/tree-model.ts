import {SelectionModel} from '../core/selection/selection';

import {MdTreeDataSource} from './data-source';

export class TreeData {
  children: any[]
}

export class TreeModel<T extends TreeData> {
  selectionModel: SelectionModel<T>;
  expansionModel: SelectionModel<T>;
  // Own
  nodes: T[];

  treeNodes: TreeNodeModel<T>[];

  constructor(public dataSource: MdTreeDataSource<T>,
              public isFlatTree: boolean = false,
              isMultiSelection: boolean = true,
              defaultSelectedNodes: T[] = [],
              defaultExpandedNodes: T[] = []) {
    this.selectionModel = new SelectionModel<T>(isMultiSelection, defaultSelectedNodes);
    this.expansionModel = new SelectionModel<T>(true, defaultExpandedNodes);
  }

  loadNodes() {
    this.dataSource.getNodes().subscribe(result => {
      this.nodes = result.nodes;
      this._addNodes();
    });
  }

  _addNodes() {
    this.treeNodes = [];
    for (let node of this.nodes) {
      this._addNode(node, 0, this.treeNodes);
    }
  }

  _addNode(node: T, level: number, collection: TreeNodeModel<T>[]) {
    let treeNode = new TreeNodeModel<T>(this, node, level);
    collection.push(treeNode);
    if ((treeNode.expanded && this.isFlatTree || !this.isFlatTree) && node.children) {
      for (let child of node.children) {
        this._addNode(child, level + 1,
          this.isFlatTree ? this.treeNodes : treeNode.children);
      }
    }
  }

  select(data: T) {
    this.selectionModel.toggle(data);
  }

  expand(data: T) {
    this.expansionModel.toggle(data);

    if (this.isFlatTree) {
      this._addNodes();
    }
  }

  onLoad(data: any) {
    return this.dataSource.getChildren(data).then((children) => {
      data.children = children;
      this._addNodes();
    });
  }
}

export class TreeNodeModel<T extends TreeData> {

  constructor(private treeModel: TreeModel<T>, public data: T, public level: number) {}

  loading: boolean = false;

  children: TreeNodeModel<T>[] = [];

  get expanded(): boolean {
    return this.treeModel.expansionModel.isSelected(this.data);
  }
  set expanded(value: boolean) {
    if (value != this.expanded) {
      this.expand();
    }
  }

  get selected(): boolean {
    return this.treeModel.selectionModel.isSelected(this.data);
  }
  set selected(value: boolean) {
    if (value != this.selected) {
      this.select();
    }
  }

  get expandable(): boolean {
    return this.data.children !== undefined;
  }

  select() {
    this.treeModel.select(this.data);
  }

  expand() {
    this.treeModel.expand(this.data);
    if (this.data.children === null) {
      // lazy loading
      this.treeModel.onLoad(this.data);
    }
  }

  get isFlatTree() {
    return this.treeModel.isFlatTree;
  }

  addNode(data: T, parent?: T) {
    // add a node
  }
}