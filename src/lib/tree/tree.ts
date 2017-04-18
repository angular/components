import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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

/**
 * Passed in values to the MdRowContextWhenFunction. These properties are
 * copied from the ngFor loop, which allow you access to loop variables when
 * determining to render a row template.
 */
export interface NgForTreeContext {
  index: number;
  first: boolean;
  last: boolean;
}


@Directive({
  selector: 'md-tree-node',
  host: {
    '[class.mat-tree-node]': 'true',
  },
})
export class MdTreeNode {

}

/**
 * The context directive for the `md-row` element. This template is stamped out
 * for the number of rows in the table.
 *
 * To customize the rows that are rendered, `MdRowContext` supports a
 * `when` option. This option tells the table when to render a row. If
 * multiple rowContexts match a given row, only the first will be rendered.
 */
@Directive({selector: '[mdNodeContext]'})
export class MdNodeContext {
  @ContentChildren(MdTreeNode) cells: QueryList<MdTreeNode>;

  constructor(public template: TemplateRef<MdNodeContext>) {
    console.log(`has one md-node context`);
  }
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
  host: {
    '[class.mat-table]': 'true',
    'role': 'grid',
  },
  styleUrls: ['tree.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdTree implements OnInit, OnDestroy {
  /**
   * The dataSource for the table rows. Not passing in a dataSource will
   * result in an MdTableInvalidDataSourceError exception.
   */
  @Input() dataSource: MdTreeDataSource<any>;

  @ContentChildren(MdNodeContext) nodeContexts: QueryList<MdNodeContext>;

  @Output() onReload = new EventEmitter<void>();

  displayNodes: MdTreeNodeControl[];
  nodes: MdTreeNodeControl[];
  nodeCount: number;
  nodeSubscription: Subscription;

  selectedNodes: any[];
  expandedNodes: any[];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {

    this.nodeSubscription = this.dataSource.getNodes().subscribe(result => {

      this.flatten(result.nodes);
      this.displayNodes = this.nodes.slice();
      this.nodeCount = result.nodeCount;
      this._changeDetectorRef.markForCheck();
      this.onReload.emit();
    });
  }

  flatten(values: any[]) {
    this.nodes = [];
    let result: any[] = [];
    for (let value of values) {
      this._processNode(value, 0);

    }
  }

  _processNode(value: any, level: number) {
    let nodeControl = new MdTreeNodeControl();
    nodeControl.level = level;
    nodeControl.data = value;
    nodeControl.expandable = !!value.items;
    this.nodes.push(nodeControl);
    if (value.items && nodeControl.expanded) {
      for (let item of value.items) {
        this._processNode(item, level + 1);
      }
    }
  }

  ngOnDestroy() {
    this.nodeSubscription.unsubscribe();
  }

  get templateRef() {
    console.log(this.nodeContexts);
    console.log(this.nodeContexts.first);
    console.log(this.nodeContexts.first.template);
    return this.nodeContexts && this.nodeContexts.length > 0 && this.nodeContexts.first ? this.nodeContexts.first.template : null;
  }

  /**
   * Returns true if the row is the last one.
   */
  isLast(index: number): boolean {
    return index === this.nodeCount - 1;
  }

  /**
   * Returns the first template that matches the row.
   */
  getTemplateForNode(
    node: any, index: number, first: boolean): TemplateRef<MdNodeContext> {
    const ngForContext: NgForTreeContext = {
      index,
      first,
      last: this.isLast(index),
    };

    return this.nodeContexts[0];
  }

  @Output()
  clickChange: EventEmitter<any> = new EventEmitter<any>();


  @Output()
  selectChange: EventEmitter<any> = new EventEmitter<any>();


  click(data: any) {
    this.clickChange.emit(data);
  }

  select(data: any) {
    if (this.selectedNodes.includes(data)) {
      this.selectedNodes.remove(data);
    } else {
      this.selectedNodes.push(data);
    }
    this.selectChange.emit(data);
  }

  expand(data: any) {

  }

  loadChildren(data: any) {

  }
}

export class MdTreeNodeControl {
  tree: MdTree;
  data: any;


  level: number;
  expanded: boolean;
  expandable: boolean;
  selected: boolean;

  // Event related
  clickNode() {
    this.tree.click(this.data);
  }
  focusNode() {
    //
  }
  blurNode() {

  }

  // select node only affect the node itself and the selection Control
  //selection related
  selectNode() {
    this.tree.select(this.data);
  }

  // expand node affect the node itself and it's children
  expandNode() {
    this.expanded = false;
    this.tree.expand(this);
  }
  // click event
  // expand event
  // select event
}
