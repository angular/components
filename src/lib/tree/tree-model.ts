import {SelectionModel} from '../core/selection/selection';

import {MdTreeDataSource} from './data-source';

export class TreeData {
  id: string;
  children?: any[];
}

export class TreeNodeState {
  level: number = 0;
  expanded: boolean = true;
  selected: boolean = false;
  loading: boolean = false;
}

export class TreeModel<T extends TreeData> {
  selectionModel: SelectionModel<string>;
  // Own
  nodes: T[];

  treeNodes: TreeNodeModel<T>[];
  viewStates: Map<string, TreeNodeState>;
  nodesMap: Map<string, TreeNodeModel<T>>;

  onLazyLoad: any;

  constructor(public dataSource: MdTreeDataSource<T>,
              public isFlatTree: boolean = false,
              isMultiSelection: boolean = true,
              defaultSelectedNodes: string[] = []) {
    this.selectionModel = new SelectionModel<string>(isMultiSelection, defaultSelectedNodes);
    this.viewStates = new Map<string, TreeNodeState>();
    this.nodesMap = new Map<string, TreeNodeModel<T>>();
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
    let viewState = this.viewStates.get(node.id) || new TreeNodeState();
    viewState.level = level;
    viewState.expanded = viewState.expanded || false;
    this.viewStates.set(node.id, viewState);
    this.nodesMap.set(node.id, treeNode);
    collection.push(treeNode);
    if ((treeNode.expanded && this.isFlatTree || !this.isFlatTree) && node.children) {
      for (let child of node.children) {
        this._addNode(child, level + 1,
          this.isFlatTree ? this.treeNodes : treeNode.children);
      }
    }
  }

  select(id: string) {
    this.selectionModel.toggle(id);
    this.viewStates.get(id).selected = !this.viewStates.get(id).selected;
    // TODO File selection event
  }

  expand(id: string) {
    console.log(this.viewStates.get(id).expanded );
    this.viewStates.get(id).expanded = !this.viewStates.get(id).expanded;

    if (this.isFlatTree) {
      // If is flat tree, re-calculate the tree nodes
      this._addNodes();
    }

    // TODO: file expand event
  }

  onLoad(id: any) {
    return this.dataSource.getChildren(id).then((children) => {
      // Set all children

      //data.children = children;


      this._addNodes();
    });
  }
}

export class TreeNodeModel<T extends TreeData> {

  constructor(private treeModel: TreeModel<T>, public data: T, public level: number) {
    this.id = data.id;
  }

  id: string;

  children: TreeNodeModel<T>[] = [];

  viewState: TreeNodeState;

  get expanded(): boolean {
    return this.viewState.expanded;
  }
  set expanded(value: boolean) {
    if (value != this.expanded) {
      this.expand();
    }
  }

  get selected(): boolean {
    return this.viewState.selected;
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
    this.treeModel.select(this.id);
  }

  expand() {
    this.treeModel.expand(this.id);
    console.log(this.viewState.expanded);
  }

  get isFlatTree() {
    return this.treeModel.isFlatTree;
  }

  addNode(data: T, parent?: T) {
    // add a node
  }
}