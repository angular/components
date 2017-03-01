import {
  AfterContentInit,
  Component,
  ContentChildren,
  Inject,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  forwardRef,
Output, EventEmitter
} from '@angular/core';
import {PortalHostDirective} from '../core';
import {MdTree} from './tree';
import {TreeNodeModel} from './tree-node-model';

@Component({
  selector: 'md-tree-node',
  host: {
  },
  templateUrl: 'tree-node.html',
  styleUrls: ['tree-node.css']
})
export class MdTreeNode implements OnInit, AfterContentInit {

  @ViewChild(PortalHostDirective) portalHost: PortalHostDirective;

  @ContentChildren(MdTreeNode) _treeNodes: QueryList<MdTreeNode>;

  get children() {
    return this._treeNodes.filter((node) => node.key != this.key);
  }

  get node() {
    return this._treeNodes ? this._treeNodes.first : null;
  }

  get isLeaf() {
    return this.children.length == 0;
  }

  model: TreeNodeModel;

  @Output()
  selectChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  expandChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(@Inject(forwardRef(() => MdTree))private tree: MdTree) {}

  ngOnInit() {
    this.selected = this.tree.selectedKeys.indexOf(this.key) >= 0;
    this.expanded = this.tree.expandedKeys.indexOf(this.key) >= 0;
  }

  ngAfterContentInit() {
    this.portalHost.attach(this.tree.nodeTemplate).instance.node = this.node;

    this.children.forEach(node => node.setParent(this));
  }

  _parent: MdTreeNode;
  setParent(node: MdTreeNode) {
    this._parent = node;
  }

  @Input()
  key: string;

  @Input()
  disabled: boolean;

  @Input()
  title: string;

  _selected: boolean = false;

  @Input()
  get selected() {
    return this._selected;
  }
  set selected(value: boolean) {
    if (this._selected != value) {
      this._selected = value;
      this.selectChange.emit(value);
      this._updateTreeSelected(this.tree.selectChildren);
    }
  }

  _expanded: boolean = false;

  @Input()
  get expanded() {
    return this._expanded;
  }
  set expanded(value: boolean) {
    if (this._expanded != value) {
      this._expanded = value;
      this.expandChange.emit(value);
      this._updateTreeExpanded();
    }
  }

  toggleExpand() {
    if (!this.disabled && !this.tree.disabled) {
      this.expanded = !this._expanded;
    }
  }

  toggleSelect() {
    if (!this.disabled && !this.tree.disabled) {
      this.selected = !this.selected;
    }
  }

  _updateTreeSelected(updateChildren: boolean) {
    this.tree.updateSelected(this.key, this.selected);

    if (updateChildren) {

      this.children.forEach((node) => node.selected = this.selected);
    } else if (this.tree.selectChildren) {
      if (this._parent) {
        let shouldSelect = (this._parent.children.filter(node => node.selected == false).length == 0);
        if (shouldSelect != this._parent.selected) {
          this._parent._selected = shouldSelect;
          this._parent._updateTreeSelected(false);
        }
      }
    }
  }

  _updateTreeExpanded() {
    this.tree.updateExpanded(this.key, this.expanded);
    if (!this.expanded) {
      // Collapse all children
      this.children.forEach((node) => node.expanded = false);
    }
  }

  findKey(key: string): MdTreeNode {
    if (this.key == key) {
      return this;
    }
    let result: MdTreeNode = null;
    this.children.forEach((node) => {
        let found = node.findKey(key);
        if (found) {
          result = found;
        }
      });
    return result;
  }
}
