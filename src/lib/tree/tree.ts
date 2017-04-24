import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {MdTreeDataSource} from './data-source';
import {SelectionModel} from '../core/selection/selection';
import {TreeNodeState} from './tree-model';
import {MdTreeNode} from './tree-node';

/**
 * Type for the mdRowContextWhen method. Takes in the current row in the ngFor
 * loop as well as the collection of ngFor properties. Returns whether to show
 * the given row.
 */
export interface MdNodeContextWhenFunction {
  (node?: any, ngForContext?: TreeNodeContext): boolean;
}

/**
 * Passed in values to the MdRowContextWhenFunction. These properties are
 * copied from the ngFor loop, which allow you access to loop variables when
 * determining to render a row template.
 */
export interface TreeNodeContext {
  index: number;
  state: TreeNodeState;
}


@Directive({selector: '[mdNodeContext]'})
export class MdNodeContext {

  private _when: MdNodeContextWhenFunction;

  @Input()
  set mdNodeContextWhen(value: MdNodeContextWhenFunction) {
    this._when = value;
  }

  get mdNodeContextWhen(): MdNodeContextWhenFunction {
    return this._when;
  }


  constructor(public template: TemplateRef<MdNodeContext>) {}
}
/**
 * A material design table component. In order to use the md-data-table, a
 * dataSource must be provided which implements the MdTableDataSource. The
 * table should contain md-row, mdRowContext, and md-cell directives.
 *
 * Example Use:
 * <md-data-table [dataSource]="dataSource">
 *   <md-header-row>
 *     <md-header-cell>Name</md-header-cell>
 *     <md-header-cell>Email</md-header-cell>
 *   <md-header-row>
 *   <md-row *mdRowContext="let row = row; when: mySuperCoolWhenFn">
 *     <md-cell>{{row.name}}</md-cell>
 *     <md-cell>{{row.email}}</md-cell>
 *   </md-row>
 * </md-data-table>
 * <md-tree [dataSource]="dataSource">
 *   <md-tree-parent>
 *   <md-tree-node *mdNodeContext="let node  = node">
 *     {{node.name}}
 *   </md-tree-node>
 * </md-tre>
 */
@Component({
  moduleId: module.id,
  selector: 'md-tree',
  templateUrl: 'tree.html',
  styleUrls: ['tree.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdTree implements OnInit, OnDestroy {

  @ContentChildren(MdNodeContext) nodeContexts: QueryList<MdNodeContext>;
  @Input() getChildrenFunction: any;
  @Input() getKeyFunction: any;

  _selectionModel: SelectionModel<any>;
  // The states map of the tree
  treeNodeStates: Map<any, TreeNodeState>;

  // The node map of the tree
  //treeNodes: Map<string, MdTreeNode>;

  // The flattened tree, store the id of the node value
  flatNodes: any[];

  nodesMap: Map<any, any>;
  // The original value of nodes
  _nodes: any[];
  @Input()
  get nodes() { return this._nodes;}
  set nodes(value: any[]) {
    this._nodes = value;
    this._buildNodeMap();
    this.flattenNodes();
  }

  /** Tree properties */
  _multiSelection: boolean = true;
  @Input()
  get multiSelection() { return this._multiSelection; }
  set multiSelection(value: boolean) {
    this._multiSelection = value;
    this._selectionModel = new SelectionModel<any>(value);
  }
  @Input() flatTree: boolean = true;
  @Input() defaultExpandAll: boolean;


  get treeControl() { return this; }
  //@Input() treeModel: TreeModel<any>;

  /**
   * The dataSource for the table rows. Not passing in a dataSource will
   * result in an MdTableInvalidDataSourceError exception.
   */

  @Output() onReload = new EventEmitter<void>();

  @Output() selectChange = new EventEmitter<any>();
  @Output() expandChange = new EventEmitter<any>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef) {
    this._selectionModel = new SelectionModel<any>(this.multiSelection);
  }

  //get templateRef() { return this.nodeContext.template; }

  ngOnInit() {
    //
  }

  ngOnDestroy() {
  }

  select(node: any, value: boolean) {
    let state = this.treeNodeStates.get(node);
    if (state && value != state.selected) {
      state.selected = value;
      this._selectionModel.toggle(node);
    }
  }

  expand(node: any, value: boolean) {
    let state = this.treeNodeStates.get(node);
    if (state && value != state.expanded) {
      state.expanded = value;
      this.flattenNodes();
    }
  }

  toggleSelect(node: any) {
    let state = this.treeNodeStates.get(node);
    if (state) {
      this.select(node, !state.selected);
    }
  }

  toggleExpand(node: any) {

    let state = this.treeNodeStates.get(node);
    if (state) {
      this.expand(node, !state.expanded);
    }
  }

  flattenNodes() {
    console.log(`flatten ndoes`);
    this.flatNodes = [];
    for (let node of this.nodes) {
      this._flattenNode(node, 0)
    }
  }

  _flattenNode(node: any, level: number) {
    let id = this.getKeyFunction(node);
    this.flatNodes.push(node);

    let state = this.treeNodeStates.get(node);
    if (!state) {
      state = new TreeNodeState();
      this.treeNodeStates.set(node, state);
      state.expanded = this.defaultExpandAll;
    }
    state.level = level;

    if (state.expanded) {
      for (let child of this.getChildrenFunction(node)) {
        this._flattenNode(child, level + 1);
      }
    }
  }

  _addToNodeMap(node: any) {
    let id = this.getKeyFunction(node);
    this.nodesMap.set(id, node);
    if (node.children) {
      for (let child of this.getChildrenFunction(node)) {
        this._addToNodeMap(child);
      }
    }
  }

  _buildNodeMap() {
    console.log(`build node map`);
    this.treeNodeStates = new Map<any, TreeNodeState>();
    this.nodesMap = new Map<any, any>();
    for (let node of this.nodes) {
      this._addToNodeMap(node);
    }
  }

  getTreeNodeState(node: any) {
    console.log(`get tree node state ${node}`);
    return this.treeNodeStates.get(node);
  }

  /**
   * Returns the first template that matches the row.
   */
  getTemplateForNode(node: any, index: number): TemplateRef<MdNodeContext> {
    let state = this.treeNodeStates.get(node);
    const nodeContext: TreeNodeContext = {
      index: index,
      state: state
    };

    return this.nodeContexts
      .find(nodeContext => {
        const whenFunction = nodeContext.mdNodeContextWhen;
        return true; //whenFunction ? whenFunction(node, nodeContext) : true;
      })
      .template;
  }
}