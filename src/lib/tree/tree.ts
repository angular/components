import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  NgModule,
  Output,
  QueryList,
  ViewChild
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {PortalModule, Portal, PortalHostDirective, ComponentPortal} from '../core';
import {MdTreeNode} from './tree-node';
import {TreeModel} from './tree-model';
import {TreeNodeModel} from './tree-node-model';

export class MdTreeChange {
  key: string;
  value: boolean;
}

@Component({
  selector: 'md-tree',
  host: {
  },
  templateUrl: 'tree.html',
  styleUrls: ['tree.css'],

})
export class MdTree implements AfterContentInit {
  @ContentChildren(MdTreeNode) treeNodes: QueryList<MdTreeNode>;

  @ViewChild(PortalHostDirective) portalHost: ComponentPortal<MdTreeNode>;

  @Input()
  nodeTemplate: Portal<any>;

  /**  The keys of the nodes which are expanded. */
  _expandedKeys: string[] = [];

  /** The keys of the nodes which are selected. */
  _selectedKeys: string[] = [];

  @Input()
  get expandedKeys() {
    return this._expandedKeys;
  }
  set expandedKeys(keys: string[]) {
    console.log(`expanded keys ${keys}`);
    this._expandedKeys = keys;
  }

  @Input()
  get selectedKeys() {
    return this._selectedKeys;
  }
  set selectedKeys(keys: string[]) {
    this._selectedKeys = keys;
  }

  @Input()
  selectChildren: boolean = false;

  @Input()
  disabled: boolean;

  @Input()
  loadData: (node: MdTreeNode) => {};

  _nodes: TreeModel;
  @Input()
  get nodes(): TreeModel {
    return this._nodes;
  }
  set nodes(value: TreeModel) {
    this._nodes = value;

    // build the tree
    let root = value.root;
    root.children.forEach((node) => {
      // Add node;
      this._addNode(node);

    });
  }

  _addNode(node: TreeNodeModel) {
    this.portalHost = new ComponentPortal(MdTreeNode);
    let mdNode = this.portalHost.component.

    // add node itself

    // add children
    node.children.forEach(this._addNode);
  }

  @Output()
  selectChange: EventEmitter<MdTreeChange> = new EventEmitter<MdTreeChange>();

  @Output()
  expandChange: EventEmitter<MdTreeChange> = new EventEmitter<MdTreeChange>();

  updateSelected(key: string, selected: boolean) {
    let index = this._selectedKeys.indexOf(key);
    if (index == -1 && selected) {
      this._selectedKeys.push(key);
      this._emitTreeChange(key, 'select', true);
    } else if (index > -1 && !selected) {
      this._selectedKeys.splice(index, 1);
      this._emitTreeChange(key, 'select', false);
    }
  }

  updateExpanded(key: string, expanded: boolean) {
    let index = this._expandedKeys.indexOf(key);
    if (index == -1 && expanded) {
      this._expandedKeys.push(key);
      this._emitTreeChange(key, 'expand', true);
    } else if (index > -1 && !expanded) {
      this._expandedKeys.splice(index, 1);
      this._emitTreeChange(key, 'expand', false);
    }
  }

  _emitTreeChange(key: string, type: 'select' | 'expand', value: boolean) {
    let change = new MdTreeChange();
    change.key = key;
    change.value = value;
    if (type == 'select') {
      this.selectChange.emit(change);
    } else {
      this.expandChange.emit(change);
    }
    console.log(`emit tree change ${key} ${type} ${value}`);
  }

  root: {};
  ngAfterContentInit() {
  }

  findKey(key: string): MdTreeNode {
    let result: MdTreeNode = null;
    this.treeNodes.forEach(node => {
      let found = node.findKey(key);
      if (found) {
        result = found;
      }
    });
    return result;
  }
}


@NgModule({
  imports: [BrowserModule, PortalModule],
  exports: [MdTreeNode, MdTree],
  declarations: [MdTreeNode, MdTree],
})
export class MdTreeModule {}
